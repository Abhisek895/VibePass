# Quick Reference: Database & CRUD Operations

## How to Retrieve Data from Tables

### 1. Posts Data Retrieval

```typescript
// Get user feed (posts from friends)
const feed = await postsService.getFeed(userId, page, limit);
// Returns: { posts[], total, page, pageSize }

// Get all posts by a user
const userPosts = await postsService.getUserPosts(username, page, limit);
// Returns: { posts[], total, page, pageSize }

// Get single post with all details
const post = await postsService.getPost(postId);
// Returns: {
//   id, userId, content, imageUrl, privacy,
//   user: { id, username, firstName, lastName, profileImage },
//   reactions: [{ id, userId, reactionType }],
//   comments: [{ id, userId, content, user }]
// }
```

### 2. Comments Data Retrieval

```typescript
// Get all comments on a post
const comments = await commentsService.getPostComments(postId, page, limit);
// Returns: { comments[], total, page, pageSize }

// Get single comment with replies
const comment = await commentsService.getComment(commentId);
// Returns: {
//   id, postId, userId, content, parentCommentId,
//   user: { id, username, firstName, lastName, profileImage },
//   replies: [{ /* nested comment structure */ }]
// }
```

### 3. Reactions Data Retrieval

```typescript
// Get all reactions on a post
const reactions = await reactionsService.getPostReactions(postId);
// Returns: {
//   total,
//   byType: { like: 45, love: 12, care: 3, ... },
//   reactions: [{ id, userId, reactionType, user }]
// }

// Get current user's reaction on post
const userReaction = await reactionsService.getUserPostReaction(postId, userId);
// Returns: { id, postId, userId, reactionType } or null
```

### 4. Friendships Data Retrieval

```typescript
// Get user's friends
const friends = await friendshipsService.getUserFriends(userId, page, limit);
// Returns: {
//   friends: [{ id, username, firstName, lastName, profileImage }],
//   total, page, pageSize
// }

// Get mutual friends between two users
const mutuals = await friendshipsService.getMutualFriends(userId1, userId2);
// Returns: [{ id, username, firstName, lastName, profileImage }]

// Check if users are friends
const areFriends = await friendshipsService.areFriends(userId1, userId2);
// Returns: boolean

// Get pending friend requests
const requests = await friendshipsService.getFriendRequests(userId, page, limit);
// Returns: {
//   requests: [{
//     id, senderId, receiverId,
//     sender: { id, username, firstName, lastName, profileImage }
//   }],
//   total, page, pageSize
// }
```

### 5. User Profiles Data Retrieval

```typescript
// Get current user's profile
const profile = await profilesService.getProfile(userId);
// Returns: {
//   id, username, firstName, lastName, email,
//   profileImage, coverImage, bio, intro,
//   location, work, education, relationshipStatus,
//   friendsCount, postsCount, createdAt, updatedAt
// }

// Get user profile by username
const profile = await profilesService.getProfileByUsername(username);
// Returns: same as above

// Search users
const results = await profilesService.searchUsers(query, page, limit);
// Returns: {
//   users: [{ id, username, firstName, lastName, profileImage, bio }],
//   total, page, pageSize
// }

// Get relationship status with another user
const relationship = await profilesService.getUserRelationship(userId, targetUserId);
// Returns: {
//   isFriend: boolean,
//   pendingRequest: null | { id, sentBy: 'you'|'them' }
// }
```

---

## Data Structure Examples

### Post Object
```json
{
  "id": "post-123",
  "userId": "user-456",
  "content": "Check out this amazing design!",
  "imageUrl": "https://cdn.example.com/image.jpg",
  "privacy": "public",
  "backgroundColor": "#ff6b6b",
  "createdAt": "2024-01-13T14:00:00Z",
  "updatedAt": "2024-01-13T14:00:00Z",
  "user": {
    "id": "user-456",
    "username": "ariana",
    "firstName": "Ariana",
    "lastName": "Miller",
    "profileImage": "https://cdn.example.com/profile.jpg"
  },
  "reactions": [
    {
      "id": "reaction-789",
      "userId": "user-111",
      "reactionType": "love"
    }
  ],
  "comments": [
    {
      "id": "comment-555",
      "postId": "post-123",
      "userId": "user-222",
      "content": "Looks great!",
      "parentCommentId": null,
      "user": {
        "id": "user-222",
        "username": "alex-chen",
        "firstName": "Alex",
        "lastName": "Chen",
        "profileImage": "https://cdn.example.com/alex.jpg"
      }
    }
  ]
}
```

### User Profile Object
```json
{
  "id": "user-456",
  "username": "ariana",
  "firstName": "Ariana",
  "lastName": "Miller",
  "email": "ariana@example.com",
  "profileImage": "https://cdn.example.com/ariana.jpg",
  "coverImage": "https://cdn.example.com/cover.jpg",
  "bio": "Creative Director | Design Enthusiast | Coffee lover",
  "intro": "Bringing ideas to life through design and creativity",
  "location": "New York, NY",
  "work": "Creative Director at Design Studio Co",
  "education": "Rhode Island School of Design",
  "relationshipStatus": "Single",
  "friendsCount": 287,
  "postsCount": 42,
  "createdAt": "2020-03-12T09:45:00Z",
  "updatedAt": "2024-01-13T14:30:00Z"
}
```

### Comment Object (with nested replies)
```json
{
  "id": "comment-555",
  "postId": "post-123",
  "userId": "user-222",
  "content": "Looks great!",
  "parentCommentId": null,
  "user": {
    "id": "user-222",
    "username": "alex-chen",
    "firstName": "Alex",
    "lastName": "Chen",
    "profileImage": "https://cdn.example.com/alex.jpg"
  },
  "replies": [
    {
      "id": "comment-666",
      "postId": "post-123",
      "userId": "user-456",
      "content": "Thanks, Alex!",
      "parentCommentId": "comment-555",
      "user": {
        "id": "user-456",
        "username": "ariana",
        "firstName": "Ariana",
        "lastName": "Miller",
        "profileImage": "https://cdn.example.com/ariana.jpg"
      },
      "replies": []
    }
  ]
}
```

### Reaction Summary Object
```json
{
  "total": 123,
  "byType": {
    "like": 45,
    "love": 34,
    "care": 12,
    "haha": 23,
    "wow": 8,
    "sad": 1,
    "angry": 0
  },
  "reactions": [
    {
      "id": "reaction-789",
      "postId": "post-123",
      "userId": "user-111",
      "reactionType": "love",
      "user": {
        "id": "user-111",
        "username": "emma-johnson",
        "firstName": "Emma",
        "lastName": "Johnson",
        "profileImage": "https://cdn.example.com/emma.jpg"
      }
    }
  ]
}
```

### Friendship Object
```json
{
  "id": "user-456",
  "username": "ariana",
  "firstName": "Ariana",
  "lastName": "Miller",
  "profileImage": "https://cdn.example.com/ariana.jpg",
  "coverImage": "https://cdn.example.com/cover.jpg"
}
```

---

## Pagination Info

All list endpoints return pagination data:
```json
{
  "data": [ /* items */ ],
  "total": 150,        // Total items in database
  "page": 1,           // Current page
  "pageSize": 20,      // Items per page
  "totalPages": 8      // Total pages available
}
```

Default values:
- `page`: 1
- `limit`: 20 (max 100)

---

## Usage in Controllers

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PostsCrudService } from './posts-crud.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('api/posts')
export class PostsController {
  constructor(private postsService: PostsCrudService) {}

  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
    @CurrentUser() userId: string
  ) {
    return this.postsService.createPost(userId, dto);
  }

  @Get('feed')
  async getFeed(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() userId: string
  ) {
    return this.postsService.getFeed(userId, page, limit);
  }

  @Get('user/:username')
  async getUserPosts(
    @Param('username') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    return this.postsService.getUserPosts(username, page, limit);
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string) {
    return this.postsService.getPost(postId);
  }

  @Put(':postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() dto: Partial<CreatePostDto>,
    @CurrentUser() userId: string
  ) {
    return this.postsService.updatePost(postId, userId, dto);
  }

  @Delete(':postId')
  async deletePost(
    @Param('postId') postId: string,
    @CurrentUser() userId: string
  ) {
    return this.postsService.deletePost(postId, userId);
  }
}
```

---

## Files Created

1. `src/modules/posts/posts-crud.service.ts` - Full CRUD for posts
2. `src/modules/posts/comments.service.ts` - Comment management
3. `src/modules/posts/reactions.service.ts` - Reaction management
4. `src/modules/posts/dto/create-post.dto.ts` - Post DTO
5. `src/modules/posts/dto/create-comment.dto.ts` - Comment DTO
6. `src/modules/posts/dto/create-reaction.dto.ts` - Reaction DTO
7. `src/modules/users/friendships.service.ts` - Friendship management
8. `src/modules/users/user-profiles.service.ts` - Profile management

---

## Next Steps

1. Register services in module providers
2. Create controllers for each service
3. Add input validation with class-validator
4. Implement authorization/permissions
5. Add error handling middleware
6. Create unit tests
7. Generate API documentation

