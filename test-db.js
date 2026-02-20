const postgres = require('postgres');

const sql = postgres('postgresql://postgres:password@localhost:5432/tharaka_academic');

async function test() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Connection successful:', result);
    
    const users = await sql`SELECT * FROM users`;
    console.log('✅ Users table accessible:', users.length, 'users');
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

test();
