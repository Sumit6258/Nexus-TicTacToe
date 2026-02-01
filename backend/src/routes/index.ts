// ====================================================================
// REST API ROUTES
// ====================================================================

import { Router, Request, Response } from 'express';
import { UserService } from '../services/userService';
import { GameService } from '../services/gameService';
import { RoomService } from '../services/roomService';
import { redis, redisKeys } from '../database';

const router = Router();

// Middleware to verify JWT token
async function authenticateToken(req: Request, res: Response, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await UserService.verifyToken(token);
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// ====================================================================
// AUTH ROUTES
// ====================================================================

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await UserService.register(username, email, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = await UserService.login(username, password);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/guest', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const result = await UserService.createGuest(username);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/auth/me', authenticateToken, async (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// ====================================================================
// GAME ROUTES
// ====================================================================

router.post('/games/single-player', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { difficulty } = req.body;

    // Create AI opponent (guest user)
    const aiUser = await UserService.createGuest('AI_' + difficulty.toUpperCase());
    
    // Create game
    const game = await GameService.createGame(userId, aiUser.user.id, 'single-player');
    
    res.json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/games/:gameId/move', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { position } = req.body;
    const userId = (req as any).user.id;

    const game = await GameService.makeMove(gameId, position, userId);
    res.json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/games/:gameId/ai-move', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { difficulty } = req.body;

    const game = await GameService.makeAIMove(gameId, difficulty);
    res.json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/games/:gameId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const game = await GameService.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ game });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/games/history/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const games = await GameService.getGameHistory(userId, limit);
    res.json({ games });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ====================================================================
// USER ROUTES
// ====================================================================

router.get('/users/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await UserService.getLeaderboard(limit);
    res.json({ leaderboard });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ====================================================================
// ROOM ROUTES (for multiplayer)
// ====================================================================

router.post('/rooms/create', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const room = await RoomService.createRoom(userId);
    res.json({ room });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/rooms/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = (req as any).user.id;
    
    const room = await RoomService.joinRoom(code, userId);
    res.json({ room });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/rooms/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const room = await RoomService.getRoomByCode(code);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ room });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ====================================================================
// ADMIN ROUTES
// ====================================================================

async function authenticateAdmin(req: Request, res: Response, next: any) {
  const user = (req as any).user;
  if (!user || user.username !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.get('/admin/stats', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await GameService.getStats();
    const activeGames = await GameService.getActiveGames();
    const onlineUsers = await redis.scard(redisKeys.onlineUsers());
    
    res.json({
      ...stats,
      activeUsers: onlineUsers,
      activeGames,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/admin/games/export', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as 'json' | 'csv') || 'json';
    const data = await GameService.exportGames(format);
    
    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `games-export-${Date.now()}.${format}`;
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/admin/users/:userId/ban', authenticateToken, authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user.id;
    
    await UserService.banUser(userId, adminId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ====================================================================
// HEALTH CHECK
// ====================================================================

router.get('/health', async (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;
