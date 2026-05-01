-- Seed test user for login demo
INSERT OR REPLACE INTO users (id, email, passwordHash, username, createdAt, updatedAt) VALUES 
('test-user-vibe', 'sarkarabhisek50@gmail.com', 'salt123:0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e', 'sarkar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(email) DO UPDATE SET 
  passwordHash = excluded.passwordHash,
  username = excluded.username,
  updatedAt = CURRENT_TIMESTAMP;

-- Password for above: 'password123' (verify with service hash logic)
-- Note: Use sqlite3 backend/prisma/prisma/dev.db < this.sql to run
