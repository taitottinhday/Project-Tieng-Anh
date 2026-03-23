
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function reimportAllData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'student_platform'
    });

    // Clear all tables
    console.log('Clearing tables...');
    await connection.query('DELETE FROM marks');
    await connection.query('DELETE FROM students');
    await connection.query('DELETE FROM subjects');
    console.log('Tables cleared');

    // Import subjects
    console.log('\nImporting subjects...');
    let subjectCount = 0;
    let subjectErrors = 0;
    const subjectsFile = path.join(__dirname, 'data/subjects.txt');
    const subjectsContent = fs.readFileSync(subjectsFile, 'utf-8');
    const subjectLines = subjectsContent.trim().split('\n').slice(1);

    console.log('Total subject lines to process:', subjectLines.length);

    for (let i = 0; i < subjectLines.length; i++) {
      const line = subjectLines[i];
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
          console.log('  Added subject', id, '-', subject_name);
        } catch (e) {
          subjectErrors++;
          console.log('  Error on line', i + 1, ':', e.message);
        }
      }
    }
    console.log('Imported', subjectCount, 'subjects, errors:', subjectErrors);

    // Import students
    console.log('\nImporting students...');
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
        } catch (e) {
          // Skip
        }
      }
    }
    console.log('Imported', studentCount, 'students');

    // Import marks (first 1000)
    console.log('\nImporting marks...');
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

          if (markCount % 1000 === 0) {
            console.log('  Imported', markCount, 'marks...');
          }
        } catch (e) {
          // Skip
        }
      }
    }
    console.log('Imported', markCount, 'marks total');

    console.log('\n=== FINAL COUNTS ===');
    const [subjectCountResult] = await connection.query('SELECT COUNT(*) as count FROM subjects');
    const [studentCountResult] = await connection.query('SELECT COUNT(*) as count FROM students');
    const [markCountResult] = await connection.query('SELECT COUNT(*) as count FROM marks');

    console.log('Subjects:', subjectCountResult[0].count);
    console.log('Students:', studentCountResult[0].count);
    console.log('Marks:', markCountResult[0].count);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

reimportAllData();
