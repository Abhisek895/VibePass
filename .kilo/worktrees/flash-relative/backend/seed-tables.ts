// This script seeds the facebook_clone database with test data
// It will directly populate the Ariana user and related data

import * as mysql from 'mysql2/promise';

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true,
  });

  try {
    console.log('🌱 Starting database setup...\n');

    // Create database
    console.log('📍 Creating facebook_clone database...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS facebook_clone');
    console.log('✅ Database ready\n');

    // Use the database
    await connection.execute('USE facebook_clone');

    // Create tables
    console.log('📍 Creating tables...');
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        is_active TINYINT DEFAULT 1,
        account_privacy VARCHAR(20) DEFAULT 'public',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_active (is_active)
      )
    `);

    // User profiles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT UNIQUE NOT NULL,
        bio VARCHAR(500),
        intro VARCHAR(255),
        profile_photo_url VARCHAR(500),
        cover_photo_url VARCHAR(500),
        gender VARCHAR(30),
        date_of_birth DATE,
        relationship_status VARCHAR(50),
        work_title VARCHAR(100),
        work_place VARCHAR(150),
        education VARCHAR(150),
        current_city VARCHAR(100),
        hometown VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Friendships table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS friendships (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_one_id BIGINT NOT NULL,
        user_two_id BIGINT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_friendships_pair (user_one_id, user_two_id),
        FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        author_id BIGINT NOT NULL,
        post_type VARCHAR(50) DEFAULT 'original',
        content LONGTEXT,
        privacy VARCHAR(20) DEFAULT 'public',
        background_color VARCHAR(10),
        status VARCHAR(20) DEFAULT 'active',
        reactions_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_posts_author (author_id)
      )
    `);

    // Reactions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reactions (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        post_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        reaction_type VARCHAR(20) DEFAULT 'like',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_reactions_post_user (post_id, user_id, reaction_type),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Comments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        post_id BIGINT NOT NULL,
        author_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_comments_post (post_id)
      )
    `);

    console.log('✅ Tables created\n');

    // Insert test data
    console.log('📍 Inserting test data...');
    
    // Clear existing data
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('DELETE FROM comments');
    await connection.execute('DELETE FROM reactions');
    await connection.execute('DELETE FROM posts');
    await connection.execute('DELETE FROM friendships');
    await connection.execute('DELETE FROM user_profiles');
    await connection.execute('DELETE FROM users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Insert users
    await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, is_active) VALUES
      ('ariana', 'ariana@example.com', 'hashed_password_123', 'Ariana', 'Miller', 1),
      ('john_doe', 'john@example.com', 'hashed_password_123', 'John', 'Doe', 1),
      ('sarah_smith', 'sarah@example.com', 'hashed_password_123', 'Sarah', 'Smith', 1),
      ('mike_chen', 'mike@example.com', 'hashed_password_123', 'Mike', 'Chen', 1),
      ('emily_davis', 'emily@example.com', 'hashed_password_123', 'Emily', 'Davis', 1)
    `);
    console.log('  ✓ Users created');

    // Insert user profiles
    await connection.execute(`
      INSERT INTO user_profiles (user_id, bio, intro, profile_photo_url, cover_photo_url, gender, relationship_status, work_title, work_place, education, current_city, hometown) VALUES
      (1, 'Living my best life 🌟', 'Finding my vibe', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1552058544-f953b5438060?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'Tech Lead', 'Meta', 'Stanford University', 'San Francisco', 'Los Angeles'),
      (2, 'Coffee enthusiast ☕', 'Just vibing', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1526980702283-985c80eec00f?auto=format&fit=crop&q=80&w=1200&h=300', 'Male', 'Single', 'Product Manager', 'Google', 'MIT', 'New York', 'Boston'),
      (3, 'Designer & Artist 🎨', 'Creating daily', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1537647471827-c00c89d83d2e?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'UX Designer', 'Apple', 'RISD', 'Seattle', 'Portland'),
      (4, 'Software Engineer 💻', 'Open source contributor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1546920519-e4f9bc3f0ca6?auto=format&fit=crop&q=80&w=1200&h=300', 'Male', 'Single', 'Software Engineer', 'Netflix', 'Carnegie Mellon', 'Los Gatos', 'San Jose'),
      (5, 'Data Scientist 📊', 'Turning data into insights', 'https://images.unsplash.com/photo-1432888722915-0edd3c6f6309?auto=format&fit=crop&q=80&w=200&h=200', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=1200&h=300', 'Female', 'Single', 'Data Scientist', 'Microsoft', 'UC Berkeley', 'Seattle', 'San Francisco')
    `);
    console.log('  ✓ User profiles created');

    // Insert friendships
    await connection.execute(`
      INSERT INTO friendships (user_one_id, user_two_id) VALUES
      (1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 5), (4, 5)
    `);
    console.log('  ✓ Friendships created');

    // Insert posts
    await connection.execute(`
      INSERT INTO posts (author_id, post_type, content, privacy, background_color, status, reactions_count, comments_count) VALUES
      (1, 'original', 'Just finished an amazing project! Feeling so accomplished 🎉', 'public', '#8B5CF6', 'active', 23, 5),
      (1, 'original', 'Coffee break at the office. Why is Monday always so long? ☕', 'public', '#EC4899', 'active', 12, 3),
      (2, 'original', 'Beautiful sunset tonight 🌅', 'public', '#F59E0B', 'active', 45, 12),
      (3, 'original', 'Just launched my new design portfolio!', 'public', '#10B981', 'active', 67, 8),
      (4, 'original', 'Working on open source contributions', 'public', '#0EA5E9', 'active', 34, 6),
      (5, 'original', 'Machine learning model achieving 95% accuracy!', 'public', '#8B5CF6', 'active', 56, 10)
    `);
    console.log('  ✓ Posts created');

    // Insert reactions
    await connection.execute(`
      INSERT INTO reactions (post_id, user_id, reaction_type) VALUES
      (1, 2, 'like'), (1, 3, 'love'), (1, 4, 'like'), (1, 5, 'wow'),
      (2, 2, 'like'), (2, 3, 'haha'), (2, 4, 'like')
    `);
    console.log('  ✓ Reactions created');

    // Insert comments
    await connection.execute(`
      INSERT INTO comments (post_id, author_id, content, status) VALUES
      (1, 2, 'Congrats! Looks amazing!', 'active'),
      (1, 3, 'So proud of you! 🎊', 'active'),
      (1, 4, 'Let''s celebrate! 🍾', 'active'),
      (1, 5, 'Incredible work!', 'active'),
      (1, 2, 'You crushed it!', 'active'),
      (2, 2, 'I feel you! Mondays are the worst', 'active'),
      (2, 3, 'Coffee is life ☕', 'active'),
      (2, 5, 'You''re not alone!', 'active')
    `);
    console.log('  ✓ Comments created');

    console.log('\n✅ Seed completed successfully!\n');

    // Verify data
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [posts] = await connection.execute('SELECT COUNT(*) as count FROM posts');
    const [comments] = await connection.execute('SELECT COUNT(*) as count FROM comments');

    console.log('📊 Data Summary:');
    console.log(`  • Users: ${(users as any)[0].count}`);
    console.log(`  • Posts: ${(posts as any)[0].count}`);
    console.log(`  • Comments: ${(comments as any)[0].count}\n`);

    // Get Ariana's profile
    const [ariana] = await connection.execute(`
      SELECT u.id, u.username, u.first_name, u.last_name, u.email,
             up.bio, up.intro, up.profile_photo_url, up.cover_photo_url,
             up.gender, up.work_title, up.work_place, up.education,
             up.current_city, up.hometown
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.username = 'ariana'
    `);

    console.log('👤 Ariana Miller Profile:');
    console.log(JSON.stringify((ariana as any)[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', (error as any).message);
  } finally {
    await connection.end();
  }
}

seedDatabase();
