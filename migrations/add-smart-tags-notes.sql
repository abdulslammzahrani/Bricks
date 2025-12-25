-- Migration: Add smartTags and notes to buyer_preferences and properties tables
-- Date: 2024-12-20
-- Description: Adds smart_tags (TEXT[]) and notes (TEXT) columns to store additional data from forms

-- Add smart_tags and notes to buyer_preferences table
ALTER TABLE buyer_preferences 
ADD COLUMN IF NOT EXISTS smart_tags TEXT[] DEFAULT '{}';

ALTER TABLE buyer_preferences 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add smart_tags and notes to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS smart_tags TEXT[] DEFAULT '{}';

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for better query performance (optional)
-- CREATE INDEX IF NOT EXISTS idx_buyer_preferences_smart_tags ON buyer_preferences USING GIN(smart_tags);
-- CREATE INDEX IF NOT EXISTS idx_properties_smart_tags ON properties USING GIN(smart_tags);


