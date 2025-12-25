import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || '';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(WS_URL, {
      path: '/ws/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected - ID:', socket.id);
      console.log('✅ Transport:', socket.io.engine.transport.name);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected - Reason:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      console.error('❌ Error details:', error);
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
      console.error('❌ WebSocket reconnection failed');
    });

    // Catch-all for debugging
    socket.onAny((eventName, ...args) => {
      console.log('📨 WebSocket event received:', eventName, args);
    });

    socketRef.current = socket;

    return () => {
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
