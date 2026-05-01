import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/api/users.service';
import { getAccessToken } from '@/services/api/storage';

function getDisplayName(username?: string | null, email?: string) {
  const preferred = username?.trim();
  if (preferred) return preferred;
  if (email) return email.split('@')[0];
  return 'VibePass User';
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  age: number | null;
  pronouns: string | null;
  interests: string[] | null;
  language: string;
  timezone: string;
  voiceComfort: string | null;
  trustScore: number | undefined;
  isSuspended: boolean | undefined;
  isBanned: boolean | undefined;
  createdAt: string;
  updatedAt: string;
  profilePhotoUrl: string | null;
}

export function useCurrentUser() {
  const hasToken = Boolean(getAccessToken());

  return useQuery<CurrentUser>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await getMe();
      const displayName = getDisplayName(user.username, user.email);

      return {
        id: user.id,
        username: user.username || displayName,
        email: user.email,
        displayName,
        bio: user.profile?.intro || user.bio || '',
        age: user.age ?? null,
        pronouns: user.pronouns || user.profile?.pronouns || null,
        interests: user.interests ?? user.profile?.interests ?? null,
        language: user.language,
        timezone: user.timezone,
        voiceComfort: user.voiceComfort ?? null,
        trustScore: user.trustScore,
        isSuspended: user.isSuspended,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profilePhotoUrl: user.profile?.profilePhotoUrl ?? null,
      };
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 5,
  });
}
