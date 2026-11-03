import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { initDatabase } from './db/db';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Security & Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // Allows Vercel frontend, local dev, mobile PWA
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting (150 req per minute per IP)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Healthcheck endpoints for Render / Cloud monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Shree Rajgor Brahman Seva Samiti API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Shree Rajgor Brahman Seva Samiti Official API Service',
    health: '/health',
    apiHealth: '/api/health',
    status: 'Ready',
  });
});

// Centralized error handling
app.use(errorHandler);

// Start Server: bind immediately to 0.0.0.0 so Render detects port instantly
async function start() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`  SHREE RAJGOR BRAHMAN SEVA SAMITI API IS ACTIVE`);
    console.log(`  Bound to 0.0.0.0:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`=======================================================`);
  });

  // Connect to database in parallel
  try {
    await initDatabase();
  } catch (err) {
    console.warn('Database initialization warning:', err);
  }
}

start();

export default app;
