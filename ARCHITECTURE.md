# Application Architecture

## Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser Request                         │
│                     GET /login, POST /contact                   │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Route Handler                        │
│                  (src/routes/*.js files)                        │
│                                                                 │
│  Example: router.get("/login", (req, res) => {                │
│    renderWithLayout(res, "auth/login", {...})                 │
│  });                                                            │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              renderWithLayout() Helper Function                 │
│            (src/utils/renderHelper.js)                          │
│                                                                 │
│  1. Render view: ejs.renderFile(login.ejs)                    │
│     Input:  { title: "Login" }                                 │
│     Output: <div class="login-form">...</div>                  │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Render Layout: ejs.renderFile(layout.ejs)          │
│                                                                 │
│  Input: {                                                       │
│    content: "<div class="login-form">...</div>",             │
│    title: "Login",                                             │
│    baseUrl: "" (or "/app207")                                  │
│  }                                                              │
│                                                                 │
│  Output: Complete HTML page with navbar + content              │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  res.send(html) to Browser                     │
│                Complete rendered HTML page                      │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
project/
├── public/                    # Static files (CSS, JS, images)
├── src/
│   ├── app.js               # Main Express app
│   ├── models/
│   │   ├── db.js           # MySQL connection pool
│   │   └── dataHandler.js  # User auth logic
│   ├── routes/
│   │   ├── auth.js         # Login/register/logout
│   │   ├── contact.js      # Contact form + messages
│   │   ├── admin.js        # Admin panel
│   │   └── dbtest.js       # Database utilities
│   ├── views/
│   │   ├── layout.ejs      # Master template wrapper
│   │   ├── home.ejs        # Landing page
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   └── register.ejs
│   │   ├── dashboard.ejs   # User dashboard
│   │   ├── contact.ejs     # Contact form
│   │   ├── messages.ejs    # Messages list
│   │   ├── admin.ejs       # Admin panel
│   │   └── editUser.ejs    # User edit form
│   ├── middleware/
│   │   └── isAdmin.js      # Admin check (legacy, auth.js now)
│   └── utils/
│       └── renderHelper.js # Layout wrapper function
├── data/
│   ├── users.txt           # User storage (JSON)
│   ├── students.txt
│   ├── marks.txt
│   └── subjects.txt
├── .env                     # Environment config
├── package.json             # Dependencies
├── start.js                 # Entry point
├── STARTUP.md              # Quick start
└── REBUILD_SUMMARY.md      # This rebuild info
```

## Component Interaction

```
Authentication Flow:
┌──────────────────────────────────────────────────────┐
│                   User Registration                   │
├──────────────────────────────────────────────────────┤
│ 1. User fills register form → POST /register         │
│ 2. Route validates input (username, email, password)  │
│ 3. registerUser() hashes password with bcrypt        │
│ 4. Saves to data/users.txt (JSON format)             │
│ 5. Response: "Registration successful!"              │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│                    User Login                        │
├──────────────────────────────────────────────────────┤
│ 1. User enters email/password → POST /login          │
│ 2. Route finds user in data/users.txt                │
│ 3. loginUser() verifies password with bcrypt         │
│ 4. Creates session: req.session.user = {...}        │
│ 5. Session stored in memory (or external store)      │
│ 6. Redirect to /dashboard or /admin                  │
└──────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│                Protected Pages                       │
├──────────────────────────────────────────────────────┤
│ Middleware checks: isLoggedIn(req, res, next)        │
│   - If no session → redirect to /login               │
│   - If session exists → continue to route            │
│ Middleware checks: isAdmin(req, res, next)           │
│   - If not admin role → return 403 Forbidden         │
│   - If admin → show admin panel                      │
└──────────────────────────────────────────────────────┘
```

## Database Schema

```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Users are stored in JSON format in `data/users.txt`:
```json
[
  {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "password": "$2a$10$...",  // bcrypt hash
    "role": "user",
    "createdAt": "2024-01-15"
  },
  {
    "id": 2,
    "username": "admin",
    "email": "admin@example.com",
    "password": "$2a$10$...",
    "role": "admin",
    "createdAt": "2024-01-15"
  }
]
```

## Environment Configuration

### Local Development
```env
BASE_URL=                  # Empty = routes at /login, /register, etc.
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=student_platform
PORT=4208
```

Link structure: http://localhost:4207/login

### Production (School Server)
```env
BASE_URL=

DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=student_platform
DB_PORT=3306

PORT=4208
```

Link structure example: https://your-app.up.railway.app/login

Redirect logic in app.js:
- If `BASE_URL=/app207` is set
- Visit to `/login` auto-redirects to `/app207/login`
- Layout navbar uses `<%= baseUrl %>` to generate correct links

## Security Features

✅ Password hashing with bcrypt (salted)
✅ Session-based authentication with cookies
✅ CSRF protection via express-session
✅ SQL injection prevention (MySQL parameterized queries)
✅ Role-based access control (isAdmin middleware)
✅ Session timeout (24 hours)
✅ Password required for registration

## Styling

- **Framework**: Tailwind CSS 3 (CDN)
- **Colors**:
  - Primary: #0F4C5C (dark teal)
  - Accent: #64ffda (cyan)
  - Background: #0a192f (dark blue)
  - Text: #ccd6f6 (light purple)
- **Icons**: FontAwesome 6.5.0
- **Responsive**: Mobile-first design with flex/grid

---

**This architecture is clean, maintainable, and ready for production deployment!**
