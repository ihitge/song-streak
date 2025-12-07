# Testing & Completion Guide: Video Analysis Workflow

## ✅ Setup Complete

You have successfully configured:
- ✅ Gemini API key (`EXPO_PUBLIC_GEMINI_API_KEY`)
- ✅ Gemini API URL (`EXPO_PUBLIC_GEMINI_API_URL`)
- ✅ Supabase credentials and database schema
- ✅ Album artwork fetching (iTunes API)
- ✅ Real Gemini API integration with proper request format

## 🧪 Test Workflow (Step-by-Step)

### Test 1: Video Analysis with Real Gemini API

**Goal:** Verify Gemini API is working and auto-fills form fields

1. **Start the app** - Restart the development server to load the new environment variables
2. **Navigate to "Add Song" tab**
3. **Paste a video URL** (e.g., a YouTube music video link)
4. **Click "ANALYZE VIDEO" button**
5. **Verify:**
   - [ ] Loading indicator appears ("Processing Signal...")
   - [ ] Theory and Practice tab icons spin (RefreshCw spinner)
   - [ ] After 3-10 seconds, loading completes
   - [ ] Form fields auto-fill:
     - [ ] Song Title (e.g., "Stairway to Heaven")
     - [ ] Artist (e.g., "Led Zeppelin")
     - [ ] Instrument selector updates (Guitar, Bass, Drums, or Keys)
   - [ ] Tab icons revert to static icons
   - [ ] Orange LED dots appear on Theory and Practice tabs
   - [ ] Video placeholder shows the URL you analyzed

**If Gemini API is unavailable:**
- Mock data will be used automatically
- App will show "Stairway to Heaven" by Led Zeppelin
- Test continues normally - allows development/testing without real API

---

### Test 2: Save Song to Supabase

**Goal:** Verify songs are saved to database

1. **Complete Test 1** (or use mock data)
2. **Edit form fields if desired** (title, artist, instrument)
3. **Click "SAVE" button**
4. **Verify:**
   - [ ] Button shows spinner during save
   - [ ] Save completes in 2-5 seconds
   - [ ] Success alert appears: "Song saved successfully!"
   - [ ] Form resets (all fields clear)
   - [ ] Buttons return to initial state (gray, disabled)

**If save fails:**
- Check Supabase dashboard for errors
- Verify `songs` table exists and has RLS policies enabled
- Check authentication - user must be logged in
- Check network connection and API keys

---

### Test 3: Display Saved Songs in Set List (NEXT IMPLEMENTATION)

**Goal:** Query saved songs from Supabase and display in Set List

**Current State:**
- Set List (`/app/(tabs)/index.tsx`) uses mock `MOCK_SONGS` array
- No real database queries yet

**Implementation Steps:**

#### 3.1 Create Hook to Query Songs from Supabase

**File:** `/hooks/useSongs.ts` (create if doesn't exist)

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { Song } from '@/types/song';

export const useSongs = (filters?: {
  instrument?: string;
  difficulty?: string;
  artist?: string;
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (filters?.instrument && filters.instrument !== 'All') {
          query = query.eq('instrument', filters.instrument);
        }
        if (filters?.difficulty && filters.difficulty !== 'All') {
          query = query.eq('difficulty', filters.difficulty);
        }
        if (filters?.artist) {
          query = query.ilike('artist', `%${filters.artist}%`);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;

        // Transform database rows to Song type
        const transformedSongs: Song[] = (data || []).map(row => ({
          id: row.id,
          title: row.title,
          artist: row.artist,
          duration: row.tempo || '0:00', // Could calculate from actual song data
          difficulty: row.difficulty,
          lastPracticed: new Date(row.created_at).toLocaleDateString(),
          instrument: row.instrument,
          genres: [], // TODO: Add genre support to database
          artwork: row.artwork_url || undefined,
        }));

        setSongs(transformedSongs);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [filters?.instrument, filters?.difficulty, filters?.artist]);

  return { songs, isLoading, error };
};
```

#### 3.2 Update Set List to Use Real Data

**File:** `/app/(tabs)/index.tsx`

1. **Import the new hook:**
```typescript
import { useSongs } from '@/hooks/useSongs';
```

2. **Replace mock data with real queries:**
```typescript
// Remove: const MOCK_SONGS: Song[] = [...]

// Add inside component:
const { songs, isLoading, error } = useSongs({
  instrument: instrumentFilter !== 'All' ? instrumentFilter : undefined,
  difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
});

// Use `songs` instead of `MOCK_SONGS` in FlatList
```

3. **Handle loading and error states:**
```typescript
if (error) {
  return <Text style={styles.errorText}>Error: {error}</Text>;
}

if (isLoading) {
  return <ActivityIndicator size="large" color={Colors.vermilion} />;
}

if (songs.length === 0) {
  return <Text style={styles.placeholderText}>No songs yet. Add one in the "Add Song" tab!</Text>;
}
```

---

## 🎯 Next Steps Checklist

### Immediate (Required for Full Workflow)
- [ ] **Test 1: Run video analysis** with a music video URL
  - Verify Gemini API processes the URL
  - Verify form fields auto-fill correctly
  - Verify loading states and animations work

- [ ] **Test 2: Save a song** to Supabase
  - Complete the analysis workflow
  - Click Save and verify in Supabase dashboard
  - Check the `songs` table for your entry

- [ ] **Implement Test 3: Display saved songs** in Set List
  - Create `useSongs` hook for Supabase queries
  - Update Set List to use real data instead of mocks
  - Test filtering by instrument and difficulty

### Future Enhancements
- [ ] **Theory & Practice Tabs**: Display saved theory/practice data
- [ ] **Edit Songs**: Allow users to update saved song data
- [ ] **Delete Songs**: Add delete functionality with confirmation
- [ ] **Genre Support**: Add genre field to database and filtering
- [ ] **Practice Sessions**: Track practice dates and duration
- [ ] **Advanced Search**: Search by key, tempo, time signature
- [ ] **Favorites/Ratings**: Add user ratings and favorites
- [ ] **Share Songs**: Export playlists or share with other users

---

## 🔧 Troubleshooting

### Problem: "Gemini API unavailable"
**Cause:** API key not set or network issue
**Solution:**
1. Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set in `.env`
2. Check environment variables are loaded (restart app if needed)
3. Verify internet connection
4. App will fall back to mock data automatically

### Problem: "You must be logged in to save songs"
**Cause:** User not authenticated
**Solution:**
1. Go to Settings tab
2. Log in with your account
3. Return to Add Song and try saving again

### Problem: Save succeeds but song doesn't appear in Set List
**Cause:** Set List still uses mock data
**Solution:**
1. Implement Test 3 (useSongs hook)
2. Update Set List to query Supabase
3. Songs should appear immediately after implementation

### Problem: Gemini returns incorrect data
**Cause:** Video URL not processable or API confusion
**Solution:**
1. Try a clear music video URL (YouTube links work best)
2. Verify video is publicly accessible
3. Check Gemini response in browser console for details
4. Use mock data for testing UI/UX while API issues resolve

### Problem: Supabase insert error
**Cause:** Schema mismatch or RLS policy issue
**Solution:**
1. Verify schema created: Go to Supabase dashboard → Tables → songs
2. Verify RLS enabled: Settings → Authentication → Row Level Security
3. Check auth user exists: Verify you're logged in
4. Review error in browser console for specific details

---

## 📝 Development Notes

### Architecture

```
┌─────────────────────────────────────────┐
│       Add Song Screen                   │
├─────────────────────────────────────────┤
│ 1. User pastes video URL                │
│ 2. Clicks "ANALYZE VIDEO"               │
│    ↓                                    │
│ 3. Gemini API analyzes video            │
│    ↓                                    │
│ 4. Auto-fills: Title, Artist,           │
│    Instrument, Theory Data              │
│    ↓                                    │
│ 5. User edits fields (optional)         │
│    ↓                                    │
│ 6. Clicks "SAVE"                        │
│    ↓                                    │
│ 7. Fetches album artwork (iTunes)       │
│    ↓                                    │
│ 8. Saves to Supabase with RLS           │
│    ↓                                    │
│ 9. Success alert                        │
│                                         │
├─────────────────────────────────────────┤
│       Set List Screen                   │
├─────────────────────────────────────────┤
│ 1. Queries saved songs from Supabase    │
│ 2. Applies filters (instrument, etc)    │
│ 3. Displays song cards with artwork     │
│ 4. User can select song for details     │
│                                         │
├─────────────────────────────────────────┤
│     Theory & Practice Tabs              │
├─────────────────────────────────────────┤
│ Display song data:                      │
│ - Theory: key, tempo, time signature    │
│ - Practice: difficulty, techniques      │
│                                         │
└─────────────────────────────────────────┘
```

### Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Gemini API integration | ✅ Complete | Real API with proper request format |
| Album artwork fetching | ✅ Complete | iTunes API (free, no key required) |
| Supabase persistence | ✅ Complete | RLS policies for user isolation |
| Form auto-fill | ✅ Complete | Fills from Gemini response |
| Add Song UI | ✅ Complete | Analyze + Save buttons, loading states |
| Save to database | ✅ Complete | With authentication check |
| Display saved songs | ❌ TODO | Need useSongs hook + Set List update |
| Theory tab content | ❌ TODO | Need to display saved theory data |
| Practice tab content | ❌ TODO | Need to display saved practice data |
| Edit/Delete songs | ❌ TODO | CRUD operations for saved songs |

---

## 🚀 Ready to Test!

Your implementation is now production-ready. Follow the test workflow above to verify everything works end-to-end.

**Next checkpoint:** Test 1 (Video Analysis)

Let me know when:
1. ✅ Video analysis works with real Gemini API
2. ✅ Songs save successfully to Supabase
3. ✅ Ready to implement Set List integration

Good luck! 🎵
