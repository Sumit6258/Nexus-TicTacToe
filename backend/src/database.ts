// ====================================================================
// DATABASE CONNECTION & UTILITIES
// ====================================================================

import { Pool, PoolClient } from 'pg';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection Pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Connection
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Connection event handlers
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

// Database query helper with error handling
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Redis helpers
export const redisKeys = {
  userSession: (userId: string) => `session:${userId}`,
  gameState: (gameId: string) => `game:${gameId}`,
  roomState: (roomId: string) => `room:${roomId}`,
  activeGames: () => 'active_games',
  onlineUsers: () => 'online_users',
  userStats: (userId: string) => `stats:${userId}`,
};

// Cache helper with TTL
export async function cacheSet(key: string, value: any, ttl: number = 3600): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

// Test connections
export async function testConnections(): Promise<void> {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }

  try {
    await redis.ping();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closeConnections(): Promise<void> {
  await pool.end();
  await redis.quit();
  console.log('Database connections closed');
}
