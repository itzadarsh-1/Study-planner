import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.router.js';
import userRouter from './routes/user.router.js';
import passwordRouter from './routes/password.router.js';
import routineRouter from './routes/routine.router.js';
import dailyTaskRouter from './routes/dailyTask.router.js';
import noteRouter from './routes/note.router.js';
import { ENV } from './config/env.js';

const app = express();
const PORT = ENV.PORT || process.env.PORT || 5000;

const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean).map((url) => url.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hello from server',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running',
    success: true,
  });
});

// Database connection
let dbPromise = null;

app.use('/api', async (req, res, next) => {
  try {
    if (!dbPromise) {
      dbPromise = Promise.resolve().then(() => connectDB());
    }

    await dbPromise;
    next();
  } catch (error) {
    dbPromise = null;
    console.error('Database connection failed:', error);

    res.status(503).json({
      success: false,
      message: 'Database unavailable',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/daily-tasks', dailyTaskRouter);
app.use('/api/password', passwordRouter);
app.use('/api/routines', routineRouter);
app.use('/api/notes', noteRouter);

// Local development only
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;