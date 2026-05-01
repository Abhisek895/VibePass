# VibePass Backend API - Quick Start Guide

## Summary of What's Been Created

The backend API is now fully implemented with 3 controllers that serve the frontend:

1. **ProfilesController** - User profiles, search
2. **FacebookPostsController** - Posts, comments, reactions  
3. **FacebookFriendshipsController** - Friendships, friend requests

All endpoints connect to the `facebook_clone` MySQL database and return properly formatted JSON responses that the frontend is already configured to consume.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend Server
```bash
cd backend
npm install  # if you haven't already
npm run start:dev
```

Expected output:
```
[Nest] 12345  - 01/20/2024, 4:30:00 PM     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 12345  - 01/20/2024, 4:30:00 PM     LOG [InstanceLoader] UsersModule dependencies initialized
[Nest] 12345  - 01/20/2024, 4:30:00 PM     LOG [InstanceLoader] PostsModule dependencies initialized
[Nest] 12345  - 01/20/2024, 4:30:01 PM     LOG [NestFactory] Nest application successfully started
```

### Step 2: Seed Database with Test Data
```bash
# In a new terminal, run:
mysql -u root -p facebook_clone < backend/prisma/seed-facebook-clone.sql
```

This creates:
- 5 test users (ariana, john_doe, sarah_smith, mike_chen, emily_davis)
- Posts, comments, reactions
- Friendship connections

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000/profile/ariana**

✅ You should now see:
- Ariana's profile with bio, city, work info
- 2 posts with comments and reactions
- 3 friends listed
- All data from the real database!

---

## 🧪 Test Endpoints with cURL

### Get User Profile
```bash
curl http://localhost:3003/api/users/ariana
```

### Get User's Posts
```bash
curl "http://localhost:3003/api/posts/user/ariana?page=1&limit=10"
```

### Get User's Friends
```bash
curl "http://localhost:3003/api/friendships/ariana/friends?page=1&limit=20"
```

### Search Users
```bash
curl "http://localhost:3003/api/users/search?q=john"
```

### Get Post Comments
```bash
curl "http://localhost:3003/api/posts/1/comments"
```

### Get Post Reactions
```bash
curl "http://localhost:3003/api/posts/1/reactions"
```

---

## 📚 Documentation Files

Read these for detailed information:

1. **[API_ENDPOINTS.md](./API_ENDPOINTS.md)**
   - Complete list of all endpoints
   - Request/response examples
   - Parameter descriptions
   - cURL and Postman examples

2. **[BACKEND_TESTING_GUIDE.md](./BACKEND_TESTING_GUIDE.md)**
   - How to test each endpoint
   - Database setup instructions
   - Troubleshooting common issues
   - Performance testing guide

3. **[BACKEND_INTEGRATION_COMPLETE.md](./BACKEND_INTEGRATION_COMPLETE.md)**
   - Architecture overview
   - Data transformation flow
   - File structure
   - Integration checklist

---

## 🏗️ Architecture Overview

```
User loads /profile/ariana
        ↓
React useProfile() hook
        ↓
profileService.getProfile('ariana')
        ↓
HTTP GET /api/users/ariana
        ↓
ProfilesController receives request
        ↓
Queries facebook_clone database:
  SELECT * FROM users WHERE username='ariana'
  SELECT * FROM user_profiles WHERE user_id=1
  COUNT friendships for user
  COUNT posts by user
        ↓
Transforms database fields:
  first_name → firstName
  profile_photo_url → profileImage
  Nested: location, work, education
        ↓
Returns formatted JSON response
        ↓
Frontend displays user profile data
```

---

## 📦 API Endpoints Summary

### User Profiles (GET)
- `GET /api/users/:username` - Get profile
- `GET /api/users/:username/friends` - Get friends
- `GET /api/users/search?q=...` - Search users

### Posts (GET, authenticated: POST)
- `GET /api/posts/user/:username` - Get user's posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:postId/comments` - Add comment 🔒
- `GET /api/posts/:postId/comments` - Get comments
- `POST /api/posts/:postId/reactions` - Add reaction 🔒
- `GET /api/posts/:postId/reactions` - Get reactions

### Friendships (GET, authenticated: POST/DELETE)
- `GET /api/friendships/:username/friends` - Get friends
- `GET /api/friendships/:username/pending` - Get requests
- `GET /api/friendships/:username/status?targetUsername=...` - Check status
- `POST /api/friendships/request` - Send request 🔒
- `POST /api/friendships/request/:id/accept` - Accept 🔒
- `DELETE /api/friendships/request/:id` - Reject 🔒
- `DELETE /api/friendships/:username/remove` - Remove friend 🔒

🔒 = Authentication required

---

## 🗄️ Database Structure

### Tables Used
- **users** - User accounts and basic info
- **user_profiles** - Extended profile data (bio, city, work, education, photos)
- **posts** - User posts and content
- **posts_media** - Post images/videos
- **comments** - Post comments
- **reactions** - Post reactions (like, love, care, haha, wow, sad, angry)
- **friendships** - Friend connections (bidirectional)
- **friend_requests** - Pending friend requests

### Test Data
```
users:        5 (ariana, john_doe, sarah_smith, mike_chen, emily_davis)
posts:        6 total
comments:     12 total
reactions:    8 total
friendships:  7 total
```

---

## 🐛 Troubleshooting

### "404 Profile not found" Error
1. Check backend is running: `curl http://localhost:3003/api/users/ariana`
2. Check database is seeded: `mysql facebook_clone -e "SELECT COUNT(*) FROM users;"`
3. Check username spelling (case-sensitive)

### Backend Won't Start
1. Check MySQL is running: `mysql -u root -p -e "SELECT 1;"`
2. Check .env has correct DATABASE_URL
3. Check port 3003 is not in use

### No Posts Showing
1. Check seed script ran successfully
2. Check database: `SELECT COUNT(*) FROM posts;`
3. Check controller logs in backend terminal

### Database Connection Error
```bash
# Fix: Update backend/.env with correct credentials
DATABASE_URL="mysql://root:password@localhost:3306/facebook_clone"

# Then restart backend
npm run start:dev
```

---

## 📋 Verification Checklist

- [ ] Backend running on http://localhost:3003
- [ ] Can get user profile: `curl http://localhost:3003/api/users/ariana`
- [ ] Database seeded with 5 users
- [ ] Ariana user has posts in database
- [ ] Frontend running on localhost:3000
- [ ] Profile page loads at /profile/ariana
- [ ] User profile displays correctly
- [ ] Posts appear below profile
- [ ] Friends list shows 3 friends
- [ ] Comments and reactions display on posts

---

## 📝 Database Seed Details

The test data includes:

**Ariana Miller (ariana)**
- Bio: "Living my best life 🌟"
- Work: Tech Lead at Meta
- City: San Francisco
- Hometown: Los Angeles
- School: Stanford University
- Friends: john_doe, sarah_smith, mike_chen (3 total)
- Posts: 2 posts with comments and reactions

**Friends:**
- John Doe (john_doe) - Product Manager at Google
- Sarah Smith (sarah_smith) - UX Designer at Apple
- Mike Chen (mike_chen) - Software Engineer at Netflix

---

## 🔧 Environment Setup

### Backend .env
```
DATABASE_URL="mysql://root:password@localhost:3306/facebook_clone"
JWT_SECRET=your_secret_key
JWT_EXPIRATION=7d
NODE_ENV=development
PORT=3003
```

### Frontend .env (if needed)
```
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

---

## 🚦 Next Steps

1. **Start Backend:** `cd backend && npm run start:dev`
2. **Seed Database:** `mysql -u root -p facebook_clone < backend/prisma/seed-facebook-clone.sql`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Open Profile:** http://localhost:3000/profile/ariana
5. **Verify Data:** Profile, posts, and friends should display
6. **Test Endpoints:** Use cURL or Postman to test other endpoints
7. **Read Documentation:** Check API_ENDPOINTS.md for complete API reference

---

## 📖 Key Files Created/Modified

**Backend Controllers (NEW):**
- `backend/src/modules/users/profiles.controller.ts`
- `backend/src/modules/users/facebook-friendships.controller.ts`
- `backend/src/modules/posts/facebook-posts.controller.ts`

**Module Updates:**
- `backend/src/modules/users/users.module.ts`
- `backend/src/modules/posts/posts.module.ts`

**Documentation (NEW):**
- `docs/API_ENDPOINTS.md` - API reference
- `docs/BACKEND_TESTING_GUIDE.md` - Testing guide
- `docs/BACKEND_INTEGRATION_COMPLETE.md` - Integration details

**Database Seed:**
- `backend/prisma/seed-facebook-clone.sql` - Test data

---

## 💡 Example: Complete Profile Page Load

```bash
# 1. User navigates to profile page
http://localhost:3000/profile/ariana

# 2. Frontend makes these API calls:
curl http://localhost:3003/api/users/ariana
curl http://localhost:3003/api/posts/user/ariana
curl http://localhost:3003/api/friendships/ariana/friends

# 3. Backend returns:
# - Profile data: name, bio, photos, work, location
# - Posts: 2 posts with comments and reactions
# - Friends: 3 friends with their profiles

# 4. Frontend displays all data:
# - Profile header with cover photo and profile pic
# - Post feed with comments and reactions
# - Friends section with friend cards
```

---

## ✅ You're All Set!

The backend is now fully implemented and ready to serve the frontend. The profile page should now load real data directly from the database instead of using mock data.

**Start the backend, seed the database, and navigate to the profile page to see it in action!**

---

**Questions?** Check the detailed documentation files:
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [BACKEND_TESTING_GUIDE.md](./BACKEND_TESTING_GUIDE.md) - Testing and troubleshooting
- [BACKEND_INTEGRATION_COMPLETE.md](./BACKEND_INTEGRATION_COMPLETE.md) - Architecture details

