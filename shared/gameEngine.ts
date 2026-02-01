// ====================================================================
// GAME ENGINE - Pure game logic (no UI, no I/O)
// ====================================================================

import { Player, BOARD_SIZE, WINNING_COMBINATIONS } from './types';

export class TicTacToeEngine {
  /**
   * Check if a player has won
   */
  static checkWinner(board: Player[]): { winner: Player | 'draw' | null; winningLine: number[] | null } {
    // Check all winning combinations
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winningLine: combination };
      }
    }

    // Check for draw
    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', winningLine: null };
    }

    // Game still ongoing
    return { winner: null, winningLine: null };
  }

  /**
   * Check if a move is valid
   */
  static isValidMove(board: Player[], position: number): boolean {
    return position >= 0 && position < board.length && board[position] === null;
  }

  /**
   * Make a move on the board
   */
  static makeMove(board: Player[], position: number, player: Player): Player[] {
    if (!this.isValidMove(board, position)) {
      throw new Error('Invalid move');
    }
    const newBoard = [...board];
    newBoard[position] = player;
    return newBoard;
  }

  /**
   * Get next player
   */
  static getNextPlayer(currentPlayer: Player): Player {
    return currentPlayer === 'X' ? 'O' : 'X';
  }

  /**
   * Get empty cells
   */
  static getEmptyCells(board: Player[]): number[] {
    return board.map((cell, index) => cell === null ? index : -1).filter(i => i !== -1);
  }
}

// ====================================================================
// AI LOGIC
// ====================================================================

export class TicTacToeAI {
  /**
   * Easy AI - Random moves
   */
  static getEasyMove(board: Player[]): number {
    const emptyCells = TicTacToeEngine.getEmptyCells(board);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**
   * Medium AI - Rule-based strategy
   * 1. Win if possible
   * 2. Block opponent from winning
   * 3. Take center if available
   * 4. Take corner
   * 5. Random
   */
  static getMediumMove(board: Player[], aiPlayer: Player): number {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';

    // Try to win
    const winMove = this.findWinningMove(board, aiPlayer);
    if (winMove !== -1) return winMove;

    // Block opponent
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove !== -1) return blockMove;

    // Take center (position 4)
    if (board[4] === null) return 4;

    // Take corners
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(pos => board[pos] === null);
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }

    // Random move
    return this.getEasyMove(board);
  }

  /**
   * Hard AI - Minimax algorithm with alpha-beta pruning
   */
  static getHardMove(board: Player[], aiPlayer: Player): number {
    let bestScore = -Infinity;
    let bestMove = -1;

    const emptyCells = TicTacToeEngine.getEmptyCells(board);

    for (const position of emptyCells) {
      const newBoard = [...board];
      newBoard[position] = aiPlayer;
      const score = this.minimax(newBoard, 0, false, aiPlayer, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = position;
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   */
  private static minimax(
    board: Player[],
    depth: number,
    isMaximizing: boolean,
    aiPlayer: Player,
    alpha: number,
    beta: number
  ): number {
    const opponent = aiPlayer === 'X' ? 'O' : 'X';
    const result = TicTacToeEngine.checkWinner(board);

    // Terminal states
    if (result.winner === aiPlayer) return 10 - depth;
    if (result.winner === opponent) return depth - 10;
    if (result.winner === 'draw') return 0;

    const emptyCells = TicTacToeEngine.getEmptyCells(board);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const position of emptyCells) {
        const newBoard = [...board];
        newBoard[position] = aiPlayer;
        const score = this.minimax(newBoard, depth + 1, false, aiPlayer, alpha, beta);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const position of emptyCells) {
        const newBoard = [...board];
        newBoard[position] = opponent;
        const score = this.minimax(newBoard, depth + 1, true, aiPlayer, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minScore;
    }
  }

  /**
   * Find a winning move for a player
   */
  private static findWinningMove(board: Player[], player: Player): number {
    const emptyCells = TicTacToeEngine.getEmptyCells(board);
    
    for (const position of emptyCells) {
      const testBoard = [...board];
      testBoard[position] = player;
      const result = TicTacToeEngine.checkWinner(testBoard);
      if (result.winner === player) {
        return position;
      }
    }
    
    return -1;
  }

  /**
   * Get AI move based on difficulty
   */
  static getMove(board: Player[], aiPlayer: Player, difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy':
        return this.getEasyMove(board);
      case 'medium':
        return this.getMediumMove(board, aiPlayer);
      case 'hard':
        return this.getHardMove(board, aiPlayer);
      default:
        return this.getMediumMove(board, aiPlayer);
    }
  }
}

// ====================================================================
// MOVE ANALYSIS - For heatmap and player insights
// ====================================================================

export class MoveAnalyzer {
  /**
   * Analyze move frequency across games
   */
  static generateHeatmap(moves: number[]): number[] {
    const heatmap = new Array(9).fill(0);
    moves.forEach(pos => {
      if (pos >= 0 && pos < 9) {
        heatmap[pos]++;
      }
    });
    return heatmap;
  }

  /**
   * Detect player patterns (for adaptive AI)
   */
  static detectPlayerPattern(moves: number[]): {
    preferredPositions: number[];
    tendency: 'aggressive' | 'defensive' | 'balanced';
  } {
    const heatmap = this.generateHeatmap(moves);
    const corners = [0, 2, 6, 8];
    const center = 4;
    const edges = [1, 3, 5, 7];

    const cornerMoves = corners.reduce((sum, pos) => sum + heatmap[pos], 0);
    const centerMoves = heatmap[center];
    const edgeMoves = edges.reduce((sum, pos) => sum + heatmap[pos], 0);

    const total = moves.length || 1;
    const cornerPercentage = cornerMoves / total;
    const centerPercentage = centerMoves / total;

    let tendency: 'aggressive' | 'defensive' | 'balanced' = 'balanced';
    if (cornerPercentage > 0.5) tendency = 'aggressive';
    else if (centerPercentage > 0.3) tendency = 'defensive';

    const preferredPositions = heatmap
      .map((count, index) => ({ index, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.index);

    return { preferredPositions, tendency };
  }
}
