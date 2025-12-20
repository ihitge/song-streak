# Development Notes & Future Features

## Browser Testing Now Available ✅

**Updated**: December 18, 2025

Claude Code can now perform **full automated browser testing** via Playwright MCP for this project. This means:

✅ **New Testing Workflow**:
- No more "user must test in browser" disclaimers
- Can navigate the app and test features
- Screenshots provide visual evidence
- Complete user flows can be verified
- Test tasks can be marked complete with confidence

📖 **How to Use**:
1. Start dev server: `npm run web`
2. Ask Claude to test: *"Navigate to http://localhost:8081, test [feature], take screenshots, verify [expected result]"*
3. Claude will test automatically and report with evidence

📚 **Documentation**:
- [QUICK_TEST_REFERENCE.md](QUICK_TEST_REFERENCE.md) - Quick patterns & examples
- [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md) - Comprehensive guide
- [PLAYWRIGHT_MCP_SETUP.md](PLAYWRIGHT_MCP_SETUP.md) - Technical details
- [MCP_TESTING_VERIFIED.md](MCP_TESTING_VERIFIED.md) - Verification report

**Benefits for Development**:
- Test new features before committing
- Verify UI rendering and layout
- Test form interaction and validation
- Regression test existing features
- Capture screenshots for design verification
- Speed up development cycle

---

# Future Features

## 1. Setlist Flow (Transition Gaps)

**Pain Point:** Bands practice songs individually but fail to practice transitions. Awkward dead air on stage while tuning or counting off.

**Features:**
- **Segue Cables**: Visual "cable" graphic connecting song cards to indicate seamless transitions
- **Tuning Alerts**: Display tuning info (e.g., "Drop D") on cards; warn if adjacent songs have different tunings
- **Transition Notes**: Metadata for "Segue immediately" or "Talk to crowd here"

---

## 2. Tempo Match (Tempo Drift)

**Pain Point:** Adrenaline makes bands play faster live. Practicing without metronome creates false security.

**Features:**
- **Auto BPM Sync**: When hitting "Practice," metronome defaults to song's detected BPM
- **"Match Original" Button**: Instantly snaps metronome dial to song's BPM
- Leverage existing video BPM extraction

---

## 3. Global Transpose (Last Minute Transposition)

**Pain Point:** Singer needs to drop key at soundcheck; musicians scramble to transpose on the fly.

**Features:**
- **Transpose Knob**: RotaryKnob for +/- semitones
- **Instant Chord Shift**: Updates all chords in Theory tab instantly
- **Audio Feedback**: Mechanical "thud" sound when shifting key
- Visual update of chord grid (E → Eb)

---

## 4. Decay Tracker (Song Health)

**Pain Point:** Musicians struggle to balance new songs vs. keeping old songs fresh. Forget songs not played in a month.

**Features:**
- **Signal Strength Meter**: Visual indicator on Song Cards (like radio signal)
- **Health Logic:**
  - Practiced today → 100% Green LED
  - 2 weeks → 50% Yellow LED
  - 1 month → "Lost" Red LED/Static
- **"Repair Signal" Mode**: Auto-generate playlist of decaying songs

---

## 5. Apple Submission & Compliance

**Action Items:**
- **Secure Gemini API**: Move API key and analysis logic to Supabase Edge Functions to prevent client-side exposure.
- **Account Deletion**: Add mandatory "Delete Account" button in Support tab with cascading deletion of user data.
- **Social Auth Verification**: Ensure Apple and Google Sign-In are fully configured for Production (production bundle identifiers and client IDs).
- **Branding Audit**: Standardize app name spelling ("Song Streak") across all UI elements and metadata.
- **Legal Requirements [CRITICAL]**: ✅ **COMPLETED** - Privacy Policy and Terms of Service fully rewritten and aligned with app.
    - Privacy Policy: 14 sections, UK GDPR + EU GDPR + CCPA compliant
    - Terms of Service: 16 sections, Apple App Store compliant (account deletion rights)
    - All third-party services documented (Supabase, Google Sign-In, Apple Sign-In, Gemini AI, iTunes API, Lyrics APIs)
    - **Sign-Up Screen**: Add "By registering, you agree to..." text with links in `app/(auth)/index.tsx`.
    - **Support Tab**: Update `components/ui/account/SupportTab.tsx` with live links for App Store reviewers.
    - **Before Launch**: Replace `[DEVELOPER_NAME]`, `[DEVELOPER_EMAIL]`, `[DEVELOPER_COUNTRY]` placeholders in legal docs.
- **Final Assets**: Replace generic Expo images with high-resolution app icon, adaptive icons, and splash screen.
- **Metadata Polish**: Finalize versioning (1.0.0) and descriptive permission strings (Camera/Media) in `app.json`.

---

## Priority Summary

| Feature | Complexity | Impact |
|---------|------------|--------|
| Secure Gemini API | Medium | Critical |
| Account Deletion | Low | Critical |
| Legal/Compliance | Low | Critical |
| Tempo Match | Low | High |
| Final Assets | Low | High |
| Decay Tracker | Medium | High |
| Global Transpose | Medium | Medium |
| Setlist Transitions | High | Medium |
