const express = require("express");
const { seedDemoCenterData } = require("../services/demoSeedService");
const { ensureApplicationSchema } = require("../services/bootstrapService");
const { isLoggedIn, isAdmin } = require("./auth");

const router = express.Router();

router.get("/test-route", isLoggedIn, isAdmin, (req, res) => {
  res.send("createTable.js is working!");
});

router.get("/createTable", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await ensureApplicationSchema();

    res.send(`
      ✅ Created tables successfully!<br/>
      Tables: users, students, teachers, courses, classes, enrollments, payments, attendance, student_comments, messages and support tables<br/>
      Next step: <a href="/seed">/seed</a> to insert demo data.
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Khong the cap nhat schema luc nay.");
  }
});

router.get("/seed", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const summary = await seedDemoCenterData();

    res.send(`
      ✅ Seed expanded demo data successfully!<br/>
      Courses: ${summary.totalCoursesAfterSeed}<br/>
      Teachers: ${summary.totalTeachersAfterSeed}<br/>
      Students: ${summary.totalStudentsAfterSeed}<br/>
      Classes: ${summary.totalClassesAfterSeed}<br/>
      Newly inserted: ${summary.coursesInserted} courses, ${summary.teachersInserted} teachers, ${summary.studentsInserted} students, ${summary.classesInserted} classes, ${summary.enrollmentsInserted} enrollments.<br/>
      Teacher login accounts created: ${summary.teacherUsersInserted}<br/>
      Go to <a href="/dbtest">/dbtest</a> to view tables.
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Khong the seed du lieu luc nay.");
  }
});

module.exports = router;
