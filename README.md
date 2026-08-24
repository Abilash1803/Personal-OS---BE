# Personal OS — Backend REST API

High-performance, secure **Express 4 & Supabase PostgreSQL** backend API service for **PersonalOS**.

Provides authenticated CRUD endpoints, JWT validation, Row-Level Security (RLS) enforcement, rate limiting, and security header hardening.

---

## 🔒 Security Architecture

- **JWT Authentication Middleware:** Intercepts and validates Supabase Auth JWT tokens on all `/api/*` endpoints.
- **Row-Level Security (RLS):** Queries are strictly scoped to the authenticated `user_id` (`auth.uid() = user_id`).
- **Helmet Protection:** HTTP security headers configured against clickjacking, MIME sniffing, and cross-site attacks.
- **CORS Whitelist:** Cross-Origin Resource Sharing restricted to configured frontend domains via `ALLOWED_ORIGINS`.
- **Rate Limiting:** IP-based windowed request limits (500 requests / 15 minutes) using `express-rate-limit`.
- **Error Sanitization:** Centralized error handler masks raw PostgreSQL database details in production to prevent schema leaks.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- npm or pnpm
- A Supabase PostgreSQL database project

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app
```

> ⚠️ **Note:** Never commit your `.env` file containing real credentials to Git. It is automatically ignored by `.gitignore`.

### 4. Database Setup
Execute the complete schema and RLS policies in [`schema.sql`](./schema.sql) in your **Supabase SQL Editor**.

### 5. Start Backend Server
```bash
# Production start
npm start

# Development mode (auto-reload)
npm run dev
```
The server will run at [http://localhost:5000](http://localhost:5000).

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck & system status | No |
| `GET / POST` | `/api/life-areas` | Get or create Life Areas | Yes (Bearer JWT) |
| `PUT / DELETE` | `/api/life-areas/:id` | Update or delete Life Area | Yes (Bearer JWT) |
| `GET / POST` | `/api/goals` | Get or create Strategic Goals | Yes (Bearer JWT) |
| `PUT / DELETE` | `/api/goals/:id` | Update or delete Goal | Yes (Bearer JWT) |
| `GET / POST` | `/api/templates` | Get or create Task Templates | Yes (Bearer JWT) |
| `PUT / DELETE` | `/api/templates/:id` | Update or delete Template | Yes (Bearer JWT) |
| `GET / POST` | `/api/daily-tasks` | Get or create Daily Tasks (by date) | Yes (Bearer JWT) |
| `PUT / DELETE` | `/api/daily-tasks/:id` | Update status/minutes or delete task | Yes (Bearer JWT) |
| `GET / POST` | `/api/planner` | Get or create Planner Agenda Events | Yes (Bearer JWT) |
| `PUT / DELETE` | `/api/planner/:id` | Update or delete Planner Event | Yes (Bearer JWT) |
| `GET / POST` | `/api/focus-sessions` | Get or create Focus Sessions | Yes (Bearer JWT) |
| `PUT` | `/api/focus-sessions/:id` | Update Focus Session / Notes | Yes (Bearer JWT) |
| `GET / POST` | `/api/timeline-events` | Activity stream & audit trail | Yes (Bearer JWT) |
| `GET / POST` | `/api/reflections/:date`| Daily reflection journal entries | Yes (Bearer JWT) |

---

## ☁️ Deployment (Render / Railway / Fly.io / VPS)

### Deploying to Render.com (Free Web Service)
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **"New Web Service"**.
3. Connect your repository `Personal-OS---BE`.
4. Settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   - `PORT` = `5000`
   - `SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-supabase-anon-key`
   - `ALLOWED_ORIGINS` = `https://your-frontend-domain.vercel.app`
6. Click **Create Web Service**.

---

## 🛠️ Project Structure

```
backend/
├── config/
│   └── supabase.js       # Initialized Supabase client instance
├── middleware/
│   └── auth.js           # JWT Bearer authentication verification middleware
├── routes/
│   ├── dailyTasks.js     # Daily tasks REST handlers
│   ├── focusSessions.js  # Focus session timers & notes
│   ├── goals.js          # Strategic goals CRUD
│   ├── lifeAreas.js      # Life areas categories
│   ├── plannerEvents.js  # Calendar & agenda events
│   ├── reflections.js    # Daily reflection journal
│   ├── templates.js      # Recurring task templates
│   └── timelineEvents.js # Activity stream timeline
├── schema.sql            # PostgreSQL table DDL & RLS security policies
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusion rules (protects .env)
├── package.json          # Node dependencies and scripts
└── server.js             # Express application entrypoint
```

---

## 📄 License
MIT
