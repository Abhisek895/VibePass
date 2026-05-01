-- Seed data for facebook_clone database
-- This script creates test users and posts for development

USE facebook_clone;

-- Clear existing data (in order - respecting foreign keys)
DELETE FROM notifications;
DELETE FROM comment_reactions;
DELETE FROM comments;
DELETE FROM reactions;
DELETE FROM post_media;
DELETE FROM posts;
DELETE FROM friendships;
DELETE FROM friend_requests;
DELETE FROM user_blocks;
DELETE FROM user_profiles;
DELETE FROM users;

-- Reset auto-increment
ALTER TABLE users AUTO_INCREMENT = 1;

-- Create test users
INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES
('ariana', 'ariana@example.com', 'hashed_password_123', 'Ariana', 'Miller', 1),
('john_doe', 'john@example.com', 'hashed_password_123', 'John', 'Doe', 1),
('sarah_smith', 'sarah@example.com', 'hashed_password_123', 'Sarah', 'Smith', 1),
('mike_chen', 'mike@example.com', 'hashed_password_123', 'Mike', 'Chen', 1),
('emily_davis', 'emily@example.com', 'hashed_password_123', 'Emily', 'Davis', 1);

-- Create user profiles
INSERT INTO user_profiles (user_id, bio, intro, profile_photo_url, cover_photo_url, gender, relationship_status, work_title, work_place, education, current_city, hometown) VALUES
(1, 'Living my best life 🌟', 'Finding my vibe', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1552058544-f953b5438060?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'Tech Lead', 'Meta', 'Stanford University', 'San Francisco', 'Los Angeles'),
(2, 'Coffee enthusiast ☕', 'Just vibing', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1526980702283-985c80eec00f?auto=format&fit=crop&q=80&w=1200&h=300', 'Male', 'Single', 'Product Manager', 'Google', 'MIT', 'New York', 'Boston'),
(3, 'Designer & Artist 🎨', 'Creating daily', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1537647471827-c00c89d83d2e?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'UX Designer', 'Apple', 'RISD', 'Seattle', 'Portland'),
(4, 'Software Engineer 💻', 'Open source contributor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1546920519-e4f9bc3f0ca6?auto=format&fit=crop&q=80&w=1200&h=300', 'Male', 'Single', 'Software Engineer', 'Netflix', 'Carnegie Mellon', 'Los Gatos', 'San Jose'),
(5, 'Data Scientist 📊', 'Turning data into insights', 'https://images.unsplash.com/photo-1432888722915-0edd3c6f6309?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'Data Scientist', 'Microsoft', 'UC Berkeley', 'Seattle', 'San Francisco');

-- Create friendships (bidirectional)
INSERT INTO friendships (user_one_id, user_two_id) VALUES
(1, 2), -- Ariana - John
(1, 3), -- Ariana - Sarah
(1, 4), -- Ariana - Mike
(2, 3), -- John - Sarah
(2, 4), -- John - Mike
(3, 5), -- Sarah - Emily
(4, 5); -- Mike - Emily

-- Create posts by Ariana
INSERT INTO posts (author_id, post_type, content, privacy, background_color, status, reactions_count, comments_count) VALUES
(1, 'original', 'Just finished an amazing project! Feeling so accomplished 🎉', 'public', '#8B5CF6', 'active', 23, 5),
(1, 'original', 'Coffee break at the office. Why is Monday always so long? ☕', 'public', '#EC4899', 'active', 12, 3);

-- Create posts by others
INSERT INTO posts (author_id, post_type, content, privacy, background_color, status, reactions_count, comments_count) VALUES
(2, 'original', 'Beautiful sunset tonight 🌅', 'public', '#F59E0B', 'active', 45, 12),
(3, 'original', 'Just launched my new design portfolio!', 'public', '#10B981', 'active', 67, 8),
(4, 'original', 'Working on open source contributions', 'public', '#0EA5E9', 'active', 34, 6),
(5, 'original', 'Machine learning model achieving 95% accuracy!', 'public', '#8B5CF6', 'active', 56, 10);

-- Create reactions on Ariana's first post
INSERT INTO reactions (post_id, user_id, reaction_type) VALUES
(1, 2, 'like'),
(1, 3, 'love'),
(1, 4, 'like'),
(1, 5, 'wow'),
(1, 2, 'like');

-- Create comments on Ariana's first post
INSERT INTO comments (post_id, author_id, content, status) VALUES
(1, 2, 'Congrats! Looks amazing!', 'active'),
(1, 3, 'So proud of you! 🎊', 'active'),
(1, 4, 'Let''s celebrate! 🍾', 'active'),
(1, 5, 'Incredible work!', 'active'),
(1, 2, 'You crushed it!', 'active');

-- Create reactions on Ariana's second post
INSERT INTO reactions (post_id, user_id, reaction_type) VALUES
(2, 2, 'like'),
(2, 3, 'haha'),
(2, 4, 'like');

-- Create comments on Ariana's second post
INSERT INTO comments (post_id, author_id, content, status) VALUES
(2, 2, 'I feel you! Mondays are the worst', 'active'),
(2, 3, 'Coffee is life ☕', 'active'),
(2, 5, 'You''re not alone!', 'active');

-- Commit and display summary
SELECT 'Seed data created successfully!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_posts FROM posts;
SELECT COUNT(*) AS total_friendships FROM friendships;
SELECT COUNT(*) AS total_comments FROM comments;
SELECT COUNT(*) AS total_reactions FROM reactions;
