import { apiRequest } from './client';

export interface PromptAnswerPayload {
  promptId: string;
  answer: string;
}

export interface UpdateUserPayload {
  age?: number;
  genderPreference?: string;
  interests?: string[];
  language?: string;
  pronouns?: string;
  timezone?: string;
  username?: string;
  password?: string;
  voiceComfort?: string;
}

export interface OnboardUserPayload extends UpdateUserPayload {
  promptAnswers?: PromptAnswerPayload[];
  conversationIntent?: string;
}

export interface Badge {
  awardedAt: string;
  badgeType: string;
  count: number;
  id: string;
  userId: string;
}

export interface NestedUserProfile {
  bio?: string | null;
  id: string;
  intro?: string | null;
  interests?: string[] | null;
  profilePhotoUrl?: string | null;
  pronouns?: string | null;
  updatedAt: string;
  userId: string;
  voiceOpen: boolean;
}

export interface UserProfile {
  age?: number | null;
  badges?: Badge[];
  bio?: string | null;
  createdAt: string;
  email: string;
  genderPreference?: string | null;
  id: string;
  interests?: string[] | null;
  isBanned?: boolean;
  isSuspended?: boolean;
  language: string;
  profile?: NestedUserProfile | null;
  pronouns?: string | null;
  timezone: string;
  trustScore?: number;
  updatedAt: string;
  username?: string | null;
  voiceComfort?: string | null;
}

export async function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/v1/users/me', {
    auth: true,
  });
}

export async function updateMe(
  payload: UpdateUserPayload,
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/v1/users/me', {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function onboardUser(
  payload: OnboardUserPayload,
): Promise<UserProfile> {
  return apiRequest<UserProfile>('/api/v1/users/onboard', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  return apiRequest<Badge[]>(`/api/v1/users/${userId}/badges`, {
    auth: true,
  });
}

export async function deleteMe(): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>('/api/v1/users/me', {
    method: 'DELETE',
    auth: true,
  });
}
