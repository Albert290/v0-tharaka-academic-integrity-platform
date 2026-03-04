// Test script to diagnose AI check issues
const postgres = require('postgres')

async function testAICheck() {
  const sql = postgres(process.env.DATABASE_URL)
  
  try {
    console.log('=== Testing AI Check System ===\n')
    
    // 1. Check if statistical_analysis column exists
    console.log('1. Checking database schema...')
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' 
      ORDER BY ordinal_position
    `
    console.log('Submissions table columns:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    })
    
    const hasStatisticalAnalysis = columns.some(col => col.column_name === 'statistical_analysis')
    if (!hasStatisticalAnalysis) {
      console.log('\n⚠️  WARNING: statistical_analysis column is MISSING!')
      console.log('   Run: sudo -u postgres psql -d tharaka_academic -f scripts/003-add-reference-materials.sql\n')
    } else {
      console.log('✓ statistical_analysis column exists\n')
    }
    
    // 2. Check if reference_materials table exists
    console.log('2. Checking reference_materials table...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reference_materials'
    `
    if (tables.length === 0) {
      console.log('⚠️  WARNING: reference_materials table is MISSING!')
      console.log('   Run: sudo -u postgres psql -d tharaka_academic -f scripts/003-add-reference-materials.sql\n')
    } else {
      console.log('✓ reference_materials table exists\n')
    }
    
    // 3. Check for submissions without AI checks
    console.log('3. Checking submissions...')
    const totalSubmissions = await sql`SELECT COUNT(*) as count FROM submissions`
    const checkedSubmissions = await sql`SELECT COUNT(*) as count FROM submissions WHERE ai_check_result IS NOT NULL`
    const withStatAnalysis = await sql`SELECT COUNT(*) as count FROM submissions WHERE statistical_analysis IS NOT NULL`
    
    console.log(`  Total submissions: ${totalSubmissions[0].count}`)
    console.log(`  With AI check: ${checkedSubmissions[0].count}`)
    console.log(`  With statistical analysis: ${withStatAnalysis[0].count}`)
    
    // 4. Check recent submission details
    console.log('\n4. Recent submissions (last 5):')
    const recent = await sql`
      SELECT id, title, file_type, submitted_at, 
             ai_check_result IS NOT NULL as has_ai_check,
             statistical_analysis IS NOT NULL as has_stat_analysis
      FROM submissions 
      ORDER BY submitted_at DESC 
      LIMIT 5
    `
    
    if (recent.length === 0) {
      console.log('  No submissions found\n')
    } else {
      recent.forEach(sub => {
        console.log(`  ID ${sub.id}: ${sub.title}`)
        console.log(`    Type: ${sub.file_type}`)
        console.log(`    AI Check: ${sub.has_ai_check ? '✓' : '✗'}`)
        console.log(`    Stat Analysis: ${sub.has_stat_analysis ? '✓' : '✗'}`)
        console.log('')
      })
    }
    
    // 5. Check environment variables
    console.log('5. Checking environment...')
    console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Missing'}`)
    console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here' ? '✓ Set' : '✗ Not configured (will use statistical analysis only)'}`)
    
    console.log('\n=== Summary ===')
    if (!hasStatisticalAnalysis) {
      console.log('❌ Database migration NOT applied')
      console.log('   Action: Run the migration script')
    } else {
      console.log('✅ Database schema is correct')
    }
    
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_claude_api_key_here') {
      console.log('⚠️  Claude API not configured (only statistical analysis will work)')
    } else {
      console.log('✅ Claude API configured')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await sql.end()
  }
}

testAICheck()
