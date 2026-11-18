import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env and root .env
// In Vercel production, these silently no-op (env vars come from Vercel dashboard)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middlewares
app.use(cors({
  origin: [
    CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount API router
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Mira Road Digital Twin API Server',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      weather: '/api/weather?lat=19.2812&lon=72.8561',
      airQuality: '/api/air-quality?lat=19.2812&lon=72.8561',
      traffic: '/api/traffic?lat=19.2812&lon=72.8561&radius=3500'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;

