-- Migration: Voice Memos for Reel-to-Reel Recorder
-- Description: Standalone voice memos (lyrics, melodies, riffs) shareable with band members
-- Created: 2024-12-30

-- ============================================================================
-- VOICE MEMOS TABLE
-- ============================================================================

-- Create voice_memos table (idempotent)
CREATE TABLE IF NOT EXISTS voice_memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Ownership & sharing
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE,  -- NULL = personal only

  -- Audio file
  audio_url TEXT NOT NULL,           -- Supabase Storage path
  duration_seconds DECIMAL(5, 2),    -- Max 30 seconds
  file_size_bytes INTEGER,

  -- Metadata
  title TEXT,                        -- Optional name
  notes TEXT,                        -- Optional description
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- For future song linking
  linked_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT max_duration CHECK (duration_seconds IS NULL OR duration_seconds <= 30)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_voice_memos_created_by ON voice_memos(created_by);
CREATE INDEX IF NOT EXISTS idx_voice_memos_band_id ON voice_memos(band_id);
CREATE INDEX IF NOT EXISTS idx_voice_memos_recorded_at ON voice_memos(recorded_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE voice_memos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own memos
DROP POLICY IF EXISTS "Users can view own memos" ON voice_memos;
CREATE POLICY "Users can view own memos" ON voice_memos
  FOR SELECT USING (created_by = auth.uid());

-- Policy: Band members can view shared memos
DROP POLICY IF EXISTS "Band members can view shared memos" ON voice_memos;
CREATE POLICY "Band members can view shared memos" ON voice_memos
  FOR SELECT USING (
    band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid())
  );

-- Policy: Users can create their own memos
DROP POLICY IF EXISTS "Users can create memos" ON voice_memos;
CREATE POLICY "Users can create memos" ON voice_memos
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Policy: Users can update their own memos
DROP POLICY IF EXISTS "Users can update own memos" ON voice_memos;
CREATE POLICY "Users can update own memos" ON voice_memos
  FOR UPDATE USING (created_by = auth.uid());

-- Policy: Users can delete their own memos
DROP POLICY IF EXISTS "Users can delete own memos" ON voice_memos;
CREATE POLICY "Users can delete own memos" ON voice_memos
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_voice_memos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS voice_memos_updated_at ON voice_memos;
CREATE TRIGGER voice_memos_updated_at
  BEFORE UPDATE ON voice_memos
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_memos_updated_at();

-- ============================================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard → Storage)
-- ============================================================================
--
-- 1. Create bucket named: voice-memos
-- 2. Set as Private bucket
-- 3. Add policies:
--
-- Policy: Allow authenticated users to upload to their own folder
-- Operation: INSERT
-- Target: authenticated
-- Policy definition:
--   (bucket_id = 'voice-memos'::text) AND
--   ((storage.foldername(name))[1] = (auth.uid())::text)
--
-- Policy: Allow users to read their own files
-- Operation: SELECT
-- Target: authenticated
-- Policy definition:
--   (bucket_id = 'voice-memos'::text) AND
--   ((storage.foldername(name))[1] = (auth.uid())::text)
--
-- Policy: Allow users to delete their own files
-- Operation: DELETE
-- Target: authenticated
-- Policy definition:
--   (bucket_id = 'voice-memos'::text) AND
--   ((storage.foldername(name))[1] = (auth.uid())::text)
--
-- Note: Band members access shared files via signed URLs generated server-side
-- ============================================================================
