"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new client_1.PrismaClient();
async function seed() {
    try {
        console.log('🌱 Starting database seed...\n');
        await prisma.$executeRaw `CREATE DATABASE IF NOT EXISTS facebook_clone`;
        console.log('✅ Database created/verified\n');
        const seedFilePath = path.join(process.cwd(), 'prisma', 'seed-facebook-clone.sql');
        const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
        const statements = seedSQL.split('\n').filter(line => line.trim() && !line.trim().startsWith('--'));
        console.log(`📝 Executing SQL statements from seed file...`);
        let currentQuery = '';
        let statementCount = 0;
        for (const line of statements) {
            currentQuery += line + '\n';
            if (line.includes(';')) {
                const query = currentQuery.trim().replace(/;$/, '');
                if (query.length > 0) {
                    try {
                        await prisma.$executeRawUnsafe(query);
                        statementCount++;
                        console.log(`  ✓ Statement ${statementCount} executed`);
                    }
                    catch (error) {
                        console.log(`  ⚠ Statement ${statementCount}: ${error.message.substring(0, 50)}`);
                    }
                }
                currentQuery = '';
            }
        }
        console.log(`\n✅ Seed script completed! Executed ${statementCount} statements\n`);
        const users = await prisma.$queryRaw `SELECT COUNT(*) as count FROM facebook_clone.users`;
        const posts = await prisma.$queryRaw `SELECT COUNT(*) as count FROM facebook_clone.posts`;
        console.log('📊 Verification:');
        console.log(`  Users: ${users[0].count}`);
        console.log(`  Posts: ${posts[0].count}`);
        const ariana = await prisma.$queryRaw `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name
      FROM facebook_clone.users u
      WHERE u.username = 'ariana'
      LIMIT 1
    `;
        if (ariana.length > 0) {
            console.log(`\n✨ User 'ariana' found in database:`);
            console.log(`  ${JSON.stringify(ariana[0], null, 2)}`);
        }
    }
    catch (error) {
        console.error('❌ Seeding error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seed();
//# sourceMappingURL=seed.js.map