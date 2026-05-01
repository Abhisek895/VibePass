import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

async function seedDatabase() {
  try {
    // Read the SQL seed file
    const seedFile = path.join(process.cwd(), 'prisma', 'seed-facebook-clone.sql');
    const sqlContent = fs.readFileSync(seedFile, 'utf8');

    // Parse the SQL file to execute queries separately
    const queries = sqlContent.split(';').filter(q => q.trim().length > 0);

    console.log('✅ Seed file read successfully');
    console.log(`📝 Found ${queries.length} SQL queries to execute`);
    console.log('\n🗂️ Facebook Clone Database will be populated with:');
    console.log('  • 5 test users: ariana, john_doe, sarah_smith, mike_chen, emily_davis');
    console.log('  • User profiles with bio, photos, work info');
    console.log('  • Friend connections between users');
    console.log('  • Posts with comments and reactions');
    
    // Print first few queries as preview
    console.log('\n📋 Sample queries:');
    for (let i = 0; i < Math.min(3, queries.length); i++) {
      const query = queries[i].trim();
      console.log(`\n  Query ${i + 1}: ${query.substring(0, 80)}...`);
    }

    console.log('\n✅ IMPORTANT: Please execute these SQL queries in MySQL Workbench or MySQL CLI:');
    console.log('   Location: c:\\VibePass\\backend\\prisma\\seed-facebook-clone.sql\n');

    // Show connection info
    console.log('📡 Connection Info:');
    console.log('   Host: localhost');
    console.log('   Port: 3306');
    console.log('   User: root');
    console.log('   Database: facebook_clone\n');

  } catch (error) {
    console.error('❌ Error reading seed file:', error.message);
    process.exit(1);
  }
}

seedDatabase();
