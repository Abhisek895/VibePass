const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true,
  });

  const sqlFile = fs.readFileSync(
    path.join(__dirname, 'prisma', 'seed-facebook-clone.sql'),
    'utf8'
  );

  try {
    console.log('Creating and seeding facebook_clone database...');
    await connection.query(sqlFile);
    console.log('✅ Database seeded successfully!');
    
    // Verify data
    const [users] = await connection.query('SELECT COUNT(*) as count FROM facebook_clone.users');
    console.log(`✅ Total users: ${users[0].count}`);
    
    const [posts] = await connection.query('SELECT COUNT(*) as count FROM facebook_clone.posts');
    console.log(`✅ Total posts: ${posts[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await connection.end();
  }
}

seedDatabase();
