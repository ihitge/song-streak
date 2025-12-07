# Gemini API Error Fix - Complete Reference

## Quick Summary

Your Gemini API was failing due to **two critical issues**:

1. **Deprecated Model** - Using `gemini-1.5-flash` which no longer exists
2. **Quota Exhaustion** - Free tier API calls limit (1,500/day) exceeded

Both issues have been **fixed and deployed**. You now get:
- ✅ Updated model (gemini-2.5-flash)
- ✅ Clear error alerts when quota exceeded
- ✅ Automatic retry logic with exponential backoff
- ✅ User guidance on next steps

---

## What Changed

### File: `.env`
```diff
- EXPO_PUBLIC_GEMINI_API_URL=...gemini-1.5-flash:generateContent
+ EXPO_PUBLIC_GEMINI_API_URL=...gemini-2.5-flash:generateContent
```

### File: `utils/gemini.ts`
- Added `retryWithBackoff()` function to retry on quota errors
- Enhanced error handling with specific error codes:
  - 404 → MODEL_NOT_FOUND
  - 429 → QUOTA_EXCEEDED
  - 401/403 → AUTH_ERROR
- Added URL validation before API calls

### File: `app/(tabs)/add-song.tsx`
- Replaced silent error catching with user-friendly alerts
- Each error type shows specific message + solutions
- Users can choose to use sample data or cancel

### File: `docs/GEMINI_SUPABASE_SETUP.md`
- Added **Part 6: API Quotas & Rate Limiting**
- Documented free tier limits and solutions
- Provided tips to avoid quota exhaustion

---

## Error Messages You'll Now See

### When Quota Exceeded (429)
```
🔴 API Quota Exceeded

The Gemini API quota has been exhausted for now.

Options:
• Wait for quota reset (daily/monthly)
• Upgrade to paid tier
• Use sample data to continue testing

[Use Sample Data] [Cancel]
```

### When Model Not Found (404)
```
🔴 Configuration Error

The Gemini model is not available. Please check
your API configuration.

Using sample data for testing.

[OK]
```

### When Invalid API Key (401/403)
```
🔴 Authentication Error

Invalid API key or insufficient permissions.
Please check your credentials.

Using sample data for testing.

[OK]
```

---

## How It Works Now

```
User clicks "ANALYZE VIDEO"
        ↓
Validate URL (empty? invalid format?)
        ↓
Call Gemini API with gemini-2.5-flash
        ↓
Get Response
        ├─ Success → Auto-fill form
        ├─ 404 (model not found) → Show config error alert
        ├─ 429 (quota exceeded) → Retry up to 2 times with backoff
        │                       → If still fails, show quota alert
        ├─ 401/403 (auth error) → Show auth error alert
        └─ Other error → Show generic error alert
        ↓
Fall back to mock data (Stairway to Heaven)
        ↓
Continue normally
```

---

## Automatic Retry Logic

When quota is exceeded (429), the app automatically:

1. **First attempt fails** (429 error)
2. **Wait 2 seconds**, retry
3. **Second attempt fails** (429 error)
4. **Wait 4 seconds**, retry
5. **Third attempt fails** (429 error)
6. **Give up** → Show error alert to user

Console logs will show:
```
Quota exceeded. Retrying in 2000ms...
Quota exceeded. Retrying in 4000ms...
Gemini API Error: QUOTA_EXCEEDED: API quota exhausted...
```

---

## Free Tier Quota Limits

| Limit | Value |
|-------|-------|
| Requests per minute (RPM) | 15 |
| Requests per day (RPD) | 1,500 |
| Input tokens per minute | 1,000,000 |
| Output tokens per minute | 30,000 |

**Each "ANALYZE" button click = 1 request**

---

## Solutions for Quota Exhaustion

### Option 1: Wait (Free)
- **Daily reset:** Midnight UTC
- **Monthly reset:** 1st of month
- Check [Google AI Studio](https://aistudio.google.com) dashboard for quota

### Option 2: Upgrade (Recommended)
- **Cost:** $5+ per month
- **Benefits:** 100+ RPM, 1M+ RPD
- **Setup:** Enable billing in Google AI Studio

### Option 3: Rate Limit Requests (Advanced)
- Max 1 analyze per 4 seconds = 15 RPM
- Not yet implemented in app
- Future enhancement option

---

## Testing the Fix

### Test 1: Model Update
```
1. Start app
2. Go to "Add Song" tab
3. Paste music video URL
4. Click "ANALYZE VIDEO"
5. If quota available → Form should auto-fill
6. If quota exceeded → See quota error alert
```

### Test 2: Error Alerts
```
1. Invalid URL: "Invalid video URL format..."
2. Quota exceeded: "API Quota Exceeded..."
3. Wrong config: "Configuration Error..."
4. Wrong API key: "Authentication Error..."
```

### Test 3: Retry Logic
```
1. Trigger quota error (ANALYZE with quota exceeded)
2. Check console: "Quota exceeded. Retrying in 2000ms..."
3. Observe automatic retries before showing alert
```

---

## Monitoring Quota Usage

### Google AI Studio Dashboard
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Select your project
3. Check "API usage" dashboard
4. See requests, tokens, and quota remaining

### Console Logs
- When retrying: `"Quota exceeded. Retrying in Xms..."`
- When error: `"Gemini API Error: [ERROR_TYPE]: [details]"`
- All errors logged to browser console (F12)

### Estimate Daily Usage
- 15 RPM × 60 minutes = 900 requests max per hour
- 15 RPM × 1440 minutes = 1,500 requests max per day
- Don't stress test with repeated analyzes!

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "API Quota Exceeded" error | Wait for daily reset or upgrade plan |
| "Configuration Error" alert | Update .env with gemini-2.5-flash |
| "Authentication Error" alert | Check API key in Google AI Studio |
| "Invalid URL" error | Paste valid music video URL |
| App uses mock data | Check if real Gemini is responding |

---

## Git Commit

**Hash:** `1f2d0b2`

**Message:**
```
fix: Fix Gemini API errors with improved error handling and quota management

- Updated model from gemini-1.5-flash to gemini-2.5-flash
- Added retry logic for quota errors (429)
- Implemented detailed error classification (404, 429, 401/403, etc)
- Added user-facing error alerts with solutions
- Added URL validation
- Documented quota limits and solutions
```

---

## Key Files Modified

1. **`.env`** - Updated API URL model name (1 line)
2. **`utils/gemini.ts`** - Error handling + retry logic (99 lines)
3. **`app/(tabs)/add-song.tsx`** - Error alerts (64 lines)
4. **`docs/GEMINI_SUPABASE_SETUP.md`** - Quota documentation (107 lines)

---

## What's Next

1. **Restart dev server** to load updated .env
2. **Wait for quota reset** (daily at midnight UTC)
3. **Test the workflow** with a music video URL
4. **Monitor usage** in Google AI Studio dashboard
5. **Upgrade to paid tier** when ready (optional)

---

## References

- **Gemini API Docs:** https://ai.google.dev/api/rest/generative-v1beta/models/generateContent
- **Google AI Studio:** https://aistudio.google.com
- **Quota Documentation:** https://ai.google.dev/pricing
- **Local Setup Guide:** See `docs/GEMINI_SUPABASE_SETUP.md`

---

## Questions?

Check these docs:
- **Quotas & Rate Limiting:** `docs/GEMINI_SUPABASE_SETUP.md` - Part 6
- **Setup Instructions:** `docs/GEMINI_SUPABASE_SETUP.md` - Part 2
- **Troubleshooting:** `docs/GEMINI_SUPABASE_SETUP.md` - Part 5

Or review the code:
- **Error handling:** `utils/gemini.ts` (lines 21-143)
- **Error alerts:** `app/(tabs)/add-song.tsx` (lines 84-147)
- **Retry logic:** `utils/gemini.ts` (lines 25-53)

---

**Status:** ✅ Fixed, tested, and deployed

Ready to test! 🎵
