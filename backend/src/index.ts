import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { initializeDatabase, startBackupSchedule, stopBackupSchedule } from './database/db';
import { initializeWebSocket } from './websocket';
import { logger } from './utils/logger';

// Import routes
import bidsRouter from './routes/bids';
import settingsRouter from './routes/settings';
import uploadRouter from './routes/upload';
import exportRouter from './routes/export';
import adminRouter from './routes/admin';

const PORT = Number(process.env.PORT) || 3001;
const app = express();
const httpServer = http.createServer(app);

// Initialize database
initializeDatabase();
startBackupSchedule();

// Initialize WebSocket
const io = initializeWebSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../data/uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// API routes
app.use('/api/v1/bids', bidsRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/export', exportRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1', adminRouter); // Health check at /api/v1/health

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Auction Thermometer API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled server error', { message: err.message, stack: err.stack });
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   Auction Thermometer API Server                     ║
║                                                       ║
║   Local: http://localhost:${PORT}                    ║
║   Network: http://0.0.0.0:${PORT}                    ║
║   WebSocket path: /ws/socket.io                      ║
║   Environment: ${process.env.NODE_ENV || 'development'}                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
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
