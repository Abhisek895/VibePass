# VibePass Backend Testing Guide

## Prerequisites

- Backend running on `http://localhost:3003`
- Database seeded with test data
- Postman or cURL installed
- JWT token for authentication (obtained from login endpoint)

---

## Database Setup

### 1. Create facebook_clone Database

```sql
CREATE DATABASE facebook_clone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE facebook_clone;
```

### 2. Run Prisma Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

### 3. Seed Test Data

```bash
# Option 1: Using MySQL CLI
mysql -u root -p facebook_clone < prisma/seed-facebook-clone.sql

# Option 2: Using Prisma seed script
npx prisma db seed
```

---

## Backend Setup & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env File
```
DATABASE_URL="mysql://root:password@localhost:3306/facebook_clone"
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=7d
NODE_ENV=development
PORT=3003
```

### 3. Start Backend
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm build
npm start
```

Backend should be running at `http://localhost:3003`

---

## Testing Endpoints

### Method 1: Using cURL

#### Get User Profile
```bash
curl -X GET http://localhost:3003/api/users/ariana
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "username": "ariana",
  "firstName": "Ariana",
  "lastName": "Miller",
  "email": "ariana@example.com",
  "bio": "Living my best life 🌟",
  "intro": "Finding my vibe",
  "profileImage": "https://images.unsplash.com/photo-1494790108377-be9c29b29330...",
  "coverImage": "https://images.unsplash.com/photo-1552058544-f953b5438060...",
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
    "graduationYear": null
  },
  "gender": "Female",
  "relationshipStatus": "Single",
  "friendsCount": 3,
  "postsCount": 2,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Get User's Posts
```bash
curl -X GET "http://localhost:3003/api/posts/user/ariana?page=1&limit=10"
```

**Expected Response:**
- Array of posts with user info, comments, and reactions
- Pagination metadata (total, page, pageSize)

#### Get User's Friends
```bash
curl -X GET "http://localhost:3003/api/friendships/ariana/friends?page=1&limit=20"
```

**Expected Response:**
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
      "mutualFriendsCount": 0
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 20
}
```

#### Search Users
```bash
curl -X GET "http://localhost:3003/api/users/search?q=ariana&page=1&limit=20"
```

---

### Method 2: Using Postman

#### 1. Create a new Postman Collection

#### 2. Create Requests for Each Endpoint

**Request 1: Get User Profile**
- Method: GET
- URL: `{{baseUrl}}/users/ariana`
- Headers: None required

**Request 2: Get User's Posts**
- Method: GET
- URL: `{{baseUrl}}/posts/user/ariana?page=1&limit=10`
- Headers: None required

**Request 3: Get User's Friends**
- Method: GET
- URL: `{{baseUrl}}/friendships/ariana/friends?page=1&limit=20`
- Headers: None required

**Request 4: Get Single Post**
- Method: GET
- URL: `{{baseUrl}}/posts/1`
- Headers: None required

**Request 5: Get Post Comments**
- Method: GET
- URL: `{{baseUrl}}/posts/1/comments?page=1&limit=20`
- Headers: None required

**Request 6: Get Post Reactions**
- Method: GET
- URL: `{{baseUrl}}/posts/1/reactions`
- Headers: None required

**Request 7: Search Users** (Authenticated)
- Method: GET
- URL: `{{baseUrl}}/users/search?q=john`
- Headers: None required

---

## Testing Authenticated Endpoints

### 1. Get JWT Token

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ariana",
    "password": "your_password"
  }'
```

Response will include JWT token:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Add Comment to Post

```bash
curl -X POST http://localhost:3003/api/posts/1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is an amazing post!",
    "parentCommentId": null
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 6,
  "postId": 1,
  "userId": 1,
  "content": "This is an amazing post!",
  "user": {
    "id": 1,
    "username": "ariana",
    "firstName": "Ariana",
    "lastName": "Miller"
  },
  "createdAt": "2024-01-20T16:00:00.000Z",
  "updatedAt": "2024-01-20T16:00:00.000Z"
}
```

### 3. Add Reaction to Post

```bash
curl -X POST http://localhost:3003/api/posts/1/reactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reactionType": "love"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 6,
  "postId": 1,
  "userId": 1,
  "reactionType": "love",
  "createdAt": "2024-01-20T16:05:00.000Z"
}
```

### 4. Send Friend Request

```bash
curl -X POST http://localhost:3003/api/friendships/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUsername": "emily_davis"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "receiverId": 5,
  "receiver": {
    "id": 5,
    "username": "emily_davis",
    "firstName": "Emily",
    "lastName": "Davis",
    "profileImage": "https://..."
  },
  "status": "pending",
  "sentAt": "2024-01-20T16:30:00.000Z"
}
```

### 5. Accept Friend Request

```bash
curl -X POST http://localhost:3003/api/friendships/request/1/accept \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "id": 15,
  "status": "accepted",
  "message": "Friend request accepted"
}
```

### 6. Remove Friend

```bash
curl -X DELETE http://localhost:3003/api/friendships/emily_davis/remove \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Friend removed"
}
```

---

## Testing with Postman Collection

### 1. Set Environment Variables

Create a Postman environment with:
```json
{
  "baseUrl": "http://localhost:3003/api",
  "token": "your_jwt_token_here",
  "username": "ariana"
}
```

### 2. Add Pre-request Script for Auth

Add this to authenticated requests:
```javascript
// Pre-request Script
// This runs before each request

// You can manually set the token or fetch it
pm.environment.set("token", "your_jwt_token");
```

### 3. Test All Endpoints

1. Get User Profile
2. Get User's Posts
3. Get User's Friends
4. Get Post Reactions
5. Add Comment (needs token)
6. Add Reaction (needs token)
7. Send Friend Request (needs token)

---

## Common Issues & Troubleshooting

### Issue 1: "404 Profile not found"

**Causes:**
- User doesn't exist in database
- Username is case-sensitive
- Database not seeded

**Solution:**
```sql
-- Check if user exists
SELECT * FROM users WHERE username = 'ariana';

-- If not, run seed script
mysql -u root -p facebook_clone < prisma/seed-facebook-clone.sql
```

### Issue 2: "Cannot read properties of undefined"

**Causes:**
- Missing required fields in database
- Prisma schema doesn't match database
- NULL values not handled in controller

**Solution:**
```bash
# Update Prisma schema
npx prisma db push

# Reset database and reseed
npx prisma migrate reset --force
```

### Issue 3: "401 Unauthorized"

**Causes:**
- Missing Authorization header
- Invalid JWT token
- Token expired

**Solution:**
- Get fresh token: `curl -X POST .../auth/login`
- Include header: `Authorization: Bearer {token}`
- Check token expiration in `.env`

### Issue 4: "CORS Error"

**Causes:**
- Frontend and backend on different origins
- CORS not enabled in backend

**Solution:**
In `main.ts`:
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Issue 5: Database Connection Errors

**Causes:**
- MySQL not running
- Wrong credentials in `.env`
- Wrong database name

**Solution:**
```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1;"

# Update .env with correct credentials
# DATABASE_URL="mysql://root:password@localhost:3306/facebook_clone"

# Restart backend
npm run start:dev
```

---

## Performance Testing

### Test Load Time

```bash
# Single request
time curl http://localhost:3003/api/users/ariana

# Multiple requests (100)
for i in {1..100}; do
  curl http://localhost:3003/api/users/ariana > /dev/null
done
```

### Monitor Server Logs

```bash
# Watch backend logs
npm run start:dev | grep -i "error\|warning"
```

---

## Database Debugging

### Check Test Data

```sql
-- View all users
SELECT id, username, first_name, last_name FROM users;

-- View user profiles
SELECT u.username, up.bio, up.work_title, up.current_city 
FROM users u 
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- View posts
SELECT p.id, u.username, p.content, p.created_at 
FROM posts p 
JOIN users u ON p.author_id = u.id 
ORDER BY p.created_at DESC;

-- View friendships
SELECT u1.username, u2.username 
FROM friendships f 
JOIN users u1 ON f.user_one_id = u1.id 
JOIN users u2 ON f.user_two_id = u2.id;

-- View comments
SELECT c.id, u.username, c.content, c.created_at 
FROM comments c 
JOIN users u ON c.author_id = u.id 
ORDER BY c.created_at DESC;

-- View reactions summary
SELECT 
  p.id,
  u.username,
  COUNT(r.id) as reaction_count,
  GROUP_CONCAT(r.reaction_type) as reaction_types
FROM posts p 
JOIN users u ON p.author_id = u.id 
LEFT JOIN reactions r ON p.id = r.post_id 
GROUP BY p.id, u.username;
```

---

## Test Data Summary

### Created Test Data

**Users:**
- ariana (id: 1) - Main test user
- john_doe (id: 2)
- sarah_smith (id: 3)
- mike_chen (id: 4)
- emily_davis (id: 5)

**Posts:**
- 2 posts by ariana
- 1 post by john_doe
- 1 post by sarah_smith
- 1 post by mike_chen
- 1 post by emily_davis

**Friendships:**
- ariana ↔ john_doe
- ariana ↔ sarah_smith
- ariana ↔ mike_chen
- john_doe ↔ sarah_smith
- john_doe ↔ mike_chen
- sarah_smith ↔ emily_davis
- mike_chen ↔ emily_davis

**Comments & Reactions:**
- 12 total comments across posts
- 8 total reactions across posts

---

## Next Steps

1. ✅ Run backend: `npm run start:dev`
2. ✅ Seed database: `mysql -u root -p facebook_clone < prisma/seed-facebook-clone.sql`
3. ✅ Test endpoints using cURL or Postman
4. ✅ Run frontend to test integration
5. ✅ Navigate to profile page: `http://localhost:3000/profile/ariana`
6. ✅ Verify data displays correctly

---

## Expected Output

When profile page loads successfully:
- ✅ User profile information displays
- ✅ User's posts appear below profile
- ✅ Friends list shows 3 friends
- ✅ Comments and reactions display on posts
- ✅ All data matches database seed

---
