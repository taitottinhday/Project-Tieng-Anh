const express = require("express");
const { DEMO_TEACHER_PASSWORD, seedDemoCenterData } = require("../services/demoSeedService");
const { ensureApplicationSchema } = require("../services/bootstrapService");

const router = express.Router();

router.get("/test-route", (req, res) => {
  res.send("createTable.js is working!");
});

router.get("/createTable", async (req, res) => {
  try {
    await ensureApplicationSchema();

    res.send(`
      ✅ Created tables successfully!<br/>
      Tables: users, students, teachers, courses, classes, enrollments, payments, attendance, student_comments, messages and support tables<br/>
      Next step: <a href="/seed">/seed</a> to insert demo data.
    `);
  } catch (err) {
    console.error(err);
    res.send("ERROR: " + err.message);
  }
});

router.get("/seed", async (req, res) => {
  try {
    const summary = await seedDemoCenterData();

    res.send(`
      ✅ Seed expanded demo data successfully!<br/>
      Courses: ${summary.totalCoursesAfterSeed}<br/>
      Teachers: ${summary.totalTeachersAfterSeed}<br/>
      Students: ${summary.totalStudentsAfterSeed}<br/>
      Classes: ${summary.totalClassesAfterSeed}<br/>
      Newly inserted: ${summary.coursesInserted} courses, ${summary.teachersInserted} teachers, ${summary.studentsInserted} students, ${summary.classesInserted} classes, ${summary.enrollmentsInserted} enrollments.<br/>
      Demo teacher password: <strong>${DEMO_TEACHER_PASSWORD}</strong><br/>
      Go to <a href="/dbtest">/dbtest</a> to view tables.
    `);
  } catch (err) {
    console.error(err);
    res.send("ERROR: " + err.message);
  }
});

module.exports = router;
