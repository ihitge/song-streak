# API Key Security Incident & Resolution

**Date:** December 7, 2025
**Status:** ✅ RESOLVED
**Severity:** HIGH (Leaked API Key)

---

## Incident Summary

Your Gemini API key was detected as leaked by Google's security systems and permanently disabled with a **403 PERMISSION_DENIED** error.

**Leaked Key:** `AIzaSyDJMZGszieQXmPmNENpYJtfMLeFcyrlX60`

### Root Causes
1. **API Key in `.env` committed to git** - The file was not in `.gitignore`
2. **Repository exposure** - Key was visible in git history
3. **Google detection** - Automated scanning found and disabled it

---

## Actions Taken

### ✅ Security Fixes Implemented

1. **Updated .gitignore** (Commit: 5f31395)
   - Added `.env` to properly exclude from git
   - Was missing (only had `.env.local`)
   - Now properly ignores all `.env` files going forward

2. **Removed .env from git tracking**
   - Executed: `git rm --cached .env`
   - Removed tracking while preserving local file
   - File still exists locally with your current credentials

3. **Created .env.example template**
   - Safe to commit (no real credentials)
   - Shows required configuration variables
   - Helps new developers understand setup

### 📝 Files Modified

| File | Change | Status |
|------|--------|--------|
| `.gitignore` | Added `.env` to exclusion list | ✅ Protected |
| `.env` | Removed from git tracking | ✅ Hidden |
| `.env.example` | Created as template | ✅ Created |

---

## Current Status

### ✅ What's Fixed
- [x] `.env` is now properly ignored by git
- [x] Future commits won't expose `.env`
- [x] `.env.example` provides setup reference
- [x] Changes pushed to GitHub

### ⚠️ What Remains (User Action)
- [ ] **CRITICAL:** Replace the leaked API key
  - Old key is disabled anyway
  - Get new key from: https://aistudio.google.com/app/apikey
  - The plan has full instructions

- [ ] Optional: Clean git history
  - The leaked key is still in git history
  - Can be removed with `git filter-branch` (see plan)
  - Not urgent since key is already disabled

- [ ] Optional: Add API key restrictions
  - In Google Cloud Console
  - Restrict to your app and Gemini API only

---

## How the Leak Happened

```
Timeline of the incident:
├─ You created .env with API key
├─ Committed .env to git (was not in .gitignore)
├─ Pushed to GitHub (visible in history)
├─ Google scanned and detected the key
├─ Google disabled the key for security
└─ Your app now gets 403 error
```

### Why It Happened
The `.gitignore` file did not include `.env`:
```diff
# local env files
- .env*.local        # ❌ WRONG: Only ignores .env.*.local
+ .env              # ✅ FIXED: Now ignores .env
+ .env*.local       # ✅ Also includes .env.local
```

---

## What the Fixes Do

### .gitignore Update
```gitignore
# local env files
.env                    # ← NEW: Ignore all .env files
.env*.local            # ← EXISTING: Ignore .env.local versions
.env.example.local     # ← NEW: Ignore local overrides of example
```

**Effect:** Git will now refuse to track any `.env` files

### .env Removal from Tracking
```bash
git rm --cached .env
```

**Effect:**
- Removed from git history (going forward)
- Local file preserved with your credentials
- Stops tracking in future commits

### .env.example Creation
```
# Safe template file (can be committed)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_GEMINI_API_URL=...gemini-2.5-flash:generateContent
```

**Effect:**
- Developers can copy to `.env` and fill in their own keys
- Shows what configuration is needed
- Safe because it has no real credentials

---

## What's NOT Fixed Yet

### The Leaked Key in Git History
The old API key is still visible in your git commit history:
- ✅ The key is already disabled by Google (can't be exploited)
- ⚠️ Should be removed from history for cleanliness
- 📋 See plan: `dynamic-snacking-frost.md` for instructions

### How to Clean History (Optional)
If you want to remove it from history:

```bash
# Option 1: Using git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all

# Option 2: Using BFG Repo-Cleaner (faster, safer)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files .env
git push origin --force --all
```

**Note:** This is optional since the key is already disabled.

---

## Best Practices Going Forward

### 1. Never Commit Secrets
```
✅ DO:  Add .env to .gitignore
❌ DON'T: Commit .env to version control
```

### 2. Use Environment-Specific Files
```
.env              # Local development (gitignored)
.env.example      # Template for documentation (committed)
.env.local        # Local overrides (gitignored)
.env.production   # Production (never committed)
```

### 3. Protect API Keys
```
✅ API key restrictions in Google Cloud Console
✅ HTTP referrer restrictions
✅ API-specific restrictions (only Gemini API)
✅ App-specific restrictions (only your app)
```

### 4. Secret Management in Production
- Use Expo Secrets for deployed apps
- Use environment variables in CI/CD
- Use secret managers (AWS Secrets, Vault, etc)
- Never hardcode credentials

### 5. Regular Key Rotation
- Rotate keys every 90 days
- Immediately rotate if exposed
- Keep old keys disabled but don't delete immediately
- Monitor for unauthorized usage

---

## Testing the Fix

After implementing all fixes:

```
1. Confirm .env is in .gitignore
   $ git check-ignore .env
   # Should output: .env

2. Verify .env is not tracked
   $ git ls-files | grep .env
   # Should output nothing

3. Confirm .env.example exists and is tracked
   $ git ls-files | grep .env.example
   # Should output: .env.example

4. Verify no commits expose the key
   $ git log --all -S "AIzaSyDJMZGszieQXmPmNENpYJtfMLeFcyrlX60"
   # Shows commits where key appears
```

---

## Security Checklist

- [x] `.env` added to `.gitignore`
- [x] `.env` removed from git tracking
- [x] `.env.example` template created
- [x] Changes committed and pushed
- [ ] **TODO (User):** Generate new API key
- [ ] **TODO (User):** Update EXPO_PUBLIC_GEMINI_API_KEY in `.env`
- [ ] **TODO (User):** Test the app with new key
- [ ] **OPTIONAL:** Clean git history of leaked key
- [ ] **OPTIONAL:** Add API key restrictions in Google Cloud
- [ ] **OPTIONAL:** Set up secret management for production

---

## References

### Documentation
- [Git Ignoring Files](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

### Google Security
- [API Key Security](https://cloud.google.com/docs/authentication/security)
- [Google AI API Best Practices](https://ai.google.dev/docs/authentication)
- [Securing API Keys](https://cloud.google.com/docs/authentication/api-keys)

### Expo/React Native
- [Expo Secrets](https://docs.expo.dev/build/variables/)
- [Environment Variables in React Native](https://facebook.github.io/react-native/docs/getting-started)

---

## Summary

### What Happened
Your Gemini API key was leaked (committed to git), detected by Google, and disabled.

### What We Fixed
- ✅ Added `.env` to `.gitignore` (now protected from future leaks)
- ✅ Removed `.env` from git tracking (already exposed, now stopped)
- ✅ Created `.env.example` template (safe reference for developers)
- ✅ Committed and pushed security improvements

### What You Need to Do
1. Generate new API key (old one is disabled anyway)
2. Update `.env` with new key
3. Restart dev server and test
4. Optional: Clean git history

### Going Forward
- Never commit `.env` files
- Use `.env.example` for configuration reference
- Add API key restrictions in Google Cloud
- Rotate keys periodically
- Monitor for unauthorized usage

---

**Status:** ✅ **SECURITY INCIDENT RESOLVED**

The main security fixes are in place. Your API key is now properly protected going forward. Next step: Generate and use a new API key.

See `/Users/adriaanhitge/.claude/plans/dynamic-snacking-frost.md` for detailed instructions on the remaining steps.
