import { apiRequest } from './client';

export interface Room {
  createdAt: string;
  description: string;
  id: string;
  isVoice: boolean;
  name: string;
  promptId?: string | null;
  theme: string;
}

export async function getActiveRooms(): Promise<Room[]> {
  return apiRequest<Room[]>('/api/v1/rooms/active', {
    auth: true,
  });
}

export async function joinRoom(
  roomId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(
    `/api/v1/rooms/${roomId}/join`,
    {
      method: 'POST',
      auth: true,
    },
  );
}

export async function leaveRoom(
  roomId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(
    `/api/v1/rooms/${roomId}/leave`,
    {
      method: 'POST',
      auth: true,
    },
  );
}
