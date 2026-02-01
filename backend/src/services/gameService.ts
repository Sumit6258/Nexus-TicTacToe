// ====================================================================
// GAME SERVICE - Game state management and persistence
// ====================================================================

import { v4 as uuidv4 } from 'uuid';
import { query, redis, redisKeys, cacheSet, cacheGet } from '../database';
import { GameState, Player, GameMode, Move } from '../../../shared/types';
import { TicTacToeEngine, TicTacToeAI } from '../../../shared/gameEngine';

export class GameService {
  /**
   * Create new game
   */
  static async createGame(
    playerXId: string,
    playerOId: string,
    mode: GameMode
  ): Promise<GameState> {
    const gameId = uuidv4();
    const game: GameState = {
      id: gameId,
      board: new Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
      mode,
      status: 'playing',
      players: {
        X: playerXId,
        O: playerOId,
      },
      createdAt: new Date(),
      moveHistory: [],
    };

    // Save to database
    await query(
      `INSERT INTO games (id, player_x_id, player_o_id, board, mode, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [gameId, playerXId, playerOId, JSON.stringify(game.board), mode, 'playing', new Date()]
    );

    // Cache game state in Redis for fast access
    await cacheSet(redisKeys.gameState(gameId), game, 3600);

    // Add to active games set
    await redis.sadd(redisKeys.activeGames(), gameId);

    return game;
  }

  /**
   * Get game state
   */
  static async getGame(gameId: string): Promise<GameState | null> {
    // Try cache first
    const cached = await cacheGet<GameState>(redisKeys.gameState(gameId));
    if (cached) {
      return cached;
    }

    // Fallback to database
    const [game] = await query<any>(
      `SELECT id, player_x_id, player_o_id, board, mode, status, winner,
              winning_line, move_history, created_at, finished_at
       FROM games WHERE id = $1`,
      [gameId]
    );

    if (!game) return null;

    const gameState: GameState = {
      id: game.id,
      board: game.board,
      currentPlayer: this.getCurrentPlayer(game.board),
      winner: game.winner,
      winningLine: game.winning_line,
      mode: game.mode,
      status: game.status,
      players: {
        X: game.player_x_id,
        O: game.player_o_id,
      },
      createdAt: game.created_at,
      finishedAt: game.finished_at,
      moveHistory: game.move_history || [],
    };

    // Cache it
    await cacheSet(redisKeys.gameState(gameId), gameState, 3600);

    return gameState;
  }

  /**
   * Make a move
   */
  static async makeMove(
    gameId: string,
    position: number,
    playerId: string
  ): Promise<GameState> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'playing') throw new Error('Game is not active');

    // Validate it's the player's turn
    const playerSymbol = game.players.X === playerId ? 'X' : 'O';
    if (game.currentPlayer !== playerSymbol) {
      throw new Error('Not your turn');
    }

    // Validate move
    if (!TicTacToeEngine.isValidMove(game.board, position)) {
      throw new Error('Invalid move');
    }

    // Make the move
    const newBoard = TicTacToeEngine.makeMove(game.board, position, playerSymbol);
    const { winner, winningLine } = TicTacToeEngine.checkWinner(newBoard);

    // Create move record
    const move: Move = {
      position,
      player: playerSymbol,
      timestamp: new Date(),
    };

    // Update game state
    game.board = newBoard;
    game.moveHistory.push(move);
    game.currentPlayer = TicTacToeEngine.getNextPlayer(playerSymbol);
    game.winner = winner;
    game.winningLine = winningLine;

    if (winner) {
      game.status = 'finished';
      game.finishedAt = new Date();
      const duration = Math.floor((game.finishedAt.getTime() - game.createdAt.getTime()) / 1000);

      // Update database
      await query(
        `UPDATE games 
         SET board = $1, winner = $2, status = $3, winning_line = $4, 
             move_history = $5, finished_at = $6, duration = $7
         WHERE id = $8`,
        [
          JSON.stringify(newBoard),
          winner,
          'finished',
          JSON.stringify(winningLine),
          JSON.stringify(game.moveHistory),
          game.finishedAt,
          duration,
          gameId,
        ]
      );

      // Update player stats
      if (winner !== 'draw') {
        const winnerId = game.players[winner];
        const loserId = game.players[winner === 'X' ? 'O' : 'X'];
        
        // Import UserService dynamically to avoid circular dependency
        const { UserService } = await import('./userService');
        await UserService.updateStats(winnerId, 'win');
        await UserService.updateStats(loserId, 'loss');
      } else {
        const { UserService } = await import('./userService');
        await UserService.updateStats(game.players.X, 'draw');
        await UserService.updateStats(game.players.O, 'draw');
      }

      // Remove from active games
      await redis.srem(redisKeys.activeGames(), gameId);
    } else {
      // Update database
      await query(
        `UPDATE games SET board = $1, move_history = $2 WHERE id = $3`,
        [JSON.stringify(newBoard), JSON.stringify(game.moveHistory), gameId]
      );
    }

    // Update cache
    await cacheSet(redisKeys.gameState(gameId), game, 3600);

    return game;
  }

  /**
   * AI makes a move (for single-player mode)
   */
  static async makeAIMove(
    gameId: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GameState> {
    const game = await this.getGame(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'playing') throw new Error('Game is not active');

    // Get AI move
    const position = TicTacToeAI.getMove(game.board, game.currentPlayer, difficulty);

    // Make the move (AI is always player O)
    return await this.makeMove(gameId, position, game.players.O);
  }

  /**
   * Get active games for admin panel
   */
  static async getActiveGames(): Promise<any[]> {
    const gameIds = await redis.smembers(redisKeys.activeGames());
    const games = await Promise.all(
      gameIds.map(async (id) => {
        const game = await this.getGame(id);
        if (!game) return null;

        const { UserService } = await import('./userService');
        const playerX = await UserService.getUserById(game.players.X);
        const playerO = await UserService.getUserById(game.players.O);

        const duration = Math.floor((Date.now() - game.createdAt.getTime()) / 1000);

        return {
          gameId: game.id,
          playerA: { id: playerX?.id, username: playerX?.username },
          playerB: { id: playerO?.id, username: playerO?.username },
          mode: game.mode,
          duration,
          status: game.status,
        };
      })
    );

    return games.filter(Boolean);
  }

  /**
   * Get game history for a user
   */
  static async getGameHistory(userId: string, limit: number = 20): Promise<any[]> {
    return await query(
      `SELECT g.id, g.winner, g.mode, g.created_at, g.finished_at, g.duration,
              ux.username as player_x_name, uo.username as player_o_name
       FROM games g
       LEFT JOIN users ux ON g.player_x_id = ux.id
       LEFT JOIN users uo ON g.player_o_id = uo.id
       WHERE g.player_x_id = $1 OR g.player_o_id = $1
       ORDER BY g.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
  }

  /**
   * Get stats for dashboard
   */
  static async getStats(): Promise<any> {
    const [stats] = await query(`
      SELECT 
        COUNT(DISTINCT id) as total_games,
        COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE THEN id END) as games_today,
        COUNT(DISTINCT player_x_id) + COUNT(DISTINCT player_o_id) as total_players
      FROM games
    `);

    const activeGamesCount = await redis.scard(redisKeys.activeGames());

    return {
      totalGames: parseInt(stats.total_games),
      gamesToday: parseInt(stats.games_today),
      totalPlayers: parseInt(stats.total_players),
      activeGames: activeGamesCount,
    };
  }

  /**
   * Helper: Determine current player from board state
   */
  private static getCurrentPlayer(board: Player[]): Player {
    const xCount = board.filter(cell => cell === 'X').length;
    const oCount = board.filter(cell => cell === 'O').length;
    return xCount <= oCount ? 'X' : 'O';
  }

  /**
   * Export game logs (for admin)
   */
  static async exportGames(format: 'json' | 'csv' = 'json'): Promise<string> {
    const games = await query(
      `SELECT g.*, ux.username as player_x_name, uo.username as player_o_name
       FROM games g
       LEFT JOIN users ux ON g.player_x_id = ux.id
       LEFT JOIN users uo ON g.player_o_id = uo.id
       ORDER BY g.created_at DESC
       LIMIT 1000`
    );

    if (format === 'json') {
      return JSON.stringify(games, null, 2);
    } else {
      // CSV format
      const headers = 'ID,Player X,Player O,Winner,Mode,Duration,Created At,Finished At\n';
      const rows = games.map(g => 
        `${g.id},${g.player_x_name},${g.player_o_name},${g.winner || 'N/A'},${g.mode},${g.duration || 'N/A'},${g.created_at},${g.finished_at || 'N/A'}`
      ).join('\n');
      return headers + rows;
    }
  }
}
