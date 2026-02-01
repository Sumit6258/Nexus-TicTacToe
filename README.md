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



<div align="center">

**Built with ❤️ by Sumit**

⭐ Star this repo if you found it useful!

</div>
