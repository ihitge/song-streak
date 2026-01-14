-- ============================================================================
-- MIGRATION: Add summary column to songs table
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to add tutorial summary support
-- This column stores a brief overview of the tutorial extracted by Gemini AI

-- Add summary column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add comment for documentation
COMMENT ON COLUMN songs.summary IS 'AI-generated tutorial overview: song structure, teaching approach, and helpful tips';
