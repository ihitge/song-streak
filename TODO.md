# Development Notes & Future Features

## Recent Changes (January 10, 2026)

### Sound Recorder - Save, Playback & Band Sharing

**Feature**: Complete voice memo management system for the Ideas/Idea Bank tab.

**User Flow**:
1. User opens Ideas tab → sees Sound Recorder in RECORD view
2. Taps Record → Recording starts (30 sec max)
3. Taps Stop → Save Panel slides in with title input + band picker
4. User enters title, optionally selects band, taps SAVE
5. Recording uploads to Supabase Storage
6. User can toggle to LIBRARY view to see all saved memos
7. In LIBRARY, can play/share/delete memos

**New Files**:
- `components/ui/recorder/SaveRecordingPanel.tsx` - Inline save panel with title + band picker
- `components/ui/modals/ShareToBandModal.tsx` - Modal for sharing existing memos to bands

**Modified Files**:
- `app/(tabs)/ideas.tsx` - Complete rewrite with view toggle, save flow, playback, share modal
- `components/ui/recorder/ReelToReelRecorder.tsx` - Added `enableSaveFlow`, `bands`, `onSave` props
- `components/ui/recorder/index.ts` - Export SaveRecordingPanel
- `components/ui/modals/index.ts` - Export ShareToBandModal

**Features**:
- VIEW toggle (RECORD/LIBRARY) using GangSwitch
- Inline save panel after stopping recording
- Optional band sharing at save time
- Web audio playback with signed URLs (1-hour expiry)
- Share existing memos to bands via modal
- Delete with confirmation dialog
- Empty state for library view

---

### Colors.deepSpaceBlue Deprecated

**Change**: Removed all usages of `Colors.deepSpaceBlue` (#0E273C) from the codebase. This teal/dark blue color was inconsistent with the app's dark theme.

**Replacement**: All instances now use `Colors.charcoal` (#333333) for consistent dark variant styling.

**Files Updated (25+ total)**:
- Filter components (RotaryKnob, FrequencyTuner, InsetWindow - native and web)
- Tuner components (TunerMeter, TunerNoteDisplay)
- Modal components (VoiceMemoModal, StyledAlertModal, CircleOfFifthsModal, ChordChartModal)
- Milestone/Trophy components (Trophy, MilestoneProgress, TrophyCase)
- LED indicators (LEDIndicator - native and web)
- Mastery components (SkillNode - native and web)
- Other components (VoiceMemosList, add-song.tsx)
- Constants (Colors.ts now marks deepSpaceBlue as deprecated, Styles.ts)
- Types (mastery.ts PATH_COLORS)
- Documentation (CLAUDE.md, design_system.md, STATUS.md)

**Note**: `Colors.deepSpaceBlue` still exists in Colors.ts for backwards compatibility but is marked as deprecated with a JSDoc comment.

### Unified Page Layout - Single Dark Device Casing

**Problem**: Pages had inconsistent visual structure - PageHeader had light background while DeviceCasing had dark background, creating a visual seam. Additionally, some panel components (ReelToReelRecorder, VUMeterDisplay) had their own internal housing/titles that duplicated DeviceCasing's styling.

**Solution**: Unified all pages to use a single dark container from top to bottom:

**PageHeader Changes** (`components/ui/PageHeader.tsx`):
- Background: `Colors.matteFog` → `Colors.ink` (dark)
- Logo SVG fill: `#221310` → `#E4DFDA` (light for dark bg)
- Avatar button: Dark styling with `Colors.charcoal` bg, `Colors.warmGray` border
- Logout icon: `Colors.charcoal` → `Colors.softWhite`

**Page Container Changes** (5 files):
- `app/(tabs)/timing.tsx`, `tuner.tsx`, `ideas.tsx`, `streaks.tsx`, `index.tsx`
- All changed from `Colors.matteFog` → `Colors.ink`

**Panel Component Fixes**:
- `ReelToReelRecorder.tsx`: Internal header (title + screws) now hidden when `fullWidth=true`
- `VUMeterDisplay.tsx`: `housingFullWidth` now includes `backgroundColor: 'transparent'`
- Both components no longer create nested visual containers when embedded in DeviceCasing

### Streaks Page Performance Improvement

**Problem**: Streaks page showed a dark blue/teal (`Colors.deepSpaceBlue`) loading placeholder and felt slow because it blocked rendering until ALL 4 data hooks completed.

**Solution**:
- Removed blocking loading state with `loadingPlaceholder`
- Page now renders immediately with progressive content loading
- Each component uses fallback values (`?? 0`) to render before data arrives
- Removed unused `Colors.deepSpaceBlue` loading placeholder style

### Branding Standardization

**Change**: Renamed all instances of "Song Streak" to "SongStreak" (one word, both S's capitalized).

**Files Updated (18 total)**:
- `app.json`, `app.config.js` - App name and iOS permission strings
- `utils/logger.ts`, `hooks/tuner/useAudioSession.ts` - Code comments
- Documentation files (CLAUDE.md, STATUS.md, PRD.md, COMPONENTS.md, etc.)
- Legal documents (docs/TERMS.md, docs/PRIVACY.md)

### Login Page Updates

**Changes**:
- Replaced text "SongStreak" with app icon image (80x80px)
- Added Image import and logo style in `app/(auth)/index.tsx`
- Matched Google Sign-In button height (50px) with Apple Sign-In
- Both social login buttons now have consistent styling

**Files**:
- `app/(auth)/index.tsx` - Logo image display
- `components/auth/GoogleSignInButton.tsx` - Fixed 50px height container

---

## Recent Changes (January 7, 2026)

### FAB Centering & Consistent Position

**Problem**: FAB buttons were not consistently positioned across pages. Library page FAB was at bottom-right, while other pages had varying positions based on panel content.

**Solution**: Standardized all primary FAB buttons to be horizontally centered with consistent 24px bottom margin:

**Changes**:
- `app/(tabs)/index.tsx` - FAB container uses `left: 0, right: 0, alignItems: 'center'`
- `app/(tabs)/timing.tsx` - Extracted TransportControls to dedicated `fabSection`
- `app/(tabs)/tuner.tsx` - Extracted TunerControls to dedicated `fabSection`
- `components/ui/metronome/MetronomePanel.tsx` - Added `showTransport` prop (default true)
- `components/ui/tuner/TunerPanel.tsx` - Added `showControls` prop (default true)
- `components/ui/recorder/ReelToReelRecorder.tsx` - Added `showTransport` prop, `fullWidth` layout support

**Result**: All pages now have consistent FAB placement for easy thumb access.

### Access Control Page Labels

**Changes**: Updated auth form labels to conventional naming:
- "Identity" → "User Name"
- "Security Key" → "Password"
- "Confirm Key" → "Confirm Password"
- "Grant Access" → "Login"
- "Create Credentials" → "Register"
- "Forgot Security Key?" → "Forgot Password?"

**File**: `app/(auth)/index.tsx`

### Webapp Width Constraint

**Problem**: Webapp stretched to full viewport width, making UI elements too spread out.

**Solution**: Added 600px max-width with centered layout on web platform only.

**File**: `app/(tabs)/_layout.tsx`

### Metronome Pendulum Animation (Wittner Style)

**Problem**: The metronome needle was jumping between discrete beat positions (1, 2, 3, 4) instead of swinging smoothly like a real mechanical metronome.

**Solution**: Implemented true pendulum animation using continuous sine wave motion:
- **Formula**: `position = -cos(2π × t / beatPeriod)` for smooth pendulum swing
- **Timing**: Click occurs at left extreme only (Wittner mechanical style)
- **Animation**: 60fps via `requestAnimationFrame` (decoupled from React state)
- **Sync**: `metronomeStartTime` exported from hook for phase synchronization

**Files Changed**:
- `hooks/useMetronome.ts` - Added `metronomeStartTime` state
- `hooks/useMetronome.web.ts` - Added `metronomeStartTime` state
- `hooks/useMetronome.legacy.ts` - Added stub for backward compatibility
- `types/metronome.ts` - Added `metronomeStartTime` to return interface
- `components/ui/practice/VUMeterDisplay.tsx` - New pendulum animation using RAF
- `components/ui/metronome/MetronomePanel.tsx` - Pass new props to VUMeterDisplay
- `app/(tabs)/timing.tsx` - Pass `metronomeStartTime` to panel
- `app/(tabs)/practice.tsx` - Pass `metronomeStartTime` to panel

**Visual Updates**:
- Deeper meter face height (112→140px full, 80→100px compact)
- Visual separator line between beat counter and pendulum area
- Beat counter LEDs remain independent (light up on `currentBeat`)

### iOS Simulator Timeout Fix

**Problem**: iOS simulator failed to open `exp://` URLs with error code 60 (Operation timed out). Expo uses LAN mode by default, broadcasting on the machine's local IP which the simulator couldn't reliably reach.

**Fix**: Updated `package.json` scripts to use `--localhost` flag for simulator development:
- `npm run ios` - Now uses `--localhost` (fixes timeout)
- `npm run ios:lan` - LAN mode for physical device on same network
- `npm run ios:tunnel` - Tunnel mode for remote physical device
- `npm run start:local` - General localhost development

### expo-av to expo-audio Migration (Complete)

**Problem**: expo-av deprecated warning on startup - will be removed in SDK 54.

**Fix**: Migrated the last remaining expo-av usage in `usePracticePlayer.ts`:
- `Audio.Sound.createAsync()` → `createAudioPlayer()`
- `setRateAsync(rate, shouldCorrectPitch)` → `setPlaybackRate(rate, 'high')`
- `setPositionAsync(ms)` → `seekTo(seconds)`
- `setVolumeAsync()` → `player.volume = value`
- Playback status callbacks → polling every 100ms
- Removed `expo-av` from `package.json`

### Ideas Tab (Idea Bank)

**New Tab**: Added 5th navigation tab "Idea Bank" with voice recorder interface.

**Files**:
- `app/(tabs)/ideas.tsx` - Ideas screen with ReelToReelRecorder
- Tab label changed from "Ideas" to "Idea Bank" for clarity

### Playwright Screenshots Cleanup

- Added `.playwright-mcp/` to `.gitignore`
- Removed all tracked Playwright test screenshots
- Added ignore rules for loose `.png`/`.jpeg` in project root (except assets/)

---

## Recent Changes (January 4, 2026)

### Metronome VU Meter Needle Fix

**Problem**: The VU meter needle wasn't pointing accurately at beat markers (1, 2, 3, 4). When beat 4's LED lit, the needle pointed toward beat 3.

**Root Cause**: Geometry mismatch - needle arc (72px at ±45°) reached positions ~89px to ~191px, but beat markers with `space-between` layout were at ~16px to ~264px.

**Fix**:
- `VUMeterDisplay.tsx`: Changed beat markers to absolute positioning within needle arc range
- `useMetronome.ts`: Updated `beatPosition` calculation to map beats linearly (1→0, 2→0.33, 3→0.67, 4→1)

### 5-Tab Navigation - Ideas Tab Added

**New Tab**: Added "Ideas" tab with microphone icon for voice recorder access.

**Changes**:
- `TactileNavbar.tsx`: Added 5th nav item (Ideas → /ideas route)
- `NavButton.tsx`: Added `compact` prop for smaller buttons in 5-tab layout
- Reduced navbar padding for tighter 5-button fit

### Voice Recorder UI Overhaul

**TapeReel Redesign** - Clean minimalist film reel icon:
- Thin outer ring with 3 triangular cutouts
- Center circle design (arc-loader.jpeg reference)
- Unified single-reel design (removed dual-reel complexity)
- Recording state changes accent glow color

**SpeedSelector Light Variant**:
- Switched to light variant styling (was dark)
- Vermilion label color to match FrequencyTuner
- Light background (`Colors.softWhite`) with dark text
- Updated both native and web versions

**Transport Controls Simplification**:
- Streamlined to essential controls only
- Consistent styling with metronome transport

**Removed Components**:
- `RecorderVUMeter.tsx` - Consolidated into shared VUMeterDisplay
- `TapePath.tsx` - Removed tape path animation (simplified design)

### RotaryKnob Light Variant Fix

- Added `knobFaceColor` variable for variant-aware knob styling
- Light variant now uses `Colors.alloy` (was always charcoal)
- Applied to both native and web versions

---

## Recent Changes (January 3, 2026)

### UI Consistency & Polish

**Typography & Labels**
- Unified all filter labels to orange (`Colors.vermilion`) via shared `Typography.label` style
- Removed local color overrides in FrequencyTuner, FrequencyTuner.web, and TunerStringSelector
- Tuner labels now consistent: "TUNING", "STRINGS", "METER" (or "PLAY A STRING" when idle)

**Filter Component Swap**
- Instrument filter now uses RotaryKnob (was FrequencyTuner)
- Genre filter now uses FrequencyTuner (was RotaryKnob)
- Added `variant` prop support to RotaryKnob for light/dark theming

**Layout & Spacing**
- Tuner page now matches song page layout with 24px padding
- All tuner elements (FrequencyTuner, Strings, VU Meter) now full-width
- Song page content area has dark background (`Colors.ink`)
- Removed white border artifact above TactileNavbar

**Component Updates**
- TunerVUMeter: Restructured with proper label positioning above meter
- TunerPanel: Full-width header container
- TunerStringSelector: Uses shared Typography.label style
- RotaryKnob: Added variant prop for light/dark theming

---

## Ralph Loop Skill Available 🔄

**Added**: January 10, 2026

The `/ralph-loop` skill is available for iterative, self-referential development tasks. It creates a loop where Claude's output becomes the next iteration's input, allowing for progressive refinement.

**Usage:**
```bash
/ralph-loop <task description> --max-iterations <n> --completion-promise '<phrase>'
```

**Examples:**
```bash
/ralph-loop Fix all TypeScript errors --max-iterations 10
/ralph-loop Refactor auth module --completion-promise 'All tests passing'
/ralph-loop Build REST API --max-iterations 20 --completion-promise 'DONE'
```

**Best For:**
- Long refactoring tasks requiring multiple passes
- Iterative code improvement until tests pass
- Complex debugging with progressive context
- Tasks where "keep going until done" is the goal

**Caution:**
- Without `--max-iterations` or `--completion-promise`, loop runs infinitely
- Each iteration accumulates context (can get expensive)
- Only output completion promise when genuinely complete

**Commands:**
- `/ralph-loop` - Start a new loop
- `/cancel-ralph` - Cancel active loop
- `/ralph-wiggum:help` - Show help

---

## EAS Update (OTA) Now Configured ✅

**Added**: January 25, 2026

**CRITICAL**: Use `eas update` (FREE) instead of `eas build` (EXPENSIVE) for JS-only changes!

| Change Type | Command | Cost |
|-------------|---------|------|
| JS/TS code, styling, assets | `eas update --channel preview --message "..."` | **FREE** |
| Native changes only | `eas build --platform ios --profile preview` | Uses credits |

**Skill Available**: `/eas-deploy` - Analyzes changes and chooses optimal deployment method.

**Documentation**: `~/.claude/skills/eas-deploy/SKILL.md`

---

## PrimaryButton Component Added ✅

**Added**: January 25, 2026

Replaced FAB component with new `PrimaryButton` for reliable cross-platform rendering (especially iOS native builds).

**Location**: `components/ui/PrimaryButton.tsx`

**Usage**:
- ADD SONG button (Songs page)
- START/STOP button (Tuner page)
- RECORD button (Idea Bank)
- ENABLE MIC button (Permission prompts)
- Play/Pause button (Metronome)

**Note**: FAB component is now deprecated. Use PrimaryButton with `size="circle"` for circular buttons.

---

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
- **Branding Audit**: ✅ **COMPLETED** - Standardized app name spelling ("SongStreak") across all UI elements and metadata.
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
