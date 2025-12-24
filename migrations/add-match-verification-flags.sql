-- Migration: Add verification flags to matches table
-- Date: 2024

ALTER TABLE "matches" 
ADD COLUMN IF NOT EXISTS "property_verified" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "buyer_verified" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "specs_verified" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "financial_verified" boolean DEFAULT false NOT NULL;

-- Update existing records to have default false values
UPDATE "matches" SET
    "property_verified" = false,
    "buyer_verified" = false,
    "specs_verified" = false,
    "financial_verified" = false
WHERE "property_verified" IS NULL 
   OR "buyer_verified" IS NULL 
   OR "specs_verified" IS NULL 
   OR "financial_verified" IS NULL;



