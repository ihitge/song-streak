# Gemini API & Supabase Setup Guide

## Overview

This guide walks you through setting up the Gemini API for video analysis and Supabase for data persistence in Song Streak.

## Architecture

```
User pastes video URL
         ↓
  Clicks "ANALYZE"
         ↓
  Gemini API analyzes video
         ↓
  Auto-fills: Title, Artist, Instrument, Theory data
         ↓
  User can edit fields if needed
         ↓
  Clicks "SAVE"
         ↓
  Save button turns GREEN (song ready to save)
         ↓
  Fetch album artwork from iTunes API
         ↓
  Save to Supabase
         ↓
  Song appears in Set List
```

---

## Part 1: Supabase Setup

### 1.1 Create Supabase Table

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project's SQL Editor
3. Copy the entire contents of `docs/SUPABASE_SCHEMA.sql`
4. Paste into the SQL Editor and run

This creates:
- `songs` table with all required fields
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic `updated_at` timestamp trigger

### 1.2 Verify the Table

In the Supabase dashboard:
1. Go to **Tables editor**
2. You should see a `songs` table
3. Columns include:
   - `id` (UUID)
   - `user_id` (UUID)
   - `title` (TEXT)
   - `artist` (TEXT)
   - `instrument` (TEXT)
   - `video_url` (TEXT)
   - `artwork_url` (TEXT)
   - `key`, `tempo`, `time_signature` (theory data)
   - `difficulty`, `techniques` (practice data)
   - `created_at`, `updated_at` (timestamps)

---

## Part 2: Gemini API Setup

### 2.1 Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Choose your project (or create a new one)
4. Copy the API key

### 2.2 Add Environment Variables

In your `.env.local` file (or Expo app config):

```
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
EXPO_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Important:** Make sure to use `gemini-2.5-flash` (or `gemini-2.0-flash`) as the model. Older models like `gemini-1.5-flash` are deprecated and will not work.

### 2.3 Implement Gemini Integration

The `utils/gemini.ts` file currently has a TODO. Here's how to implement it:

```typescript
export async function analyzeVideoWithGemini(
  videoUrl: string
): Promise<GeminiAnalysisResponse> {
  const prompt = `Analyze this music video and extract:
1. Song title
2. Artist name
3. Primary instrument (Guitar or Bass)
4. Musical key
5. Tempo in BPM
6. Time signature
7. Difficulty level (Easy, Medium, Hard)
8. List of techniques used

Video URL: ${videoUrl}

Return as JSON with exact structure:
{
  "title": "string",
  "artist": "string",
  "instrument": "Guitar|Bass",
  "theoryData": {
    "key": "string (e.g., 'A Minor')",
    "tempo": "string (e.g., '120 BPM')",
    "timeSignature": "string (e.g., '4/4')"
  },
  "practiceData": {
    "difficulty": "Easy|Medium|Hard",
    "techniques": ["string", "string"]
  }
}`;

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_GEMINI_API_URL}?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Extract the text response from Gemini
  const textContent = data.candidates[0].content.parts[0].text;

  // Parse JSON from response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse Gemini response');
  }

  return JSON.parse(jsonMatch[0]);
}
```

### 2.4 Fallback to Mock Data

The implementation has a built-in fallback:
- If Gemini API is not configured or fails, it uses `getMockGeminiResponse()`
- This allows development/testing without setting up Gemini first

---

## Part 3: iTunes Artwork API

The artwork fetching is already implemented in `utils/artwork.ts`:

```typescript
export async function fetchAlbumArtwork(
  title: string,
  artist: string
): Promise<ArtworkResult> {
  // Calls iTunes Search API
  // Returns album artwork URL or placeholder
}
```

**No API key needed** - iTunes Search API is free and public!

---

## Part 4: Testing the Workflow

### 4.1 Test Without Gemini (Using Mock Data)

1. Don't set up Gemini API - the app will use mock data
2. User flow:
   - Paste any video URL
   - Click "ANALYZE VIDEO"
   - Mock data fills in: "Stairway to Heaven" by Led Zeppelin
   - Edit fields if desired
   - Click "SAVE"
   - Song appears in database

### 4.2 Test With Gemini API

1. Set up Gemini API key in `.env.local`
2. Restart the app
3. User flow:
   - Paste YouTube video URL
   - Click "ANALYZE VIDEO"
   - Gemini extracts real metadata from video
   - User can edit if needed
   - Click "SAVE"
   - Song saved with real data

---

## Part 5: Troubleshooting

### Problem: "You must be logged in to save songs"
**Solution:** Make sure user is authenticated before saving
- Check `/app/(tabs)/settings.tsx` for auth setup
- Verify Supabase auth is configured

### Problem: Gemini API error
**Solution:** Check environment variables
- Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set
- Verify `EXPO_PUBLIC_GEMINI_API_URL` is correct
- Check API key is valid in Google AI Studio dashboard
- App falls back to mock data if API fails

### Problem: Supabase insert error
**Solution:** Check database setup
- Verify `songs` table was created
- Verify RLS policies are enabled
- Check user_id is correctly set from auth.users

### Problem: No album artwork
**Solution:**
- iTunes API might not find the song
- Check song title and artist spelling
- App uses placeholder image if not found

### Problem: "API Quota Exceeded" error
**Solution:** See **Part 6: API Quotas** below for details and solutions

---

## Part 6: Gemini API Quotas & Rate Limiting

### Free Tier Limits (as of December 2025)

The Gemini API free tier has the following limits:

| Limit | Value |
|-------|-------|
| **Requests per minute (RPM)** | 15 |
| **Requests per day (RPD)** | 1,500 |
| **Input tokens per minute** | 1,000,000 |
| **Output tokens per minute** | 30,000 |

### What Happens When Quota Exceeded

1. **API returns 429 error** with message: "You exceeded your current quota"
2. **App shows error alert** explaining the quota issue
3. **User can choose** to use sample data to continue testing
4. **Automatic retry logic** attempts to retry 2 times with exponential backoff

### Solutions for Quota Exhaustion

#### Option 1: Wait for Quota Reset (Free)
- **Daily quota resets:** At midnight UTC
- **Monthly quota resets:** On the 1st of each month
- **Best for:** Testing in batches during development
- **Drawback:** Can't test continuously

#### Option 2: Upgrade to Paid Tier (Recommended)
- **Pricing:** $5+ per month depending on usage
- **Benefits:** Much higher quotas (100+ RPM, 1M+ RPD)
- **Setup:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and enable paid billing
- **Best for:** Production apps and heavy testing

#### Option 3: Implement Client-Side Rate Limiting (Advanced)
- **Approach:** Limit requests to stay within free tier quotas
- **Example:** Max 1 analyze request per 4 seconds = 15 RPM
- **Best for:** Development when upgrading isn't an option
- **Note:** App already has exponential backoff for 429 errors

### Monitoring Quota Usage

1. **Check Google AI Studio Dashboard**
   - Go to [aistudio.google.com](https://aistudio.google.com)
   - Look at your project's API usage dashboard
   - Shows requests, tokens, and quota remaining

2. **Check App Console Logs**
   - When quota exceeded: "Quota exceeded. Retrying in Xms..."
   - Browser/device console will show detailed error messages
   - Look for error codes: `QUOTA_EXCEEDED`, `RESOURCE_EXHAUSTED`

3. **Monitor During Testing**
   - Count API calls: Each "ANALYZE" button click = 1 API call
   - Remember 15 RPM = ~1 call per 4 seconds
   - Daily limit = 1,500 calls = ~1 analyze per minute all day

### Tips to Avoid Quota Exhaustion

1. **Use sample data during development** (when real API not needed)
   - Kill Gemini API key to force fallback to mock data
   - Test UI/UX without consuming quota

2. **Batch your testing**
   - Plan test cases before running
   - Don't repeatedly test same video URL
   - Test different scenarios, not the same one

3. **Restart quota-heavy features**
   - Each app restart might reset some in-memory counts
   - Quota is tracked server-side, not client-side

4. **Test with mock data first**
   - The app automatically falls back to "Stairway to Heaven" when Gemini fails
   - Perfect for UI/UX testing without quota costs

---

## Part 7: Next Steps

1. **Test the workflow** with real video URLs
   - Go to "Add Song" tab
   - Paste a music video URL
   - Click "ANALYZE VIDEO"
   - Verify form auto-fills (or shows error if quota exceeded)
   - Click "SAVE" to persist to Supabase

2. **Monitor quota usage** using Google AI Studio dashboard

3. **Display saved songs** in Set List tab (Phase 3)

4. **Add editing/deletion** of saved songs (Phase 4)

5. **Implement theory/practice tabs** with saved data (Phase 5)

---

## File Structure

```
utils/
  ├── gemini.ts                 # Gemini API integration
  ├── artwork.ts                # iTunes artwork fetching
  └── supabase/
      └── client.ts             # Supabase client (already set up)

app/(tabs)/
  └── add-song.tsx              # Main Add Song screen (updated)

docs/
  ├── SUPABASE_SCHEMA.sql       # Database schema
  └── GEMINI_SUPABASE_SETUP.md  # This file
```

---

## API Endpoints Reference

### Gemini API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- **Method:** POST
- **Auth:** API key in query parameter
- **Rate Limit:** Free tier has limits

### iTunes Search API
- **Endpoint:** `https://itunes.apple.com/search`
- **Method:** GET
- **Auth:** None (public API)
- **Rate Limit:** None (public API)

### Supabase
- **URL:** `https://YOUR_PROJECT.supabase.co`
- **Auth:** EXPO_PUBLIC_SUPABASE_ANON_KEY
- **Table:** `songs`
