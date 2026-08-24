import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import lifeAreasRouter from './routes/lifeAreas.js';
import goalsRouter from './routes/goals.js';
import templatesRouter from './routes/templates.js';
import dailyTasksRouter from './routes/dailyTasks.js';
import plannerEventsRouter from './routes/plannerEvents.js';
import focusSessionsRouter from './routes/focusSessions.js';
import timelineEventsRouter from './routes/timelineEvents.js';
import reflectionsRouter from './routes/reflections.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Restricted CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile PWAs, curl, server-to-server) or in allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Personal OS API Server', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/life-areas', lifeAreasRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/daily-tasks', dailyTasksRouter);
app.use('/api/planner', plannerEventsRouter);
app.use('/api/focus-sessions', focusSessionsRouter);
app.use('/api/timeline-events', timelineEventsRouter);
app.use('/api/reflections', reflectionsRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Centralized Error Handler (Sanitizes error leaks in production)
app.use((err, req, res, _next) => {
  console.error('💥 Backend Error:', err.message || err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error occurred.',
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Personal OS Express Backend Server listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use by another background process.`);
    console.error(`💡 Freeing port ${PORT}... Please re-run 'npm run dev' in backend.`);
    process.exit(1);
  }
  throw err;
});

