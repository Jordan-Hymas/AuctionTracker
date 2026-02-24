import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { initializeDatabase, startBackupSchedule, stopBackupSchedule } from './database/db';
import { initializeWebSocket } from './websocket';
import { logger } from './utils/logger';
import { buildNetworkInfo } from './utils/network';
import { findFirstAvailablePort } from './utils/port';

// Import routes
import bidsRouter from './routes/bids';
import settingsRouter from './routes/settings';
import uploadRouter from './routes/upload';
import exportRouter from './routes/export';
import adminRouter from './routes/admin';

const HOST = '0.0.0.0';
const DEV_PORT = 3001;
const EMBEDDED_PORT_CANDIDATES = [5000, 5001, 5002];
const IS_EMBEDDED = process.env.ELECTRON_EMBEDDED === '1';
const SHOULD_SERVE_FRONTEND = IS_EMBEDDED || process.env.SERVE_FRONTEND === '1';

const app = express();
const httpServer = http.createServer(app);

// Initialize database
initializeDatabase();
startBackupSchedule();

// Initialize WebSocket
initializeWebSocket(httpServer);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../data/uploads');
const FRONTEND_DIST_PATH = process.env.FRONTEND_DIST_PATH || path.resolve(__dirname, '../../frontend/dist');

const parseEmbeddedPortCandidates = (value?: string): number[] => {
  if (!value) return EMBEDDED_PORT_CANDIDATES;

  const parsed = value
    .split(',')
    .map((segment) => Number(segment.trim()))
    .filter((port) => Number.isInteger(port) && port >= 1 && port <= 65535);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : EMBEDDED_PORT_CANDIDATES;
};

const resolveServerPort = async (): Promise<number> => {
  if (!IS_EMBEDDED) {
    return Number(process.env.PORT) || DEV_PORT;
  }

  const candidates = parseEmbeddedPortCandidates(process.env.PORT_CANDIDATES);
  const selectedPort = await findFirstAvailablePort(candidates, HOST);

  if (selectedPort === null) {
    throw new Error(`No available ports from candidates: ${candidates.join(', ')}`);
  }

  return selectedPort;
};

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api/v1/bids', bidsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', adminRouter); // Health check at /api/v1/health

if (SHOULD_SERVE_FRONTEND && fs.existsSync(FRONTEND_DIST_PATH)) {
  app.use(express.static(FRONTEND_DIST_PATH));

  // SPA fallback so refreshing /control works in production.
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/') || req.path.startsWith('/ws/')) {
      next();
      return;
    }
    res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
  });
} else {
  if (SHOULD_SERVE_FRONTEND) {
    logger.warn('Frontend dist path was not found; static hosting is disabled', { path: FRONTEND_DIST_PATH });
  }

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Auction Thermometer API',
      version: '1.0.0',
      status: 'running',
    });
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled server error', { message: err.message, stack: err.stack });
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  const selectedPort = await resolveServerPort();
  process.env.PORT = String(selectedPort);
  app.set('serverPort', selectedPort);

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      httpServer.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      httpServer.off('error', onError);
      resolve();
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    httpServer.listen(selectedPort, HOST);
  });

  const networkInfo = buildNetworkInfo(selectedPort);
  logger.info('Server network info', networkInfo);

  if (networkInfo.warning) {
    logger.warn('LAN detection warning', { warning: networkInfo.warning });
  }

  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Auction Thermometer API Server                     ║
║                                                       ║
║   Local: http://localhost:${selectedPort}                    ║
║   Control (LAN): ${networkInfo.controlUrlLan || 'Unavailable'}     ║
║   WebSocket path: /ws/socket.io                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
};

startServer().catch((err) => {
  logger.error('Failed to start server', { message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully');
  stopBackupSchedule();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully');
  stopBackupSchedule();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
