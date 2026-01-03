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
  instrument TEXT NOT NULL, -- 'Guitar' or 'Bass'

  -- Video & Media
  video_url TEXT NOT NULL,
  artwork_url TEXT,

  -- Theory Data
  key TEXT,
  tempo TEXT,
  time_signature TEXT,

  -- Practice Data
  -- DEPRECATED: difficulty field kept for backward compatibility but no longer used in UI
  difficulty TEXT,
  techniques TEXT[],

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT valid_instrument CHECK (instrument IN ('Guitar', 'Bass')),
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
-- 10. CREATE BANDS TABLE
-- ============================================================================
CREATE TABLE bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bands_join_code ON bands(join_code);

-- ============================================================================
-- 11. CREATE BAND_MEMBERS TABLE
-- ============================================================================
CREATE TABLE band_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(band_id, user_id)
);

CREATE INDEX idx_band_members_user ON band_members(user_id);
CREATE INDEX idx_band_members_band ON band_members(band_id);

-- ============================================================================
-- 12. CREATE BAND_INVITES TABLE
-- ============================================================================
CREATE TABLE band_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(band_id, email)
);

CREATE INDEX idx_band_invites_email ON band_invites(email);
CREATE INDEX idx_band_invites_band ON band_invites(band_id);

-- ============================================================================
-- 13. CREATE SETLISTS TABLE
-- ============================================================================
CREATE TABLE setlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  band_id UUID REFERENCES bands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  venue TEXT,
  gig_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_setlists_band ON setlists(band_id);

-- Trigger for setlists updated_at
CREATE TRIGGER update_setlists_updated_at
  BEFORE UPDATE ON setlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 14. CREATE SETLIST_SONGS TABLE
-- ============================================================================
CREATE TABLE setlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(setlist_id, song_id)
);

CREATE INDEX idx_setlist_songs_setlist ON setlist_songs(setlist_id);
CREATE INDEX idx_setlist_songs_song ON setlist_songs(song_id);

-- ============================================================================
-- 15. RLS POLICIES FOR BANDS & SETLISTS
-- ============================================================================

-- Enable RLS on all band-related tables
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_songs ENABLE ROW LEVEL SECURITY;

-- BANDS: Members can view their bands
CREATE POLICY "Members can view bands" ON bands FOR SELECT
  USING (id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- BANDS: Anyone can create a band (they become admin)
CREATE POLICY "Users can create bands" ON bands FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- BANDS: Admins can update their bands
CREATE POLICY "Admins can update bands" ON bands FOR UPDATE
  USING (id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid() AND role = 'admin'));

-- BANDS: Admins can delete their bands
CREATE POLICY "Admins can delete bands" ON bands FOR DELETE
  USING (id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid() AND role = 'admin'));

-- BAND_MEMBERS: Members can view band members
CREATE POLICY "Members can view band members" ON band_members FOR SELECT
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- BAND_MEMBERS: Users can insert themselves (when joining via code)
CREATE POLICY "Users can join bands" ON band_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- BAND_MEMBERS: Admins can manage members
CREATE POLICY "Admins can manage members" ON band_members FOR DELETE
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid() AND role = 'admin'));

-- BAND_INVITES: Admins can manage invites
CREATE POLICY "Admins can view invites" ON band_invites FOR SELECT
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid() AND role = 'admin')
         OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can create invites" ON band_invites FOR INSERT
  WITH CHECK (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can update their invites" ON band_invites FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- SETLISTS: Members can view setlists
CREATE POLICY "Members can view setlists" ON setlists FOR SELECT
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- SETLISTS: Members can create setlists (limit enforced in app)
CREATE POLICY "Members can create setlists" ON setlists FOR INSERT
  WITH CHECK (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- SETLISTS: Members can update setlists
CREATE POLICY "Members can update setlists" ON setlists FOR UPDATE
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- SETLISTS: Members can delete setlists
CREATE POLICY "Members can delete setlists" ON setlists FOR DELETE
  USING (band_id IN (SELECT band_id FROM band_members WHERE user_id = auth.uid()));

-- SETLIST_SONGS: Members can view setlist songs
CREATE POLICY "Members can view setlist songs" ON setlist_songs FOR SELECT
  USING (setlist_id IN (SELECT id FROM setlists WHERE band_id IN
    (SELECT band_id FROM band_members WHERE user_id = auth.uid())));

-- SETLIST_SONGS: Members can add songs to setlists
CREATE POLICY "Members can add setlist songs" ON setlist_songs FOR INSERT
  WITH CHECK (setlist_id IN (SELECT id FROM setlists WHERE band_id IN
    (SELECT band_id FROM band_members WHERE user_id = auth.uid())));

-- SETLIST_SONGS: Members can update song positions
CREATE POLICY "Members can update setlist songs" ON setlist_songs FOR UPDATE
  USING (setlist_id IN (SELECT id FROM setlists WHERE band_id IN
    (SELECT band_id FROM band_members WHERE user_id = auth.uid())));

-- SETLIST_SONGS: Members can remove songs from setlists
CREATE POLICY "Members can remove setlist songs" ON setlist_songs FOR DELETE
  USING (setlist_id IN (SELECT id FROM setlists WHERE band_id IN
    (SELECT band_id FROM band_members WHERE user_id = auth.uid())));

-- ============================================================================
-- 16. UPDATE SONGS RLS FOR SETLIST ACCESS
-- ============================================================================
-- Band members need to see songs that are in their setlists
CREATE POLICY "Band members can view setlist songs" ON songs FOR SELECT
  USING (id IN (
    SELECT song_id FROM setlist_songs WHERE setlist_id IN (
      SELECT id FROM setlists WHERE band_id IN (
        SELECT band_id FROM band_members WHERE user_id = auth.uid()
      )
    )
  ));

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
-- 12. bands table stores band groups with unique join codes
-- 13. band_members links users to bands with admin/member roles
-- 14. band_invites tracks email invitations to bands
-- 15. setlists belong to bands, limited to 5 per band (app enforced)
-- 16. setlist_songs references songs from any band member's library
-- 17. Songs deleted from library are automatically removed from setlists (CASCADE)
-- 18. difficulty field in songs table is DEPRECATED and no longer used in UI (kept for backward compatibility)

-- ============================================================================
-- ADDITIONAL MIGRATIONS
-- ============================================================================
-- For gamification features (Streak Flame, Song Mastery, Lifetime Milestones),
-- see: docs/migrations/001_gamification_system.sql
--
-- Tables added by gamification migration:
-- - user_streaks: Daily practice goals and streak counts
-- - daily_practice_logs: Aggregated practice per day for calendar view
-- - streak_freeze_history: Tracks when streak freezes are earned/used
-- - song_mastery_progress: RPG skill tree progress per song
-- - lifetime_milestones: Global achievement definitions
-- - user_lifetime_milestones: Tracks unlocked global achievements
