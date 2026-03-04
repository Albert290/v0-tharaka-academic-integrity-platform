const postgres = require('postgres');

async function testDatabaseFlow() {
  console.log('🧪 Testing Database Flow...\n');

  const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tharaka_academic');

  try {
    // Test data
    const testData = {
      ai_confidence: 75.5,
      human_confidence: 24.5,
      is_ai_generated: true,
      confidence_score: 75.5,
      indicators: {
        repetitive_patterns: 80,
        statistical_anomalies: 75,
        vocabulary_consistency: 70,
        structural_analysis: 85,
        perplexity_score: 68
      },
      checked_at: new Date().toISOString()
    };

    console.log('📊 Test data to save:', testData);
    console.log('\n1️⃣ Saving test data to database...');
    
    // Get the latest submission ID
    const latestSub = await sql`SELECT id FROM submissions ORDER BY id DESC LIMIT 1`;
    const submissionId = latestSub[0]?.id;
    
    if (!submissionId) {
      console.error('❌ No submissions found in database');
      return;
    }

    console.log(`   Using submission ID: ${submissionId}`);

    // Save the data
    await sql`
      UPDATE submissions
      SET ai_check_result = ${JSON.stringify(testData)}
      WHERE id = ${submissionId}
    `;

    console.log('✅ Data saved successfully\n');

    console.log('2️⃣ Fetching data back from database...');
    
    // Fetch it back
    const result = await sql`
      SELECT 
        id, 
        title,
        ai_check_result
      FROM submissions 
      WHERE id = ${submissionId}
    `;

    const fetchedData = result[0];
    
    // Parse JSONB if it's a string
    const aiCheckResult = typeof fetchedData.ai_check_result === 'string' 
      ? JSON.parse(fetchedData.ai_check_result)
      : fetchedData.ai_check_result;
    
    console.log('📥 Fetched data:', {
      id: fetchedData.id,
      title: fetchedData.title,
      ai_check_result: aiCheckResult
    });

    console.log('\n3️⃣ Verifying data integrity...');
    
    if (aiCheckResult?.ai_confidence === testData.ai_confidence) {
      console.log('✅ ai_confidence matches:', aiCheckResult.ai_confidence);
    } else {
      console.log('❌ ai_confidence mismatch:', {
        expected: testData.ai_confidence,
        got: aiCheckResult?.ai_confidence
      });
    }

    if (aiCheckResult?.human_confidence === testData.human_confidence) {
      console.log('✅ human_confidence matches:', aiCheckResult.human_confidence);
    } else {
      console.log('❌ human_confidence mismatch:', {
        expected: testData.human_confidence,
        got: aiCheckResult?.human_confidence
      });
    }

    console.log('\n✨ Database flow test complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }

  process.exit(0);
}

testDatabaseFlow();
