// ====================================================================
// ROOM SERVICE - Multiplayer matchmaking and room management
// ====================================================================

import { v4 as uuidv4 } from 'uuid';
import { query, redis, redisKeys, cacheSet, cacheGet, cacheDel } from '../database';
import { Room } from '../../../shared/types';
import { GameService } from './gameService';

export class RoomService {
  /**
   * Generate unique room code
   */
  private static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Create a new room
   */
  static async createRoom(hostId: string): Promise<Room> {
    const roomId = uuidv4();
    const code = this.generateRoomCode();
    
    // Check if code already exists (very unlikely but handle it)
    const existing = await query('SELECT id FROM rooms WHERE code = $1', [code]);
    if (existing.length > 0) {
      return this.createRoom(hostId); // Retry with new code
    }

    const room: Room = {
      id: roomId,
      code,
      hostId,
      createdAt: new Date(),
    };

    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await query(
      `INSERT INTO rooms (id, code, host_id, status, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [roomId, code, hostId, 'waiting', room.createdAt, expiresAt]
    );

    // Cache room state
    await cacheSet(redisKeys.roomState(roomId), room, 3600);

    return room;
  }

  /**
   * Join a room by code
   */
  static async joinRoom(code: string, guestId: string): Promise<Room> {
    const [roomData] = await query<any>(
      `UPDATE rooms 
       SET guest_id = $1, status = $2
       WHERE code = $3 AND status = 'waiting' AND guest_id IS NULL
       RETURNING id, code, host_id, guest_id, game_id, created_at`,
      [guestId, 'ready', code]
    );

    if (!roomData) {
      throw new Error('Room not found or already full');
    }

    const room: Room = {
      id: roomData.id,
      code: roomData.code,
      hostId: roomData.host_id,
      guestId: roomData.guest_id,
      createdAt: roomData.created_at,
    };

    // Update cache
    await cacheSet(redisKeys.roomState(room.id), room, 3600);

    return room;
  }

  /**
   * Start game in room
   */
  static async startGame(roomId: string): Promise<string> {
    const [roomData] = await query<any>(
      `SELECT id, host_id, guest_id, game_id FROM rooms WHERE id = $1`,
      [roomId]
    );

    if (!roomData) {
      throw new Error('Room not found');
    }

    if (!roomData.guest_id) {
      throw new Error('Waiting for opponent to join');
    }

    if (roomData.game_id) {
      return roomData.game_id; // Game already started
    }

    // Randomly assign X and O
    const isHostX = Math.random() < 0.5;
    const playerXId = isHostX ? roomData.host_id : roomData.guest_id;
    const playerOId = isHostX ? roomData.guest_id : roomData.host_id;

    // Create game
    const game = await GameService.createGame(playerXId, playerOId, 'online-multiplayer');

    // Update room with game ID
    await query(
      `UPDATE rooms SET game_id = $1, status = $2 WHERE id = $3`,
      ['playing', game.id, roomId]
    );

    // Update cache
    const room = await this.getRoom(roomId);
    if (room) {
      room.game = game;
      await cacheSet(redisKeys.roomState(roomId), room, 3600);
    }

    return game.id;
  }

  /**
   * Get room by ID
   */
  static async getRoom(roomId: string): Promise<Room | null> {
    // Try cache first
    const cached = await cacheGet<Room>(redisKeys.roomState(roomId));
    if (cached) return cached;

    // Fallback to database
    const [roomData] = await query<any>(
      `SELECT id, code, host_id, guest_id, game_id, created_at 
       FROM rooms WHERE id = $1`,
      [roomId]
    );

    if (!roomData) return null;

    const room: Room = {
      id: roomData.id,
      code: roomData.code,
      hostId: roomData.host_id,
      guestId: roomData.guest_id,
      createdAt: roomData.created_at,
    };

    if (roomData.game_id) {
      room.game = await GameService.getGame(roomData.game_id) || undefined;
    }

    await cacheSet(redisKeys.roomState(roomId), room, 3600);
    return room;
  }

  /**
   * Get room by code
   */
  static async getRoomByCode(code: string): Promise<Room | null> {
    const [roomData] = await query<any>(
      `SELECT id FROM rooms WHERE code = $1`,
      [code]
    );

    if (!roomData) return null;
    return this.getRoom(roomData.id);
  }

  /**
   * Leave room
   */
  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (!room) return;

    if (room.hostId === userId) {
      // Host left, delete room
      await query('DELETE FROM rooms WHERE id = $1', [roomId]);
      await cacheDel(redisKeys.roomState(roomId));
    } else if (room.guestId === userId) {
      // Guest left, reset room to waiting
      await query(
        `UPDATE rooms SET guest_id = NULL, status = $1 WHERE id = $2`,
        ['waiting', roomId]
      );
      await cacheDel(redisKeys.roomState(roomId));
    }
  }

  /**
   * Clean up expired rooms
   */
  static async cleanupExpiredRooms(): Promise<void> {
    await query(
      `DELETE FROM rooms WHERE expires_at < CURRENT_TIMESTAMP AND status = 'waiting'`
    );
  }
}
