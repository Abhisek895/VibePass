# Social Module - Backend Architecture

## Decision: Friend System vs Follow System

**Choice: Friend System** - Facebook-style with mutual acceptance.

**Why Friend System is better for Facebook-like flow:**
1. Requires mutual consent - more privacy-centric
2. More appropriate for personal profile content
3. Standard Facebook behavior users expect
4. Enables "friends only" privacy setting naturally

## Design: Post Type vs Separate Share Table

**Choice: Hybrid Approach** 
- Post has `postType: 'original' | 'share'` + `sharedPostId` + `shareCaption`
- Separate `Share` table for explicit share tracking with more metadata

**Why:**
- Single Post table for original posts and share activities keeps feed queries simple
- Separate Share table enables:
  - Tracking share metadata (caption, who shared)
  - Easier to query "who shared this post"
  - Can add share-specific features later (share reactions)
- Share count on Post table for quick access
- `postType` makes it clear in query results

## Share Feature Implementation

### Creating a Share:
1. User shares original post (ID: orig123)
2. New Post created with:
   - `postType: 'share'`
   - `sharedPostId: 'orig123'`
   - `shareCaption: 'Great post!'`
   - `authorId: sharer_user_id`
3. Original post's `sharesCount` incremented
4. Share appears in sharer's timeline

### Feed Display:
- Query posts where `authorId IN (friends) OR authorId = currentUser`
- If `postType === 'share'`, fetch original post details via `sharedPostId`
- Display: "User shared a post" + original author + original content preview

### Edge Cases:
- **Original post deleted**: Show "This post is unavailable" but keep share
- **Privacy changed**: If original becomes private, show "Content hidden" on share
- **Sharing a share**: Allowed - nested shares work (share → original_post_id points to original)

---

## Database Schema Overview

### Core Tables:
1. **users** - User accounts with profile fields
2. **user_profiles** - Extended profile info
3. **sessions** - Auth tokens
4. **friend_requests** - Friend requests (pending/accepted/rejected)
5. **user_friends** - Accept friendships (bidirectional)
6. **posts** - All posts (original + shares)
7. **post_media** - Images/videos per post
8. **reactions** - All reactions (generic target_type)
9. **comments** - Comments with parent for replies
10. **shares** - Explicit shares tracking
11. **blocks** - User blocking
12. **notifications** - Activity notifications
13. **bookmarks** - Saved posts

### Indexes for Performance:
- posts: authorId + createdAt (profile feed)
- posts: authorId + postType + createdAt (shares)
- posts: sharedPostId (original posts for shares)
- reactions: targetType + targetId (post/comment reactions)
- comments: postId + parentCommentId (threaded comments)
- friends: userId + friendId (friendship checks)

---

## API Endpoints

### Auth:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Users/Profile:
- `GET /api/users/:username` - Public profile
- `PATCH /api/users/me` - Update profile
- `PATCH /api/users/me/profile-photo` - Upload profile photo
- `PATCH /api/users/me/cover-photo` - Upload cover photo

### Friends:
- `POST /api/friends/request/:userId` - Send friend request
- `POST /api/friends/accept/:requestId` - Accept request
- `POST /api/friends/reject/:requestId` - Reject request
- `DELETE /api/friends/:friendId` - Remove friend
- `GET /api/friends/requests` - Pending requests
- `GET /api/friends/:userId/status` - Friend status
- `GET /api/users/:username/friends` - User's friends list
- `GET /api/users/:username/followers` - Followers
- `GET /api/users/:username/following` - Following

### Posts:
- `POST /api/posts` - Create post (original)
- `POST /api/posts/:id/share` - Share a post
- `GET /api/posts/feed` - Home feed
- `GET /api/posts/:id` - Single post
- `PATCH /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/users/:username/posts` - User's posts
- `GET /api/users/:username/shares` - User's shares

### Reactions:
- `POST /api/posts/:id/reactions` - Add/update reaction
- `DELETE /api/posts/:id/reactions` - Remove reaction
- `POST /api/comments/:id/reactions` - React to comment
- `DELETE /api/comments/:id/reactions` - Remove reaction

### Comments:
- `POST /api/posts/:id/comments` - Comment on post
- `GET /api/posts/:id/comments` - Get comments
- `PATCH /api/comments/:id` - Edit comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/replies` - Reply to comment

### Media:
- `POST /api/media/upload` - Upload media file

### Notifications:
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Bookmarks:
- `POST /api/posts/:id/bookmark` - Bookmark post
- `DELETE /api/posts/:id/bookmark` - Remove bookmark
- `GET /api/bookmarks` - User's bookmarks

---

## Implementation Order

1. **Setup**: Database, Prisma, basic NestJS setup
2. **Auth**: Register, login, JWT guard
3. **Users**: Profile CRUD, photo upload
4. **Friends**: Friend request system
5. **Posts**: Create, read, update, delete
6. **Media**: Upload handling
7. **Reactions**: Add/remove reactions
8. **Comments**: Add, reply, edit, delete
9. **Shares**: Share logic + feed integration
10. **Feed**: Home feed with friends' posts + shares
11. **Profile**: User timeline with posts/shares
12. **Notifications** (optional)
13. **Bookmarks** (optional)

---

## Feed Query Logic

### Home Feed Query:
```sql
SELECT p.*, u.username, u.firstName, u.lastName, u.profilePhotoUrl,
       (SELECT COUNT(*) FROM reactions WHERE targetType='post' AND targetId=p.id) as reactionsCount,
       (SELECT COUNT(*) FROM comments WHERE postId=p.id) as commentsCount,
       p.sharesCount as sharesCount
FROM posts p
JOIN users u ON p.authorId = u.id
WHERE p.status = 'active'
  AND p.visibility IN ('public', 'friends')
  AND p.authorId IN (SELECT friendId FROM user_friends WHERE userId = ?)
  OR p.authorId = ?
ORDER BY p.createdAt DESC
LIMIT 20 OFFSET ?
```

### Shares on Profile:
```sql
SELECT p.*, u.username, u.profilePhotoUrl,
       op.content as originalContent,
       op.authorId as originalAuthorId,
       ou.username as originalAuthorUsername
FROM posts p
JOIN users u ON p.authorId = u.id
LEFT JOIN posts op ON p.sharedPostId = op.id
LEFT JOIN users ou ON op.authorId = ou.id
WHERE p.postType = 'share'
  AND p.authorId = ?
ORDER BY p.createdAt DESC
```

---

## Edge Cases & Handling

### Share Flow:
1. **Original post deleted**: Show "Post unavailable" on share card
2. **Privacy change**: If original becomes private, show "Content hidden"
3. **Sharing a share**: Allow - share.originalPostId points to original
4. **Share with caption**: Store in shareCaption, show above original

### Reaction Flow:
1. **Toggle reaction**: If same type, remove; if different, update
2. **Duplicate reaction**: Prevent via unique constraint (userId + targetType + targetId)
3. **React to share**: Target is the share post, not original

### Comment Flow:
1. **Delete comment with replies**: Soft delete, keep replies visible
2. **Delete parent comment**: Replies become top-level (orphan)

### Privacy Flow:
1. **Private user**: Show only their own posts
2. **Friends only**: Hide from non-friends
3. **Blocked**: Don't show posts from blocked users

### Pagination:
- Cursor-based preferred over offset for performance
- Use `createdAt` + `id` as cursor for consistency

---

## Manual Testing Checklist

### Auth:
- [ ] Register with email/password
- [ ] Login and receive JWT
- [ ] Access protected route with JWT
- [ ] Logout invalidates token

### Profile:
- [ ] View public profile by username
- [ ] Update bio, work, education
- [ ] Upload profile photo
- [ ] Upload cover photo

### Friends:
- [ ] Send friend request
- [ ] Accept friend request
- [ ] Reject friend request
- [ ] Remove friend
- [ ] View friends list
- [ ] See friend status on profile

### Posts:
- [ ] Create text post
- [ ] Create post with image
- [ ] Edit own post
- [ ] Delete own post
- [ ] View home feed
- [ ] View profile posts

### Reactions:
- [ ] React with like
- [ ] React with love
- [ ] Change reaction type
- [ ] Remove reaction
- [ ] See reaction counts

### Comments:
- [ ] Comment on post
- [ ] Reply to comment
- [ ] Edit own comment
- [ ] Delete own comment
- [ ] See comment count

### Shares (Critical):
- [ ] Share original post without caption
- [ ] Share with caption
- [ ] Share appears on sharer's profile
- [ ] Original post shows share count
- [ ] Share shows "X shared a post"
- [ ] Share card shows original author + content
- [ ] Share a share (nested)
- [ ] Original post deleted shows "unavailable"

### Feed:
- [ ] Home feed shows own posts
- [ ] Home feed shows friends' posts
- [ ] Home feed shows shares from friends
- [ ] Pagination works (load more)
- [ ] Share cards show correctly in feed

### Profile:
- [ ] Timeline shows own posts
- [ ] Timeline shows own shares
- [ ] Privacy settings respected
- [ ] Friend button shows correctly