-- Migration: Add workshopNames column to Notice table
-- Run this in your Supabase SQL Editor

-- For Supabase PostgreSQL
ALTER TABLE "Notice" ADD COLUMN IF NOT EXISTS "workshopNames" TEXT[] DEFAULT '{}';

-- For local SQLite (if using local fallback)
-- ALTER TABLE Notice ADD COLUMN workshopNames TEXT DEFAULT '[]';
