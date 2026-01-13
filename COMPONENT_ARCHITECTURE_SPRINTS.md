# Component Architecture Improvement Sprints

Generated from Component Architecture Agent Review - January 13, 2026

---

## Sprint Overview

| Sprint | Focus | Effort | Impact |
|--------|-------|--------|--------|
| **Sprint 1** | React.memo & FlatList Performance | 1.5 hours | High |
| **Sprint 2** | Accessibility Improvements | 1.5 hours | High |
| **Sprint 3** | TypeScript Cleanup | 1 hour | Medium |
| **Sprint 4** | Advanced Optimizations | 2 hours | Medium |

---

## Sprint 1: React.memo & FlatList Performance (Critical) ✅ COMPLETED

**Goal:** Reduce unnecessary re-renders and improve list scrolling performance

### Tasks

- [x] **1.1** Add React.memo to `AchievementBadge.tsx` (5 min) ✅
- [x] **1.2** Add React.memo to `BandCard.tsx` (5 min) ✅
- [x] **1.3** Add React.memo to `TheoryChipGroup.tsx` (5 min) ✅
- [x] **1.4** Add React.memo to `SearchSuggestions.tsx` HighlightedText (5 min) ✅
- [x] **1.5** Add React.memo to `AchievementModal.tsx` (5 min) ✅
- [x] **1.6** Add React.memo to `StreakFlame.tsx` (5 min) ✅
- [x] **1.7** Add React.memo to `PracticeTimer.tsx` (5 min) ✅
- [x] **1.8** Add React.memo to `SetlistCard.tsx` (5 min) ✅
- [x] **1.9** Fix inline onPress in SongCard FlatList + memoize SongCard (`index.tsx`) ✅
- [x] **1.10** Add FlatList performance options to Library screen ✅
  - Added `getItemLayout` for fixed-height items
  - Added `removeClippedSubviews={true}`
  - Added `maxToRenderPerBatch={10}`
  - Added `updateCellsBatchingPeriod={50}`
  - Added `initialNumToRender={8}`
  - Added `windowSize={5}`
- [x] **1.11** Memoize MetronomePanel option transforms with `useMemo` ✅

**Completed:** January 13, 2026

---

## Sprint 2: Accessibility Improvements ✅ COMPLETED

**Goal:** Improve screen reader support and motion preferences

### Tasks

- [x] **2.1** Apply `useReducedMotion` to `RotaryKnob.tsx` ✅
  - Added conditional animation for knob rotation
  - Uses FadeIn/FadeOut instead of slide animations when reduced motion preferred
- [x] **2.2** Apply `useReducedMotion` to `GangSwitch.tsx` ✅
  - Added conditional loading spinner animation
  - Skips rotation animation when reduced motion preferred
- [x] **2.3** Apply `useReducedMotion` to `FrequencyTuner.tsx` ✅
  - Uses FadeIn/FadeOut instead of slide animations for value display
- [x] **2.4** Add `accessibilityViewIsModal` to `StyledAlertModal.tsx` ✅
- [x] **2.5** Add `accessibilityViewIsModal` to `PracticePlayerModal.tsx` ✅
- [x] **2.6** Add `accessibilityViewIsModal` to `VideoPlayerModal.tsx` ✅
- [x] **2.7** Add `accessibilityViewIsModal` to `AchievementModal.tsx` ✅
- [x] **2.8** Add `accessibilityViewIsModal` to `CreateBandModal.tsx` ✅
- [x] **2.9** Add `accessibilityViewIsModal` to `JoinBandModal.tsx` ✅
- [x] **2.10** Add focus management to StyledAlertModal ✅
  - Added AccessibilityInfo.setAccessibilityFocus on modal open
  - Added accessibilityRole="alert" and accessibilityLiveRegion="assertive"
  - Modal content announces title and message to screen readers

**Completed:** January 13, 2026

---

## Sprint 3: TypeScript Cleanup ✅ COMPLETED

**Goal:** Remove `any` types and improve type safety

### Tasks

- [x] **3.1** Create `/types/database.ts` for Supabase schema types ✅
  - Created comprehensive type definitions for all 16 database tables
  - Added `DbSong`, `DbPracticeSession`, `DbUserStreak`, etc.
  - Added `getErrorMessage()` and `isErrorWithMessage()` utility functions
- [x] **3.2** Replace `any` in database row mapping (`index.tsx:140`) ✅
  - Changed `(row: any)` to `(row: DbSong)`
  - Fixed field mappings: `techniques` → `genres`, documented derived fields
- [x] **3.3** Extract `RamsInput` component with proper interface ✅
  - Added `RamsInputProps` interface extending `TextInputProps`
  - Added JSDoc documentation for the component
- [x] **3.4** Replace `catch (error: any)` with `unknown` + guards ✅
  - Updated `useAccountDeletion.ts` to use `error: unknown` + `getErrorMessage()`
  - Updated `ProfileTab.tsx` to use `error: unknown` + `getErrorMessage()`

**Completed:** January 13, 2026

---

## Sprint 4: Advanced Optimizations ✅ COMPLETED

**Goal:** Further performance and code quality improvements

### Tasks

- [x] **4.1** Add Web Audio API types to `useMetronomeSound.ts` ✅
  - Created `types/audio.ts` with comprehensive Web Audio API type definitions
  - Added `AudioContextType`, `AudioBufferType`, `GainNodeType`, `AudioBufferSourceNodeType`
  - Added `MetronomeAudioBuffers` interface for sound buffer collections
- [x] **4.2** Define metronome sound asset types in `types/audio.ts` ✅
  - Combined with 4.1 - added `AudioAssetModule` type for require() assets
- [x] **4.3** Memoize inline style objects in `AchievementBadge.tsx` ✅
  - Added `useMemo` for `dimensions`, `outerRingStyle`, `innerBadgeStyle`
  - Moved `TIER_GRADIENTS` outside component as static constant
- [x] **4.4** Add `useCallback` to VoiceMemosList item callbacks ✅
  - Already properly implemented with `useCallback` for `handleRefresh`, `renderItem`, `keyExtractor`
- [x] **4.5** Memoize StreakCalendar color/intensity functions ✅
  - Added `useCallback` to `handleNavigation`, `getDayIntensity`, `getIntensityColor`
  - Added proper dependency arrays for memoization
- [x] **4.6** Add image caching strategy (expo-image) ✅
  - Installed `expo-image` package
  - Migrated 3 components from React Native `Image` to `expo-image`:
    - `app/(tabs)/index.tsx` - Song thumbnails with `cachePolicy="memory-disk"`
    - `components/ui/account/ProfileTab.tsx` - User avatars
    - `components/ui/VideoPlaceholder.tsx` - YouTube thumbnails
  - Added `contentFit="cover"`, `transition` animations for smooth loading

**Completed:** January 13, 2026

---

## Progress Tracking

### Sprint 1 Status: ✅ Completed (January 13, 2026)
### Sprint 2 Status: ✅ Completed (January 13, 2026)
### Sprint 3 Status: ✅ Completed (January 13, 2026)
### Sprint 4 Status: ✅ Completed (January 13, 2026)

---

## Notes

- Each task includes file path in the task description
- React.memo should use shallow comparison (default)
- For components with callback props, ensure parent uses useCallback
- Test each change with React DevTools Profiler if available
