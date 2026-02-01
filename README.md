# 🎮 NEXUS TIC-TAC-TOE

<div align="center">

![Nexus Tic-Tac-Toe](https://img.shields.io/badge/Game-Tic_Tac_Toe-8B5CF6?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-00FF41?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A next-generation, real-time multiplayer Tic-Tac-Toe game with stunning UI, AI opponents, and comprehensive admin dashboard.**

[Live Demo](#) | [Documentation](#) | [Report Bug](#) | [Request Feature](#)

</div>

---

## ✨ Features

### 🎮 Game Modes
- **Single Player** - Challenge AI with 3 difficulty levels (Easy, Medium, Hard with Minimax)
- **Online Multiplayer** - Real-time gameplay via WebSockets with matchmaking
- **Local Multiplayer** - Two players on the same device

### 🤖 AI System
- **Easy**: Random move selection
- **Medium**: Rule-based strategy (win/block/center/corners)
- **Hard**: Minimax algorithm with alpha-beta pruning for unbeatable AI

### 🎨 Stunning UI/UX
- **Multiple Themes**: Cyberpunk, Minimal, Retro, Neon
- **Glassmorphism & Neumorphism** hybrid design
- **60fps Animations** with Framer Motion
- **Particle Effects** and victory confetti
- **Dark/Light Mode** with smooth transitions
- **Fully Responsive** - Mobile, tablet, desktop optimized

### 👥 User System
- **Authentication**: Login/Signup with JWT
- **Guest Mode**: Play without registration
- **Player Stats**: Games played, wins, losses, draws, win streaks
- **Achievements**: Unlock rewards based on performance
- **Leaderboard**: Global rankings

### 👑 Admin Dashboard
- **Real-time Monitoring**: See all active games
- **User Management**: View player stats, ban users
- **Game Insights**: Player A vs Player B, game duration, winners
- **Analytics**: Total users, active users, games today
- **Export Data**: Download game logs as CSV/JSON

### 🔥 Advanced Features
- **Real-time Sync** via Socket.IO
- **Move Heatmaps** - Analyze player patterns
- **Game Replay** - Review past games
- **Emotes** - Send reactions during games
- **Timer Mode** - Blitz Tic-Tac-Toe with time limits
- **Spectator Mode** - Watch ongoing games
- **PWA Support** - Installable as mobile app
- **Offline Mode** - Play with cached data
- **Cheat Detection** - Server-side validation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Pages     │  │  Components  │  │  State (Zustand)│ │
│  │  ┌───────┐  │  │  ┌────────┐  │  │  ┌──────────┐  │ │
│  │  │ Game  │  │  │  │ Board  │  │  │  │ useGame  │  │ │
│  │  │ Admin │  │  │  │  UI    │  │  │  │ useAuth  │  │ │
│  │  │ Auth  │  │  │  │ Themes │  │  │  │ useSocket│  │ │
│  │  └───────┘  │  │  └────────┘  │  │  └──────────┘  │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ WebSocket (Socket.IO) + REST API
                      │
┌─────────────────────▼───────────────────────────────────┐
│               BACKEND (Node.js + Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routes     │  │   Services   │  │   Sockets    │  │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │  │
│  │  │  Auth  │  │  │  │  User  │  │  │  │ Game   │  │  │
│  │  │  Game  │  │  │  │  Game  │  │  │  │ Events │  │  │
│  │  │  Admin │  │  │  │  Room  │  │  │  │ Rooms  │  │  │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│   PostgreSQL   │         │      Redis      │
│  (Persistent)  │         │  (Real-time)    │
└────────────────┘         └─────────────────┘
```

### Tech Stack

**Frontend**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- Zustand (State Management)

**Backend**
- Node.js + Express
- Socket.IO
- TypeScript
- PostgreSQL (Database)
- Redis (Caching & Real-time state)
- JWT Authentication

**Shared**
- Game Engine (Pure TypeScript logic)
- AI Engine (Minimax algorithm)
- Type Definitions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Local Development Setup

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/nexus-tictactoe.git
cd nexus-tictactoe
```

#### 2️⃣ Setup Database

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Install Redis
brew install redis
brew services start redis

# Create database
createdb nexus_tictactoe

# Run migrations
cd backend
psql nexus_tictactoe < schema.sql
```

#### 3️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

#### 4️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_WS_URL=ws://localhost:5000

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

#### 5️⃣ Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin (login with username: `admin`, password: `admin123`)

---

## 📦 Production Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Deploy
railway up

# Set environment variables in Railway dashboard:
# - JWT_SECRET
# - ADMIN_SECRET_KEY
# - CORS_ORIGIN (your frontend URL)
```

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

cd frontend

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL (Railway backend URL)
# - NEXT_PUBLIC_WS_URL (Railway WebSocket URL)
```

### Option 2: AWS Deployment

#### Backend (EC2 + RDS + ElastiCache)

```bash
# 1. Create RDS PostgreSQL instance
# 2. Create ElastiCache Redis cluster
# 3. Launch EC2 instance (Ubuntu 22.04)
# 4. SSH into EC2 and setup

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd nexus-tictactoe/backend
npm install
npm run build

# Create .env with production values

# Start with PM2
pm2 start dist/server.js --name nexus-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx

# Configure Nginx (/etc/nginx/sites-available/nexus)
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/nexus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Frontend (Vercel or S3 + CloudFront)

**Vercel** (Recommended - Easiest)
```bash
vercel --prod
```

**AWS S3 + CloudFront**
```bash
# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync out/ s3://your-bucket-name --acl public-read

# Create CloudFront distribution pointing to S3 bucket
# Configure custom domain and SSL certificate
```

### Option 3: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Scale backend instances
docker-compose up -d --scale backend=3
```

---

## 🌍 Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

JWT_SECRET=your-super-secret-jwt-key-256-bits-minimum
JWT_EXPIRES_IN=7d

ADMIN_SECRET_KEY=your-admin-secret-key

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

ENABLE_GUEST_MODE=true
ENABLE_TIMER_MODE=true
ENABLE_ACHIEVEMENTS=true
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Nexus Tic-Tac-Toe
```

---

## 📡 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "securepassword123"
}

Response:
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "securepassword123"
}
```

#### Guest Login
```http
POST /api/auth/guest
Content-Type: application/json

{
  "username": "Guest_xyz" // optional
}
```

### Game Endpoints

#### Create Single Player Game
```http
POST /api/games/single-player
Authorization: Bearer {token}
Content-Type: application/json

{
  "difficulty": "hard"
}
```

#### Make Move
```http
POST /api/games/:gameId/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "position": 4
}
```

#### Get Game History
```http
GET /api/games/history/me?limit=20
Authorization: Bearer {token}
```

### Room Endpoints (Multiplayer)

#### Create Room
```http
POST /api/rooms/create
Authorization: Bearer {token}
```

#### Join Room
```http
POST /api/rooms/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "ABC123"
}
```

### Admin Endpoints

#### Get Stats
```http
GET /api/admin/stats
Authorization: Bearer {admin-token}
```

#### Export Games
```http
GET /api/admin/games/export?format=csv
Authorization: Bearer {admin-token}
```

#### Ban User
```http
POST /api/admin/users/:userId/ban
Authorization: Bearer {admin-token}
```

---

## 🔌 WebSocket Events

### Client → Server

```typescript
// Authenticate
socket.emit('authenticate', token, (response) => {
  if (response.success) {
    console.log('Authenticated!', response.user);
  }
});

// Create room
socket.emit('create_room', (response) => {
  console.log('Room created:', response.room);
});

// Join room
socket.emit('join_room', roomCode, (response) => {
  console.log('Joined room:', response.room);
});

// Make move
socket.emit('make_move', { gameId, position }, (response) => {
  console.log('Move made:', response.game);
});

// Send emote
socket.emit('send_emote', { gameId, emote: '🎉' });
```

### Server → Client

```typescript
// Game started
socket.on('game_started', ({ game }) => {
  console.log('Game started!', game);
});

// Move made by opponent
socket.on('move_made', ({ game }) => {
  console.log('Opponent moved!', game);
});

// Game over
socket.on('game_over', ({ game }) => {
  console.log('Game finished!', game);
});

// Player joined
socket.on('player_joined', ({ userId, room }) => {
  console.log('Player joined:', userId);
});

// Emote received
socket.on('emote_received', ({ userId, emote }) => {
  console.log('Emote:', emote);
});
```

---

## 🎯 Game Logic

### AI Difficulty Levels

**Easy**: Random valid move selection
```typescript
const emptyCells = board.filter(cell => cell === null);
const randomIndex = Math.random() * emptyCells.length;
return emptyCells[randomIndex];
```

**Medium**: Rule-based strategy
1. Win if possible
2. Block opponent from winning
3. Take center (position 4)
4. Take corner
5. Random edge

**Hard**: Minimax with alpha-beta pruning
```typescript
function minimax(board, depth, isMaximizing, alpha, beta) {
  // Check terminal state
  if (hasWinner) return score;
  
  // Recursive search
  for (each empty cell) {
    score = minimax(newBoard, depth + 1, !isMaximizing, alpha, beta);
    
    // Alpha-beta pruning
    if (beta <= alpha) break;
  }
  
  return isMaximizing ? maxScore : minScore;
}
```

### Win Detection

```typescript
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
}
```

---

## 🎨 UI Themes

### Cyberpunk
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
```

### Neon
```css
background: linear-gradient(135deg, #FF006E 0%, #8B5CF6 100%);
text-shadow: 0 0 10px #FF006E;
```

### Minimal
```css
background: #ffffff;
border: 2px solid #e5e7eb;
```

### Retro
```css
background: #1a1a1a;
border: 3px solid #00FF41;
font-family: 'Courier New', monospace;
```

---

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** with bcrypt (10 rounds)
- **Rate Limiting** (100 requests per 15 minutes)
- **CORS Protection** with whitelist
- **Helmet.js** security headers
- **Input Validation** on all endpoints
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with content security policy
- **Server-side Game Validation** prevents cheating

---

## 📊 Performance Optimizations

### Backend
- **Redis Caching** for game state (sub-millisecond reads)
- **Connection Pooling** for PostgreSQL (max 20 connections)
- **Compression** middleware (gzip/brotli)
- **Database Indexing** on frequently queried columns
- **WebSocket Connection Pooling** with Socket.IO

### Frontend
- **Code Splitting** with Next.js dynamic imports
- **Image Optimization** with Next.js Image component
- **Prefetching** for faster page transitions
- **Client-side Caching** with React Query
- **Optimistic UI Updates** for instant feedback
- **Lazy Loading** for modals and heavy components

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Minimax Algorithm inspiration from John von Neumann
- UI design inspired by Cyberpunk 2077 and Synthwave aesthetics
- Icons from React Icons
- Animations powered by Framer Motion

---

## 📞 Support

- **Email**: support@nexustictactoe.com
- **Discord**: [Join our server](#)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nexus-tictactoe/issues)

---

<div align="center">

**Built with ❤️ by [Your Name]**

⭐ Star this repo if you found it useful!

</div>
