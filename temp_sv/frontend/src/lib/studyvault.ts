import { sessionStore } from '../stores/session';
import { get } from 'svelte/store';

/**
 * Get authentication token from session store
 * @returns {string} JWT access token or empty string if not authenticated
 */
export function getAuthToken(): string {
  const session = get(sessionStore);
  return session?.access_token || '';
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid session
 */
export function isAuthenticated(): boolean {
  return !!get(sessionStore)?.access_token;
}

/**
 * Clear authentication (logout)
 */
export function clearAuth(): void {
  sessionStore.set(null);
}
