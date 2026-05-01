import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Create the database first
    await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS facebook_clone`;
    console.log('✅ Database created/verified\n');

    // Read and execute the seed SQL file
    const seedFilePath = path.join(process.cwd(), 'prisma', 'seed-facebook-clone.sql');
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');

    // Split by statements and execute each
    const statements = seedSQL.split('\n').filter(line => line.trim() && !line.trim().startsWith('--'));
    
    console.log(`📝 Executing SQL statements from seed file...`);
    
    // Group statements into complete queries
    let currentQuery = '';
    let statementCount = 0;

    for (const line of statements) {
      currentQuery += line + '\n';
      
      if (line.includes(';')) {
        const query = currentQuery.trim().replace(/;$/, '');
        if (query.length > 0) {
          try {
            // Execute raw SQL
            await prisma.$executeRawUnsafe(query);
            statementCount++;
            console.log(`  ✓ Statement ${statementCount} executed`);
          } catch (error) {
            // Continue on error (for cases like database exists, etc.)
            console.log(`  ⚠ Statement ${statementCount}: ${(error as any).message.substring(0, 50)}`);
          }
        }
        currentQuery = '';
      }
    }

    console.log(`\n✅ Seed script completed! Executed ${statementCount} statements\n`);

    // Verify data
    const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM facebook_clone.users`;
    const posts = await prisma.$queryRaw`SELECT COUNT(*) as count FROM facebook_clone.posts`;
    
    console.log('📊 Verification:');
    console.log(`  Users: ${(users as any)[0].count}`);
    console.log(`  Posts: ${(posts as any)[0].count}`);

    // Test get Ariana's profile
    const ariana = await prisma.$queryRaw`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name
      FROM facebook_clone.users u
      WHERE u.username = 'ariana'
      LIMIT 1
    `;

    if ((ariana as any).length > 0) {
      console.log(`\n✨ User 'ariana' found in database:`);
      console.log(`  ${JSON.stringify((ariana as any)[0], null, 2)}`);
    }

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
