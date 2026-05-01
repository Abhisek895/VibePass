# VibePass Facebook Clone API Endpoints Documentation

## Base URL
```
http://localhost:3003/api
```

## Authentication
All endpoints marked with 🔒 require a JWT Bearer token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Profiles API

### 1. Get User Profile
**GET** `/users/:username`

Retrieve a user's complete profile with friend and post counts.

**Parameters:**
- `username` (string) - The username of the user

**Response:**
```json
{
  "id": 1,
  "username": "ariana",
  "firstName": "Ariana",
  "lastName": "Miller",
  "email": "ariana@example.com",
  "bio": "Living my best life 🌟",
  "intro": "Finding my vibe",
  "profileImage": "https://...",
  "coverImage": "https://...",
  "location": {
    "city": "San Francisco",
    "hometown": "Los Angeles"
  },
  "work": {
    "title": "Tech Lead",
    "company": "Meta"
  },
  "education": {
    "school": "Stanford University",
    "graduationYear": 2020
  },
  "gender": "Female",
  "relationshipStatus": "Single",
  "friendsCount": 45,
  "postsCount": 23,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - User not found

---

### 2. Get User's Friends
**GET** `/users/:username/friends`

Get paginated list of a user's friends.

**Parameters:**
- `username` (string) - The username of the user
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "friends": [
    {
      "id": 2,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://...",
      "coverImage": "https://...",
      "bio": "Coffee enthusiast ☕",
      "mutualFriendsCount": 12
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

---

### 3. Search Users
**GET** `/users/search`

Search for users by username, first name, or last name.

**Query Parameters:**
- `q` (string, required) - Search query
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "ariana",
      "firstName": "Ariana",
      "lastName": "Miller",
      "profileImage": "https://...",
      "bio": "Living my best life 🌟"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

## Posts API

### 1. Get User's Posts
**GET** `/posts/user/:username`

Get paginated posts from a specific user.

**Parameters:**
- `username` (string) - The username of the user
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "posts": [
    {
      "id": 101,
      "userId": 1,
      "content": "Just finished an amazing project! Feeling so accomplished 🎉",
      "imageUrl": "https://...",
      "privacy": "public",
      "backgroundColor": "#8B5CF6",
      "user": {
        "id": 1,
        "username": "ariana",
        "firstName": "Ariana",
        "lastName": "Miller",
        "profileImage": "https://..."
      },
      "reactions": [
        {
          "id": 1,
          "postId": 101,
          "userId": 2,
          "reactionType": "like"
        }
      ],
      "comments": [
        {
          "id": 1,
          "postId": 101,
          "userId": 2,
          "content": "Congrats! Looks amazing!",
          "user": {
            "id": 2,
            "username": "john_doe",
            "firstName": "John",
            "lastName": "Doe"
          },
          "createdAt": "2024-01-20T15:45:00Z"
        }
      ],
      "commentsCount": 5,
      "reactionsCount": 23,
      "createdAt": "2024-01-20T15:45:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. Get Single Post
**GET** `/posts/:id`

Retrieve a specific post with all its details.

**Parameters:**
- `id` (string) - The post ID

**Response:** Same structure as user posts

---

### 3. Add Comment to Post 🔒
**POST** `/posts/:postId/comments`

Add a comment to a post.

**Parameters:**
- `postId` (string) - The post ID

**Request Body:**
```json
{
  "content": "This is an awesome post!",
  "parentCommentId": null
}
```

**Response:**
```json
{
  "id": 5,
  "postId": 101,
  "userId": 2,
  "content": "This is an awesome post!",
  "user": {
    "id": 2,
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "createdAt": "2024-01-20T16:00:00Z",
  "updatedAt": "2024-01-20T16:00:00Z"
}
```

---

### 4. Get Post Comments
**GET** `/posts/:postId/comments`

Get paginated comments on a post.

**Parameters:**
- `postId` (string) - The post ID
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "comments": [
    {
      "id": 1,
      "postId": 101,
      "userId": 2,
      "content": "Congrats! Looks amazing!",
      "user": {
        "id": 2,
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-20T15:45:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20
}
```

---

### 5. Add Reaction to Post 🔒
**POST** `/posts/:postId/reactions`

Add or update a reaction on a post. If user already reacted, updates the reaction type.

**Parameters:**
- `postId` (string) - The post ID

**Request Body:**
```json
{
  "reactionType": "like"
}
```

**Supported Reaction Types:**
- `like`
- `love`
- `care`
- `haha`
- `wow`
- `sad`
- `angry`

**Response:**
```json
{
  "id": 23,
  "postId": 101,
  "userId": 2,
  "reactionType": "like",
  "createdAt": "2024-01-20T15:50:00Z"
}
```

---

### 6. Get Post Reactions
**GET** `/posts/:postId/reactions`

Get all reactions on a post, grouped by reaction type.

**Parameters:**
- `postId` (string) - The post ID

**Response:**
```json
{
  "total": 23,
  "byType": {
    "like": 15,
    "love": 5,
    "care": 2,
    "haha": 1,
    "wow": 0,
    "sad": 0,
    "angry": 0
  },
  "reactions": [
    {
      "id": 1,
      "postId": 101,
      "userId": 2,
      "reactionType": "like",
      "user": {
        "id": 2,
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2024-01-20T15:50:00Z"
    }
  ]
}
```

---

## Friendships API

### 1. Get User's Friends
**GET** `/friendships/:username/friends`

Get paginated list of a user's friends.

**Parameters:**
- `username` (string) - The username of the user
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "friends": [
    {
      "id": 2,
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://...",
      "coverImage": "https://...",
      "bio": "Coffee enthusiast ☕",
      "mutualFriendsCount": 12
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. Get Pending Friend Requests
**GET** `/friendships/:username/pending`

Get pending friend requests for a user.

**Parameters:**
- `username` (string) - The username of the user
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "senderId": 5,
      "sender": {
        "id": 5,
        "username": "emily_davis",
        "firstName": "Emily",
        "lastName": "Davis",
        "profileImage": "https://..."
      },
      "status": "pending",
      "sentAt": "2024-01-19T10:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 20
}
```

---

### 3. Check Friendship Status
**GET** `/friendships/:username/status`

Check the friendship status between the current user and another user.

**Parameters:**
- `username` (string) - Username of the first user
- `targetUsername` (string, query) - Username of the second user

**Example:** `GET /friendships/ariana/status?targetUsername=john_doe`

**Response:**
```json
{
  "status": "friends"
}
```

OR

```json
{
  "status": "pending",
  "direction": "sent",
  "requestId": 1
}
```

**Possible status values:**
- `friends` - Users are friends
- `pending` - Friend request is pending
- `not_friends` - No friendship or request

---

### 4. Send Friend Request 🔒
**POST** `/friendships/request`

Send a friend request to another user.

**Request Body:**
```json
{
  "targetUsername": "emily_davis"
}
```

**Response:**
```json
{
  "id": 2,
  "receiverId": 5,
  "receiver": {
    "id": 5,
    "username": "emily_davis",
    "firstName": "Emily",
    "lastName": "Davis",
    "profileImage": "https://..."
  },
  "status": "pending",
  "sentAt": "2024-01-20T16:30:00Z"
}
```

---

### 5. Accept Friend Request 🔒
**POST** `/friendships/request/:requestId/accept`

Accept a friend request.

**Parameters:**
- `requestId` (string) - The friend request ID

**Response:**
```json
{
  "id": 15,
  "status": "accepted",
  "message": "Friend request accepted"
}
```

---

### 6. Reject Friend Request 🔒
**DELETE** `/friendships/request/:requestId`

Reject or cancel a friend request.

**Parameters:**
- `requestId` (string) - The friend request ID

**Response:**
```json
{
  "message": "Friend request rejected"
}
```

---

### 7. Remove Friend 🔒
**DELETE** `/friendships/:username/remove`

Remove a friend.

**Parameters:**
- `username` (string) - Username of the friend to remove

**Response:**
```json
{
  "message": "Friend removed"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Example Usage: Profile Page Flow

### 1. Get User Profile
```bash
curl -X GET http://localhost:3003/api/users/ariana
```

### 2. Get User's Posts
```bash
curl -X GET http://localhost:3003/api/posts/user/ariana?page=1&limit=20
```

### 3. Get User's Friends
```bash
curl -X GET http://localhost:3003/api/friendships/ariana/friends?page=1&limit=10
```

### 4. Get Current User (authenticated)
```bash
curl -X GET http://localhost:3003/api/auth/me \
  -H "Authorization: Bearer your_jwt_token"
```

---

## Testing with cURL

### Add a Comment
```bash
curl -X POST http://localhost:3003/api/posts/101/comments \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"content": "Amazing post!"}'
```

### Add a Reaction
```bash
curl -X POST http://localhost:3003/api/posts/101/reactions \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"reactionType": "like"}'
```

### Send Friend Request
```bash
curl -X POST http://localhost:3003/api/friendships/request \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"targetUsername": "emily_davis"}'
```

---

## Notes

1. **Pagination**: Default page is 1, default limit is 20 items per page
2. **Authentication**: Protected endpoints require valid JWT token
3. **Timestamps**: All timestamps are in ISO 8601 format (UTC)
4. **Case Sensitivity**: Usernames are case-sensitive
5. **Privacy**: Default post privacy is "public", can be "friends" or "private"
6. **Reactions**: Users can only have one reaction per post at a time (new reaction replaces old one)
7. **Friendships**: Bidirectional - if A is friends with B, then B is friends with A

---

## Integration with Frontend

All these endpoints are called through the frontend API services:
- `profileService` - User profiles and search
- `postsService` - Posts, comments, and reactions
- `friendshipsService` - Friendship operations

The React hooks (`useProfile`, `useProfilePosts`, `useProfileFriends`) use these services and handle data fetching, caching, and state management.
