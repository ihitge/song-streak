# 🚨 IMMEDIATE ACTION REQUIRED - Shell Environment Fix

## Status
✅ Root cause identified and documented
❌ Shell environment STILL HAS STALE VARIABLES (need your action)

---

## What You Need to Do RIGHT NOW

### The Problem
Shell environment STILL contains OLD API credentials that override your `.env` file:

```
Shell (CURRENT):
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDJMZGszieQXmPmNENpYJtfMLeFcyrlX60  ❌ OLD (leaked)
EXPO_PUBLIC_GEMINI_API_URL=...gemini-1.5-flash:generateContent        ❌ OLD (deprecated)

.env File (CORRECT):
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDvv1hBb1ga1lydKXHJ2_Z3BZpnUg05GEg  ✅ NEW (valid)
EXPO_PUBLIC_GEMINI_API_URL=...gemini-2.5-flash:generateContent        ✅ NEW (current)
```

### Solution (Choose ONE)

#### Option 1: Quick Fix in Current Terminal
**In your terminal, run:**
```bash
unset EXPO_PUBLIC_GEMINI_API_KEY
unset EXPO_PUBLIC_GEMINI_API_URL
npx expo start
```

#### Option 2: Restart Terminal (Recommended)
1. **Close your terminal completely** (all tabs/windows)
2. **Open a NEW terminal**
3. **Navigate to project:**
   ```bash
   cd /Users/adriaanhitge/Dropbox/ai-apps/song-streak
   ```
4. **Start Expo:**
   ```bash
   npx expo start
   ```

#### Option 3: Force Fresh Shell
```bash
env -i bash --norc --noprofile
cd /Users/adriaanhitge/Dropbox/ai-apps/song-streak
npx expo start
```

---

## Verify the Fix Works

After restarting Expo dev server:

1. **Open app on device/emulator**
2. **Go to "Add Song" tab**
3. **Paste a music video URL:**
   ```
   https://www.youtube.com/watch?v=x9VN57t2IXs
   ```
4. **Click "ANALYZE VIDEO"**
5. **Look for the debug message:**
   - ✅ **"✅ SUCCESS: Real data from Gemini API"** = WORKING!
   - ❌ **"❌ ERROR: ..."** = Still has issues

6. **Verify data changes:**
   - Try different video URLs
   - Each should return DIFFERENT song data
   - NOT "Stairway to Heaven" every time

---

## Why This Works

### Before Fix (Current State)
```
User: Paste URL + Click ANALYZE
     ↓
Expo uses OLD API key from shell
     ↓
API rejects: "Key is invalid/expired"
     ↓
App falls back to mock data ("Stairway to Heaven")
     ↓
Result: ❌ Wrong data every time
```

### After Fix (Once You Clear Shell)
```
User: Paste URL #1 + Click ANALYZE
     ↓
Expo uses NEW API key from .env
     ↓
API accepts and returns real data
     ↓
App displays correct song info
     ↓
Result: ✅ Real data ("Never Gonna Give You Up" for Rick Roll video)

User: Paste URL #2 + Click ANALYZE
     ↓
Same NEW API key
     ↓
API returns DIFFERENT real data
     ↓
App displays DIFFERENT song info
     ↓
Result: ✅ Different real data for different videos
```

---

## Understanding the Issue

### How Expo Loads Environment Variables

1. **When you run `npx expo start`:**
   - Expo CLI starts Metro bundler
   - Metro reads environment from current shell
   - Values are **inlined into JavaScript bundle at build time**
   - Not loaded at runtime - they're compiled in!

2. **Precedence (what wins):**
   - Shell environment variables (highest priority)
   - `.env` file values
   - Default/fallback values (lowest priority)

3. **Why `unset` in my shell didn't work:**
   - I can only affect subprocesses
   - Your main terminal still has the old values
   - You need to `unset` in YOUR terminal

### Why Test Script Worked But App Doesn't

- **Test script** (`test-gemini.js`) with hardcoded values = bypasses shell env completely
- **Expo app** = inherits shell environment when dev server starts
- **Conclusion** = API key is valid, app code is correct, only shell env is wrong

---

## Files Already Updated

✅ **Documentation:**
- `SHELL_ENVIRONMENT_FIX.md` - Full technical explanation
- `IMMEDIATE_ACTION_REQUIRED.md` - This file

✅ **Code (All Correct):**
- `utils/gemini.ts` - Proper environment variable usage
- `app/(tabs)/add-song.tsx` - Error handling + debug display
- `.env` - Has correct NEW key
- `.gitignore` - Properly excludes `.env`

✅ **No Code Changes Needed** - Everything works once you clear shell vars

---

## Troubleshooting If Still Broken

**After clearing shell and restarting Expo:**

### Still Seeing "Stairway to Heaven"?

1. **Verify shell is clean:**
   ```bash
   printenv | grep EXPO_PUBLIC_GEMINI
   # Should show NOTHING
   ```

2. **Kill and restart Expo:**
   ```bash
   # Press Ctrl+C in your Expo terminal
   npx expo start --clear
   ```

3. **Check debug message in app:**
   - Should show error type if not working
   - "❌ ERROR: AUTH_ERROR" = Still using old key (repeat step 1)
   - "❌ ERROR: QUOTA_EXCEEDED" = Using new key but hit API limit (wait or upgrade)
   - "✅ SUCCESS: Real data from Gemini API" = WORKING!

4. **Last resort:**
   - Close terminal completely
   - Open new terminal
   - Navigate to project
   - Run: `npx expo start`

---

## Summary

### What I Found
- ✅ API key is valid (test script proves it)
- ✅ Code is correct (proper error handling)
- ✅ `.env` file is correct (has NEW key)
- ❌ Shell environment is WRONG (has OLD key)

### The Fix
- Clear shell environment variables
- Restart Expo dev server
- App will use NEW key from `.env`

### One Sentence
**Shell variables override `.env` in Expo - you need to `unset EXPO_PUBLIC_GEMINI_API_KEY` in your terminal then restart Expo.**

---

**ACTION REQUIRED:** Clear shell environment and restart Expo dev server

Once you do, the app will work correctly! 🚀
