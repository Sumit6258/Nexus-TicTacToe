// ====================================================================
// USER SERVICE - Authentication & User Management
// ====================================================================

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, transaction, cacheSet, cacheGet, cacheDel, redisKeys } from '../database';
import { User } from '../../../shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

interface AuthResponse {
  user: User;
  token: string;
}

export class UserService {
  /**
   * Register new user
   */
  static async register(username: string, email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!username || username.length < 3 || username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if username exists
    const existing = await query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.length > 0) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [user] = await query<User>(
      `INSERT INTO users (username, email, password_hash, is_guest, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, avatar, games_played, wins, losses, draws, 
                 win_streak, last_played, status, created_at, is_guest`,
      [username, email, passwordHash, false, 'online']
    );

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Cache user session
    await cacheSet(redisKeys.userSession(user.id), { userId: user.id }, 7 * 24 * 3600);

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(username: string, password: string): Promise<AuthResponse> {
    // Find user
    const [user] = await query<User & { password_hash: string }>(
      `SELECT id, username, email, password_hash, avatar, games_played, wins, 
              losses, draws, win_streak, last_played, status, created_at, is_guest
       FROM users WHERE username = $1`,
      [username]
    );

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    // Update status to online
    await query('UPDATE users SET status = $1 WHERE id = $2', ['online', user.id]);

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Cache session
    await cacheSet(redisKeys.userSession(user.id), { userId: user.id }, 7 * 24 * 3600);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Create guest user
   */
  static async createGuest(username?: string): Promise<AuthResponse> {
    const guestUsername = username || `Guest_${Math.random().toString(36).substring(2, 8)}`;

    const [user] = await query<User>(
      `INSERT INTO users (username, is_guest, status)
       VALUES ($1, $2, $3)
       RETURNING id, username, avatar, games_played, wins, losses, draws,
                 win_streak, last_played, status, created_at, is_guest`,
      [guestUsername, true, 'online']
    );

    const token = jwt.sign({ userId: user.id, isGuest: true }, JWT_SECRET, { expiresIn: '24h' });

    await cacheSet(redisKeys.userSession(user.id), { userId: user.id, isGuest: true }, 24 * 3600);

    return { user, token };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Check cache first
      const cached = await cacheGet<{ userId: string }>(redisKeys.userSession(decoded.userId));
      if (!cached) {
        throw new Error('Session expired');
      }

      // Get user from database
      const [user] = await query<User>(
        `SELECT id, username, avatar, games_played, wins, losses, draws,
                win_streak, last_played, status, created_at, is_guest
         FROM users WHERE id = $1`,
        [decoded.userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Update user stats after game
   */
  static async updateStats(userId: string, result: 'win' | 'loss' | 'draw'): Promise<void> {
    await transaction(async (client) => {
      const [user] = await client.query(
        'SELECT win_streak, max_win_streak FROM users WHERE id = $1 FOR UPDATE',
        [userId]
      ).then(r => r.rows);

      let newWinStreak = user.win_streak;
      let newMaxWinStreak = user.max_win_streak;

      if (result === 'win') {
        newWinStreak += 1;
        newMaxWinStreak = Math.max(newMaxWinStreak, newWinStreak);
        await client.query(
          `UPDATE users 
           SET wins = wins + 1, 
               games_played = games_played + 1,
               win_streak = $1,
               max_win_streak = $2,
               last_played = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [newWinStreak, newMaxWinStreak, userId]
        );
      } else if (result === 'loss') {
        await client.query(
          `UPDATE users 
           SET losses = losses + 1, 
               games_played = games_played + 1,
               win_streak = 0,
               last_played = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [userId]
        );
      } else {
        await client.query(
          `UPDATE users 
           SET draws = draws + 1, 
               games_played = games_played + 1,
               last_played = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [userId]
        );
      }
    });

    // Invalidate cache
    await cacheDel(redisKeys.userStats(userId));
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const [user] = await query<User>(
      `SELECT id, username, avatar, games_played, wins, losses, draws,
              win_streak, last_played, status, created_at, is_guest
       FROM users WHERE id = $1`,
      [userId]
    );
    return user || null;
  }

  /**
   * Update user status
   */
  static async updateStatus(userId: string, status: 'online' | 'offline' | 'in-game'): Promise<void> {
    await query('UPDATE users SET status = $1 WHERE id = $2', [status, userId]);
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(limit: number = 100): Promise<any[]> {
    return await query(
      'SELECT * FROM leaderboard LIMIT $1',
      [limit]
    );
  }

  /**
   * Ban user (admin only)
   */
  static async banUser(userId: string, adminId: string): Promise<void> {
    await query('UPDATE users SET is_banned = TRUE WHERE id = $1', [userId]);
    await query(
      'INSERT INTO admin_logs (admin_id, action, target_user_id) VALUES ($1, $2, $3)',
      [adminId, 'BAN_USER', userId]
    );
  }
}
