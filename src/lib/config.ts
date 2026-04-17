/**
 * Configuration for API endpoints.
 * When running locally with the FastAPI backend, set VITE_USE_LOCAL_BACKEND=true
 * and VITE_BACKEND_URL=http://localhost:8000
 */

export const API_CONFIG = {
  useLocalBackend: import.meta.env.VITE_USE_LOCAL_BACKEND === 'true',
  baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
};

export const getApiUrl = (path: string) => `${API_CONFIG.baseUrl}${path}`;
