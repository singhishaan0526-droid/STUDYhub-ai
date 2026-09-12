require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

// Secure HTTP headers
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser with payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes).
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Health check route for Render
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'StudyHub AI Backend', database: 'Supabase' });
});

const routes = [
  ['/api/auth',          './routes/authRoutes'],
  ['/api/notes',         './routes/notesRoutes'],
  ['/api/questions',     './routes/questionsRoutes'],
  ['/api/exams',         './routes/examsRoutes'],
  ['/api/doubts',        './routes/doubtsRoutes'],
  ['/api/history',       './routes/historyRoutes'],
  ['/api/quiz',          './routes/quizRoutes'],
  ['/api/study-planner', './routes/studyPlannerRoutes'],
];

for (const [path, route] of routes) {
  app.use(path, require(route));
}

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack || err.message);
  res.status(500).json({ message: 'Internal server error: ' + err.message, stack: err.stack });
});

module.exports = app;
