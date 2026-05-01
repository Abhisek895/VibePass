import type { CSSProperties } from 'react';
import type {
  ConnectionPreview,
  Match,
} from '@/services/api/matches.service';

export type MatchesFilterKey =
  | 'all'
  | 'new'
  | 'unread'
  | 'active'
  | 'recent'
  | 'nearby'
  | 'favorites';

export type MatchesSortKey =
  | 'recent'
  | 'unread'
  | 'active'
  | 'newest'
  | 'oldest';

export type MatchStatusTone = 'rose' | 'amber' | 'emerald' | 'slate';

export type MatchViewModel = {
  avatarUrl?: string;
  age: number;
  chatId?: string;
  compatibilityScore: number;
  connectionId?: string;
  genderPreference?: string | null;
  displayName: string;
  fallbackPrompt: string;
  hasConversation: boolean;
  heroStyle: CSSProperties;
  id: string;
  initials: string;
  interests: string[];
  isActive: boolean;
  isFavorite: boolean;
  isNearby: boolean;
  isNew: boolean;
  isUnread: boolean;
  isWaitingOnYou: boolean;
  lastMessage?: string | null;
  locationLabel?: string;
  metaLine: string;
  mood: string;
  moodLabel: string;
  primaryStatus: {
    label: string;
    tone: MatchStatusTone;
  };
  priorityScore: number;
  rawMatch?: Match;
  spotlightLabel: string;
  subtitle: string;
  updatedAt?: string;
  username: string;
  voiceOpen: boolean;
};

type BuildOptions = {
  favorites: string[];
  mediaByUsername?: Record<string, { avatarUrl?: string }>;
};

const FALLBACK_CITIES = [
  'Kolkata',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chandigarh',
  'Goa',
];

// Local preview data keeps the experience reviewable if the API is offline.
export const MATCHES_MOCK_POOL: Match[] = [
  {
    id: 'mock-pool-1',
    username: 'lunar.echo',
    mood: 'Late-night walks, old playlists, and conversations that drift into sunrise.',
    interests: ['Indie Music', 'Night Drives', 'Poetry'],
    compatibilityScore: 94,
    voiceOpen: true,
  },
  {
    id: 'mock-pool-2',
    username: 'sundown.sage',
    mood: 'Warm coffee dates, tiny bookstores, and people who feel grounded instantly.',
    interests: ['Books', 'Coffee Spots', 'Slow Sundays'],
    compatibilityScore: 88,
    voiceOpen: false,
  },
  {
    id: 'mock-pool-3',
    username: 'velvet.signal',
    mood: 'Candid energy, playful flirting, and a little chaos in the best way.',
    interests: ['Live Music', 'Design', 'Rooftop Nights'],
    compatibilityScore: 81,
    voiceOpen: true,
  },
  {
    id: 'mock-pool-4',
    username: 'aurora.line',
    mood: 'Museum dates, films with strange endings, and long voice notes.',
    interests: ['Cinema', 'Art', 'Voice Notes'],
    compatibilityScore: 77,
    voiceOpen: false,
  },
];

export const MATCHES_MOCK_CONNECTIONS: ConnectionPreview[] = [
  {
    id: 'mock-chat-1',
    otherUser: {
      id: 'mock-user-1',
      username: 'lunar.echo',
    },
    lastMessage: 'That playlist rec was dangerously good.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'mock-chat-2',
    otherUser: {
      id: 'mock-user-2',
      username: 'sundown.sage',
    },
    lastMessage: 'Coffee this weekend sounds tempting.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function getMoodLabel(mood: string): string {
  const cleaned = normalizeText(mood);

  if (!cleaned) {
    return 'Open to a real connection';
  }

  const sentence = cleaned
    .split(/[.!?]/)
    .map(part => part.trim())
    .find(Boolean);

  const primary = sentence ?? cleaned;
  const clause = primary
    .split(',')
    .map(part => part.trim())
    .find(part => part.length >= 6);
  const label = clause ?? primary;

  if (label.length <= 34) {
    return label;
  }

  return `${label.slice(0, 31).trimEnd()}...`;
}

function getSeed(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildHeroStyle(seed: number): CSSProperties {
  const hue = seed % 360;

  return {
    backgroundImage: `
      linear-gradient(180deg, rgba(15,10,24,0.08) 0%, rgba(6,5,8,0.16) 28%, rgba(4,4,6,0.78) 82%, rgba(4,4,6,0.96) 100%),
      radial-gradient(circle at 20% 18%, hsla(${hue}, 88%, 72%, 0.30), transparent 30%),
      radial-gradient(circle at 78% 24%, hsla(${(hue + 54) % 360}, 82%, 66%, 0.16), transparent 28%),
      linear-gradient(118deg, rgba(255,255,255,0.18) 10%, transparent 10%, transparent 16%, rgba(255,255,255,0.06) 16%, rgba(255,255,255,0.06) 19%, transparent 19%, transparent 25%, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0.14) 28%, transparent 28%, transparent 34%, rgba(255,255,255,0.05) 34%, rgba(255,255,255,0.05) 37%, transparent 37%),
      linear-gradient(145deg, rgba(52,30,49,0.9), rgba(12,10,16,1))
    `,
  };
}

function getAge(seed: number): number {
  return 22 + (seed % 8);
}

function getLocation(seed: number): string | undefined {
  return FALLBACK_CITIES[seed % FALLBACK_CITIES.length];
}

function getHoursFromTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return Math.max((Date.now() - timestamp) / (1000 * 60 * 60), 0);
}

function getRelativeLabel(hours: number | null): string {
  if (hours === null) {
    return 'Matched recently';
  }

  if (hours < 1) {
    return 'Moments ago';
  }

  if (hours < 24) {
    return `${Math.round(hours)}h ago`;
  }

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function getMessagePrompt(match: Match | undefined, hasConversation: boolean): string {
  if (hasConversation) {
    return 'Pick up the conversation';
  }

  if (match?.voiceOpen) {
    return 'Say hi and see if the vibe clicks';
  }

  return 'Say hi and start the conversation';
}

function getPrimaryStatus(params: {
  hasConversation: boolean;
  isActive: boolean;
  isNew: boolean;
  isUnread: boolean;
  isWaitingOnYou: boolean;
}): MatchViewModel['primaryStatus'] {
  if (params.isUnread) {
    return { label: 'Reply now', tone: 'rose' };
  }

  if (params.isNew) {
    return { label: 'New', tone: 'amber' };
  }

  if (params.isActive) {
    return { label: 'Voice open', tone: 'emerald' };
  }

  if (params.isWaitingOnYou) {
    return { label: 'Waiting on you', tone: 'slate' };
  }

  if (params.hasConversation) {
    return { label: 'Conversation open', tone: 'slate' };
  }

  return { label: 'Good fit', tone: 'slate' };
}

function getSpotlightLabel(params: {
  hasConversation: boolean;
  isActive: boolean;
  isNew: boolean;
  isUnread: boolean;
  isWaitingOnYou: boolean;
}): string {
  if (params.isUnread) {
    return 'Best to reply now';
  }

  if (params.isNew) {
    return 'Fresh match';
  }

  if (params.isActive) {
    return 'Open to talk';
  }

  if (params.isWaitingOnYou) {
    return 'Warm lead';
  }

  if (params.hasConversation) {
    return 'Conversation ready';
  }

  return 'Strong compatibility';
}

function buildPriority(params: {
  compatibilityScore: number;
  hasConversation: boolean;
  isActive: boolean;
  isFavorite: boolean;
  isNew: boolean;
  isUnread: boolean;
  isWaitingOnYou: boolean;
}): number {
  return (
    params.compatibilityScore +
    (params.hasConversation ? 18 : 0) +
    (params.isFavorite ? 14 : 0) +
    (params.isActive ? 12 : 0) +
    (params.isUnread ? 22 : 0) +
    (params.isWaitingOnYou ? 10 : 0) +
    (params.isNew ? 16 : 0)
  );
}

export function buildMatchViewModels(
  pool: Match[],
  connections: ConnectionPreview[],
  options: BuildOptions,
): MatchViewModel[] {
  const connectionMap = new Map(
    connections.map(connection => [connection.otherUser.username.toLowerCase(), connection]),
  );
  const poolMap = new Map(pool.map(match => [match.username.toLowerCase(), match]));
  const usernames = new Set([
    ...Array.from(poolMap.keys()),
    ...Array.from(connectionMap.keys()),
  ]);

  return Array.from(usernames)
    .map(usernameKey => {
      const rawMatch = poolMap.get(usernameKey);
      const connection = connectionMap.get(usernameKey);
      const seed = getSeed(usernameKey);
      const updatedHours = getHoursFromTimestamp(connection?.updatedAt);
      const hasConversation = Boolean(connection);
      const isNew = !connection;
      // We do not have unread state from the backend, so urgency is derived from
      // very recent conversation activity to keep the UX actionable without API changes.
      const isUnread = hasConversation && updatedHours !== null && updatedHours <= 12;
      const isWaitingOnYou = hasConversation && updatedHours !== null && updatedHours > 12 && updatedHours <= 72;
      const isActive = rawMatch?.voiceOpen ?? false;
      const isFavorite = options.favorites.includes(rawMatch?.id ?? connection?.id ?? usernameKey);
      const compatibilityScore = rawMatch?.compatibilityScore ?? 68 + (seed % 24);
      const displayName = rawMatch?.username ?? connection?.otherUser.username ?? usernameKey;
      const photoFromRaw = rawMatch?.profilePhotoUrl || connection?.otherUser.profilePhotoUrl;
      const media = photoFromRaw ? { avatarUrl: photoFromRaw } : options.mediaByUsername?.[usernameKey];
      const fallbackPrompt = getMessagePrompt(rawMatch, hasConversation);
      const metaLine = hasConversation
        ? `Conversation updated ${getRelativeLabel(updatedHours)}`
        : rawMatch?.bio || rawMatch?.mood
          ? (rawMatch.bio || rawMatch.mood).slice(0, 80)
          : 'Take the first step with something personal';

      return {
        avatarUrl: media?.avatarUrl,
        age: rawMatch?.age || getAge(seed),
        compatibilityScore,
        connectionId: connection?.id,
        genderPreference: rawMatch?.genderPreference,
        displayName,
        fallbackPrompt,
        hasConversation,
        heroStyle: buildHeroStyle(seed),
        id: rawMatch?.id ?? connection?.id ?? usernameKey,
        initials: displayName.slice(0, 2).toUpperCase(),
        interests: rawMatch?.interests ?? [],
        isActive,
        isFavorite: options.favorites.includes(rawMatch?.id ?? connection?.id ?? usernameKey),
        isNearby: false,
        isNew,
        isUnread,
        isWaitingOnYou,
        lastMessage: connection?.lastMessage ?? null,
        locationLabel: rawMatch?.currentCity || getLocation(seed),
        metaLine,
        mood: rawMatch?.mood ?? '',
        moodLabel: getMoodLabel(rawMatch?.mood ?? ''),
        primaryStatus: getPrimaryStatus({
          hasConversation,
          isActive,
          isNew,
          isUnread,
          isWaitingOnYou,
        }),
        priorityScore: buildPriority({
          compatibilityScore,
          hasConversation,
          isActive,
          isFavorite,
          isNew,
          isUnread,
          isWaitingOnYou,
        }),
        rawMatch,
        spotlightLabel: getSpotlightLabel({
          hasConversation,
          isActive,
          isNew,
          isUnread,
          isWaitingOnYou,
        }),
        subtitle: hasConversation ? 'Conversation ready to continue' : 'People who matched your vibe',
        updatedAt: connection?.updatedAt,
        username: displayName,
        voiceOpen: rawMatch?.voiceOpen ?? false,
      } satisfies MatchViewModel;
    })
    .sort((left, right) => right.priorityScore - left.priorityScore);
}

export function filterMatches(
  matches: MatchViewModel[],
  filter: MatchesFilterKey,
  searchTerm: string,
): MatchViewModel[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return matches.filter(match => {
    const matchesFilter =
      (filter === 'all' && !match.connectionId) ||
      (filter === 'new' && match.isNew) ||
      (filter === 'unread' && match.isUnread) ||
      (filter === 'active' && match.isActive) ||
      (filter === 'recent' && match.hasConversation) ||
      (filter === 'nearby' && match.isNearby) ||
      (filter === 'favorites' && match.isFavorite);

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      match.displayName.toLowerCase().includes(normalizedSearch) ||
      match.username.toLowerCase().includes(normalizedSearch) ||
      match.interests.some(interest => interest.toLowerCase().includes(normalizedSearch)) ||
      match.moodLabel.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function sortMatches(
  matches: MatchViewModel[],
  sort: MatchesSortKey,
): MatchViewModel[] {
  const copy = [...matches];

  copy.sort((left, right) => {
    switch (sort) {
      case 'unread':
        return Number(right.isUnread) - Number(left.isUnread) || right.priorityScore - left.priorityScore;
      case 'active':
        return Number(right.isActive) - Number(left.isActive) || right.priorityScore - left.priorityScore;
      case 'newest':
        return Number(right.isNew) - Number(left.isNew) || right.priorityScore - left.priorityScore;
      case 'oldest':
        return left.priorityScore - right.priorityScore;
      case 'recent':
      default:
        return right.priorityScore - left.priorityScore;
    }
  });

  return copy;
}

export function getSpotlightMatches(matches: MatchViewModel[]): MatchViewModel[] {
  return matches.slice(0, 6);
}

export function getSummaryCounts(matches: MatchViewModel[]) {
  return {
    active: matches.filter(match => match.isActive).length,
    new: matches.filter(match => match.isNew).length,
    unread: matches.filter(match => match.isUnread).length,
  };
}
