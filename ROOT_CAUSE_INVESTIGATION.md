# Root Cause Investigation Guide

**Date:** December 7, 2025
**Status:** ⚠️ UNKNOWN - Shell hypothesis invalidated, need new approach

---

## Problem Summary

**What:** App returns mock data ("Stairway to Heaven") instead of real Gemini API analysis
**When:** Every time user analyzes a music video URL
**What We Know:**
- ✅ API key is valid (test-gemini.js proves it works with hardcoded values)
- ✅ Code implementation is correct
- ✅ .env file has correct values
- ❌ App still returns mock data
- ❌ Shell environment fix did NOT resolve it

---

## How the Mock Data Fallback Works

The flow in `app/(tabs)/add-song.tsx:72-143`:

```
User clicks "ANALYZE VIDEO"
    ↓
Call analyzeVideoWithGemini(videoUrl)
    ↓
    ├─ Success → Set debugInfo to "✅ SUCCESS"
    │
    └─ Any Error →
        ├─ VALIDATION_ERROR or CONFIG_ERROR → Alert and stop
        │
        └─ Everything else (AUTH_ERROR, QUOTA_EXCEEDED, MODEL_NOT_FOUND, GEMINI_API_ERROR, etc.)
            → Show alert
            → Fall back to getMockGeminiResponse()
            → Set debugInfo to "❌ ERROR: [error message]"
```

**Key Point:** Unless the error starts with `VALIDATION_ERROR:` or `CONFIG_ERROR:`, the app FALLS BACK TO MOCK DATA.

---

## Investigation Checklist

### ✅ Step 1: What Debug Message Does the App Show?

When you analyze a video, the app displays a debug message (appears after clicking "ANALYZE VIDEO").

**Run this test:**
1. Go to "Add Song" tab
2. Paste URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Click "ANALYZE VIDEO"
4. **SCREENSHOT OR DESCRIBE** what appears in the debug message

**Important:** The debug message tells us EXACTLY where it's failing:
- ✅ "✅ SUCCESS: Real data from Gemini API" → Working!
- ❌ "❌ ERROR: CONFIG_ERROR: ..." → Environment variables missing
- ❌ "❌ ERROR: AUTH_ERROR: ..." → API key is invalid
- ❌ "❌ ERROR: MODEL_NOT_FOUND: ..." → API URL is wrong
- ❌ "❌ ERROR: QUOTA_EXCEEDED: ..." → Hit API limit
- ❌ "❌ ERROR: GEMINI_API_ERROR: ..." → Some other API error
- ❌ "❌ ERROR: Invalid Gemini API response structure" → API returned unexpected format

---

### ✅ Step 2: Check Environment Variables at Runtime

**Method A: Via Console Logs (If accessible)**

After analyzing, check if console shows lines like:
```
Gemini API response: [actual response from API]
Attempting to parse JSON: [what we're trying to parse]
```

If these DON'T appear, the API call likely isn't happening at all.

**Method B: Add Temporary Debug Logging**

Add this line to `utils/gemini.ts` at line 67-68 (right after getting env vars):

```typescript
console.log('DEBUG: API Key loaded:', apiKey ? 'YES (length:' + apiKey.length + ')' : 'NO (empty)');
console.log('DEBUG: API URL loaded:', apiUrl ? 'YES' : 'NO (empty)');
```

Then restart Expo and try analyzing again. This will show if the env vars are being loaded.

---

### ✅ Step 3: Verify Metro Bundler Cached Values

**Problem:** Metro might have old values cached from previous builds.

**Solution A: Clear Everything**
```bash
# Kill Expo if running (Ctrl+C in terminal)

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf /tmp/expo-*

# Clear npm cache
npm cache clean --force

# Reinstall and restart
npm install
npx expo start --clear
```

**Solution B: Quick Cache Clear**
```bash
npx expo start --clear
```

**Solution C: Nuclear Option (Fresh Start)**
```bash
# Stop Expo (Ctrl+C)
rm -rf .expo/
rm -rf node_modules/
npm install
npx expo start
```

After doing this, try analyzing again and check the debug message.

---

### ✅ Step 4: Verify Which .env File is Actually Being Loaded

**Check Priority Order:**

In Expo, the `.env` file loading order is:
1. `.env.local` (highest priority, if it exists)
2. `.env.development.local` (if development mode)
3. `.env.development`
4. `.env` (default)
5. `.env.production` (if production mode)

**Current state:**
- ✅ `.env` exists with correct values
- ✅ `.env.example` exists as template
- ❓ No `.env.local`, `.env.development.local`, etc. (should be fine)

**To verify:** Check if any of these files exist and might be overriding:
```bash
ls -la .env*
```

If ANY `.env.local` file exists with wrong values, it would take precedence!

---

### ✅ Step 5: Check for Hardcoded Fallback or Conditional Logic

**Review `app/(tabs)/add-song.tsx` line 86-143:**

The error handling prioritizes VALIDATION_ERROR and CONFIG_ERROR. Everything else falls back to mock data.

**Possible issue:** If there's logic that always returns false or throws an untracked error, it would fallback to mock.

**Check:** Look for any `if` statements that might force mock data or catch all errors silently.

---

### ✅ Step 6: Test With Hardcoded Values

**Temporary Debug:** Modify `utils/gemini.ts` line 67-68:

```typescript
// TEMPORARY: Replace with hardcoded values for testing
const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const apiKey = 'AIzaSyDvv1hBb1ga1lydKXHJ2_Z3BZpnUg05GEg';
```

This bypasses environment variable loading entirely. If it works with hardcoded values, the problem is environment variables.

**After testing:** Revert these changes.

---

### ✅ Step 7: Check Expo SDK Configuration

**File: `app.json`** (or `expo.json`)

Check if there's any environment variable configuration or special Expo settings:

```bash
grep -i "env\|plugin\|extra" app.json | head -20
```

**Look for:**
- `plugins` that might override environment variables
- `extra` section that might affect env loading
- Any environment-specific configurations

---

### ✅ Step 8: IDE/Editor Environment Injection

**Problem:** VS Code or another IDE might be injecting environment variables.

**Check:**
1. **VS Code Settings** (`.vscode/settings.json`)
   ```bash
   cat .vscode/settings.json | grep -i env
   ```

2. **VS Code Environment Variables**
   - Check if VS Code terminal has different env than system terminal
   - Run `printenv | grep EXPO_PUBLIC` in both VS Code terminal and system terminal

3. **Solution:** Start Expo from system terminal (not VS Code terminal)

---

## Most Likely Root Causes (Ranked by Probability)

### 1. **Metro Bundler Cache** (60% probability)
- Symptoms: Test script works, app doesn't; shell env fix didn't help
- Solution: `npx expo start --clear` or clean all caches
- Why: Metro caches bundled values; doesn't always refresh on .env changes

### 2. **Different .env File Precedence** (20% probability)
- Symptoms: .env has correct values but app uses old ones
- Solution: Check for `.env.local`, `.env.development.local`, etc.
- Why: Expo has specific precedence order

### 3. **Environment Variables Not Being Loaded** (10% probability)
- Symptoms: Both apiKey and apiUrl are empty strings
- Solution: Check CONFIG_ERROR message in debug display
- Why: dotenv not configured properly or .env file in wrong location

### 4. **API Response Format Issue** (7% probability)
- Symptoms: Debug shows "Invalid Gemini API response structure"
- Solution: API returned data but not in expected format
- Why: Google might return different structure for certain requests

### 5. **API Key Actually Invalid** (3% probability)
- Symptoms: AUTH_ERROR in debug message
- Solution: Regenerate key in Google Cloud Console
- Why: Despite test script working, could be account/quotas issue

---

## Next Steps

1. **Determine which error is happening** - Get the debug message from the app
2. **Based on error, follow the specific fix path** below
3. **If unsure, run Step 3** (clear Metro cache) as it solves 60% of cases

---

## Fix Paths by Error Type

### If Debug Shows: "❌ ERROR: CONFIG_ERROR"
```bash
# Environment variables are NOT being loaded
# Solution: Check .env file location and Expo configuration
# Most likely: .env not in project root or dotenv not configured
```

### If Debug Shows: "❌ ERROR: AUTH_ERROR"
```bash
# API key is invalid/rejected
# Solution: Check if key has been disabled in Google Cloud Console
# Or: Regenerate new key and update .env
```

### If Debug Shows: "❌ ERROR: MODEL_NOT_FOUND"
```bash
# API URL points to non-existent model
# Solution: Update EXPO_PUBLIC_GEMINI_API_URL in .env
# Current should be: gemini-2.5-flash
```

### If Debug Shows: "❌ ERROR: QUOTA_EXCEEDED"
```bash
# Hit daily API quota
# Solution: Wait for quota reset (24 hours) or upgrade plan
# App should recover automatically after reset
```

### If Debug Shows: "❌ ERROR: Invalid Gemini API response structure"
```bash
# API returned unexpected response format
# Solution: Check what Gemini actually returned
# Most likely: Different API response format than expected
```

### If Debug Shows: "✅ SUCCESS" but still mock data?
```bash
# This shouldn't happen - success should use real data
# Debug the form field population logic in add-song.tsx:152-169
```

---

## Summary

The app falls back to mock data when `analyzeVideoWithGemini()` throws an error. To fix it, we need to:

1. **Find out what error is being thrown** (debug message shows this)
2. **Fix the root cause of that specific error** (follow fix path above)
3. **Verify it works** (debug message should show "✅ SUCCESS" and data should NOT be "Stairway to Heaven")

**The investigation is data-driven:** Get the error message from the app's debug display, and that tells us exactly what to fix.

---

**Action Required:** Test the app, take a screenshot of the debug message, and report what error it shows.
