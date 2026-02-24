import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getSettings, getRecentBids, getLastBid, getCurrentTotal } from './database/queries';
import { Bid } from './models/Bid';
import { Settings } from './models/Settings';
import { logger } from './utils/logger';

let io: Server | null = null;

export function initializeWebSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    path: '/ws/socket.io'
  });

  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id });

    // Send initial state to newly connected client
    try {
      const settings = getSettings();
      const recentBids = getRecentBids(10);
      const lastBid = getLastBid();
      const currentTotal = getCurrentTotal();

      socket.emit('state:initial', {
        currentTotal,
        settings,
        lastBid,
        recentBids,
      });
    } catch (error) {
      logger.error('Error sending initial state', error);
      socket.emit('error', { message: 'Failed to load initial state' });
    }

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  logger.info('WebSocket server initialized');
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

// Broadcast helpers
export function broadcastBidAdded(bid: Bid, newTotal: number, totalBids: number): void {
  if (io) {
    logger.info('Broadcasting bid:added', { bid, newTotal, totalBids, clients: io.engine.clientsCount });
    io.emit('bid:added', { bid, newTotal, totalBids });
  } else {
    logger.error('Cannot broadcast bid:added — WebSocket not initialized');
  }
}

export function broadcastBidUndone(removedBid: Bid, newTotal: number, totalBids: number): void {
  if (io) {
    logger.info('Broadcasting bid:undone', { removedBid, newTotal, totalBids, clients: io.engine.clientsCount });
    io.emit('bid:undone', { removedBid, newTotal, totalBids });
  } else {
    logger.error('Cannot broadcast bid:undone — WebSocket not initialized');
  }
}

export function broadcastSettingsUpdated(settings: Settings): void {
  if (io) {
    logger.info('Broadcasting settings:updated', { clients: io.engine.clientsCount });
    io.emit('settings:updated', { settings });
  } else {
    logger.error('Cannot broadcast settings:updated — WebSocket not initialized');
  }
}

export function broadcastLogoUpdated(logoUrl: string | null): void {
  if (io) {
    logger.info('Broadcasting logo:updated', { logoUrl, clients: io.engine.clientsCount });
    io.emit('logo:updated', { logoUrl });
  } else {
    logger.error('Cannot broadcast logo:updated — WebSocket not initialized');
  }
}
