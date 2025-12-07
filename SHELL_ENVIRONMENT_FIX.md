# Shell Environment Variable Fix - ATTEMPTED BUT FAILED ❌

**Date:** December 7, 2025
**Status:** ❌ HYPOTHESIS INVALIDATED - Issue persists after fix

---

## ⚠️ CRITICAL UPDATE: THIS FIX DID NOT WORK

**The user implemented this fix and the issue STILL PERSISTS.**

This document describes an investigation that was thorough and well-reasoned, but **the conclusion was WRONG**. The shell environment variables were NOT the actual root cause.

**What happened:**
- ✅ Shell variables were cleared (`unset` commands executed)
- ✅ Expo dev server was restarted
- ❌ App STILL returns "Stairway to Heaven" mock data
- ❌ This means the actual problem is something else

**Do NOT follow the fixes in this document** - they don't solve the problem. This is documented here for reference of what was already tried.

---

## Problem Identified (DISPROVEN)

~~Your app was returning mock data ("Stairway to Heaven") because shell environment variables were **overriding** the correct values in your `.env` file.~~

**UPDATE:** This theory was tested and proven FALSE. See IMMEDIATE_ACTION_REQUIRED.md for what actually happened.

### Evidence

**Shell Environment (STALE):**
```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDJMZGszieQXmPmNENpYJtfMLeFcyrlX60  ❌ OLD (leaked)
EXPO_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent  ❌ OLD (deprecated)
```

**`.env` File (CORRECT):**
```
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyDvv1hBb1ga1lydKXHJ2_Z3BZpnUg05GEg  ✅ NEW (valid)
EXPO_PUBLIC_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent  ✅ NEW (current)
```

---

## Why This Happened

### Expo SDK 54 Environment Variable Precedence

1. **Shell variables take priority** over `.env` file values
2. When you run `npx expo start`, Expo CLI **inherits the shell environment**
3. The Metro bundler inlines environment variables **at build time**
4. OLD values from shell → bundled into app → API calls use wrong key
5. API rejects old key → app falls back to mock data

### Source of Stale Variables

The stale environment variables were set via:
- Previous shell session `export` commands
- OR manually set and persisting in current shell session
- NOT in shell config files (checked `~/.bashrc`, `~/.zshrc`, etc.)

---

## Solution Applied

### Step 1: Identified Stale Variables ✅
```bash
printenv | grep EXPO_PUBLIC_GEMINI
# Output: OLD values detected
```

### Step 2: Cleared Shell Environment ✅
```bash
unset EXPO_PUBLIC_GEMINI_API_KEY
unset EXPO_PUBLIC_GEMINI_API_URL

# Verified:
printenv | grep EXPO_PUBLIC_GEMINI
# Output: (empty - success!)
```

### Step 3: Shell is Now Clean ✅
```
✅ No stale EXPO_PUBLIC_GEMINI variables in shell
✅ Ready to restart Expo dev server
✅ Metro bundler will now use .env file values
✅ App will bundle with NEW (correct) API key
```

---

## What to Do Now

### Option A: Continue in Current Shell (Recommended)
```bash
# Shell is already clean
# Just restart Expo:
npx expo start

# Then test in app:
# - Go to "Add Song" tab
# - Paste video URL: https://www.youtube.com/watch?v=x9VN57t2IXs
# - Click "ANALYZE VIDEO"
# - Should see debug message: ✅ SUCCESS: Real data from Gemini API
# - Data should NOT be "Stairway to Heaven"
```

### Option B: Start Fresh Terminal
If you want maximum confidence that no stale vars exist:
1. Close current terminal completely
2. Open new terminal
3. Navigate to project: `cd /Users/adriaanhitge/Dropbox/ai-apps/song-streak`
4. Run: `npx expo start`

---

## Technical Explanation

### How Environment Variables Work in Expo

**Build Time (NOT Runtime):**
- Expo CLI reads environment when you start dev server
- Metro bundler **inlines values into JavaScript bundle**
- Values become part of the compiled app code
- Changes to `.env` require dev server restart
- Changes to shell environment also require dev server restart

**Precedence Order (highest to lowest):**
1. Shell environment variables
2. `.env` file
3. Default/fallback values

**Why Test Script Worked:**
- Node.js script runs in isolated process
- Uses `dotenv.config()` to load `.env` directly
- Bypasses shell environment inheritance
- Showed API key itself is valid
- Proved implementation is correct

---

## Prevention Going Forward

### ✅ DO
- Keep API keys **ONLY in `.env`** (gitignored)
- Restart dev server after **any** environment change
- Use `.env.example` for documentation (no real credentials)
- Check shell before debugging env var issues

### ❌ DON'T
- `export EXPO_PUBLIC_* =...` in shell
- Hardcode credentials in shell config files
- Share or commit `.env` to version control
- Trust that shell env vars match `.env` file

### Verify Shell is Clean
```bash
# Always check before starting dev server:
printenv | grep EXPO_PUBLIC

# Should return NOTHING - only .env values will be used
```

---

## What Changed

### Files Already Correct (No Changes Made)
- ✅ `.env` - Already has correct NEW key
- ✅ `utils/gemini.ts` - Code is correct
- ✅ `app/(tabs)/add-song.tsx` - UI and error handling correct
- ✅ `.gitignore` - Already excludes `.env`
- ✅ `test-gemini.js` - Test script works with hardcoded values

### Only Thing That Needed Fixing
- ❌ **Shell environment** (FIXED) - Cleared stale variables

---

## Expected Behavior After Fix

### Before (with stale shell vars):
```
User: Analyzes video URL
App:  Uses OLD API key from shell environment
API:  Rejects with 400/403 error
App:  Falls back to mock data
Result: Always "Stairway to Heaven" ❌
```

### After (with clean shell):
```
User: Analyzes video URL #1
App:  Uses NEW API key from .env file
API:  Returns real data (e.g., "Never Gonna Give You Up")
App:  Auto-fills form with real data
Result: Correct song data ✅

User: Analyzes video URL #2
App:  Same NEW API key
API:  Returns different real data
App:  Different form data fills
Result: Different song data ✅
```

---

## Troubleshooting

### If Still Seeing Mock Data

**Check 1: Verify shell is still clean**
```bash
printenv | grep EXPO_PUBLIC_GEMINI
# Must return nothing
```

**Check 2: Restart dev server**
- Kill current `npx expo start` (Ctrl+C)
- Wait 2 seconds
- Run: `npx expo start`

**Check 3: Clear Expo cache**
```bash
npx expo start --clear
```

**Check 4: Restart entire terminal**
- Close terminal window
- Open new terminal
- `cd /Users/adriaanhitge/Dropbox/ai-apps/song-streak`
- `npx expo start`

### If Getting Error Messages

**Check debug box in app:**
- Should show `✅ SUCCESS: Real data from Gemini API`
- If shows `❌ ERROR: ...`, see what the error says
- Common errors:
  - `QUOTA_EXCEEDED` - Hit API limit, wait or upgrade
  - `AUTH_ERROR` - API key issue (shouldn't happen now)
  - `MODEL_NOT_FOUND` - Configuration issue

---

## Summary

### Root Cause
Shell environment variables with OLD API key were overriding `.env` file values, causing Expo to bundle app with wrong credentials.

### Fix Applied
1. ✅ Identified stale shell vars (OLD key + deprecated model)
2. ✅ Cleared shell environment (`unset` commands)
3. ✅ Verified clean state (printenv shows nothing)
4. ✅ Ready to restart dev server

### Next Step
Restart Expo dev server - it will now use the NEW, correct values from `.env` file.

### Expected Result
- ✅ Different data for each video analyzed
- ✅ No more "Stairway to Heaven" every time
- ✅ Debug shows "✅ SUCCESS"
- ✅ Real song data appears in form

---

**Status:** ❌ **HYPOTHESIS INVALIDATED - FIX DID NOT WORK**

This investigation was thorough but WRONG. The shell environment fix was implemented by the user and did NOT resolve the issue. The app still returns mock data.

**Reference:** See IMMEDIATE_ACTION_REQUIRED.md for full details on what was tried and why it failed.

**Next action:** A different approach is needed to identify the actual root cause.
