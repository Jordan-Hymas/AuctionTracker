import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { getSettings, getRecentBids, getLastBid, getCurrentTotal } from './database/queries';
import { Bid } from './models/Bid';
import { Settings } from './models/Settings';

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
    console.log(`✅ Client connected: ${socket.id}`);

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
      console.error('Error sending initial state:', error);
      socket.emit('error', { message: 'Failed to load initial state' });
    }

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ WebSocket server initialized');
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
    console.log('📡 Broadcasting bid:added to all clients:', { bid, newTotal, totalBids });
    console.log(`📡 Connected clients: ${io.engine.clientsCount}`);
    io.emit('bid:added', {
      bid,
      newTotal,
      totalBids,
    });
  } else {
    console.error('❌ Cannot broadcast bid:added - WebSocket not initialized');
  }
}

export function broadcastBidUndone(removedBid: Bid, newTotal: number, totalBids: number): void {
  if (io) {
    console.log('📡 Broadcasting bid:undone to all clients:', { removedBid, newTotal, totalBids });
    console.log(`📡 Connected clients: ${io.engine.clientsCount}`);
    io.emit('bid:undone', {
      removedBid,
      newTotal,
      totalBids,
    });
  } else {
    console.error('❌ Cannot broadcast bid:undone - WebSocket not initialized');
  }
}

export function broadcastSettingsUpdated(settings: Settings): void {
  if (io) {
    console.log('📡 Broadcasting settings:updated to all clients:', settings);
    console.log(`📡 Connected clients: ${io.engine.clientsCount}`);
    io.emit('settings:updated', { settings });
  } else {
    console.error('❌ Cannot broadcast settings:updated - WebSocket not initialized');
  }
}

export function broadcastLogoUpdated(logoUrl: string | null): void {
  if (io) {
    console.log('📡 Broadcasting logo:updated to all clients:', { logoUrl });
    console.log(`📡 Connected clients: ${io.engine.clientsCount}`);
    io.emit('logo:updated', { logoUrl });
  } else {
    console.error('❌ Cannot broadcast logo:updated - WebSocket not initialized');
  }
}
