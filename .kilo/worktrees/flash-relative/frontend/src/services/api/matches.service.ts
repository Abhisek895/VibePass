import { apiRequest } from './client';

export interface Match {
  age?: number | null;
  bio?: string | null;
  compatibilityScore: number;
  currentCity?: string | null;
  genderPreference?: string | null;
  id: string;
  interests: string[];
  mood: string;
  profilePhotoUrl?: string | null;
  username: string;
  voiceOpen: boolean;
}

export interface MatchActionPayload {
  action: 'like' | 'pass';
  matchId: string;
}

export interface ConnectionPreview {
  id: string;
  otherUser: {
    id: string;
    username: string;
    profilePhotoUrl?: string | null;
  };
  lastMessage?: string | null;
  updatedAt: string;
}

export async function getMatchPool(): Promise<Match[]> {
  return apiRequest<Match[]>('/api/v1/matches/pool', {
    auth: true,
  });
}

export async function submitMatchAction(
  payload: MatchActionPayload,
): Promise<{ success: boolean; message?: string; chatId?: string }> {
  return apiRequest<{ success: boolean; message?: string; chatId?: string }>(
    '/api/v1/matches/action',
    {
      method: 'POST',
      body: payload,
      auth: true,
    },
  );
}

export async function getConnections(): Promise<ConnectionPreview[]> {
  return apiRequest<ConnectionPreview[]>('/api/v1/connections', {
    auth: true,
  });
}
export async function unmatch(
  matchId: string,
): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>(
    '/api/v1/matches/unmatch',
    {
      method: 'POST',
      body: { matchId },
      auth: true,
    },
  );
}
