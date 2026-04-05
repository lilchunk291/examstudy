/**
 * IndexedDB operations for offline-first architecture
 * All student data is stored locally and synced as encrypted blobs
 */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'scholarmind';
const DB_VERSION = 3;

export interface StudySession {
  id?: number;
  client_id?: string;
  topic: string;
  subject: string;
  duration_minutes: number;
  retention_score?: number;
  anxiety_level?: number;
  notes?: string;
  created_at: string;
  completed_at?: string;
  synced: boolean;
}

export interface DeepWorkSession {
  id?: number;
  client_id?: string;
  topic: string;
  duration_minutes: number;
  intensity_level: number;
  comprehension_score?: number;
  cognitive_fatigue?: number;
  started_at: string;
  completed_at?: string;
  synced: boolean;
}

export interface Reflection {
  id?: number;
  client_id?: string;
  session_id: string;
  mood_score: number;
  notes?: string;
  created_at: string;
}

export interface AcademicEvent {
  id?: number;
  client_id?: string;
  title: string;
  event_type: string;
  due_date: string;
  course_code?: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  data_type: string;
  data_id: string;
  client_id?: string;
  encrypted_blob: string;
  operation: 'create' | 'update' | 'delete';
  created_at: string;
  retry_count: number;
}

export interface ProcessedBlob {
  id: string;
  processed_at: string;
}

export interface KeyRecord {
  id: string;
  value: string;
  updated_at: string;
}

let db: IDBPDatabase | null = null;

export async function initDB(): Promise<IDBPDatabase> {
  if (db) return db;
  
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      // Study sessions store
      if (!database.objectStoreNames.contains('study_sessions')) {
        const store = database.createObjectStore('study_sessions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced');
        store.createIndex('subject', 'subject');
        store.createIndex('created_at', 'created_at');
        store.createIndex('client_id', 'client_id');
      } else {
        const store = transaction.objectStore('study_sessions');
        if (!store.indexNames.contains('client_id')) store.createIndex('client_id', 'client_id');
      }
      
      // Deep work sessions store
      if (!database.objectStoreNames.contains('deep_work_sessions')) {
        const store = database.createObjectStore('deep_work_sessions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced');
        store.createIndex('started_at', 'started_at');
        store.createIndex('client_id', 'client_id');
      } else {
        const store = transaction.objectStore('deep_work_sessions');
        if (!store.indexNames.contains('client_id')) store.createIndex('client_id', 'client_id');
      }
      
      // Reflections store (not synced to server)
      if (!database.objectStoreNames.contains('reflections')) {
        const store = database.createObjectStore('reflections', { keyPath: 'id', autoIncrement: true });
        store.createIndex('session_id', 'session_id');
        store.createIndex('client_id', 'client_id');
      } else {
        const store = transaction.objectStore('reflections');
        if (!store.indexNames.contains('client_id')) store.createIndex('client_id', 'client_id');
      }
      
      // Academic events store
      if (!database.objectStoreNames.contains('academic_events')) {
        const store = database.createObjectStore('academic_events', { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced');
        store.createIndex('event_type', 'event_type');
        store.createIndex('due_date', 'due_date');
        store.createIndex('client_id', 'client_id');
      } else {
        const store = transaction.objectStore('academic_events');
        if (!store.indexNames.contains('client_id')) store.createIndex('client_id', 'client_id');
      }
      
      // Sync queue store
      if (!database.objectStoreNames.contains('sync_queue')) {
        const store = database.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('data_type', 'data_type');
        store.createIndex('created_at', 'created_at');
        store.createIndex('client_id', 'client_id');
      } else {
        const store = transaction.objectStore('sync_queue');
        if (!store.indexNames.contains('client_id')) store.createIndex('client_id', 'client_id');
      }
      
      // Profile store
      if (!database.objectStoreNames.contains('profile')) {
        database.createObjectStore('profile', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('keys')) {
        database.createObjectStore('keys', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('processed_blobs')) {
        database.createObjectStore('processed_blobs', { keyPath: 'id' });
      }
    }
  });
  
  return db;
}

// Study Sessions
export async function addStudySession(session: Omit<StudySession, 'id' | 'synced'>): Promise<number> {
  const database = await initDB();
  return (await database.add('study_sessions', {
    ...session,
    synced: false
  })) as number;
}

export async function getStudySessions(): Promise<StudySession[]> {
  const database = await initDB();
  return await database.getAll('study_sessions');
}

export async function getStudySessionByClientId(clientId: string): Promise<StudySession | null> {
  const database = await initDB();
  const results = await database.getAllFromIndex('study_sessions', 'client_id', clientId);
  return results[0] || null;
}

export async function getUnsyncedStudySessions(): Promise<StudySession[]> {
  const database = await initDB();
  const all = await database.getAll('study_sessions');
  return all.filter((s) => !s.synced);
}

export async function markSessionSynced(id: number): Promise<void> {
  const database = await initDB();
  const session = await database.get('study_sessions', id);
  if (session) {
    session.synced = true;
    await database.put('study_sessions', session);
  }
}

export async function updateStudySession(session: StudySession): Promise<void> {
  const database = await initDB();
  await database.put('study_sessions', session);
}

export async function markStudySessionSyncedByClientId(clientId: string): Promise<void> {
  const session = await getStudySessionByClientId(clientId);
  if (!session || !session.id) return;
  session.synced = true;
  await updateStudySession(session);
}

// Deep Work Sessions
export async function addDeepWorkSession(session: Omit<DeepWorkSession, 'id' | 'synced'>): Promise<number> {
  const database = await initDB();
  return (await database.add('deep_work_sessions', {
    ...session,
    synced: false
  })) as number;
}

export async function getDeepWorkSessions(): Promise<DeepWorkSession[]> {
  const database = await initDB();
  return await database.getAll('deep_work_sessions');
}

export async function getDeepWorkSessionByClientId(clientId: string): Promise<DeepWorkSession | null> {
  const database = await initDB();
  const results = await database.getAllFromIndex('deep_work_sessions', 'client_id', clientId);
  return results[0] || null;
}

export async function updateDeepWorkSession(session: DeepWorkSession): Promise<void> {
  const database = await initDB();
  await database.put('deep_work_sessions', session);
}

export async function markDeepWorkSessionSyncedByClientId(clientId: string): Promise<void> {
  const session = await getDeepWorkSessionByClientId(clientId);
  if (!session || !session.id) return;
  session.synced = true;
  await updateDeepWorkSession(session);
}

export async function getReflectionByClientId(clientId: string): Promise<Reflection | null> {
  const database = await initDB();
  const results = await database.getAllFromIndex('reflections', 'client_id', clientId);
  return results[0] || null;
}

export async function getStudySessionsCount(): Promise<number> {
  const database = await initDB();
  return await database.count('study_sessions');
}

export async function getDeepWorkSessionsCount(): Promise<number> {
  const database = await initDB();
  return await database.count('deep_work_sessions');
}

export async function hasProcessedBlob(id: string): Promise<boolean> {
  const database = await initDB();
  const record = await database.get('processed_blobs', id);
  return !!record;
}

export async function markBlobProcessed(id: string): Promise<void> {
  const database = await initDB();
  const record: ProcessedBlob = { id, processed_at: new Date().toISOString() };
  await database.put('processed_blobs', record);
}

// Reflections (local only)
export async function addReflection(reflection: Omit<Reflection, 'id'>): Promise<number> {
  const database = await initDB();
  return (await database.add('reflections', reflection)) as number;
}

export async function getReflections(sessionId?: string): Promise<Reflection[]> {
  const database = await initDB();
  if (sessionId) {
    return await database.getAllFromIndex('reflections', 'session_id', sessionId);
  }
  return await database.getAll('reflections');
}

// Academic Events
export async function addAcademicEvent(event: Omit<AcademicEvent, 'id' | 'synced'>): Promise<number> {
  const database = await initDB();
  return (await database.add('academic_events', {
    ...event,
    synced: false
  })) as number;
}

export async function getAcademicEvents(): Promise<AcademicEvent[]> {
  const database = await initDB();
  return await database.getAll('academic_events');
}

// Sync Queue
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
  const database = await initDB();
  return (await database.add('sync_queue', item)) as number;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const database = await initDB();
  return await database.getAll('sync_queue');
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const database = await initDB();
  await database.delete('sync_queue', id);
}

export async function incrementRetryCount(id: number): Promise<void> {
  const database = await initDB();
  const item = await database.get('sync_queue', id);
  if (item) {
    item.retry_count += 1;
    await database.put('sync_queue', item);
  }
}

// Profile
export async function saveProfile(profile: any): Promise<void> {
  const database = await initDB();
  await database.put('profile', profile);
}

export async function getProfile(): Promise<any> {
  const database = await initDB();
  const profiles = await database.getAll('profile');
  return profiles[0] || null;
}

// Keys
export async function saveKeyRecord(id: string, value: string): Promise<void> {
  const database = await initDB();
  const record: KeyRecord = {
    id,
    value,
    updated_at: new Date().toISOString()
  };
  await database.put('keys', record);
}

export async function getKeyRecord(id: string): Promise<KeyRecord | null> {
  const database = await initDB();
  const record = await database.get('keys', id);
  return record || null;
}

export async function deleteKeyRecord(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('keys', id);
}

// Clear all data (GDPR)
export async function clearAllData(): Promise<void> {
  const database = await initDB();
  await database.clear('study_sessions');
  await database.clear('deep_work_sessions');
  await database.clear('reflections');
  await database.clear('academic_events');
  await database.clear('sync_queue');
  await database.clear('profile');
  if (database.objectStoreNames.contains('keys')) {
    await database.clear('keys');
  }
  if (database.objectStoreNames.contains('processed_blobs')) {
    await database.clear('processed_blobs');
  }
}
