-- ============================================================================
-- SUPABASE SCHEMA SETUP FOR SONG STREAK
-- ============================================================================
-- Run these SQL commands in your Supabase SQL Editor to set up the database

-- ============================================================================
-- 1. CREATE SONGS TABLE
-- ============================================================================
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Song Information
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  instrument TEXT NOT NULL, -- 'Guitar', 'Bass', 'Drums', or 'Keys'

  -- Video & Media
  video_url TEXT NOT NULL,
  artwork_url TEXT,

  -- Theory Data
  key TEXT,
  tempo TEXT,
  time_signature TEXT,

  -- Practice Data
  difficulty TEXT,
  techniques TEXT[],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT valid_instrument CHECK (instrument IN ('Guitar', 'Bass', 'Drums', 'Keys')),
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('Easy', 'Medium', 'Hard') OR difficulty IS NULL)
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_created_at ON songs(created_at);
CREATE INDEX idx_songs_instrument ON songs(instrument);
CREATE INDEX idx_songs_artist ON songs(artist);
CREATE INDEX idx_songs_title ON songs(title);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- Policy: Users can view their own songs
CREATE POLICY "Users can view their own songs"
  ON songs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own songs
CREATE POLICY "Users can insert their own songs"
  ON songs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own songs
CREATE POLICY "Users can update their own songs"
  ON songs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own songs
CREATE POLICY "Users can delete their own songs"
  ON songs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 5. CREATE UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ADD PRACTICE TRACKING COLUMNS TO SONGS
-- ============================================================================
ALTER TABLE songs ADD COLUMN IF NOT EXISTS total_practice_seconds INTEGER DEFAULT 0;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS chords TEXT[];
ALTER TABLE songs ADD COLUMN IF NOT EXISTS scales TEXT[];
ALTER TABLE songs ADD COLUMN IF NOT EXISTS lyrics TEXT;

-- ============================================================================
-- 7. CREATE PRACTICE_SESSIONS TABLE
-- ============================================================================
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  duration_seconds INTEGER NOT NULL,
  practiced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT positive_duration CHECK (duration_seconds > 0)
);

-- Indexes for practice_sessions
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_song_id ON practice_sessions(song_id);
CREATE INDEX idx_practice_sessions_practiced_at ON practice_sessions(practiced_at);

-- RLS for practice_sessions
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own practice sessions"
  ON practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. CREATE ACHIEVEMENTS TABLE (Definitions)
-- ============================================================================
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  threshold_seconds INTEGER NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
);

-- Insert initial achievements
INSERT INTO achievements (id, title, description, icon, threshold_seconds, tier) VALUES
  ('practice_5min', 'First Steps', 'Practice a song for 5 minutes total', 'footprints', 300, 'bronze'),
  ('practice_30min', 'Getting Warmed Up', 'Practice a song for 30 minutes total', 'flame', 1800, 'bronze'),
  ('practice_1hr', 'Dedicated Student', 'Practice a song for 1 hour total', 'book-open', 3600, 'silver'),
  ('practice_3hr', 'Serious Player', 'Practice a song for 3 hours total', 'guitar', 10800, 'silver'),
  ('practice_10hr', 'Committed Artist', 'Practice a song for 10 hours total', 'star', 36000, 'gold'),
  ('practice_24hr', 'Master in Training', 'Practice a song for 24 hours total', 'crown', 86400, 'gold'),
  ('practice_50hr', 'Song Master', 'Practice a song for 50 hours total', 'trophy', 180000, 'platinum');

-- ============================================================================
-- 9. CREATE USER_ACHIEVEMENTS TABLE (Unlocked badges)
-- ============================================================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES achievements(id) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, song_id, achievement_id)
);

-- Index for user_achievements
CREATE INDEX idx_user_achievements_user_song ON user_achievements(user_id, song_id);

-- RLS for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The songs table uses UUID for the primary key (generated by Supabase)
-- 2. user_id references auth.users(id) to link songs to authenticated users
-- 3. ON DELETE CASCADE ensures songs are deleted when a user is deleted
-- 4. RLS policies ensure users can only see/modify their own songs
-- 5. updated_at is automatically set to NOW() on update via trigger
-- 6. Indexes are created on commonly queried columns for performance
-- 7. CHECK constraints validate instrument and difficulty values
-- 8. practice_sessions tracks individual practice events per song
-- 9. achievements table defines badge milestones (5min to 50hr)
-- 10. user_achievements tracks which badges users have unlocked per song
-- 11. total_practice_seconds on songs is denormalized for quick access
