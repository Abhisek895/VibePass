-- Social Module Seed Data
-- Run this in MySQL to create test data

-- ============================================
-- Users
-- ============================================

INSERT INTO users (id, username, email, passwordHash, firstName, lastName, bio, profilePhotoUrl, coverPhotoUrl, accountPrivacy, createdAt, updatedAt) VALUES
('user-1', 'johndoe', 'john@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'John', 'Doe', 'Full stack developer | Coffee lover | Travel enthusiast', 'https://i.pravatar.cc/150?u=john', 'https://picsum.photos/1200/400?random=1', 'public', NOW(), NOW()),
('user-2', 'janedoe', 'jane@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Jane', 'Doe', 'UX Designer | Art lover | Foodie', 'https://i.pravatar.cc/150?u=jane', 'https://picsum.photos/1200/400?random=2', 'public', NOW(), NOW()),
('user-3', 'bobsmith', 'bob@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Bob', 'Smith', 'Software Engineer | Gamer | Movie buff', 'https://i.pravatar.cc/150?u=bob', 'https://picsum.photos/1200/400?random=3', 'friends', NOW(), NOW()),
('user-4', 'alicejohn', 'alice@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Alice', 'Johnson', 'Product Manager | Tech enthusiast', 'https://i.pravatar.cc/150?u=alice', 'https://picsum.photos/1200/400?random=4', 'public', NOW(), NOW()),
('user-5', 'mikebrown', 'mike@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Mike', 'Brown', 'Data Scientist | Math nerd | Runner', 'https://i.pravatar.cc/150?u=mike', 'https://picsum.photos/1200/400?random=5', 'private', NOW(), NOW());

-- ============================================
-- Friends (Bi-directional)
-- ============================================

INSERT INTO user_friends (id, userId, friendId, createdAt) VALUES
('f-1', 'user-1', 'user-2', NOW()),
('f-2', 'user-2', 'user-1', NOW()),
('f-3', 'user-1', 'user-3', NOW()),
('f-4', 'user-3', 'user-1', NOW()),
('f-5', 'user-2', 'user-4', NOW()),
('f-6', 'user-4', 'user-2', NOW());

-- ============================================
-- Posts (Original)
-- ============================================

INSERT INTO posts (id, authorId, content, postType, visibility, status, reactionsCount, commentsCount, sharesCount, createdAt, updatedAt) VALUES
('post-1', 'user-1', 'Hello world! This is my first post on this amazing social platform. Excited to connect with everyone!', 'original', 'public', 'active', 5, 2, 1, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 2 HOUR),
('post-2', 'user-2', 'Just finished working on an amazing design project. So happy with how it turned out! 🎨', 'original', 'public', 'active', 8, 3, 2, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 5 HOUR),
('post-3', 'user-3', 'Coffee and code. The perfect combination for a productive morning ☕💻', 'original', 'friends', 'active', 3, 1, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
('post-4', 'user-1', 'Check out this amazing view from my recent trip to the mountains! 🏔️', 'original', 'public', 'active', 15, 5, 3, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
('post-5', 'user-4', 'Excited to announce our new product launch! #innovation #startup', 'original', 'public', 'active', 12, 4, 2, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY),
('post-6', 'user-2', 'Having a great weekend with friends! What are your plans?', 'original', 'public', 'active', 6, 2, 1, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY);

-- ============================================
-- Posts (Shares)
-- ============================================

INSERT INTO posts (id, authorId, content, postType, sharedPostId, shareCaption, visibility, status, reactionsCount, commentsCount, sharesCount, createdAt, updatedAt) VALUES
('share-1', 'user-1', NULL, 'share', 'post-2', 'Great design work! Keep it up 👏', 'public', 'active', 2, 1, 0, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR),
('share-2', 'user-3', NULL, 'share', 'post-5', 'This is so exciting! Can''t wait to see what''s next 😍', 'friends', 'active', 1, 0, 0, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 6 HOUR),
('share-3', 'user-4', NULL, 'share', 'post-1', 'Welcome to the platform! 🎉', 'public', 'active', 3, 2, 0, NOW() - INTERVAL 12 HOUR, NOW() - INTERVAL 12 HOUR);

-- ============================================
-- Post Media
-- ============================================

INSERT INTO post_media (id, postId, url, type, orderIndex, createdAt) VALUES
('media-1', 'post-4', 'https://picsum.photos/800/600?random=10', 'image', 0, NOW() - INTERVAL 3 DAY),
('media-2', 'post-5', 'https://picsum.photos/800/600?random=11', 'image', 0, NOW() - INTERVAL 4 DAY);

-- ============================================
-- Reactions
-- ============================================

INSERT INTO reactions (id, userId, targetType, targetId, reactionType, createdAt) VALUES
('r-1', 'user-2', 'post', 'post-1', 'like', NOW() - INTERVAL 1 HOUR),
('r-2', 'user-3', 'post', 'post-1', 'love', NOW() - INTERVAL 2 HOUR),
('r-3', 'user-4', 'post', 'post-1', 'like', NOW() - INTERVAL 30 MINUTE),
('r-4', 'user-1', 'post', 'post-2', 'love', NOW() - INTERVAL 4 HOUR),
('r-5', 'user-3', 'post', 'post-2', 'haha', NOW() - INTERVAL 5 HOUR),
('r-6', 'user-1', 'post', 'post-4', 'love', NOW() - INTERVAL 2 DAY),
('r-7', 'user-2', 'post', 'post-4', 'wow', NOW() - INTERVAL 2 DAY),
('r-8', 'user-4', 'post', 'post-4', 'like', NOW() - INTERVAL 1 DAY),
('r-9', 'user-2', 'post', 'share-1', 'like', NOW() - INTERVAL 30 MINUTE);

-- ============================================
-- Comments
-- ============================================

INSERT INTO comments (id, postId, authorId, content, parentCommentId, status, reactionsCount, repliesCount, createdAt, updatedAt) VALUES
('c-1', 'post-1', 'user-2', 'Welcome to the platform! Great first post 👏', NULL, 'active', 2, 1, NOW() - INTERVAL 1 HOUR, NOW() - INTERVAL 1 HOUR),
('c-2', 'post-1', 'user-3', 'Nice! Looking forward to seeing more content from you', NULL, 'active', 1, 0, NOW() - INTERVAL 30 MINUTE, NOW() - INTERVAL 30 MINUTE),
('c-3', 'post-1', 'user-1', 'Thanks everyone! Excited to be here 😊', 'c-1', 'active', 1, 0, NOW() - INTERVAL 15 MINUTE, NOW() - INTERVAL 15 MINUTE),
('c-4', 'post-2', 'user-1', 'The design looks amazing! Great work 🎨', NULL, 'active', 1, 0, NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 4 HOUR),
('c-5', 'post-2', 'user-4', 'Love the color scheme!', NULL, 'active', 0, 0, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 3 HOUR),
('c-6', 'post-4', 'user-2', 'Incredible view! Where is this?', NULL, 'active', 1, 1, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
('c-7', 'post-4', 'user-1', 'This is in the Swiss Alps! Highly recommend visiting', 'c-6', 'active', 0, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY);

-- ============================================
-- Shares Table (Explicit tracking)
-- ============================================

INSERT INTO shares (id, userId, originalPostId, caption, createdAt) VALUES
('s-1', 'user-1', 'post-2', 'Great design work! Keep it up 👏', NOW() - INTERVAL 1 HOUR),
('s-2', 'user-3', 'post-5', 'This is so exciting! Can''t wait to see what''s next 😍', NOW() - INTERVAL 6 HOUR),
('s-3', 'user-4', 'post-1', 'Welcome to the platform! 🎉', NOW() - INTERVAL 12 HOUR);

-- ============================================
-- Blocks (Optional)
-- ============================================

-- Example: user-5 has blocked user-3
-- INSERT INTO blocks (id, blockerId, blockedId, createdAt) VALUES
-- ('b-1', 'user-5', 'user-3', NOW());

-- ============================================
-- Notifications (Optional - for future)
-- ============================================

INSERT INTO notifications (id, userId, type, targetType, targetId, actorId, message, isRead, createdAt) VALUES
('n-1', 'user-1', 'reaction', 'post', 'post-1', 'user-2', 'Jane Doe liked your post', false, NOW() - INTERVAL 30 MINUTE),
('n-2', 'user-1', 'comment', 'post', 'post-1', 'user-3', 'Bob Smith commented on your post', false, NOW() - INTERVAL 15 MINUTE),
('n-3', 'user-2', 'share', 'post', 'share-1', 'user-1', 'John Doe shared your post', false, NOW() - INTERVAL 30 MINUTE);

-- ============================================
-- Test User Credentials
-- ============================================

-- Note: Password for all users is: "password123"
-- (This is a hash placeholder, in real app use bcrypt)

-- To test:
-- 1. Register a new user
-- 2. Login with email/password
-- 3. View feed at /feed
-- 4. Create posts at /feed
-- 5. View profiles at /profile/username
-- 6. Test friend system
-- 7. Test sharing and reactions