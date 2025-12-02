import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import env from '../config/env';
import logger from '../utils/logger';

let io: Server | null = null;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug('Client connected', { socketId: socket.id });

    socket.on('disconnect', () => {
      logger.debug('Client disconnected', { socketId: socket.id });
    });

    // Join tenant room
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(`tenant:${tenantId}`);
      logger.debug('Client joined tenant', { socketId: socket.id, tenantId });
    });

    // Leave tenant room
    socket.on('leave-tenant', (tenantId: string) => {
      socket.leave(`tenant:${tenantId}`);
      logger.debug('Client left tenant', { socketId: socket.id, tenantId });
    });
  });

  return io;
};

export const getSocket = (): Server | null => {
  return io;
};

// Emit to tenant room
export const emitToTenant = (tenantId: string, event: string, data: any): void => {
  if (io) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }
};

