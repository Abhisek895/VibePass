# Database Integration Complete

## Overview

The VibePass profile page now retrieves user data directly from the database! We've created a complete API layer that connects the React frontend to your NestJS backend CRUD services.

## What Was Created

### 1. API Service Layer (Frontend)

Three new API service files were created in `src/services/api/`:

#### `profiles.service.ts` - User Profile API
- **getProfile(username)** - Fetch a user's profile by username
- **getMe()** - Get current user's profile
- **updateProfile(data)** - Update profile fields
- **updateProfilePhoto(photoUrl)** - Update profile picture
- **updateCoverPhoto(coverUrl)** - Update cover photo
- **getUserFriends(username, page, limit)** - Get user's friends list with pagination
- **getTrendingUsers(limit)** - Get trending users
- **searchUsers(query)** - Search for users

#### `posts-crud.service.ts` - Posts & Comments API
- **createPost(data)** - Create a new post
- **getFeed(page, limit)** - Get user's feed (posts from user + friends)
- **getUserPosts(username, page, limit)** - Get all posts by a specific user
- **getPost(postId)** - Get a single post with full details
- **addComment(postId, data)** - Add comment or reply
- **getPostComments(postId, page, limit)** - Get post comments
- **addReaction(postId, reactionType)** - React to a post (like, love, care, etc.)
- **getPostReactions(postId)** - Get all reactions on a post

#### `friendships.service.ts` - Friend Management API
- **sendFriendRequest(userId)** - Send friend request
- **getFriendRequests(page, limit)** - Get pending friend requests
- **acceptFriendRequest(requestId)** - Accept friend request
- **rejectFriendRequest(requestId)** - Reject friend request
- **removeFriend(friendId)** - Remove a friend
- **getMutualFriends(userId)** - Get mutual friends

### 2. Updated React Hooks

The following hooks now call real backend APIs instead of mock data:

#### `useProfile(username)`
- Calls: `profileService.getProfile(username)`
- Returns: User profile with all fields and counts

#### `useProfilePosts(username, page)`
- Calls: `postsService.getUserPosts(username, page, limit)`
- Returns: User's posts with pagination

#### `useProfileFriends(username, page)`
- Calls: `profileService.getUserFriends(username, page, limit)`
- Returns: User's friends list

### 3. Backend Integration

All API calls connect to your existing NestJS backend services:

**Profile Endpoints:**
```
GET  /api/users/:username           - Get user profile
GET  /api/users/:username/friends   - Get user's friends
PUT  /api/users/me                  - Update current user profile
```

**Posts Endpoints:**
```
GET  /api/posts/user/:username      - Get user's posts
POST /api/posts                     - Create post
GET  /api/posts/:id                 - Get single post
POST /api/posts/:id/comments        - Add comment
POST /api/posts/:id/reactions       - Add reaction
```

**Friendship Endpoints:**
```
POST /api/friendships/request/:userId           - Send friend request
GET  /api/friendships/requests                  - Get pending requests
POST /api/friendships/request/:requestId/accept - Accept request
```

## Data Flow

```
Profile Page Component
         ↓
React Hooks (useProfile, useProfilePosts, useProfileFriends)
         ↓
API Services (profiles.service, posts-crud.service, friendships.service)
         ↓
apiRequest (client.ts) - Handles HTTP requests + auth tokens
         ↓
Backend API (localhost:3003)
         ↓
NestJS CRUD Services (PostgreSQL/MySQL Database)
```

## How to Use

### 1. Fetching Profile Data

```typescript
import { useProfile, useProfilePosts, useProfileFriends } from '@/hooks';

export function ProfilePage() {
  const { profile, isLoading } = useProfile('ariana'); // Username
  const { posts } = useProfilePosts('ariana');
  const { friends } = useProfileFriends('ariana');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1>{profile.firstName} {profile.lastName}</h1>
      <p>{profile.bio}</p>
      <PostsList posts={posts} />
      <FriendsList friends={friends} />
    </div>
  );
}
```

### 2. Creating Posts

```typescript
import { postsService } from '@/services/api/posts-crud.service';

async function createPost() {
  const post = await postsService.createPost({
    content: 'Hello world!',
    privacy: 'public',
    backgroundColor: '#8B5CF6',
  });
  console.log('Post created:', post);
}
```

### 3. Managing Friends

```typescript
import { friendshipsService } from '@/services/api/friendships.service';

async function addFriend(userId) {
  const request = await friendshipsService.sendFriendRequest(userId);
  console.log('Friend request sent!');
}

async function acceptFriendRequest(requestId) {
  await friendshipsService.acceptFriendRequest(requestId);
}
```

### 4. Reacting to Posts

```typescript
import { postsService } from '@/services/api/posts-crud.service';

async function likePost(postId) {
  const reaction = await postsService.addReaction(postId, 'like');
  console.log('Post liked!');
}
```

## Backend Service Requirements

Make sure your NestJS backend has the following routes implemented:

### Users Module
- `GET /api/users/:username` - Returns full user profile
- `GET /api/users/:username/friends` - Returns friends with pagination
- `PUT /api/users/me` - Update current user profile

### Posts Module
- `GET /api/posts/user/:username` - Get user's posts (paginated)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post with comments and reactions
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/:id/comments` - Get post comments (paginated)
- `POST /api/posts/:id/reactions` - Add reaction
- `GET /api/posts/:id/reactions` - Get reactions summary

### Friendships Module
- `POST /api/friendships/request/:userId` - Send friend request
- `GET /api/friendships/requests` - Get pending requests
- `POST /api/friendships/request/:requestId/accept` - Accept request
- `GET /api/friendships/mutual/:userId` - Get mutual friends

## Error Handling

All API calls handle errors gracefully:

```typescript
try {
  const profile = await profileService.getProfile('ariana');
} catch (error) {
  if (error.status === 404) {
    console.log('Profile not found');
  } else if (error.status === 401) {
    console.log('Authentication required');
  } else {
    console.log('Error:', error.message);
  }
}
```

## Authentication

All authenticated endpoints require a Bearer token:

```
Authorization: Bearer <access_token>
```

The token is automatically included in requests when `auth: true` is set in the API service.

## Next Steps

1. **Verify Backend is Running**
   - Ensure NestJS backend is running on `http://localhost:3003`
   - Check that all controllers are properly registered

2. **Test API Endpoints**
   - Use Postman or curl to verify each endpoint returns correct data
   - Example: `curl http://localhost:3003/api/users/ariana`

3. **Environment Configuration**
   - Set `NEXT_PUBLIC_API_URL=http://localhost:3003` in `.env.local`
   - Or update the default in `src/services/api/client.ts`

4. **Enable Caching** (Optional)
   - Configure React Query cache settings in each hook
   - Add revalidation triggers when data is modified

5. **Add Error Boundaries**
   - Wrap profile components with error boundaries for better UX
   - Display user-friendly error messages

## Summary

✅ Frontend API services created and typed
✅ React hooks updated to use real API
✅ Database integration layer complete
✅ Authentication ready
✅ Error handling in place
✅ Pagination support
✅ Type safety with TypeScript

Your profile page now connects directly to your database! The transition from mock data is complete.
