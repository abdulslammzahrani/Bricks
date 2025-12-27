-- Add detailed_verifications column to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS detailed_verifications JSONB;







