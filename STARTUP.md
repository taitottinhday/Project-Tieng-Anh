# Quick Start Guide

## Prerequisites
- Node.js installed
- MySQL/MariaDB running
- Database created: `student_platform`

## Setup Steps

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create database** (if not exists)
   ```sql
   CREATE DATABASE student_platform;
   ```

3. **Update .env** (if needed)
   - `DB_HOST`: localhost (or your server)
   - `DB_USER`: root (or your user)
   - `DB_PASS`: (your password)
   - `DB_NAME`: student_platform
   - `PORT`: 4207
   - `BASE_URL`: (leave empty for local, set to /app207 for production)

4. **Start the server**
   ```
   npm start
   ```

5. **Create database tables**
   Visit: http://localhost:4207/create-table

6. **Test the app**
   - Home: http://localhost:4207/
   - Register: http://localhost:4207/register
   - Login: http://localhost:4207/login
   - Contact: http://localhost:4207/contact
   - Messages: http://localhost:4207/messages (login required)
   - Admin: http://localhost:4207/admin (admin only)
   - DB Test: http://localhost:4207/dbtest

## Features

✅ Authentication (login/register/logout)
✅ Dashboard (post-login view)
✅ Contact form with database storage
✅ Messages listing (login-required)
✅ Admin panel (users & messages management)
✅ Role-based access control
✅ Responsive Tailwind CSS design
✅ Environment-based URL routing

## Architecture

- **Framework**: Express.js with EJS templates
- **Database**: MySQL with promise pool
- **Sessions**: Express-session with cookies
- **Authentication**: Bcrypt password hashing
- **Styling**: Tailwind CSS 3 + custom colors
- **Layout**: Standalone views rendered with layout wrapper

## Deployment

For public deployment:
1. Change `.env`:
   - Set production DB credentials
   - Set a strong `SESSION_SECRET`
   - Leave `BASE_URL` empty unless your host serves the app from a subpath
2. Deploy code to your hosting provider
3. Run `npm install && npm start`
4. Visit your deployed domain, for example `https://your-app.up.railway.app/`
