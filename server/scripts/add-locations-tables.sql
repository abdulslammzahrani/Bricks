-- Migration: Create locations tables (cities, districts, directions)
-- Date: 2024-12-26
-- Description: Creates tables to store cities, districts, and directions with coordinates

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    region TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id VARCHAR(255) NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_en TEXT,
    direction TEXT, -- north, south, east, west, center
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unq_city_district UNIQUE (city_id, name)
);

-- Create directions table
CREATE TABLE IF NOT EXISTS directions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- north, south, east, west, center
    label_ar TEXT NOT NULL,
    label_en TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_cities_order ON cities("order");
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_direction ON districts(direction);
CREATE INDEX IF NOT EXISTS idx_districts_order ON districts("order");
CREATE INDEX IF NOT EXISTS idx_directions_code ON directions(code);
CREATE INDEX IF NOT EXISTS idx_directions_order ON directions("order");


