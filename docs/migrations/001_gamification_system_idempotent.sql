-- ============================================================================
-- GAMIFICATION SYSTEM MIGRATION (IDEMPOTENT VERSION)
-- Safe to run multiple times - drops existing policies before recreating
-- ============================================================================

-- ============================================================================
-- 1. STREAK TRACKING TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_freezes_available INTEGER DEFAULT 0 CHECK (streak_freezes_available >= 0 AND streak_freezes_available <= 3),
  daily_goal_minutes INTEGER DEFAULT 30 CHECK (daily_goal_minutes IN (15, 30, 60)),
  last_practice_date DATE,
  streak_started_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS daily_practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  goal_met BOOLEAN DEFAULT FALSE,
  streak_freeze_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, practice_date)
);

CREATE TABLE IF NOT EXISTS streak_freeze_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('earned', 'used', 'expired')),
  action_date DATE NOT NULL,
  streak_day_count INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_practice_logs_user_date ON daily_practice_logs(user_id, practice_date);
CREATE INDEX IF NOT EXISTS idx_daily_practice_logs_date ON daily_practice_logs(practice_date);
CREATE INDEX IF NOT EXISTS idx_streak_freeze_history_user ON streak_freeze_history(user_id);

-- ============================================================================
-- 2. SONG MASTERY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS song_mastery_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  theory_chords_added BOOLEAN DEFAULT FALSE,
  theory_structure_mapped BOOLEAN DEFAULT FALSE,
  theory_key_set BOOLEAN DEFAULT FALSE,
  theory_transpose_practiced BOOLEAN DEFAULT FALSE,
  theory_master BOOLEAN DEFAULT FALSE,
  perf_first_recording BOOLEAN DEFAULT FALSE,
  perf_self_review BOOLEAN DEFAULT FALSE,
  perf_band_ready BOOLEAN DEFAULT FALSE,
  perf_stage_prep BOOLEAN DEFAULT FALSE,
  perf_performance_master BOOLEAN DEFAULT FALSE,
  star_rating INTEGER DEFAULT 0 CHECK (star_rating >= 0 AND star_rating <= 3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

ALTER TABLE songs ADD COLUMN IF NOT EXISTS song_structure JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_song_mastery_user_song ON song_mastery_progress(user_id, song_id);
CREATE INDEX IF NOT EXISTS idx_song_mastery_star_rating ON song_mastery_progress(star_rating);

-- ============================================================================
-- 3. LIFETIME MILESTONES TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS lifetime_milestones (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('time', 'songs', 'streak', 'genre')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  threshold_meta JSONB,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_lifetime_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL REFERENCES lifetime_milestones(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_lifetime_milestones_category ON lifetime_milestones(category);
CREATE INDEX IF NOT EXISTS idx_lifetime_milestones_tier ON lifetime_milestones(tier);
CREATE INDEX IF NOT EXISTS idx_user_lifetime_milestones_user ON user_lifetime_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lifetime_milestones_milestone ON user_lifetime_milestones(milestone_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES - DROP FIRST, THEN CREATE
-- ============================================================================

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_practice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freeze_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_mastery_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifetime_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lifetime_milestones ENABLE ROW LEVEL SECURITY;

-- USER_STREAKS policies
DROP POLICY IF EXISTS "Users can view own streak data" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak data" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streak data" ON user_streaks;

CREATE POLICY "Users can view own streak data" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak data" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak data" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- DAILY_PRACTICE_LOGS policies
DROP POLICY IF EXISTS "Users can view own daily logs" ON daily_practice_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON daily_practice_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON daily_practice_logs;

CREATE POLICY "Users can view own daily logs" ON daily_practice_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily logs" ON daily_practice_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily logs" ON daily_practice_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- STREAK_FREEZE_HISTORY policies
DROP POLICY IF EXISTS "Users can view own freeze history" ON streak_freeze_history;
DROP POLICY IF EXISTS "Users can insert own freeze history" ON streak_freeze_history;

CREATE POLICY "Users can view own freeze history" ON streak_freeze_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own freeze history" ON streak_freeze_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SONG_MASTERY_PROGRESS policies
DROP POLICY IF EXISTS "Users can view own mastery progress" ON song_mastery_progress;
DROP POLICY IF EXISTS "Users can insert own mastery progress" ON song_mastery_progress;
DROP POLICY IF EXISTS "Users can update own mastery progress" ON song_mastery_progress;

CREATE POLICY "Users can view own mastery progress" ON song_mastery_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mastery progress" ON song_mastery_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mastery progress" ON song_mastery_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- LIFETIME_MILESTONES policies
DROP POLICY IF EXISTS "Anyone can view milestone definitions" ON lifetime_milestones;

CREATE POLICY "Anyone can view milestone definitions" ON lifetime_milestones
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- USER_LIFETIME_MILESTONES policies
DROP POLICY IF EXISTS "Users can view own milestones" ON user_lifetime_milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON user_lifetime_milestones;

CREATE POLICY "Users can view own milestones" ON user_lifetime_milestones
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON user_lifetime_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON user_streaks;
DROP TRIGGER IF EXISTS update_daily_practice_logs_updated_at ON daily_practice_logs;
DROP TRIGGER IF EXISTS update_song_mastery_progress_updated_at ON song_mastery_progress;

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_practice_logs_updated_at
  BEFORE UPDATE ON daily_practice_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_song_mastery_progress_updated_at
  BEFORE UPDATE ON song_mastery_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. SEED LIFETIME MILESTONE DEFINITIONS
-- ============================================================================

INSERT INTO lifetime_milestones (id, category, title, description, icon, threshold, tier, sort_order) VALUES
  ('time_1hr', 'time', 'Beginner''s Journey', 'Practice for 1 hour total', 'footprints', 3600, 'bronze', 1),
  ('time_10hr', 'time', 'Getting Serious', 'Practice for 10 hours total', 'flame', 36000, 'bronze', 2),
  ('time_50hr', 'time', 'Dedicated Musician', 'Practice for 50 hours total', 'book-open', 180000, 'silver', 3),
  ('time_100hr', 'time', 'Century Club', 'Practice for 100 hours total', 'award', 360000, 'silver', 4),
  ('time_500hr', 'time', 'Practice Legend', 'Practice for 500 hours total', 'star', 1800000, 'gold', 5),
  ('time_1000hr', 'time', 'Grandmaster', 'Practice for 1000 hours total', 'crown', 3600000, 'platinum', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lifetime_milestones (id, category, title, description, icon, threshold, tier, sort_order) VALUES
  ('songs_1', 'songs', 'First Song', 'Master your first song (1hr+ practice)', 'music', 1, 'bronze', 1),
  ('songs_5', 'songs', 'Growing Repertoire', 'Master 5 songs', 'disc', 5, 'bronze', 2),
  ('songs_10', 'songs', 'Versatile Player', 'Master 10 songs', 'layers', 10, 'silver', 3),
  ('songs_25', 'songs', 'Walking Jukebox', 'Master 25 songs', 'list-music', 25, 'silver', 4),
  ('songs_50', 'songs', 'Living Library', 'Master 50 songs', 'library', 50, 'gold', 5),
  ('songs_100', 'songs', 'Infinite Playlist', 'Master 100 songs', 'infinity', 100, 'platinum', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lifetime_milestones (id, category, title, description, icon, threshold, tier, sort_order) VALUES
  ('streak_7', 'streak', 'Week Warrior', 'Practice for 7 consecutive days', 'calendar-check', 7, 'bronze', 1),
  ('streak_30', 'streak', 'Month Master', 'Practice for 30 consecutive days', 'calendar', 30, 'silver', 2),
  ('streak_90', 'streak', 'Quarterly Quest', 'Practice for 90 consecutive days', 'calendar-range', 90, 'gold', 3),
  ('streak_365', 'streak', 'Year of Dedication', 'Practice for 365 consecutive days', 'trophy', 365, 'diamond', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lifetime_milestones (id, category, title, description, icon, threshold, threshold_meta, tier, sort_order) VALUES
  ('genre_rock', 'genre', 'Rock Star', 'Master 5 Rock songs', 'guitar', 5, '{"genre": "Rock"}', 'silver', 1),
  ('genre_jazz', 'genre', 'Jazz Cat', 'Master 5 Jazz songs', 'music-2', 5, '{"genre": "Jazz"}', 'silver', 2),
  ('genre_blues', 'genre', 'Blues Brother', 'Master 5 Blues songs', 'music-3', 5, '{"genre": "Blues"}', 'silver', 3),
  ('genre_metal', 'genre', 'Metal Head', 'Master 5 Metal songs', 'skull', 5, '{"genre": "Metal"}', 'silver', 4),
  ('genre_classical', 'genre', 'Classical Virtuoso', 'Master 5 Classical songs', 'scroll', 5, '{"genre": "Classical"}', 'silver', 5),
  ('genre_country', 'genre', 'Country Road', 'Master 5 Country songs', 'sun', 5, '{"genre": "Country"}', 'silver', 6),
  ('genre_funk', 'genre', 'Funk Master', 'Master 5 Funk songs', 'zap', 5, '{"genre": "Funk"}', 'silver', 7),
  ('genre_folk', 'genre', 'Folk Hero', 'Master 5 Folk songs', 'feather', 5, '{"genre": "Folk"}', 'silver', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. HELPER FUNCTION: UPDATE USER STREAK
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_practice_date DATE,
  p_practice_minutes INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_streak_data user_streaks%ROWTYPE;
  v_daily_log daily_practice_logs%ROWTYPE;
  v_goal_minutes INTEGER;
  v_goal_met BOOLEAN;
  v_days_since_last INTEGER;
  v_streak_broken BOOLEAN := FALSE;
  v_freeze_used BOOLEAN := FALSE;
  v_new_streak INTEGER;
  v_freezes_earned INTEGER := 0;
  v_previous_goal_met BOOLEAN;
BEGIN
  SELECT * INTO v_streak_data FROM user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, daily_goal_minutes)
    VALUES (p_user_id, 30)
    RETURNING * INTO v_streak_data;
  END IF;

  v_goal_minutes := v_streak_data.daily_goal_minutes;

  SELECT goal_met INTO v_previous_goal_met
  FROM daily_practice_logs
  WHERE user_id = p_user_id AND practice_date = p_practice_date;

  INSERT INTO daily_practice_logs (user_id, practice_date, total_minutes)
  VALUES (p_user_id, p_practice_date, p_practice_minutes)
  ON CONFLICT (user_id, practice_date)
  DO UPDATE SET
    total_minutes = daily_practice_logs.total_minutes + p_practice_minutes,
    updated_at = NOW()
  RETURNING * INTO v_daily_log;

  v_goal_met := v_daily_log.total_minutes >= v_goal_minutes;

  IF v_goal_met AND NOT COALESCE(v_previous_goal_met, FALSE) THEN
    UPDATE daily_practice_logs
    SET goal_met = TRUE, updated_at = NOW()
    WHERE id = v_daily_log.id;

    IF v_streak_data.last_practice_date IS NULL THEN
      v_new_streak := 1;
    ELSE
      v_days_since_last := p_practice_date - v_streak_data.last_practice_date;

      IF v_days_since_last = 0 THEN
        v_new_streak := v_streak_data.current_streak;
      ELSIF v_days_since_last = 1 THEN
        v_new_streak := v_streak_data.current_streak + 1;
      ELSIF v_days_since_last = 2 AND v_streak_data.streak_freezes_available > 0 THEN
        v_freeze_used := TRUE;
        v_new_streak := v_streak_data.current_streak + 1;

        INSERT INTO streak_freeze_history (user_id, action_type, action_date, notes)
        VALUES (p_user_id, 'used', p_practice_date - 1, 'Auto-consumed for missed day');

        INSERT INTO daily_practice_logs (user_id, practice_date, total_minutes, goal_met, streak_freeze_used)
        VALUES (p_user_id, p_practice_date - 1, 0, FALSE, TRUE)
        ON CONFLICT (user_id, practice_date)
        DO UPDATE SET streak_freeze_used = TRUE;
      ELSE
        v_streak_broken := TRUE;
        v_new_streak := 1;
      END IF;
    END IF;

    IF v_new_streak > 0 AND v_new_streak % 7 = 0 AND v_streak_data.streak_freezes_available < 3 THEN
      v_freezes_earned := 1;
      INSERT INTO streak_freeze_history (user_id, action_type, action_date, streak_day_count)
      VALUES (p_user_id, 'earned', p_practice_date, v_new_streak);
    END IF;

    UPDATE user_streaks SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      streak_freezes_available = CASE
        WHEN v_freeze_used THEN streak_freezes_available - 1 + v_freezes_earned
        ELSE LEAST(streak_freezes_available + v_freezes_earned, 3)
      END,
      last_practice_date = p_practice_date,
      streak_started_at = CASE
        WHEN v_streak_broken THEN p_practice_date
        WHEN streak_started_at IS NULL THEN p_practice_date
        ELSE streak_started_at
      END,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_streak_data;
  ELSE
    v_new_streak := v_streak_data.current_streak;
  END IF;

  RETURN json_build_object(
    'current_streak', v_streak_data.current_streak,
    'longest_streak', v_streak_data.longest_streak,
    'freezes_available', v_streak_data.streak_freezes_available,
    'goal_met_today', v_goal_met,
    'freeze_used', v_freeze_used,
    'freeze_earned', v_freezes_earned > 0,
    'streak_broken', v_streak_broken
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. HELPER FUNCTION: GET MASTERED SONGS BY GENRE
-- ============================================================================

CREATE OR REPLACE FUNCTION get_mastered_songs_by_genre(p_user_id UUID)
RETURNS TABLE(genre TEXT, mastered_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.genre,
    COUNT(DISTINCT s.id)::INTEGER AS mastered_count
  FROM songs s
  CROSS JOIN LATERAL (
    SELECT unnest(COALESCE(s.techniques, ARRAY[]::TEXT[])) AS genre
  ) g
  WHERE s.user_id = p_user_id
    AND s.total_practice_seconds >= 3600
  GROUP BY g.genre;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE - Safe to run multiple times
-- ============================================================================
