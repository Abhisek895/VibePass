# VibePass CRUD API Documentation

## Overview
This document outlines all available CRUD (Create, Read, Update, Delete) operations for the VibePass backend.

---

## Posts API

### Create Post
```
POST /api/posts
Authorization: Bearer {token}

Body:
{
  "content": "Post content here",
  "imageUrl": "https://example.com/image.jpg",
  "privacy": "public|friends|private",
  "backgroundColor": "#ff0000"
}

Response: Created post with user details, reactions, and comments
```

### Get Feed (User's Timeline)
```
GET /api/posts/feed?page=1&limit=20
Authorization: Bearer {token}

Response: Array of posts from user and friends with pagination
```

### Get User Posts
```
GET /api/posts/user/{username}?page=1&limit=20
Response: All posts by a specific user
```

### Get Single Post
```
GET /api/posts/{postId}
Response: Post with all details, reactions, and comments
```

### Update Post
```
PUT /api/posts/{postId}
Authorization: Bearer {token}

Body:
{
  "content": "Updated content",
  "privacy": "friends"
}

Response: Updated post
```

### Delete Post
```
DELETE /api/posts/{postId}
Authorization: Bearer {token}
Response: Deleted post
```

### Search Posts
```
GET /api/posts/search?query=design&page=1&limit=20
Response: Posts matching the search query
```

---

## Comments API

### Create Comment
```
POST /api/posts/{postId}/comments
Authorization: Bearer {token}

Body:
{
  "content": "Great post!",
  "parentCommentId": "comment-id" (optional for replies)
}

Response: Created comment with user details
```

### Get Post Comments
```
GET /api/posts/{postId}/comments?page=1&limit=20
Response: All comments on a post (threaded)
```

### Get Single Comment
```
GET /api/comments/{commentId}
Response: Comment with all replies
```

### Update Comment
```
PUT /api/comments/{commentId}
Authorization: Bearer {token}

Body:
{
  "content": "Updated comment"
}

Response: Updated comment
```

### Delete Comment
```
DELETE /api/comments/{commentId}
Authorization: Bearer {token}
Response: Deleted comment (also deletes all replies)
```

---

## Reactions API

### Add Reaction
```
POST /api/posts/{postId}/reactions
Authorization: Bearer {token}

Body:
{
  "reactionType": "like|love|care|haha|wow|sad|angry"
}

Response: Created/updated reaction
```

### Remove Reaction
```
DELETE /api/posts/{postId}/reactions
Authorization: Bearer {token}
Response: Deleted reaction
```

### Get Post Reactions
```
GET /api/posts/{postId}/reactions
Response: All reactions for post with breakdown by type
```

### Get User Reaction
```
GET /api/posts/{postId}/reactions/user
Authorization: Bearer {token}
Response: Current user's reaction on the post
```

### Add Comment Reaction
```
POST /api/comments/{commentId}/reactions
Authorization: Bearer {token}

Body:
{
  "reactionType": "like"
}

Response: Created/updated reaction
```

### Remove Comment Reaction
```
DELETE /api/comments/{commentId}/reactions
Authorization: Bearer {token}
Response: Deleted reaction
```

---

## Friendships API

### Send Friend Request
```
POST /api/friendships/request/{userId}
Authorization: Bearer {token}
Response: Created friend request
```

### Get Friend Requests
```
GET /api/friendships/requests?page=1&limit=20
Authorization: Bearer {token}
Response: Pending friend requests for current user
```

### Accept Friend Request
```
POST /api/friendships/request/{requestId}/accept
Authorization: Bearer {token}
Response: Created friendship
```

### Reject Friend Request
```
POST /api/friendships/request/{requestId}/reject
Authorization: Bearer {token}
Response: Deleted request
```

### Get User Friends
```
GET /api/users/{username}/friends?page=1&limit=20
Response: List of user's friends
```

### Remove Friend
```
DELETE /api/friendships/{friendId}
Authorization: Bearer {token}
Response: Deleted friendship
```

### Check Friendship Status
```
GET /api/friendships/status/{userId}
Authorization: Bearer {token}
Response: 
{
  "isFriend": true|false,
  "pendingRequest": null | { "id": "...", "sentBy": "you|them" }
}
```

### Get Mutual Friends
```
GET /api/friendships/mutual/{userId}
Response: List of mutual friends between current user and target user
```

---

## User Profiles API

### Get Profile
```
GET /api/users/me
Authorization: Bearer {token}
Response: Current user's profile
```

### Get User Profile
```
GET /api/users/{username}
Response: Public profile of a user
```

### Update Profile
```
PUT /api/users/me
Authorization: Bearer {token}

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Product Designer",
  "intro": "Creative and passionate",
  "location": "San Francisco, CA",
  "work": "Designer at Tech Co",
  "education": "Stanford University",
  "relationshipStatus": "In a relationship"
}

Response: Updated profile
```

### Update Profile Photo
```
PUT /api/users/me/profile-photo
Authorization: Bearer {token}

Body:
{
  "photoUrl": "https://example.com/photo.jpg"
}

Response: Updated user with new profile photo
```

### Update Cover Photo
```
PUT /api/users/me/cover-photo
Authorization: Bearer {token}

Body:
{
  "coverUrl": "https://example.com/cover.jpg"
}

Response: Updated user with new cover photo
```

### Search Users
```
GET /api/users/search?query=john&page=1&limit=20
Response: List of users matching search query
```

### Get Trending Users
```
GET /api/users/trending?limit=10
Response: List of popular/trending users
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": "BadRequest"
}
```

### Paginated Response
```json
{
  "data": [ /* items */ ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

---

## Error Codes

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- Authenticated requests: 100 requests per minute per user
- Public requests: 30 requests per minute per IP

---

## Pagination

All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

---

## Examples

### Create a Post and Get Reactions
```bash
# 1. Create post
curl -X POST http://localhost:3003/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Amazing design!",
    "imageUrl": "https://example.com/image.jpg"
  }'

# 2. Add reaction
curl -X POST http://localhost:3003/api/posts/{postId}/reactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reactionType": "love"}'

# 3. Get all reactions
curl http://localhost:3003/api/posts/{postId}/reactions
```

### Friend Flow
```bash
# 1. Send friend request
curl -X POST http://localhost:3003/api/friendships/request/{userId} \
  -H "Authorization: Bearer TOKEN"

# 2. Check requests
curl http://localhost:3003/api/friendships/requests \
  -H "Authorization: Bearer TOKEN"

# 3. Accept request
curl -X POST http://localhost:3003/api/friendships/request/{requestId}/accept \
  -H "Authorization: Bearer TOKEN"

# 4. Get user's friends
curl http://localhost:3003/api/users/john-doe/friends
```
