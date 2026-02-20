const postgres = require('postgres');

const sql = postgres('postgresql://postgres:password@localhost:5432/tharaka_academic');

async function testSubmission() {
  try {
    // Get a student
    const students = await sql`SELECT id, name FROM users WHERE role = 'student' LIMIT 1`;
    console.log('Student:', students[0]);
    
    // Get a lecturer
    const lecturers = await sql`SELECT id, name FROM users WHERE role = 'lecturer' LIMIT 1`;
    console.log('Lecturer:', lecturers[0]);
    
    if (students.length === 0 || lecturers.length === 0) {
      console.log('Need both student and lecturer');
      await sql.end();
      return;
    }
    
    const studentId = students[0].id;
    const lecturerId = lecturers[0].id;
    const title = 'Test Submission';
    const fileUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
    const fileType = 'text/plain';
    
    console.log('\nAttempting submission...');
    const result = await sql`
      INSERT INTO submissions (student_id, lecturer_id, title, file_url, file_type)
      VALUES (${studentId}, ${lecturerId}, ${title}, ${fileUrl}, ${fileType})
      RETURNING id, title, file_type, submitted_at, reviewed
    `;
    
    console.log('✅ Submission successful:', result[0]);
    
    await sql.end();
  } catch (error) {
    console.error('❌ Submission failed:', error.message);
    console.error('Full error:', error);
    await sql.end();
  }
}

testSubmission();
