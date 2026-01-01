-- ============================================================================
-- ACCOUNT DELETION RPC FUNCTION
-- Required for Apple App Store Guideline 5.1.1(v)
--
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- Navigate to: SQL Editor > New Query > Paste & Run
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from all user-related tables (order matters due to FKs)
  -- Most tables have ON DELETE CASCADE, but explicit deletion is safer

  -- 1. Delete user achievements
  DELETE FROM user_achievements WHERE user_id = v_user_id;

  -- 2. Delete user lifetime milestones
  DELETE FROM user_lifetime_milestones WHERE user_id = v_user_id;

  -- 3. Delete song mastery progress
  DELETE FROM song_mastery_progress WHERE user_id = v_user_id;

  -- 4. Delete streak freeze history
  DELETE FROM streak_freeze_history WHERE user_id = v_user_id;

  -- 5. Delete daily practice logs
  DELETE FROM daily_practice_logs WHERE user_id = v_user_id;

  -- 6. Delete user streaks
  DELETE FROM user_streaks WHERE user_id = v_user_id;

  -- 7. Delete practice sessions
  DELETE FROM practice_sessions WHERE user_id = v_user_id;

  -- 8. Delete from setlist_songs (via song ownership)
  DELETE FROM setlist_songs WHERE song_id IN (
    SELECT id FROM songs WHERE user_id = v_user_id
  );

  -- 9. Delete setlists created by user
  DELETE FROM setlists WHERE created_by = v_user_id;

  -- 10. Delete band memberships
  DELETE FROM band_members WHERE user_id = v_user_id;

  -- 11. Delete band invites by this user
  DELETE FROM band_invites WHERE invited_by = v_user_id;

  -- 12. Delete bands created by user (if no other admins)
  DELETE FROM bands WHERE created_by = v_user_id
    AND NOT EXISTS (
      SELECT 1 FROM band_members
      WHERE band_id = bands.id
        AND role = 'admin'
        AND user_id != v_user_id
    );

  -- 13. Delete user's songs
  DELETE FROM songs WHERE user_id = v_user_id;

  -- 14. Delete profile
  DELETE FROM profiles WHERE id = v_user_id;

  -- Note: The actual auth.users deletion should be handled by:
  -- 1. Client calling supabase.auth.signOut() after this succeeds
  -- 2. Optional: Supabase Edge Function with service_role key to delete auth.users entry

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- ============================================================================
-- VERIFICATION: Test the function exists
-- Run this after creating the function:
-- ============================================================================
-- SELECT proname, pronamespace::regnamespace
-- FROM pg_proc
-- WHERE proname = 'delete_user_account';
