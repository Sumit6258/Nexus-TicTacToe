-- ====================================================================
-- NEXUS TIC-TAC-TOE DATABASE SCHEMA
-- ====================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    avatar VARCHAR(500),
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    win_streak INTEGER DEFAULT 0,
    max_win_streak INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline',
    is_guest BOOLEAN DEFAULT FALSE,
    last_played TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_banned BOOLEAN DEFAULT FALSE
);

-- Games Table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_x_id UUID REFERENCES users(id) ON DELETE SET NULL,
    player_o_id UUID REFERENCES users(id) ON DELETE SET NULL,
    winner VARCHAR(10), -- 'X', 'O', 'draw', or NULL
    board JSONB NOT NULL,
    move_history JSONB,
    mode VARCHAR(30) NOT NULL,
    status VARCHAR(20) DEFAULT 'playing',
    winning_line JSONB,
    duration INTEGER, -- seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

-- Rooms Table (for multiplayer matchmaking)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES users(id) ON DELETE SET NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_player_x ON games(player_x_id);
CREATE INDEX IF NOT EXISTS idx_games_player_o ON games(player_o_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample admin user (password: admin123)
-- Hash generated with bcrypt rounds=10
INSERT INTO users (id, username, email, password_hash, is_guest, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@nexustictactoe.com',
    '$2b$10$rBV2LkZXqUqNd8uJ8j8K0.YzYZm8pZXmNyqKZMxWMqLKQZJ3qJYQm',
    FALSE,
    'online'
) ON CONFLICT (username) DO NOTHING;

-- View for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    id,
    username,
    avatar,
    games_played,
    wins,
    losses,
    draws,
    win_streak,
    max_win_streak,
    CASE 
        WHEN games_played > 0 THEN ROUND((wins::DECIMAL / games_played) * 100, 2)
        ELSE 0 
    END as win_percentage
FROM users
WHERE is_guest = FALSE
ORDER BY wins DESC, win_percentage DESC
LIMIT 100;
