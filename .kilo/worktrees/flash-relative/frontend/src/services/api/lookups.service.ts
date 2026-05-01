import { apiRequest } from './client';

export interface LookupOption {
  label: string;
  value: string;
}

export interface ConversationIntentOption extends LookupOption {
  description: string;
  emoji: string;
  isCasual: boolean;
}

export interface MoodOption {
  category: string;
  color: string;
  description: string;
  emoji: string;
  id: string;
  name: string;
}

export interface OnboardingLookups {
  conversationIntents: ConversationIntentOption[];
  interests: LookupOption[];
  pronouns: LookupOption[];
  voiceLevels: LookupOption[];
}

export async function getOnboardingLookups(): Promise<OnboardingLookups> {
  return apiRequest<OnboardingLookups>('/api/v1/lookups/onboarding', {
    auth: true,
  });
}

export async function getMoodOptions(): Promise<MoodOption[]> {
  return apiRequest<MoodOption[]>('/api/v1/lookups/moods', {
    auth: true,
  });
}
