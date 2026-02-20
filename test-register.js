const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const sql = postgres('postgresql://postgres:password@localhost:5432/tharaka_academic');

async function testRegister() {
  try {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';
    const role = 'student';
    
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    console.log('Existing users:', existing);
    
    if (existing.length > 0) {
      console.log('User already exists, deleting...');
      await sql`DELETE FROM users WHERE email = ${email}`;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('Password hashed');
    
    // Insert user
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${role})
      RETURNING id, name, email, role
    `;
    
    console.log('✅ Registration successful:', result);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Registration failed:', error.message);
    console.error('Full error:', error);
    await sql.end();
  }
}

testRegister();
