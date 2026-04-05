/**
 * Client-side AES-256 encryption utilities
 * Privacy-first: Private key never leaves the device
 */

import { browser } from '$app/environment';
import { deleteKeyRecord, getKeyRecord, saveKeyRecord } from '$lib/db/indexeddb';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Generate a random encryption key
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to base64 for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from base64
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv
    },
    key,
    encodedData
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

// Decrypt data
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv
    },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function loadOrCreateUserKey(userId: string, password?: string): Promise<CryptoKey> {
  if (!browser) {
    throw new Error('Not in browser');
  }

  const record = await getKeyRecord(`aes_key_${userId}`);
  if (record?.value) {
    return await importKey(record.value);
  }

  // If password provided, try to recover from escrow first
  if (password) {
    try {
      const recovered = await recoverKeyFromEscrow(userId, password);
      if (recovered) return recovered;
    } catch (e) {
      console.warn('Escrow recovery failed, generating new key', e);
    }
  }

  const key = await generateKey();
  const exported = await exportKey(key);
  await saveKeyRecord(`aes_key_${userId}`, exported);
  
  // If password provided, escrow the new key
  if (password) {
    await escrowKey(userId, key, password);
  }
  
  return key;
}

export async function escrowKey(userId: string, key: CryptoKey, password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivationKey = await deriveKeyFromPassword(password, salt);
  const exportedKey = await exportKey(key);
  const encryptedKey = await encrypt(exportedKey, derivationKey);
  
  const { supabase } = await import('./supabase');
  await supabase.from('key_escrow').upsert({
    user_id: userId,
    encrypted_key: encryptedKey,
    salt: btoa(String.fromCharCode(...salt))
  });
}

export async function recoverKeyFromEscrow(userId: string, password: string): Promise<CryptoKey | null> {
  const { supabase } = await import('./supabase');
  const { data, error } = await supabase.from('key_escrow').select('*').eq('user_id', userId).single();
  
  if (error || !data) return null;
  
  const salt = Uint8Array.from(atob(data.salt), c => c.charCodeAt(0));
  const derivationKey = await deriveKeyFromPassword(password, salt);
  const decryptedExportedKey = await decrypt(data.encrypted_key, derivationKey);
  
  const key = await importKey(decryptedExportedKey);
  await saveKeyRecord(`aes_key_${userId}`, decryptedExportedKey);
  return key;
}

// Generate key pair for key escrow
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Store private key in localStorage (never transmitted)
export async function storePrivateKey(key: CryptoKey, userId: string): Promise<void> {
  if (!browser) return;
  const exported = await exportKey(key);
  await saveKeyRecord(`aes_key_${userId}`, exported);
}

// Get private key from localStorage
export async function getPrivateKey(userId: string): Promise<CryptoKey | null> {
  if (!browser) return null;
  const record = await getKeyRecord(`aes_key_${userId}`);
  if (!record?.value) return null;
  return await importKey(record.value);
}

// Clear private key (for logout or GDPR delete)
export async function clearPrivateKey(userId: string): Promise<void> {
  if (!browser) return;
  await deleteKeyRecord(`aes_key_${userId}`);
}

// Hash password for key derivation
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  const saltBytes = new Uint8Array(salt.slice().buffer);
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: ENCRYPTION_ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt for key escrow (uses public key)
export async function encryptForEscrow(data: string, publicKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    encodedData
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Decrypt from escrow (uses private key)
export async function decryptFromEscrow(encryptedData: string, privateKey: CryptoKey): Promise<string> {
  const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}
