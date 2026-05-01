import type {
  Comment,
  FriendPreview,
  PhotoItem,
  Post,
  PrivacyType,
  Profile,
  ReactionSummary,
  ReactionType,
  User,
} from '@/types/profile';

const wait = <T>(value: T, delay = 300): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), delay));

const reactionSummary = (
  entries: Partial<Record<ReactionType, number>> = {},
): ReactionSummary[] =>
  (['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'] as ReactionType[])
    .map((type) => ({
      type,
      count: entries[type] ?? 0,
      reacted: false,
    }))
    .filter((item) => item.count > 0 || item.type === 'like');

const buildUser = (id: string, overrides: Partial<User> = {}): User => ({
  id,
  username: id,
  firstName: 'Alex',
  lastName: 'Johnson',
  fullName: 'Alex Johnson',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
  coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200&h=400',
  intro: 'Building better experiences every day.',
  bio: 'Software engineer and coffee enthusiast.',
  headline: 'Senior Engineer',
  workTitle: 'Senior Engineer',
  workPlace: 'VibePass',
  education: 'Stanford University',
  currentCity: 'San Francisco',
  hometown: 'Los Angeles',
  relationshipStatus: 'Single',
  joinedDate: '2024-01-15T00:00:00.000Z',
  friendsCount: 128,
  photosCount: 32,
  postsCount: 12,
  followersCount: 640,
  followingCount: 220,
  isOnline: true,
  isOwnProfile: id === 'current_user',
  mutualFriends: 12,
  friendStatus: id === 'current_user' ? 'friends' : 'none',
  ...overrides,
});

const buildPosts = (profile: User): Post[] => [
  {
    id: `post-${profile.id}-1`,
    user: profile,
    content: 'Just finished polishing a profile flow. It feels much cleaner now.',
    media: [
      {
        id: `media-${profile.id}-1`,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=600',
        alt: 'Mountain hike',
      },
    ],
    reactions: reactionSummary({ like: 127, love: 45, wow: 12 }),
    comments: [],
    commentsCount: 12,
    sharesCount: 4,
    createdAt: '2024-04-10T12:00:00.000Z',
    updatedAt: '2024-04-10T12:00:00.000Z',
    privacy: 'public',
    isShared: false,
  },
  {
    id: `post-${profile.id}-2`,
    user: profile,
    content: 'Shipping small UX fixes adds up fast.',
    media: [],
    reactions: reactionSummary({ like: 89, love: 23 }),
    comments: [],
    commentsCount: 5,
    sharesCount: 2,
    createdAt: '2024-04-09T09:30:00.000Z',
    updatedAt: '2024-04-09T09:30:00.000Z',
    privacy: 'friends',
    isShared: false,
  },
];

export const profileApi = {
  async getProfile(username: string): Promise<User> {
    return wait(buildUser(username === 'me' ? 'current_user' : username), 450);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return wait({ ...buildUser('current_user'), ...data }, 350);
  },

  async uploadCoverPhoto(file: File): Promise<string> {
    return wait(URL.createObjectURL(file), 500);
  },

  async uploadAvatar(file: File): Promise<string> {
    return wait(URL.createObjectURL(file), 500);
  },
};

export const postsApi = {
  async getProfilePosts(userId: string): Promise<Post[]> {
    return wait(buildPosts(buildUser(userId)));
  },

  async createPost(data: {
    content: string;
    media: string[];
    privacy: PrivacyType;
  }): Promise<Post> {
    return wait({
      id: `post-${Date.now()}`,
      user: buildUser('current_user'),
      content: data.content,
      media: data.media.map((url, index) => ({
        id: `media-${Date.now()}-${index}`,
        type: 'image',
        url,
        alt: `Uploaded media ${index + 1}`,
      })),
      reactions: reactionSummary(),
      comments: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      privacy: data.privacy,
      isShared: false,
    });
  },

  async reactToPost(postId: string, reaction: string): Promise<void> {
    await wait(undefined, 150);
  },
};

export const commentsApi = {
  async getComments(postId: string): Promise<Comment[]> {
    return wait([
      {
        id: `comment-${postId}-1`,
        postId,
        user: buildUser('sarah', {
          firstName: 'Sarah',
          lastName: 'Miller',
          fullName: 'Sarah Miller',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=50&h=50',
        }),
        content: 'This looks incredible.',
        createdAt: '2024-04-10T13:00:00.000Z',
        likesCount: 8,
        liked: false,
        replies: [],
      },
      {
        id: `comment-${postId}-2`,
        postId,
        user: buildUser('mike', {
          firstName: 'Mike',
          lastName: 'Chen',
          fullName: 'Mike Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=50&h=50',
        }),
        content: 'Huge improvement.',
        createdAt: '2024-04-10T14:00:00.000Z',
        likesCount: 3,
        liked: false,
        replies: [],
      },
    ]);
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    return wait({
      id: `comment-${Date.now()}`,
      postId,
      user: buildUser('current_user', { fullName: 'You', isOwnProfile: true }),
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      liked: false,
      replies: [],
    });
  },
};

export const friendsApi = {
  async getFriends(userId: string): Promise<FriendPreview[]> {
    return wait([
      {
        id: 'friend-1',
        username: 'sarah',
        firstName: 'Sarah',
        lastName: 'Miller',
        fullName: 'Sarah Miller',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200',
        mutualFriends: 12,
        status: 'friend',
        friendStatus: 'friends',
      },
      {
        id: 'friend-2',
        username: 'mike',
        firstName: 'Mike',
        lastName: 'Chen',
        fullName: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
        mutualFriends: 8,
        status: 'friend',
        friendStatus: 'friends',
      },
    ]);
  },
};

export const photosApi = {
  async getPhotos(userId: string): Promise<PhotoItem[]> {
    return wait([
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800&h=800',
        thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200&h=200',
        caption: 'Mountain moment',
        createdAt: '2024-04-08T09:00:00.000Z',
        likesCount: 127,
        commentsCount: 12,
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=800&h=800',
        thumbnail: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=200&h=200',
        caption: 'Summit view',
        createdAt: '2024-04-06T09:00:00.000Z',
        likesCount: 89,
        commentsCount: 5,
      },
    ]);
  },
};
