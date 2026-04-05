/**
 * Sync Manager - handles encrypted blob sync between IndexedDB and Supabase
 * Privacy-first: only encrypted blobs are ever sent to the server
 */

import { browser } from '$app/environment';
import { supabase } from './supabase';
import {
  getSyncQueue,
  removeSyncQueueItem,
  incrementRetryCount,
  hasProcessedBlob,
  markBlobProcessed,
  markDeepWorkSessionSyncedByClientId,
  markStudySessionSyncedByClientId,
  getDeepWorkSessionByClientId,
  getStudySessionByClientId,
  getReflectionByClientId,
  initDB,
  type StudySession,
  type DeepWorkSession,
  type Reflection,
  type SyncQueueItem
} from '$lib/db/indexeddb';
import { decrypt, encrypt, loadOrCreateUserKey } from './encryption';

const MAX_RETRIES = 3;

type DecryptedPayload = {
  type: 'study_session' | 'deep_work_session' | 'reflection';
  data: Record<string, unknown>;
};

async function decryptBlob(encryptedBlob: string, userId: string): Promise<DecryptedPayload> {
  const key = await loadOrCreateUserKey(userId);
  const plaintext = await decrypt(encryptedBlob, key);
  const parsed = JSON.parse(plaintext) as DecryptedPayload;
  return parsed;
}

export async function fetchAndDecryptBlobs(userId: string): Promise<number> {
  if (!browser) return 0;

  let data: any[] | null = null;
  {
    const result = await supabase
      .from('encrypted_student_data')
      .select('id, client_id, encrypted_blob')
      .eq('user_id', userId)
      .order('synced_at', { ascending: false });

    if (!result.error) {
      data = (result.data as any[]) || [];
    } else {
      const fallback = await supabase
        .from('encrypted_student_data')
        .select('id, encrypted_blob')
        .eq('user_id', userId)
        .order('synced_at', { ascending: false });

      if (fallback.error) {
        return 0;
      }
      data = (fallback.data as any[]) || [];
    }
  }

  const database = await initDB();
  let hydrated = 0;

  for (const record of data as any[]) {
    const blobId = String(record.id ?? '');
    if (!blobId) continue;

    const alreadyProcessed = await hasProcessedBlob(blobId);
    if (alreadyProcessed) continue;

    const clientId = typeof record.client_id === 'string' ? record.client_id : undefined;
    if (!clientId) {
      await markBlobProcessed(blobId);
      continue;
    }

    try {
      const decrypted = await decryptBlob(record.encrypted_blob, userId);

      if (decrypted.type === 'study_session') {
        const exists = await getStudySessionByClientId(clientId);
        if (!exists) {
          const dataToStore: StudySession = {
            ...(decrypted.data as any),
            client_id: clientId,
            synced: true
          };
          await database.put('study_sessions', dataToStore);
          hydrated++;
        }
      } else if (decrypted.type === 'deep_work_session') {
        const exists = await getDeepWorkSessionByClientId(clientId);
        if (!exists) {
          const dataToStore: DeepWorkSession = {
            ...(decrypted.data as any),
            client_id: clientId,
            synced: true
          };
          await database.put('deep_work_sessions', dataToStore);
          hydrated++;
        }
      } else if (decrypted.type === 'reflection') {
        const exists = await getReflectionByClientId(clientId);
        if (!exists) {
          const dataToStore: Reflection = {
            ...(decrypted.data as any),
            client_id: clientId
          };
          await database.put('reflections', dataToStore);
          hydrated++;
        }
      }

      await markBlobProcessed(blobId);
    } catch {
      await markBlobProcessed(blobId);
    }
  }

  return hydrated;
}

// Encrypt a data object and return a blob string
export async function encryptForSync(data: object, dataType: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  const key = await loadOrCreateUserKey(session.user.id);
  const payload = JSON.stringify({ type: dataType, data });
  return await encrypt(payload, key);
}

// Process the sync queue - push all pending items to Supabase
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (!browser) return { success: 0, failed: 0 };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: 0, failed: 0 };

  const queue = await getSyncQueue();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.retry_count >= MAX_RETRIES) {
      failed++;
      continue;
    }

    try {
      const payload: Record<string, unknown> = {
        user_id: session.user.id,
        data_type: item.data_type,
        encrypted_blob: item.encrypted_blob,
        device_id: getDeviceId(),
        synced_at: new Date().toISOString()
      };

      if (item.client_id) {
        payload.client_id = item.client_id;
      }

      let { error } = await supabase.from('encrypted_student_data').insert(payload);
      if (error && item.client_id) {
        const retryPayload = { ...payload };
        delete (retryPayload as any).client_id;
        ({ error } = await supabase.from('encrypted_student_data').insert(retryPayload));
      }

      if (error) throw error;

      if (item.client_id) {
        await Promise.all([
          markStudySessionSyncedByClientId(item.client_id),
          markDeepWorkSessionSyncedByClientId(item.client_id)
        ]);
      }

      await removeSyncQueueItem(item.id as number);
      success++;
    } catch (err) {
      console.error('Sync failed for item:', item.id, err);
      await incrementRetryCount(item.id as number);
      failed++;
    }
  }

  return { success, failed };
}

// Fetch all encrypted blobs from Supabase and return them
export async function fetchEncryptedBlobs(since?: string): Promise<any[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  let query = supabase
    .from('encrypted_student_data')
    .select('*')
    .eq('user_id', session.user.id)
    .order('synced_at', { ascending: false });

  if (since) {
    query = query.gte('synced_at', since);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Failed to fetch blobs:', error);
    return [];
  }

  return data || [];
}

// Get or generate a stable device ID
export function getDeviceId(): string {
  if (!browser) return 'server';
  let deviceId = localStorage.getItem('scholarmind_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('scholarmind_device_id', deviceId);
  }
  return deviceId;
}

// Check if online
export function isOnline(): boolean {
  if (!browser) return false;
  return navigator.onLine;
}

// Register online/offline listeners
export function registerSyncListeners(onSync: () => void): () => void {
  if (!browser) return () => {};

  const handleOnline = () => {
    console.log('Back online - triggering sync');
    onSync();
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
