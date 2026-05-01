import { apiRequest } from './client';

export interface BackendHealth {
  database: 'up' | 'down';
  service: string;
  status: 'ok' | 'degraded';
  timestamp: string;
}

export async function getBackendHealth(): Promise<BackendHealth> {
  return apiRequest<BackendHealth>('/api/v1/health');
}
