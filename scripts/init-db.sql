-- Create the saves table for storing game states
CREATE TABLE IF NOT EXISTS game_saves (
  code VARCHAR(6) PRIMARY KEY,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Create index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_expires_at ON game_saves(expires_at);

-- Create a function to clean up expired saves
CREATE OR REPLACE FUNCTION cleanup_expired_saves()
RETURNS void AS $$
BEGIN
  DELETE FROM game_saves WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
