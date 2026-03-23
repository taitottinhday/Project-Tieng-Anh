const mysql = require('mysql2/promise');

async function testDashboard() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'student_platform',
      port: 3306
    });

    console.log('✅ Connected to database student_platform');

    console.log('\n===== Testing Dashboard Queries =====');

    // Test 1: subjects
    console.log('\n1️⃣ Testing subjects table');
    try {
      const [subjects] = await connection.query('SELECT * FROM subjects LIMIT 5');
      console.log('✔ Success! Found', subjects.length, 'subjects');
      console.log('Sample:', subjects[0]);
    } catch (e) {
      console.log('❌ subjects table error:', e.message);
    }

    // Test 2: students
    console.log('\n2️⃣ Testing students table');
    try {
      const [students] = await connection.query('SELECT * FROM students LIMIT 5');
      console.log('✔ Success! Found', students.length, 'students');
      console.log('Sample:', students[0]);
    } catch (e) {
      console.log('❌ students table error:', e.message);
    }

    // Test 3: marks with joins
    console.log('\n3️⃣ Testing marks join query');
    try {
      const [marks] = await connection.query(`
        SELECT m.id, m.student_id, m.mark,
               s.subject_name,
               st.name AS student_name
        FROM marks m
        LEFT JOIN subjects s ON m.subject_id = s.id
        LEFT JOIN students st ON m.student_id = st.student_id
        LIMIT 5
      `);

      console.log('✔ Success! Found', marks.length, 'marks');
      console.log('Sample:', marks[0]);

    } catch (e) {
      console.log('❌ marks query error:', e.message);
    }

    await connection.end();
    console.log('\n✅ Database test completed');

  } catch (err) {
    console.error('❌ Connection error:', err.message);
    console.log('\nPossible reasons:');
    console.log('- MySQL chưa chạy');
    console.log('- Sai tên database');
    console.log('- Sai user/password');
  }
}

testDashboard();