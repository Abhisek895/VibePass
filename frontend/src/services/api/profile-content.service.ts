import { apiRequest } from './client';
import { profileService } from './profiles.service';
import { getMe } from './users.service';
import type {
  Comment,
  FriendPreview,
  PhotoItem,
  Post,
  PostMedia,
  PrivacyType,
  Profile,
  ReactionType,
  User,
} from '@/types/profile';

type BackendProfile = {
  age?: number | null;
  bio?: string | null;
  createdAt?: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  friendsCount?: number;
  fullName?: string;
  genderPreference?: string | null;
  id: string;
  interests?: string[] | null;
  intro?: string | null;
  isBanned?: boolean;
  isOwnProfile?: boolean;
  isSuspended?: boolean;
  language?: string | null;
  mutualFriendsCount?: number;
  postsCount?: number;
  friendshipStatus?: string | null;
  profile?: {
    coverPhotoUrl?: string | null;
    currentCity?: string | null;
    education?: string | null;
    hometown?: string | null;
    intro?: string | null;
    profilePhotoUrl?: string | null;
    relationshipStatus?: string | null;
    voiceOpen?: boolean;
    workPlace?: string | null;
    workTitle?: string | null;
  } | null;
  profileDetails?: {
    interests?: string[] | null;
    voiceOpen?: boolean;
  } | null;
  pronouns?: string | null;
  timezone?: string | null;
  trustScore?: number;
  updatedAt?: string;
  username?: string | null;
  voiceComfort?: string | null;
};

type BackendPostUser = {
  email?: string | null;
  id: string;
  profile?: {
    profilePhotoUrl?: string | null;
  } | null;
  username?: string | null;
};

type BackendComment = {
  content: string;
  createdAt: string;
  id: string;
  postId: string;
  user: BackendPostUser;
  userId: string;
};

type BackendPost = {
  comments?: BackendComment[];
  commentsCount: number;
  content: string;
  createdAt: string;
  id: string;
  imageUrl?: string | null;
  likes?: Array<{ userId: string }>;
  likesCount: number;
  sharesCount: number;
  updatedAt: string;
  user: BackendPostUser;
};

type BackendPostsResponse = {
  nextCursor: string | null;
  posts: BackendPost[];
};

type BackendCommentsResponse = {
  comments: BackendComment[];
  nextCursor: string | null;
};

function getDisplayName(user: {
  displayName?: string;
  email?: string | null;
  firstName?: string;
  fullName?: string;
  id?: string;
  username?: string | null;
}) {
  return (
    user.displayName?.trim() ||
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.username?.trim() ||
    user.email?.split('@')[0] ||
    (user.id ? `user-${user.id.slice(0, 8)}` : 'VibePass User')
  );
}

function normalizeFriendStatus(value?: string | null): User['friendStatus'] {
  switch (value) {
    case 'FRIENDS':
      return 'friends';
    case 'PENDING_INCOMING':
      return 'pending';
    case 'PENDING_OUTGOING':
      return 'request_sent';
    default:
      return 'none';
  }
}

function buildUserSummary(user: BackendPostUser): User {
  const fullName = getDisplayName(user);
  const username = user.username?.trim() || fullName;

  return {
    id: user.id,
    username,
    firstName: fullName,
    lastName: '',
    fullName,
    avatar: user.profile?.profilePhotoUrl || '',
    coverPhoto: '',
    intro: '',
    bio: '',
    headline: '',
    workTitle: '',
    workPlace: '',
    education: '',
    currentCity: '',
    hometown: '',
    relationshipStatus: '',
    joinedDate: '',
    friendsCount: 0,
    photosCount: 0,
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    isOnline: false,
    isOwnProfile: false,
    mutualFriends: 0,
    friendStatus: 'none',
  };
}

function mapComment(comment: BackendComment): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    user: buildUserSummary(comment.user),
    content: comment.content,
    createdAt: comment.createdAt,
    likesCount: 0,
    liked: false,
    replies: [],
    replyCount: 0,
  };
}

function mapPost(post: BackendPost): Post {
  return {
    id: post.id,
    user: buildUserSummary(post.user),
    content: post.content,
    media: post.imageUrl
      ? [
          {
            id: `${post.id}-image`,
            type: 'image',
            url: post.imageUrl,
            alt: post.content || 'Post media',
          },
        ]
      : [],
    reactions: post.likesCount
      ? [
          {
            type: 'like',
            count: post.likesCount,
          },
        ]
      : [],
    comments: (post.comments || []).map(mapComment),
    commentsCount: post.commentsCount,
    sharesCount: post.sharesCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    privacy: 'public',
    currentUserReaction: undefined,
  };
}

function mapProfile(profile: BackendProfile, fallbackUsername?: string): Profile {
  const fullName = getDisplayName(profile);
  const username = profile.username?.trim() || fallbackUsername || fullName;
  const intro = profile.profile?.intro || profile.intro || '';
  const interests = profile.interests ?? profile.profileDetails?.interests ?? null;

  return {
    id: profile.id,
    username,
    firstName: profile.firstName?.trim() || fullName,
    lastName: '',
    fullName,
    avatar: profile.profile?.profilePhotoUrl || '',
    coverPhoto: profile.profile?.coverPhotoUrl || '',
    intro,
    bio: profile.bio || intro,
    headline: profile.profile?.workTitle || '',
    workTitle: profile.profile?.workTitle || '',
    workPlace: profile.profile?.workPlace || '',
    education: profile.profile?.education || '',
    currentCity: profile.profile?.currentCity || '',
    hometown: profile.profile?.hometown || '',
    relationshipStatus: profile.profile?.relationshipStatus || '',
    joinedDate: profile.createdAt || '',
    friendsCount: profile.friendsCount || 0,
    photosCount: 0,
    postsCount: profile.postsCount || 0,
    followersCount: 0,
    followingCount: 0,
    isOnline: Boolean(profile.profile?.voiceOpen ?? profile.profileDetails?.voiceOpen),
    isOwnProfile: Boolean(profile.isOwnProfile),
    mutualFriends: profile.mutualFriendsCount || 0,
    friendStatus: normalizeFriendStatus(profile.friendshipStatus),
    age: profile.age ?? null,
    genderPreference: profile.genderPreference ?? null,
    pronouns: profile.pronouns || undefined,
    interests,
    language: profile.language ?? null,
    timezone: profile.timezone ?? null,
    voiceComfort: profile.voiceComfort ?? null,
    trustScore: profile.trustScore,
    isSuspended: profile.isSuspended,
    isBanned: profile.isBanned,
    updatedAt: profile.updatedAt,
    contactEmail: profile.email,
  };
}

function buildUpdatePayload(changes: Partial<Profile>) {
  const payload: Record<string, unknown> = {};

  if (changes.username !== undefined) payload.username = changes.username;
  if (changes.age !== undefined) payload.age = changes.age;
  if (changes.bio !== undefined) payload.bio = changes.bio;
  if (changes.intro !== undefined) payload.intro = changes.intro;
  if (changes.pronouns !== undefined) payload.pronouns = changes.pronouns;
  if (changes.genderPreference !== undefined) {
    payload.genderPreference = changes.genderPreference;
  }
  if (changes.interests !== undefined) payload.interests = changes.interests;
  if (changes.language !== undefined) payload.language = changes.language;
  if (changes.timezone !== undefined) payload.timezone = changes.timezone;
  if (changes.voiceComfort !== undefined) payload.voiceComfort = changes.voiceComfort;
  if (changes.workTitle !== undefined) payload.workTitle = changes.workTitle;
  if (changes.workPlace !== undefined) payload.workPlace = changes.workPlace;
  if (changes.education !== undefined) payload.education = changes.education;
  if (changes.currentCity !== undefined) payload.currentCity = changes.currentCity;
  if (changes.hometown !== undefined) payload.hometown = changes.hometown;
  if (changes.relationshipStatus !== undefined) {
    payload.relationshipStatus = changes.relationshipStatus;
  }

  return payload;
}

export async function fetchProfile(username: string): Promise<Profile | null> {
  if (!username || username === 'current') {
    const me = await getMe();
    return {
      ...mapProfile(me as unknown as BackendProfile, me.username || undefined),
      isOwnProfile: true,
    };
  }

  const profile = (await profileService.getProfile(username)) as unknown as BackendProfile;
  return mapProfile(profile, username);
}

export async function fetchProfilePosts(username: string): Promise<Post[]> {
  const response = await apiRequest<BackendPostsResponse>(
    `/api/v1/posts/user/${encodeURIComponent(username)}?limit=50`,
  );

  return response.posts.map(mapPost);
}

export async function fetchProfilePhotos(username: string): Promise<PhotoItem[]> {
  const posts = await fetchProfilePosts(username);

  return posts.flatMap(post =>
    post.media.map((media, index) => ({
      id: `${post.id}-photo-${index}`,
      url: media.url,
      thumbnail: media.url,
      caption: post.content,
      createdAt: post.createdAt,
      likesCount: post.reactions.reduce((sum, reaction) => sum + reaction.count, 0),
      commentsCount: post.commentsCount,
    })),
  );
}

export async function fetchProfileFriends(username: string): Promise<FriendPreview[]> {
  const response = await profileService.getUserFriends(username, 1, 24);

  return response.friends.map(friend => {
    const fullName = getDisplayName(friend);
    return {
      id: friend.id,
      username: friend.username,
      firstName: friend.firstName || fullName,
      lastName: friend.lastName || '',
      fullName,
      avatar: friend.profileImage || '',
      mutualFriends: friend.mutualFriendsCount || 0,
      status: 'friend',
      friendStatus: 'friends',
    };
  });
}

export async function createPost(
  _username: string,
  content: string,
  media: PostMedia[],
  _privacy: PrivacyType,
): Promise<Post> {
  const firstImage = media.find(item => item.type === 'image');
  const createdPost = await apiRequest<BackendPost>('/api/v1/posts', {
    method: 'POST',
    auth: true,
    body: {
      content,
      imageUrl: firstImage?.url,
    },
  });

  return mapPost(createdPost);
}

export async function togglePostReaction(
  postId: string,
  _reactionType: ReactionType,
): Promise<Post | null> {
  await apiRequest<{ liked: boolean }>(`/api/v1/posts/${postId}/like`, {
    method: 'POST',
    auth: true,
  });

  const post = await apiRequest<BackendPost>(`/api/v1/posts/${postId}`);
  return mapPost(post);
}

export async function addComment(
  postId: string,
  _userId: string,
  content: string,
  _parentId?: string,
): Promise<Comment | null> {
  const comment = await apiRequest<BackendComment>(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    auth: true,
    body: { content },
  });

  return mapComment(comment);
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const response = await apiRequest<BackendCommentsResponse>(
    `/api/v1/posts/${postId}/comments?limit=50`,
  );

  return response.comments.map(mapComment);
}

export async function updateProfile(
  _username: string,
  changes: Partial<Profile>,
): Promise<Profile | null> {
  const payload = buildUpdatePayload(changes);
  const updatedProfile = (await apiRequest<BackendProfile>('/api/v1/users/me', {
    method: 'PUT',
    auth: true,
    body: payload,
  })) as BackendProfile;

  return mapProfile(updatedProfile, updatedProfile.username || undefined);
}

export async function uploadProfileImage(
  _username: string,
  url: string,
): Promise<string> {
  await profileService.updateProfilePhoto(url);
  return url;
}

export async function uploadCoverImage(
  _username: string,
  url: string,
): Promise<string> {
  await profileService.updateCoverPhoto(url);
  return url;
}
