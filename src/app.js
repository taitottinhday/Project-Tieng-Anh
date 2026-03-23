const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const { loadPlacementExam } = require('./data/toeicPlacementProvider');
const { resolveDatabaseConfig } = require('./config/runtime');
require('dotenv').config();

const app = express();

// Base URL Configuration
const baseUrl = (process.env.BASE_URL !== undefined) ? process.env.BASE_URL : '';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session Store Options
const sessionOptions = resolveDatabaseConfig();
const sessionStore = new MySQLStore(sessionOptions);

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash Middleware
app.use(flash());

// Expose user and variables to views
app.use((req, res, next) => {
  res.locals.user = (req.session && req.session.user) ? req.session.user : null;
  res.locals.baseUrl = baseUrl;
  res.locals.currentPath = req.originalUrl || req.path;
  res.locals.defaultPlacementExam = null;

  try {
    res.locals.defaultPlacementExam = loadPlacementExam();
  } catch (error) {
    console.error('loadPlacementExam locals error:', error);
  }

  // Flash messages
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');

  next();
});

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(baseUrl, express.static(path.join(__dirname, '../public')));

// Redirect if BASE_URL is set
if (baseUrl && baseUrl !== '/') {
  app.use((req, res, next) => {
    if (req.path.startsWith(baseUrl) || req.path.startsWith('/public')) return next();
    return res.redirect(baseUrl + req.url);
  });
}
const paymentsRoute = require("./routes/payments");
app.use(baseUrl + "/payments", paymentsRoute);
// Render helper
const renderWithLayout = require('./utils/renderHelper');
const paymentRoute = require("./routes/payment");
app.use(baseUrl + "/payment", paymentRoute);
// ========================
// MAIN ROUTES
// ========================
const authRoutes = require("./routes/auth");
app.use(baseUrl, authRoutes);

app.get(baseUrl || '/', (req, res) => {
  const role = req.session?.user?.role;
  const isStudent = role && role !== 'admin' && role !== 'teacher';

  if (isStudent) {
    return renderWithLayout(res, 'student-home', { title: 'Trang chủ học viên' });
  }

  renderWithLayout(res, 'home', { title: 'Home' });
});

const contactRoute = require("./routes/contact");
app.use(baseUrl, contactRoute);
const publicPagesRoute = require("./routes/publicPages");
app.use(baseUrl, publicPagesRoute);
const chatbotRoute = require("./routes/chatbot");
app.use(baseUrl, chatbotRoute);
const studentPortalRoute = require("./routes/studentPortal");
app.use(baseUrl + "/student", studentPortalRoute);

const adminRoutes = require("./routes/admin");
app.use(baseUrl, adminRoutes);
const placementRoutes = require('./routes/placement');
app.use('/', placementRoutes);
// Dashboard route - mapped to /dashboard
const dashboardRoute = require("./routes/dashboard");
app.use(baseUrl + '/dashboard', dashboardRoute);

//const crudRoute = require("./routes/crud");
//app.use(baseUrl + '/crud', crudRoute);
// Enroll route - mapped to /enroll
const enrollRoute = require("./routes/enroll");
app.use(baseUrl + "/enroll", enrollRoute);
// Database tables route - mapped to /database
const dbtestRoute = require("./routes/dbtest");
app.use(baseUrl + '/database', dbtestRoute);
const coursesBlogRoute = require("./routes/coursesBlog");
app.use(baseUrl + "/courses-blog", coursesBlogRoute);
// ========================
// DATABASE UTILITY ROUTES
// ========================
const createTableRoute = require("./routes/createTable");
app.use(baseUrl, createTableRoute);
const courseDetailRoute = require("./routes/courseDetail");
app.use(baseUrl + "/course-detail", courseDetailRoute);
const createMessagesTableRoute = require("./routes/createMessagesTable");
app.use(baseUrl, createMessagesTableRoute);
const teacherRoute = require("./routes/teacher");
app.use(baseUrl + "/teacher", teacherRoute);
const addRoleColumnRoute = require("./routes/addRoleColumn");
app.use(baseUrl, addRoleColumnRoute);

const makeAdminRoute = require("./routes/makeAdmin");
app.use(baseUrl, makeAdminRoute);
const registerCourseRoute = require("./routes/registerCourse");
app.use(baseUrl + "/register-course", registerCourseRoute);
// Error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).send("Server Error: " + err.message);
});

module.exports = app;
