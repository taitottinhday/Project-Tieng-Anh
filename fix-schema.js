
const mysql = require('mysql2/promise');

async function fixSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'student_platform'
    });

    console.log('Checking subjects table structure...');
    const [columns] = await connection.query('SHOW COLUMNS FROM subjects');
    console.log('Current columns:');
    columns.forEach(col => {
      console.log('  -', col.Field, col.Type, col.Key);
    });

    // Check if there's a unique constraint on subject_code
    const [keys] = await connection.query('SHOW KEYS FROM subjects');
    console.log('\nCurrent keys:');
    keys.forEach(key => {
      console.log('  -', key.Key_name, '(', key.Column_name, ') Unique:', key.Non_unique === 0);
    });

    // Drop the unique constraint if it exists
    try {
      console.log('\nDropping UNIQUE constraint on subject_code...');
      await connection.query('ALTER TABLE subjects DROP INDEX subject_code');
      console.log('Successfully dropped constraint');
    } catch (e) {
      console.log('No unique constraint to drop:', e.message);
    }

    // Now reimport all data
    console.log('\n=== REIMPORTING DATA ===\n');

    const fs = require('fs');
    const path = require('path');

    // Clear tables
    await connection.query('DELETE FROM marks');
    await connection.query('DELETE FROM students');
    await connection.query('DELETE FROM subjects');

    // Import subjects
    console.log('Importing subjects...');
    let subjectCount = 0;
    const subjectsFile = path.join(__dirname, 'data/subjects.txt');
    const subjectsContent = fs.readFileSync(subjectsFile, 'utf-8');
    const subjectLines = subjectsContent.trim().split('\n').slice(1);

    for (const line of subjectLines) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      if (parts.length >= 2) {
        try {
          const id = parts[0].trim();
          const subject_name = parts[1].trim();
          const subject_code = parts[2] ? parts[2].trim() : '';

          await connection.query(
            'INSERT INTO subjects (id, subject_name, subject_code) VALUES (?, ?, ?)',
            [id, subject_name, subject_code]
          );
          subjectCount++;
        } catch (e) {
          // Skip
        }
      }
    }
    console.log('Imported', subjectCount, 'subjects');

    // Import students
    console.log('Importing students...');
    let studentCount = 0;
    const studentsFile = path.join(__dirname, 'data/students.txt');
    const studentsContent = fs.readFileSync(studentsFile, 'utf-8');
    const studentLines = studentsContent.trim().split('\n').slice(1);

    for (const line of studentLines) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      if (parts.length >= 2) {
        try {
          const student_id = parts[0].trim();
          const name = parts[1].trim();

          await connection.query(
            'INSERT INTO students (student_id, name) VALUES (?, ?)',
            [student_id, name]
          );
          studentCount++;
        } catch (e) { }
      }
    }
    console.log('Imported', studentCount, 'students');

    // Import marks
    console.log('Importing marks...');
    let markCount = 0;
    const marksFile = path.join(__dirname, 'data/marks.txt');
    const marksContent = fs.readFileSync(marksFile, 'utf-8');
    const markLines = marksContent.trim().split('\n').slice(1);

    for (const line of markLines) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      if (parts.length >= 5) {
        try {
          const student_id = parts[0].trim();
          const subject_id = parts[4].trim();
          const mark = parts[2].trim();

          await connection.query(
            'INSERT INTO marks (student_id, subject_id, mark) VALUES (?, ?, ?)',
            [student_id, subject_id, mark]
          );
          markCount++;

          if (markCount % 2000 === 0) {
            console.log('  Imported', markCount, 'marks...');
          }
        } catch (e) { }
      }
    }
    console.log('Imported', markCount, 'marks total');

    console.log('\n=== FINAL COUNTS ===');
    const [subResult] = await connection.query('SELECT COUNT(*) as count FROM subjects');
    const [stuResult] = await connection.query('SELECT COUNT(*) as count FROM students');
    const [marResult] = await connection.query('SELECT COUNT(*) as count FROM marks');

    console.log('Subjects:', subResult[0].count);
    console.log('Students:', stuResult[0].count);
    console.log('Marks:', marResult[0].count);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

fixSchema();
