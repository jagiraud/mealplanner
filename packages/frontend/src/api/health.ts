import client from './client';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

export async function healthCheck(): Promise<HealthStatus> {
  const { data } = await client.get<HealthStatus>('/healthCheck');
  return data;
}
