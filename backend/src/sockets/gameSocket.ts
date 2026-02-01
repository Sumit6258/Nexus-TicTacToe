// ====================================================================
// WEBSOCKET HANDLERS - Real-time multiplayer communication
// ====================================================================

import { Server as SocketServer, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/types';
import { GameService } from '../services/gameService';
import { RoomService } from '../services/roomService';
import { UserService } from '../services/userService';
import { redis, redisKeys } from '../database';

// Store socket-to-user mapping
const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();

export function setupSocketHandlers(io: SocketServer) {
  io.on(SocketEvents.CONNECT, async (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ================================================================
    // AUTHENTICATION
    // ================================================================
    socket.on('authenticate', async (token: string, callback) => {
      try {
        const user = await UserService.verifyToken(token);
        socketToUser.set(socket.id, user.id);
        userToSocket.set(user.id, socket.id);
        
        // Update user status
        await UserService.updateStatus(user.id, 'online');
        await redis.sadd(redisKeys.onlineUsers(), user.id);

        callback({ success: true, user });
        console.log(`User authenticated: ${user.username} (${user.id})`);
      } catch (error) {
        callback({ success: false, error: 'Authentication failed' });
        socket.disconnect();
      }
    });

    // ================================================================
    // ROOM MANAGEMENT
    // ================================================================
    socket.on(SocketEvents.CREATE_ROOM, async (callback) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) throw new Error('Not authenticated');

        const room = await RoomService.createRoom(userId);
        socket.join(`room:${room.id}`);

        callback({ success: true, room });
        console.log(`Room created: ${room.code} by user ${userId}`);
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on(SocketEvents.JOIN_ROOM, async (roomCode: string, callback) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) throw new Error('Not authenticated');

        const room = await RoomService.joinRoom(roomCode, userId);
        socket.join(`room:${room.id}`);

        // Notify host that guest joined
        const hostSocketId = userToSocket.get(room.hostId);
        if (hostSocketId) {
          io.to(hostSocketId).emit(SocketEvents.PLAYER_JOINED, {
            userId,
            room,
          });
        }

        callback({ success: true, room });
        console.log(`User ${userId} joined room ${roomCode}`);

        // Auto-start game
        const gameId = await RoomService.startGame(room.id);
        const game = await GameService.getGame(gameId);
        
        io.to(`room:${room.id}`).emit(SocketEvents.GAME_STARTED, { game });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on(SocketEvents.LEAVE_ROOM, async (roomId: string) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) return;

        await RoomService.leaveRoom(roomId, userId);
        socket.leave(`room:${roomId}`);

        // Notify other player
        socket.to(`room:${roomId}`).emit(SocketEvents.PLAYER_LEFT, { userId });
        console.log(`User ${userId} left room ${roomId}`);
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // ================================================================
    // GAME ACTIONS
    // ================================================================
    socket.on(SocketEvents.MAKE_MOVE, async (data: { gameId: string; position: number }, callback) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) throw new Error('Not authenticated');

        const game = await GameService.makeMove(data.gameId, data.position, userId);

        // Get room for this game
        const [roomData] = await redis.smembers(`game:${data.gameId}:rooms`);
        if (roomData) {
          // Broadcast move to all players in the room
          io.to(`room:${roomData}`).emit(SocketEvents.MOVE_MADE, { game });
        }

        // If game is over, emit game over event
        if (game.status === 'finished') {
          io.to(`room:${roomData}`).emit(SocketEvents.GAME_OVER, { game });
          
          // Update player statuses
          await UserService.updateStatus(game.players.X, 'online');
          await UserService.updateStatus(game.players.O, 'online');
        }

        callback({ success: true, game });
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    socket.on(SocketEvents.REMATCH_REQUEST, async (gameId: string) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) return;

        const game = await GameService.getGame(gameId);
        if (!game) return;

        // Notify opponent
        const opponentId = game.players.X === userId ? game.players.O : game.players.X;
        const opponentSocketId = userToSocket.get(opponentId);
        
        if (opponentSocketId) {
          io.to(opponentSocketId).emit(SocketEvents.REMATCH_REQUEST, { userId });
        }
      } catch (error) {
        console.error('Rematch request error:', error);
      }
    });

    // ================================================================
    // EMOTES
    // ================================================================
    socket.on(SocketEvents.SEND_EMOTE, async (data: { gameId: string; emote: string }) => {
      try {
        const userId = socketToUser.get(socket.id);
        if (!userId) return;

        // Broadcast to other players
        socket.broadcast.emit(SocketEvents.EMOTE_RECEIVED, {
          userId,
          emote: data.emote,
          gameId: data.gameId,
        });
      } catch (error) {
        console.error('Emote error:', error);
      }
    });

    // ================================================================
    // ADMIN ACTIONS
    // ================================================================
    socket.on(SocketEvents.ADMIN_KICK_USER, async (data: { userId: string; reason: string }, callback) => {
      try {
        const adminId = socketToUser.get(socket.id);
        if (!adminId) throw new Error('Not authenticated');

        // Verify admin privileges (simplified - in production, check admin role)
        const admin = await UserService.getUserById(adminId);
        if (!admin || admin.username !== 'admin') {
          throw new Error('Unauthorized');
        }

        // Ban user
        await UserService.banUser(data.userId, adminId);

        // Disconnect user's socket
        const targetSocketId = userToSocket.get(data.userId);
        if (targetSocketId) {
          io.to(targetSocketId).emit(SocketEvents.USER_KICKED, { reason: data.reason });
          io.sockets.sockets.get(targetSocketId)?.disconnect();
        }

        callback({ success: true });
        console.log(`Admin ${adminId} kicked user ${data.userId}`);
      } catch (error: any) {
        callback({ success: false, error: error.message });
      }
    });

    // ================================================================
    // DISCONNECT
    // ================================================================
    socket.on(SocketEvents.DISCONNECT, async () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        await UserService.updateStatus(userId, 'offline');
        await redis.srem(redisKeys.onlineUsers(), userId);
        
        socketToUser.delete(socket.id);
        userToSocket.delete(userId);
        
        console.log(`User ${userId} disconnected`);
      }
    });
  });

  // ================================================================
  // PERIODIC CLEANUP
  // ================================================================
  setInterval(async () => {
    await RoomService.cleanupExpiredRooms();
  }, 5 * 60 * 1000); // Every 5 minutes
}
