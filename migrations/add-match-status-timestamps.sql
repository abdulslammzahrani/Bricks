-- Migration: Add status, createdAt, updatedAt to matches table
-- Date: 2024-01-XX

-- Add status column with default value
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

-- Add createdAt column with default value
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add updatedAt column with default value
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update existing matches:
-- - Set status to 'contacted' if is_contacted is true
-- - Set status to 'new' if is_contacted is false
-- - Set timestamps to current time if NULL
UPDATE matches 
SET 
  status = CASE 
    WHEN is_contacted = true THEN 'contacted'
    ELSE 'new'
  END,
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

