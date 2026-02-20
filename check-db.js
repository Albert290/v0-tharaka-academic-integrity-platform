const { sql } = require('@vercel/postgres');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `;
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Error: users table does not exist!');
      console.log('\n📝 Run this command to create tables:');
      console.log('psql -U postgres -d tharaka_academic -f scripts/001-create-tables.sql');
      process.exit(1);
    }
    
    console.log('✅ users table exists');
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Users table columns:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check for new columns
    const hasRegNumber = columns.rows.some(col => col.column_name === 'registration_number');
    const hasPhone = columns.rows.some(col => col.column_name === 'phone_number');
    
    if (!hasRegNumber || !hasPhone) {
      console.log('\n⚠️  Warning: Missing new columns!');
      if (!hasRegNumber) console.log('  - registration_number column missing');
      if (!hasPhone) console.log('  - phone_number column missing');
      console.log('\n📝 Run migration:');
      console.log('psql -U postgres -d tharaka_academic -f scripts/002-add-student-details.sql');
    } else {
      console.log('\n✅ All required columns exist');
    }
    
    // Check if database has any users
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('  1. PostgreSQL is not running');
    console.log('  2. Database "tharaka_academic" does not exist');
    console.log('  3. Incorrect credentials in .env.local');
    console.log('\n📝 To fix:');
    console.log('  1. Start PostgreSQL: brew services start postgresql (Mac) or sudo systemctl start postgresql (Linux)');
    console.log('  2. Create database: createdb tharaka_academic');
    console.log('  3. Run schema: psql -U postgres -d tharaka_academic -f scripts/001-create-tables.sql');
    process.exit(1);
  }
}

checkDatabase();
