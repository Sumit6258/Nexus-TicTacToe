// ====================================================================
// SHARED TYPES - Used across frontend and backend
// ====================================================================

export type Player = 'X' | 'O' | null;
export type GameMode = 'single-player' | 'online-multiplayer' | 'local-multiplayer';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type PlayerStatus = 'online' | 'offline' | 'in-game';
export type ThemeType = 'cyberpunk' | 'minimal' | 'retro' | 'neon';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  lastPlayed?: Date;
  status: PlayerStatus;
  createdAt: Date;
  isGuest: boolean;
}

export interface GameState {
  id: string;
  board: Player[];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
  mode: GameMode;
  status: GameStatus;
  players: {
    X: string; // user ID
    O: string; // user ID
  };
  createdAt: Date;
  finishedAt?: Date;
  moveHistory: Move[];
  timer?: {
    enabled: boolean;
    timePerMove: number; // seconds
    currentPlayerTime: number;
  };
}

export interface Move {
  position: number;
  player: Player;
  timestamp: Date;
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  guestId?: string;
  game?: GameState;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: User) => boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  gamesPlayed: number;
  gamesToday: number;
  activeGames: ActiveGameInfo[];
}

export interface ActiveGameInfo {
  gameId: string;
  playerA: { id: string; username: string };
  playerB: { id: string; username: string };
  mode: GameMode;
  duration: number; // seconds
  status: GameStatus;
}

// WebSocket Events
export enum SocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Room Management
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_CREATED = 'room_created',
  ROOM_JOINED = 'room_joined',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  
  // Game Actions
  MAKE_MOVE = 'make_move',
  MOVE_MADE = 'move_made',
  GAME_STARTED = 'game_started',
  GAME_OVER = 'game_over',
  REMATCH_REQUEST = 'rematch_request',
  REMATCH_ACCEPTED = 'rematch_accepted',
  
  // Emotes & Chat
  SEND_EMOTE = 'send_emote',
  EMOTE_RECEIVED = 'emote_received',
  
  // Admin
  ADMIN_KICK_USER = 'admin_kick_user',
  USER_KICKED = 'user_kicked',
  
  // Errors
  ERROR = 'error',
}

// Game Constants
export const BOARD_SIZE = 3;
export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    condition: (stats) => stats.wins >= 1,
  },
  {
    id: 'win_streak_3',
    name: 'Hat Trick',
    description: 'Win 3 games in a row',
    icon: '🎩',
    condition: (stats) => stats.winStreak >= 3,
  },
  {
    id: 'win_streak_5',
    name: 'Unstoppable',
    description: 'Win 5 games in a row',
    icon: '🔥',
    condition: (stats) => stats.winStreak >= 5,
  },
  {
    id: 'games_10',
    name: 'Veteran Player',
    description: 'Play 10 games',
    icon: '⭐',
    condition: (stats) => stats.gamesPlayed >= 10,
  },
  {
    id: 'games_50',
    name: 'Master Player',
    description: 'Play 50 games',
    icon: '👑',
    condition: (stats) => stats.gamesPlayed >= 50,
  },
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win without opponent scoring',
    icon: '💎',
    condition: (stats) => stats.wins > 0, // Needs game-specific logic
  },
];

export const EMOTES = [
  '👋', '🎉', '😎', '🔥', '💪', '🤔', '😅', '🎯', '⚡', '🌟'
];
