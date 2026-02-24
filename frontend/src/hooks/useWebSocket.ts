import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const getDefaultWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;

  // In Vite dev, connect directly to backend to avoid proxy ws EPIPE noise.
  if (import.meta.env.DEV) {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    return `${protocol}://${window.location.hostname}:3001`;
  }

  // In production, empty URL means same-origin.
  return '';
};

const WS_URL = getDefaultWsUrl();

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(WS_URL, {
      path: '/ws/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    const clearRetryTimer = () => {
      if (retryTimerRef.current !== null) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    socket.on('connect', () => {
      console.log('✅ WebSocket connected - ID:', socket.id);
      console.log('✅ Transport:', socket.io.engine.transport.name);
      clearRetryTimer();
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected - Reason:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.io.on('reconnect', (attempt) => {
      console.log('🔄 WebSocket reconnected after', attempt, 'attempts');
    });

    socket.io.on('reconnect_attempt', (attempt) => {
      console.log('🔄 WebSocket reconnection attempt', attempt);
    });

    socket.io.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
    });

    socket.io.on('reconnect_failed', () => {
      console.warn('⚠️ WebSocket reconnection failed — starting 30s retry loop');
      // Circuit breaker: keep trying every 30 seconds until the backend is back
      if (retryTimerRef.current === null) {
        retryTimerRef.current = setInterval(() => {
          console.log('🔄 Circuit breaker: attempting reconnect...');
          socket.io.opts.reconnectionAttempts = 5;
          socket.connect();
        }, 30000);
      }
    });

    // Catch-all for debugging
    socket.onAny((eventName, ...args) => {
      console.log('📨 WebSocket event received:', eventName, args);
    });

    socketRef.current = socket;

    return () => {
      clearRetryTimer();
      socket.disconnect();
    };
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  const emit = useCallback((event: string, ...args: any[]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args);
    }
  }, []);

  return {
    isConnected,
    on,
    off,
    emit,
    socket: socketRef.current,
  };
}
