# VibePass Database Schema & CRUD Operations

## Database Overview

The VibePass application uses MySQL with the following main tables for social features:

### Core Tables

#### `users`
Stores user account information
- `id` (BIGINT UNSIGNED) - Primary key
- `username` VARCHAR(50) - Unique username
- `email` VARCHAR(255) - User email
- `firstName`, `lastName` - User name
- `profileImage`, `coverImage` - Profile and cover photos
- `bio`, `intro` - User bio and intro text
- `location`, `work`, `education` - Career/location info
- `relationshipStatus` - Relationship status
- `createdAt`, `updatedAt` - Timestamps

#### `posts`
Stores user-generated posts
- `id` (BIGINT UNSIGNED) - Primary key
- `userId` - Author of post
- `content` TEXT - Post content
- `imageUrl` - Post image URL
- `privacy` ENUM - public/friends/private
- `backgroundColor` - Background color for text-only posts
- `createdAt`, `updatedAt` - Timestamps

#### `comments`
Stores comments on posts
- `id` (BIGINT UNSIGNED) - Primary key
- `postId` - Post being commented on
- `userId` - Comment author
- `content` TEXT - Comment text
- `parentCommentId` - Parent comment (for nested replies)
- `createdAt` - Timestamp

#### `reactions`
Stores post reactions/likes
- `id` (BIGINT UNSIGNED) - Primary key
- `postId` - Post being reacted to
- `userId` - User who reacted
- `reactionType` ENUM - like/love/care/haha/wow/sad/angry
- `createdAt` - Timestamp

#### `comment_reactions`
Stores reactions on comments
- Same structure as reactions but for comments

#### `friendships`
Tracks friend connections
- `id` (BIGINT UNSIGNED) - Primary key
- `user1Id`, `user2Id` - Two users in friendship
- `createdAt` - Timestamp

#### `friend_requests`
Tracks pending friend requests
- `id` (BIGINT UNSIGNED) - Primary key
- `senderId` - User sending request
- `receiverId` - User receiving request
- `status` ENUM - pending/accepted/rejected
- `createdAt`, `respondedAt` - Timestamps

---

## Service Implementation

### 1. **PostsCrudService** (`src/modules/posts/posts-crud.service.ts`)
Handles all post operations:
- ✅ Create posts
- ✅ Get feed (posts from user and friends)
- ✅ Get user's posts
- ✅ Get single post
- ✅ Update post (only author)
- ✅ Delete post (only author)
- ✅ Search posts

### 2. **CommentsService** (`src/modules/posts/comments.service.ts`)
Handles all comment operations:
- ✅ Create comment (with nested replies)
- ✅ Get post comments (threaded)
- ✅ Get single comment
- ✅ Update comment (only author)
- ✅ Delete comment (cascades to replies)

### 3. **ReactionsService** (`src/modules/posts/reactions.service.ts`)
Handles all reaction operations:
- ✅ Add/update post reaction
- ✅ Remove post reaction
- ✅ Get post reactions (grouped by type)
- ✅ Get user's reaction on post
- ✅ Add/update/remove comment reactions

### 4. **FriendshipsService** (`src/modules/users/friendships.service.ts`)
Handles all friendship operations:
- ✅ Send friend request
- ✅ Accept/reject friend request
- ✅ Get pending friend requests
- ✅ Get user's friends
- ✅ Remove friend
- ✅ Check if users are friends
- ✅ Get mutual friends between users

### 5. **UserProfilesService** (`src/modules/users/user-profiles.service.ts`)
Handles user profile operations:
- ✅ Get complete profile
- ✅ Get profile by username
- ✅ Update profile
- ✅ Update profile photo
- ✅ Update cover photo
- ✅ Search users
- ✅ Get user relationship status
- ✅ Get trending users

---

## CRUD Operations Summary

### Posts (6 operations)
| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Create | POST | /api/posts | ✅ |
| Get Feed | GET | /api/posts/feed | ✅ |
| Get User Posts | GET | /api/posts/user/{username} | ❌ |
| Get Single | GET | /api/posts/{postId} | ❌ |
| Update | PUT | /api/posts/{postId} | ✅ |
| Delete | DELETE | /api/posts/{postId} | ✅ |

### Comments (5 operations)
| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Create | POST | /api/posts/{postId}/comments | ✅ |
| Get Comments | GET | /api/posts/{postId}/comments | ❌ |
| Get Single | GET | /api/comments/{commentId} | ❌ |
| Update | PUT | /api/comments/{commentId} | ✅ |
| Delete | DELETE | /api/comments/{commentId} | ✅ |

### Reactions (6 operations)
| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Add | POST | /api/posts/{postId}/reactions | ✅ |
| Remove | DELETE | /api/posts/{postId}/reactions | ✅ |
| Get All | GET | /api/posts/{postId}/reactions | ❌ |
| Get User's | GET | /api/posts/{postId}/reactions/user | ✅ |
| Comment React | POST | /api/comments/{commentId}/reactions | ✅ |
| Comment Unreact | DELETE | /api/comments/{commentId}/reactions | ✅ |

### Friendships (7 operations)
| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Send Request | POST | /api/friendships/request/{userId} | ✅ |
| Get Requests | GET | /api/friendships/requests | ✅ |
| Accept | POST | /api/friendships/request/{requestId}/accept | ✅ |
| Reject | POST | /api/friendships/request/{requestId}/reject | ✅ |
| Get Friends | GET | /api/users/{username}/friends | ❌ |
| Remove Friend | DELETE | /api/friendships/{friendId} | ✅ |
| Get Mutual | GET | /api/friendships/mutual/{userId} | ❌ |

### User Profiles (6 operations)
| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Get My Profile | GET | /api/users/me | ✅ |
| Get User Profile | GET | /api/users/{username} | ❌ |
| Update Profile | PUT | /api/users/me | ✅ |
| Profile Photo | PUT | /api/users/me/profile-photo | ✅ |
| Cover Photo | PUT | /api/users/me/cover-photo | ✅ |
| Search Users | GET | /api/users/search | ❌ |

---

## Total CRUD Operations: 30

### Breakdown
- **Create**: 7 operations
- **Read**: 13 operations
- **Update**: 6 operations
- **Delete**: 4 operations

---

## Database Retrieval

To retrieve data from the database, you can use the following methods:

### 1. Using the Services Directly
```typescript
import { PostsCrudService } from './posts-crud.service';

constructor(private postsService: PostsCrudService) {}

// Get all user posts
const posts = await this.postsService.getUserPosts('username');

// Get feed
const feed = await this.postsService.getFeed(userId);
```

### 2. Using SQL Queries (if needed)
```sql
-- Get all posts by user
SELECT * FROM posts WHERE userId = ? ORDER BY createdAt DESC;

-- Get post with comments and reactions
SELECT 
  p.*,
  COUNT(DISTINCT c.id) as commentCount,
  COUNT(DISTINCT r.id) as reactionCount
FROM posts p
LEFT JOIN comments c ON p.id = c.postId
LEFT JOIN reactions r ON p.id = r.postId
WHERE p.id = ?
GROUP BY p.id;

-- Get user's friends
SELECT u.* FROM users u
INNER JOIN friendships f ON (f.user1Id = u.id OR f.user2Id = u.id)
WHERE f.user1Id = ? OR f.user2Id = ?;
```

### 3. Pagination
All list endpoints support pagination:
```
GET /api/posts?page=1&limit=20
```

---

## Next Steps

1. **Integration**: Integrate these services into controllers
2. **Validation**: Add DTOs for all endpoints
3. **Testing**: Create unit and integration tests
4. **Documentation**: Generate OpenAPI/Swagger docs
5. **Performance**: Add caching and query optimization

