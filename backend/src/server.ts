// ====================================================================
// MAIN SERVER - Express + Socket.IO
// ====================================================================

import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnections, closeConnections } from './database';
import routes from './routes';
import { setupSocketHandlers } from './sockets/gameSocket';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ====================================================================
// SOCKET.IO CONFIGURATION
// ====================================================================

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup WebSocket handlers
setupSocketHandlers(io);

// ====================================================================
// MIDDLEWARE
// ====================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// ====================================================================
// ROUTES
// ====================================================================

app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Nexus Tic-Tac-Toe API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      games: '/api/games/*',
      users: '/api/users/*',
      rooms: '/api/rooms/*',
      admin: '/api/admin/*',
    },
    websocket: {
      url: process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com'
        : 'ws://localhost:5000',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ====================================================================
// SERVER STARTUP
// ====================================================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connections
    await testConnections();

    // Start server
    httpServer.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`🎮 Nexus Tic-Tac-Toe Server Started!`);
      console.log(`📡 HTTP Server: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket Server: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// ====================================================================
// GRACEFUL SHUTDOWN
// ====================================================================

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    await closeConnections();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    await closeConnections();
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };
