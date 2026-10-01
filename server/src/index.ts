import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config/env.js';
import { initDatabase } from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import mobilityRoutes from './routes/mobilityRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow frontend dev server and production clients
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'MobiMind AI – Intelligent Mobility Copilot Backend',
    version: '1.0.0',
    tagline: 'MobiMind AI doesn’t just find the fastest route. It uses AI to balance time, cost, traffic, environmental impact and user preferences to recommend the smartest way to travel.',
    geminiConfigured: !!config.geminiApiKey,
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/mobility', mobilityRoutes);
app.use('/api/journeys', journeyRoutes);

// 404 Route Handler for unmatched /api endpoints
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Serve frontend static assets if client/dist exists (Full-stack production mode)
const possibleClientDistPaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../../../client/dist'),
];

const clientDist = possibleClientDistPaths.find((p) => fs.existsSync(p));

if (clientDist) {
  console.log(`[Static] Serving frontend static assets from: ${clientDist}`);
  app.use(express.static(clientDist));

  // SPA fallback for frontend client routing (e.g. /app, /app/results, /login)
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexHtml = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
} else {
  // Generic 404 if no frontend static files exist
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
  });
}

// Centralized Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Initialize DB and launch server
async function startServer() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log('================================================================');
      console.log(`🧭 MobiMind AI Server is running on http://localhost:${config.port}`);
      console.log(`⚡ Mode: ${config.nodeEnv} | Gemini AI: ${config.geminiApiKey ? 'Configured' : 'Offline Heuristic Copilot Active'}`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
