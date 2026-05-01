# Backend API Routes Setup Guide

## Overview

This guide shows how to implement the backend routes that correspond to the frontend API services. Your NestJS backend needs to expose these endpoints for the profile page to work.

## Routes by Module

### Users Module Routes

```typescript
// GET /api/users/:username
// Get user profile by username
@Get(':username')
async getProfileByUsername(@Param('username') username: string) {
  return this.userProfilesService.getProfileByUsername(username);
}

// GET /api/users/me
// Get current user's profile (authenticated)
@Get('me')
@UseGuards(JwtAuthGuard)
async getCurrentUser(@Request() req) {
  return this.userProfilesService.getProfile(req.user.id);
}

// GET /api/users/:username/friends
// Get user's friends list
@Get(':username/friends')
async getUserFriends(
  @Param('username') username: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.friendshipsService.getUserFriends(username, page, limit);
}

// PUT /api/users/me
// Update current user profile (authenticated)
@Put('me')
@UseGuards(JwtAuthGuard)
async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
  return this.userProfilesService.updateProfile(req.user.id, updateProfileDto);
}

// PUT /api/users/me/profile-photo
// Update profile photo (authenticated)
@Put('me/profile-photo')
@UseGuards(JwtAuthGuard)
async updateProfilePhoto(
  @Request() req,
  @Body() dto: { photoUrl: string }
) {
  return this.userProfilesService.updateProfilePhoto(req.user.id, dto.photoUrl);
}

// PUT /api/users/me/cover-photo
// Update cover photo (authenticated)
@Put('me/cover-photo')
@UseGuards(JwtAuthGuard)
async updateCoverPhoto(
  @Request() req,
  @Body() dto: { coverUrl: string }
) {
  return this.userProfilesService.updateCoverPhoto(req.user.id, dto.coverUrl);
}

// GET /api/users/search
// Search for users
@Get('search')
async searchUsers(
  @Query('query') query: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.userProfilesService.searchUsers(query, page, limit);
}
```

### Posts Module Routes

```typescript
// POST /api/posts
// Create a new post (authenticated)
@Post()
@UseGuards(JwtAuthGuard)
async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
  return this.postsCrudService.createPost(req.user.id, createPostDto);
}

// GET /api/posts/feed
// Get user's feed (authenticated)
@Get('feed')
@UseGuards(JwtAuthGuard)
async getFeed(
  @Request() req,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.postsCrudService.getFeed(req.user.id, page, limit);
}

// GET /api/posts/user/:username
// Get all posts by a specific user
@Get('user/:username')
async getUserPosts(
  @Param('username') username: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.postsCrudService.getUserPosts(username, page, limit);
}

// GET /api/posts/:id
// Get single post with all details
@Get(':id')
async getPost(@Param('id') postId: string) {
  return this.postsCrudService.getPost(postId);
}

// PUT /api/posts/:id
// Update a post (authenticated)
@Put(':id')
@UseGuards(JwtAuthGuard)
async updatePost(
  @Param('id') postId: string,
  @Request() req,
  @Body() updatePostDto: Partial<CreatePostDto>
) {
  return this.postsCrudService.updatePost(postId, req.user.id, updatePostDto);
}

// DELETE /api/posts/:id
// Delete a post (authenticated)
@Delete(':id')
@UseGuards(JwtAuthGuard)
async deletePost(@Param('id') postId: string, @Request() req) {
  return this.postsCrudService.deletePost(postId, req.user.id);
}

// GET /api/posts/search
// Search posts
@Get('search')
async searchPosts(
  @Query('query') query: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.postsCrudService.searchPosts(query, page, limit);
}
```

### Comments Sub-Routes (under Posts)

```typescript
// POST /api/posts/:postId/comments
// Add a comment (authenticated)
@Post(':postId/comments')
@UseGuards(JwtAuthGuard)
async addComment(
  @Param('postId') postId: string,
  @Request() req,
  @Body() createCommentDto: CreateCommentDto
) {
  return this.commentsService.createComment(postId, req.user.id, createCommentDto);
}

// GET /api/posts/:postId/comments
// Get post comments
@Get(':postId/comments')
async getPostComments(
  @Param('postId') postId: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.commentsService.getPostComments(postId, page, limit);
}

// GET /api/comments/:commentId
// Get single comment
@Get('comments/:commentId')
async getComment(@Param('commentId') commentId: string) {
  return this.commentsService.getComment(commentId);
}

// PUT /api/comments/:commentId
// Update a comment (authenticated)
@Put('comments/:commentId')
@UseGuards(JwtAuthGuard)
async updateComment(
  @Param('commentId') commentId: string,
  @Request() req,
  @Body() dto: { content: string }
) {
  return this.commentsService.updateComment(commentId, req.user.id, dto.content);
}

// DELETE /api/comments/:commentId
// Delete a comment (authenticated)
@Delete('comments/:commentId')
@UseGuards(JwtAuthGuard)
async deleteComment(@Param('commentId') commentId: string, @Request() req) {
  return this.commentsService.deleteComment(commentId, req.user.id);
}
```

### Reactions Sub-Routes (under Posts)

```typescript
// POST /api/posts/:postId/reactions
// Add reaction to post (authenticated)
@Post(':postId/reactions')
@UseGuards(JwtAuthGuard)
async addReaction(
  @Param('postId') postId: string,
  @Request() req,
  @Body() createReactionDto: CreateReactionDto
) {
  return this.reactionsService.addReaction(postId, req.user.id, createReactionDto);
}

// DELETE /api/posts/:postId/reactions
// Remove reaction from post (authenticated)
@Delete(':postId/reactions')
@UseGuards(JwtAuthGuard)
async removeReaction(@Param('postId') postId: string, @Request() req) {
  return this.reactionsService.removeReaction(postId, req.user.id);
}

// GET /api/posts/:postId/reactions
// Get all reactions on post
@Get(':postId/reactions')
async getPostReactions(@Param('postId') postId: string) {
  return this.reactionsService.getPostReactions(postId);
}

// GET /api/posts/:postId/reactions/user
// Get current user's reaction on post (authenticated)
@Get(':postId/reactions/user')
@UseGuards(JwtAuthGuard)
async getUserReaction(@Param('postId') postId: string, @Request() req) {
  return this.reactionsService.getUserReaction(postId, req.user.id);
}

// POST /api/comments/:commentId/reactions
// Add reaction to comment (authenticated)
@Post('comments/:commentId/reactions')
@UseGuards(JwtAuthGuard)
async addCommentReaction(
  @Param('commentId') commentId: string,
  @Request() req,
  @Body() createReactionDto: CreateReactionDto
) {
  return this.reactionsService.addCommentReaction(commentId, req.user.id, createReactionDto);
}

// DELETE /api/comments/:commentId/reactions
// Remove reaction from comment (authenticated)
@Delete('comments/:commentId/reactions')
@UseGuards(JwtAuthGuard)
async removeCommentReaction(@Param('commentId') commentId: string, @Request() req) {
  return this.reactionsService.removeCommentReaction(commentId, req.user.id);
}
```

### Friendships Module Routes

```typescript
// POST /api/friendships/request/:userId
// Send friend request (authenticated)
@Post('request/:userId')
@UseGuards(JwtAuthGuard)
async sendFriendRequest(@Param('userId') userId: string, @Request() req) {
  return this.friendshipsService.sendFriendRequest(req.user.id, userId);
}

// GET /api/friendships/requests
// Get pending friend requests (authenticated)
@Get('requests')
@UseGuards(JwtAuthGuard)
async getFriendRequests(
  @Request() req,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20,
) {
  return this.friendshipsService.getFriendRequests(req.user.id, page, limit);
}

// POST /api/friendships/request/:requestId/accept
// Accept friend request (authenticated)
@Post('request/:requestId/accept')
@UseGuards(JwtAuthGuard)
async acceptFriendRequest(@Param('requestId') requestId: string, @Request() req) {
  return this.friendshipsService.acceptFriendRequest(requestId, req.user.id);
}

// POST /api/friendships/request/:requestId/reject
// Reject friend request (authenticated)
@Post('request/:requestId/reject')
@UseGuards(JwtAuthGuard)
async rejectFriendRequest(@Param('requestId') requestId: string, @Request() req) {
  return this.friendshipsService.rejectFriendRequest(requestId, req.user.id);
}

// DELETE /api/friendships/:friendId
// Remove friend (authenticated)
@Delete(':friendId')
@UseGuards(JwtAuthGuard)
async removeFriend(@Param('friendId') friendId: string, @Request() req) {
  return this.friendshipsService.removeFriend(req.user.id, friendId);
}

// GET /api/friendships/status/:userId
// Check friendship status (authenticated)
@Get('status/:userId')
@UseGuards(JwtAuthGuard)
async areFriends(@Param('userId') userId: string, @Request() req) {
  return this.friendshipsService.areFriends(req.user.id, userId);
}

// GET /api/friendships/mutual/:userId
// Get mutual friends (authenticated)
@Get('mutual/:userId')
@UseGuards(JwtAuthGuard)
async getMutualFriends(@Param('userId') userId: string, @Request() req) {
  return this.friendshipsService.getMutualFriends(req.user.id, userId);
}
```

## Module Registration

Register these controllers and services in your NestJS modules:

### users.module.ts
```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { UserProfilesService } from './user-profiles.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UserProfilesService, PrismaService],
  controllers: [UsersController],
  exports: [UserProfilesService],
})
export class UsersModule {}
```

### posts.module.ts
```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PostsCrudService } from './posts-crud.service';
import { CommentsService } from './comments.service';
import { ReactionsService } from './reactions.service';
import { PostsController } from './posts.controller';

@Module({
  providers: [PostsCrudService, CommentsService, ReactionsService, PrismaService],
  controllers: [PostsController],
  exports: [PostsCrudService, CommentsService, ReactionsService],
})
export class PostsModule {}
```

### friendships.module.ts
```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';

@Module({
  providers: [FriendshipsService, PrismaService],
  controllers: [FriendshipsController],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
```

### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { FriendshipsModule } from './modules/users/friendships.module';

@Module({
  imports: [
    // ... other modules
    UsersModule,
    PostsModule,
    FriendshipsModule,
  ],
})
export class AppModule {}
```

## DTO Definitions

Make sure you have the following DTOs:

### update-profile.dto.ts
```typescript
export class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  intro?: string;
  location?: string;
  work?: string;
  education?: string;
  relationshipStatus?: string;
}
```

## Response Format

All endpoints should return consistent responses with proper pagination:

### Single Resource Response
```json
{
  "id": "user-123",
  "username": "ariana",
  "firstName": "Ariana",
  "lastName": "Miller",
  "bio": "Living my best life",
  "friendsCount": 150,
  "postsCount": 42,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### List Response with Pagination
```json
{
  "data": [
    { "id": "1", "username": "user1", ... },
    { "id": "2", "username": "user2", ... }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### Error Response
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

## Testing

Use these curl commands to test your endpoints:

```bash
# Get user profile
curl http://localhost:3003/api/users/ariana

# Get user's friends
curl http://localhost:3003/api/users/ariana/friends?page=1&limit=20

# Get user's posts
curl http://localhost:3003/api/posts/user/ariana?page=1&limit=20

# Get single post
curl http://localhost:3003/api/posts/post-123

# Get post reactions
curl http://localhost:3003/api/posts/post-123/reactions
```

With authentication:
```bash
# Create post (requires token)
curl -X POST http://localhost:3003/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content":"Hello world!","privacy":"public"}'

# Send friend request (requires token)
curl -X POST http://localhost:3003/api/friendships/request/user-456 \
  -H "Authorization: Bearer <your-token>"
```

## Summary

✅ All routes mapped from frontend API services
✅ Consistent naming conventions
✅ Proper authentication guards
✅ Pagination support
✅ Error handling requirements defined
✅ Response format standardized

Once these routes are implemented in your backend, the profile page will retrieve all data from your database!
