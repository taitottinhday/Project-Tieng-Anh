const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const { loadPlacementExam } = require('./data/toeicPlacementProvider');
const { resolveDatabaseConfig } = require('./config/runtime');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Base URL Configuration
const baseUrl = (process.env.BASE_URL !== undefined) ? process.env.BASE_URL : '';

function createSessionStore() {
  const configuredStore = String(process.env.SESSION_STORE || 'mysql').trim().toLowerCase();

  if (configuredStore === 'memory') {
    console.warn('[session] Using in-memory session store for this environment.');
    return null;
  }

  try {
    return new MySQLStore(resolveDatabaseConfig());
  } catch (error) {
    console.error('[session] Failed to initialize MySQL session store. Falling back to memory store.', error);
    return null;
  }
}

function resolveSessionSecret() {
  const configuredSecret = String(process.env.SESSION_SECRET || '').trim();

  if (configuredSecret) {
    return configuredSecret;
  }

  console.warn('[session] SESSION_SECRET is missing. Using an ephemeral secret for this process.');
  return crypto.randomBytes(32).toString('hex');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
const sessionStore = createSessionStore();

// Session
const sessionConfig = {
  secret: resolveSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  } // 1 day
};

if (sessionStore) {
  sessionConfig.store = sessionStore;
}

app.use(session(sessionConfig));

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

app.use(async (req, res, next) => {
  const role = req.session?.user?.role;
  const isStudentRole = role && role !== 'admin' && role !== 'teacher';
  const isStaticAssetRequest = Boolean(path.extname(req.path || ''));

  if (isStaticAssetRequest) {
    return next();
  }

  if (!isStudentRole) {
    res.locals.studentNotifications = [];
    res.locals.unreadStudentNotificationCount = 0;
    return next();
  }

  try {
    const userId = Number(req.session?.user?.id || 0);
    const [notifications, unreadCount] = await Promise.all([
      listStudentNotifications(userId, { limit: 6 }),
      countUnreadStudentNotifications(userId),
    ]);
    res.locals.studentNotifications = notifications;
    res.locals.unreadStudentNotificationCount = unreadCount;
  } catch (error) {
    console.error('student notification middleware error:', error);
    res.locals.studentNotifications = [];
    res.locals.unreadStudentNotificationCount = 0;
  }

  return next();
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
const ensureSchemaReady = require("./middleware/ensureSchemaReady");
const {
  countUnreadStudentNotifications,
  listStudentNotifications,
} = require("./services/studentNotificationService");
// ========================
// MAIN ROUTES
// ========================
const authRoutes = require("./routes/auth");
app.use(baseUrl, authRoutes);

app.get(baseUrl || '/', ensureSchemaReady, async (req, res) => {
  const role = req.session?.user?.role;
  const isStudent = role && role !== 'admin' && role !== 'teacher';

  if (isStudent) {
    return renderWithLayout(res, 'student-home', { title: 'Trang chủ học viên' });
    try {
      const userId = Number(req.session?.user?.id || 0);
      const [notifications, unreadCount] = await Promise.all([
        listStudentNotifications(userId, { limit: 4 }),
        countUnreadStudentNotifications(userId),
      ]);
      res.locals.studentNotifications = notifications;
      res.locals.unreadStudentNotificationCount = unreadCount;
    } catch (error) {
      console.error("student home notifications error:", error);
      res.locals.studentNotifications = [];
      res.locals.unreadStudentNotificationCount = 0;
    }

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
app.use(baseUrl, placementRoutes);
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
const allowMaintenanceRoutes = String(process.env.ALLOW_MAINTENANCE_ROUTES || '').trim().toLowerCase() === 'true';
if (allowMaintenanceRoutes) {
  const createTableRoute = require("./routes/createTable");
  app.use(baseUrl, createTableRoute);
}
const courseDetailRoute = require("./routes/courseDetail");
app.use(baseUrl + "/course-detail", courseDetailRoute);
if (allowMaintenanceRoutes) {
  const createMessagesTableRoute = require("./routes/createMessagesTable");
  app.use(baseUrl, createMessagesTableRoute);
}
const teacherRoute = require("./routes/teacher");
app.use(baseUrl + "/teacher", teacherRoute);
if (allowMaintenanceRoutes) {
  const addRoleColumnRoute = require("./routes/addRoleColumn");
  app.use(baseUrl, addRoleColumnRoute);
}

const allowLegacyMakeAdminRoute = String(process.env.ALLOW_MAKE_ADMIN_ROUTE || '').trim().toLowerCase() === 'true';
if (allowLegacyMakeAdminRoute) {
  const makeAdminRoute = require("./routes/makeAdmin");
  app.use(baseUrl, makeAdminRoute);
}
const registerCourseRoute = require("./routes/registerCourse");
app.use(baseUrl + "/register-course", registerCourseRoute);
// Error handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).send("Server Error");
});

module.exports = app;
