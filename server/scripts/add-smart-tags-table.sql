-- Migration: Add smart_tags table
-- Date: 2025-01-26
-- Description: Creates smart_tags table for managing smart tags associated with property types

-- Create smart_tags table
CREATE TABLE IF NOT EXISTS smart_tags (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type TEXT NOT NULL,
  tag TEXT NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on property_type for faster queries
CREATE INDEX IF NOT EXISTS idx_smart_tags_property_type ON smart_tags(property_type);

-- Create index on order for sorting
CREATE INDEX IF NOT EXISTS idx_smart_tags_order ON smart_tags("order");

-- Add unique constraint on property_type + tag combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_smart_tags_unique ON smart_tags(property_type, tag);


