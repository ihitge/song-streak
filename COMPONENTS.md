# Song Streak Component Library

> **For Claude AI**: Always check this file before creating new UI components. Reuse existing components to avoid tech debt.

---

## Quick Reference

| Component | Purpose | Location |
|-----------|---------|----------|
| `PageHeader` | **Reusable page header with logo and user controls** | `components/ui/PageHeader.tsx` |
| `NavButton` | Tactile navigation button with LED indicator + audio/haptic feedback | `components/ui/NavButton.tsx` |
| `GangSwitch` | Horizontal/vertical switch with LED indicators | `components/ui/filters/GangSwitch.tsx` |
| `FrequencyTuner` | Horizontal tuner with glass overlay | `components/ui/filters/FrequencyTuner.tsx` |
| `RotaryKnob` | Rotary control with digital readout | `components/ui/filters/RotaryKnob.tsx` |
| `TactileNavbar` | Bottom navigation bar | `components/ui/TactileNavbar.tsx` |
| `LibraryHeader` | Page header with search and filters (uses PageHeader) | `components/ui/LibraryHeader.tsx` |
| `SearchSuggestions` | Dropdown for search results | `components/ui/SearchSuggestions.tsx` |
| `ProfileTab` | User profile display in Account screen | `components/ui/account/ProfileTab.tsx` |
| `SettingsTab` | App settings toggles (dark mode, sound) | `components/ui/account/SettingsTab.tsx` |
| `BillingTab` | Billing/subscription placeholder | `components/ui/account/BillingTab.tsx` |
| `SupportTab` | Help, about, and sign out | `components/ui/account/SupportTab.tsx` |
| `StyledAlertModal` | **Styled alert/confirm modal (replaces native Alert)** | `components/ui/modals/StyledAlertModal.tsx` |
| `PracticeCompleteModal` | Practice session logged modal | `components/ui/practice/PracticeCompleteModal.tsx` |
| `AchievementModal` | Achievement unlocked celebration modal | `components/ui/practice/AchievementModal.tsx` |
| `CreateBandModal` | Modal for creating a new band | `components/ui/bands/CreateBandModal.tsx` |
| `JoinBandModal` | Modal for joining a band via code | `components/ui/bands/JoinBandModal.tsx` |
| `VideoPlayerModal` | YouTube video player modal | `components/ui/VideoPlayerModal.tsx` |
| `BandCard` | Band display card with expandable setlists | `components/ui/bands/BandCard.tsx` |
| `SetlistCard` | Setlist display card | `components/ui/bands/SetlistCard.tsx` |
| `BPMDisplay` | Tappable BPM display with tap tempo | `components/ui/metronome/BPMDisplay.tsx` |
| `MetronomeControls` | Time signature and subdivision controls | `components/ui/metronome/MetronomeControls.tsx` |
| `MetronomePanel` | **Composite: VU meter + BPM + session timer** | `components/ui/metronome/MetronomePanel.tsx` |
| `TransportControls` | Play/pause/reset/log buttons for metronome | `components/ui/metronome/TransportControls.tsx` |
| `TunerMeter` | Visual meter showing pitch deviation (-50 to +50 cents) | `components/ui/tuner/TunerMeter.tsx` |
| `TunerNoteDisplay` | Note display with frequency, deviation, and guidance | `components/ui/tuner/TunerNoteDisplay.tsx` |
| `TunerStringSelector` | Row of 6 guitar string buttons with LED indicators | `components/ui/tuner/TunerStringSelector.tsx` |
| `TunerControls` | Start/Stop button and signal strength meter | `components/ui/tuner/TunerControls.tsx` |
| `RamsTapeCounterDisplay` | Flip-chart style time display (MM:SS) | `components/ui/practice/RamsTapeCounterDisplay.tsx` |
| `PracticePlayerModal` | **Audio playback with speed/pitch control** | `components/ui/practice/PracticePlayerModal.tsx` |
| `PlaybackControls` | Speed slider and playback transport | `components/ui/practice/PlaybackControls.tsx` |
| `InsetWindow` | **Reusable Skia inset window (dark/light variants)** | `components/ui/InsetWindow.tsx` |
| `LEDIndicator` | **Skeuomorphic LED with metal bezel and bloom** | `components/skia/primitives/LEDIndicator.tsx` |
| `GlassOverlay` | **Skia-based glass effect overlay (glare, specular highlight, bezel)** | `components/ui/GlassOverlay.tsx` |
| `InsetShadowOverlay` | **Recessed depth effect via edge gradients** | `components/skia/primitives/InsetShadowOverlay.tsx` |
| `SurfaceTextureOverlay` | **Noise/grain texture for dust/scratches on glass** | `components/skia/primitives/SurfaceTextureOverlay.tsx` |
| `TheorySection` | **Section container with label + alloy content box** | `components/ui/theory/TheorySection.tsx` |
| `TheoryMetricsRow` | **2x2 grid display for Tuning, Key, Tempo, Time Signature. Tap Key to open Circle of Fifths** | `components/ui/theory/TheoryMetricsRow.tsx` |
| `TheoryChipGroup` | **Labeled chip container for chords/scales/techniques** | `components/ui/theory/TheoryChipGroup.tsx` |
| `CircleOfFifths` | **Interactive rotatable circle of fifths visualization (Skia)** | `components/ui/theory/CircleOfFifths.tsx` |
| `CircleOfFifthsModal` | **Modal wrapper for Circle of Fifths with mode selector** | `components/ui/theory/CircleOfFifthsModal.tsx` |
| `TheoryChordSection` | **Chord diagrams with floating delete button (top-right)** | `components/ui/theory/TheoryChordSection.tsx` |
| `ChordChartModal` | **Full-screen chord diagram modal** | `components/ui/theory/ChordChartModal.tsx` |
| `AddChordModal` | **Modal for manually adding chords** | `components/ui/theory/chords/AddChordModal.tsx` |
| `GuitarChordDiagram` | **Skia-based guitar chord visualization** | `components/ui/theory/chords/GuitarChordDiagram.tsx` |
| `ChordVisualization` | **Unified chord diagram wrapper (multi-instrument)** | `components/ui/theory/chords/ChordVisualization.tsx` |
| `ChordChip` | **Tappable chord chip with diagram indicator + delete** | `components/ui/theory/chords/ChordChip.tsx` |
| `StreakFlame` | **Animated streak flame (evolves with streak days)** | `components/ui/streaks/StreakFlame.tsx` |
| `StreakStats` | Current/longest streak display | `components/ui/streaks/StreakStats.tsx` |
| `StreakFreezeIndicator` | Snowflake icons for streak freezes | `components/ui/streaks/StreakFreezeIndicator.tsx` |
| `DailyGoalProgress` | Today's progress bar toward goal | `components/ui/streaks/DailyGoalProgress.tsx` |
| `DailyGoalSelector` | 15/30/60 min goal selector | `components/ui/streaks/DailyGoalSelector.tsx` |
| `StreakCalendar` | **GitHub-style practice calendar** | `components/ui/streaks/StreakCalendar.tsx` |
| `SkillTree` | **Radial 3-path mastery visualization** | `components/ui/mastery/SkillTree.tsx` |
| `SkillNode` | Individual skill tree node | `components/ui/mastery/SkillNode.tsx` |
| `MiniSkillTree` | Compact 3-star mastery display | `components/ui/mastery/MiniSkillTree.tsx` |
| `StarRating` | 0-3 star rating display | `components/ui/mastery/StarRating.tsx` |
| `Trophy` | **Individual trophy with tier styling** | `components/ui/milestones/Trophy.tsx` |
| `TrophyCase` | **Trophy shelves by category** | `components/ui/milestones/TrophyCase.tsx` |
| `MilestoneProgress` | Progress bar to next milestone | `components/ui/milestones/MilestoneProgress.tsx` |
| `StatsDashboard` | **2x2 grid of global stats** | `components/ui/milestones/StatsDashboard.tsx` |
| `DailyGoalModal` | **Celebration: daily goal achieved** | `components/ui/streaks/DailyGoalModal.tsx` |
| `MilestoneModal` | **Celebration: lifetime trophy unlock** | `components/ui/milestones/MilestoneModal.tsx` |
| `StreakMilestoneModal` | **Celebration: streak milestone reached** | `components/ui/streaks/StreakMilestoneModal.tsx` |
| `ReelToReelRecorder` | **Full skeuomorphic voice recorder** | `components/ui/recorder/ReelToReelRecorder.tsx` |
| `TapeReel` | Animated spinning tape reel (Skia) | `components/ui/recorder/TapeReel.tsx` |
| `TapePath` | Animated tape line between reels | `components/ui/recorder/TapePath.tsx` |
| `RecorderVUMeter` | Dual stereo VU meter display | `components/ui/recorder/RecorderVUMeter.tsx` |
| `TapeCounter` | Mechanical flip time counter | `components/ui/recorder/TapeCounter.tsx` |
| `SpeedSelector` | SLOW/NORMAL/FAST speed picker | `components/ui/recorder/SpeedSelector.tsx` |
| `RecorderTransportControls` | 5-button transport (REC/STOP/PLAY/REW/FF) | `components/ui/recorder/TransportControls.tsx` |
| `VoiceMemosList` | List of voice memos with playback | `components/ui/recorder/VoiceMemosList.tsx` |
| `VoiceMemoModal` | **Modal containing recorder + library** | `components/ui/modals/VoiceMemoModal.tsx` |

### Hooks

| Hook | Purpose | Sound File | Location |
|------|---------|------------|----------|
| `useSignOut` | Centralized sign-out logic with error handling | N/A | `hooks/useSignOut.ts` |
| `useSettings` | App settings (dark mode, sound enabled) | N/A | `hooks/useSettings.ts` |
| `useStyledAlert` | **Styled alert system (replaces native Alert.alert)** | N/A | `hooks/useStyledAlert.tsx` |
| `useAccountDeletion` | **Account deletion with confirmation (Apple requirement)** | N/A | `hooks/useAccountDeletion.ts` |
| `useUISound` | **Base hook for all UI sounds (consolidated)** | configurable | `hooks/useUISound.ts` |
| `useNavButtonSound` | Audio feedback for NavButton (large nav) | sound-nav-button.wav | `hooks/useNavButtonSound.ts` |
| `useGangSwitchSound` | Audio feedback for GangSwitch (small filters) | sound-gang-switch.wav | `hooks/useGangSwitchSound.ts` |
| `useRotaryKnobSound` | Audio feedback for RotaryKnob (genre selector) | sound-rotary-knob.wav | `hooks/useRotaryKnobSound.ts` |
| `useFABSound` | Audio feedback for FAB (add song button) | sound-fab.wav | `hooks/useFABSound.ts` |
| `useClickSound` | Audio feedback for shared components | sound-shared-click.mp3 | `hooks/useClickSound.ts` |
| `useChordChartSound` | Audio feedback for chord chart interactions | sound-shared-click.mp3 | `hooks/useChordChartSound.ts` |
| `useBands` | Band management (create, join, list bands) | N/A | `hooks/useBands.ts` |
| `useSetlists` | Setlist management for bands | N/A | `hooks/useSetlists.ts` |
| `usePracticeData` | Practice session tracking and achievements | N/A | `hooks/usePracticeData.ts` |
| `useSearch` | Debounced search with relevance scoring | N/A | `hooks/useSearch.ts` |
| `useMetronome` | Core metronome logic with drift-corrected timing | N/A | `hooks/useMetronome.ts` |
| `useMetronomeSound` | Sound pool for metronome (click, snare, bass, hihat) | metronome-*.wav, sound-click-*.wav | `hooks/useMetronomeSound.ts` |
| `usePracticePlayer` | **Audio playback with speed control (pitch preserved)** | N/A | `hooks/usePracticePlayer.ts` |
| `useTunerMachine` | **Guitar tuner state machine with pitch detection** | N/A | `hooks/tuner/useTunerMachine.ts` |
| `usePitchDetection` | Pitch detection using pitchy (McLeod Pitch Method) | N/A | `hooks/tuner/usePitchDetection.ts` |
| `useAudioSession` | Web Audio API microphone streaming | N/A | `hooks/tuner/useAudioSession.ts` |
| `useStreakData` | **Daily streak management & goal tracking** | N/A | `hooks/useStreakData.ts` |
| `useStreakCalendar` | Calendar data with month navigation | N/A | `hooks/useStreakCalendar.ts` |
| `useSongMastery` | **Per-song skill tree progress** | N/A | `hooks/useSongMastery.ts` |
| `useGlobalStats` | **Lifetime stats aggregation** | N/A | `hooks/useGlobalStats.ts` |
| `useMilestones` | **Lifetime milestone tracking** | N/A | `hooks/useMilestones.ts` |

### Utilities

| Utility | Purpose | Location |
|---------|---------|----------|
| `logger` | Development-only logging (silent in production) | `utils/logger.ts` |
| `feedback` | Haptic + sound feedback utilities | `utils/feedback.ts` |
| `auth` | Supabase authentication helpers | `utils/auth.ts` |

### Constants

| Constant | Purpose | Location |
|----------|---------|----------|
| `Colors` | Design system color tokens | `constants/Colors.ts` |
| `Animations` | Shared animation keyframes (glitch effects) | `constants/Animations.ts` |
| `UI_VOLUMES` | Sound volume levels per component | `constants/Audio.ts` |
| `TunerConfig` | Audio, YIN, volume, and tuning thresholds for tuner | `constants/TunerConfig.ts` |

### Data

| Data | Purpose | Location |
|------|---------|----------|
| `MOCK_SONGS` | Demo songs for development | `data/mockSongs.ts` |
| `isMockSong()` | Check if a song is demo data | `data/mockSongs.ts` |

---

## Design Tokens

### Colors

Import: `import { Colors } from '@/constants/Colors';`

| Token | Hex | Usage |
|-------|-----|-------|
| `Colors.matteFog` | `#E4DFDA` | Chassis/background (Warm Bone) |
| `Colors.softWhite` | `#f0f0f0` | Inset surfaces, highlights |
| `Colors.charcoal` | `#333333` | Dark controls, primary text |
| `Colors.alloy` | `#d6d6d6` | Light controls, wells |
| `Colors.vermilion` | `#EE6C4D` | Action/accent (hero color) |
| `Colors.ink` | `#221E22` | Text primary (Off-Black) |
| `Colors.graphite` | `#888888` | Labels, secondary text |
| `Colors.moss` | `#417B5A` | Success/Easy (Green) |
| `Colors.lobsterPink` | `#DB5461` | Accent/Highlight (Lobster Pink) |
| `Colors.deepSpaceBlue` | `#0E273C` | Dark Accent (Deep Space Blue) |
| `Colors.warmGray` | `#847577` | Secondary Text (Warm Gray) |

### Typography

**Primary Font**: Lexend Deca (all weights available)
**Logo Font**: MomoTrustDisplay

| Use Case | Font | Size | Weight | Notes |
|----------|------|------|--------|-------|
| App Logo | MomoTrustDisplay | 24-28px | Bold | deepSpaceBlue color |
| Page Titles | LexendDecaRegular | 12px | Regular | uppercase, warmGray |
| Song Titles | LexendDecaBold | 14px | Bold | Title case |
| Artist Names | LexendDecaRegular | 12px | Regular | uppercase |
| Body text | LexendDecaRegular | 16px | Regular | |
| Labels | LexendDecaSemiBold | 9-10px | SemiBold | uppercase |
| Values | LexendDecaBold | 12-16px | Bold | |
| Inputs | LexendDecaRegular | 16px | Regular | |

---

## Component Catalog

### PageHeader

**Purpose**: Reusable page header component with SongStreak logo and user controls. Use this for all new pages to ensure consistent branding.

**Location**: `components/ui/PageHeader.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  children?: ReactNode; // Optional content below header (e.g., filter deck)
}
```

**Usage**:
```typescript
// Basic page
<PageHeader />

// Page with additional content below header
<PageHeader>
  <FilterDeck>...</FilterDeck>
</PageHeader>
```

**Visual Behavior**:
- SongStreak logo (MomoTrustDisplay, deepSpaceBlue)
- User avatar button - displays user initials from email, navigates to `/account` on tap
- Logout button with audio + haptic feedback (uses `useSignOut` hook)

**Audio Feedback**: Both avatar and logout buttons provide haptic + sound feedback on press (`useClickSound` hook)

---

### GangSwitch

**Purpose**: Multi-option switch inspired by analog mixing consoles. Supports both exclusive selection (radio) and optional de-selection.

**Location**: `components/ui/filters/GangSwitch.tsx`

**Props**:
```typescript
interface GangSwitchProps<T extends string> {
  label: string;              // Label above the switch (increased to 10px)
  value: T | null;            // Current selected value
  options: FilterOption<T>[]; // Array of options (value text increased to 10px)
  onChange: (val: T) => void; // Selection handler
  disabled?: boolean;         // Disable interaction
  orientation?: 'horizontal' | 'vertical'; // Layout direction
  allowDeselect?: boolean;    // If true, clicking active toggles off (default: true)
}
```

**Visual Behavior**:
- **Height**: Reduced to 38px.
- Recessed "well" background
- Raised buttons that depress when active
- LED indicator for active state
- Audio + haptic feedback on selection (`useClickSound` hook)

---

### FrequencyTuner

**Purpose**: Horizontal sliding tuner control with a glass overlay effect. Used for instrument selection.

**Location**: `components/ui/filters/FrequencyTuner.tsx`

**Props**:
```typescript
interface FrequencyTunerProps<T extends string> {
  label: string;              // Label above the tuner (left-aligned)
  value: T;                   // Current selected value
  options: FilterOption<T>[];
  onChange: (val: T) => void;
  disabled?: boolean;
  variant?: 'dark' | 'light'; // Default: 'dark'
  showGlassOverlay?: boolean; // Enable enhanced glass effects
  labelColor?: string;        // Custom label color (default: Colors.warmGray)
}
```

**Visual Behavior**:
- **Height**: Reduced to 38px.
- Dark window with scale markings (or light variant for metronome)
- "Glass" reflection overlay with optional enhanced effects
- Orange hairline indicator
- **Label**: Left-aligned, warmGray by default (use `labelColor` for custom color)
- **Animated Text**: Value text animates with a "glitchy" slide from the side when changed.
- Audio + haptic feedback on chevron taps (`useClickSound` hook)

**Variant Support**:
- `dark`: Dark background (#2a2a2a), light text - default for most uses
- `light`: Light background (softWhite), charcoal text - used in metronome

---

### RotaryKnob

**Purpose**: Rotary control with a digital readout display. Used for genre selection and other rotary controls.

**Location**: `components/ui/filters/RotaryKnob.tsx`

**Props**:
```typescript
interface RotaryKnobProps<T extends string> {
  label: string; // Label above the knob (increased to 10px)
  value: T;      // Current selected value (readout text increased to 10px)
  options: FilterOption<T>[];
  onChange: (val: T) => void;
  disabled?: boolean;
}
```

**Visual Behavior**:
- **Height**: Reduced to 38px.
- Digital text readout in a recessed well
- Physical rotating knob with position indicator
- Haptic feedback on change
- **Animated Text**: Readout text animates with a "glitchy" slide from the side when changed.
- Audio + haptic feedback on rotation (`useClickSound` hook)

---

### LibraryHeader

**Purpose**: Page header with branding, user controls, search input, and slots for filter widgets.

**Location**: `components/ui/LibraryHeader.tsx`

**Props**:
```typescript
interface LibraryHeaderProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  searchSuggestions: Song[];
  onSuggestionSelect: (song: Song) => void;
  instrumentFilter?: ReactNode; // Slot for FrequencyTuner
  genreFilter?: ReactNode;      // Slot for RotaryKnob
}
```

**Visual Behavior**:
- **Top Bar**: "SongStreak" logo (MomoTrustDisplay, deepSpaceBlue) + User Avatar/Logout
- **Filter Deck**: Two-row grid configuration
  - Row 1: Search Widget (no label, placeholder: "Search songs...")
  - Row 2: Instrument Widget | Genre Widget
- **Search Widget**: Flat, recessed input. Height reduced to 38px.

---

### SongCard

**Purpose**: Song display card in the library view with edit and delete actions.

**Location**: `app/(tabs)/index.tsx` (inline component)

**Props**:
```typescript
interface SongCardProps {
  song: Song;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPress?: () => void;
}
```

**Visual Behavior**:
- Album artwork thumbnail with glass overlay
- Song title and artist
- Duration metadata
- **Action buttons** (stacked vertically):
  - Edit icon (Edit2) - navigates to song detail in edit mode
  - Delete icon (Trash2) - shows confirmation dialog

**Navigation Flow**:
- Card tap → View mode (read-only)
- Edit icon tap → Edit mode directly (`?songId=X&edit=true`)
- Demo songs (IDs 1-5) show info alert that they cannot be edited/deleted

---

### AddSongScreen

**Purpose**: Screen for adding new songs or viewing/editing existing songs, featuring a tabbed interface using `GangSwitch`.

**Location**: `app/(tabs)/add-song.tsx`

**Features**:
- **Header**: Uses `PageHeader` component for consistent branding.
- **Tabs**: Uses `GangSwitch` with `allowDeselect={false}` to switch between 'Basics', 'Theory', and 'Lyrics'.
- **Navigation**: Accessible via the FAB on the Library screen; integrated into the main Tab layout.
- **Edit Mode**: When navigating with `?edit=true` param, auto-enables edit mode for the song.

---

### AccountScreen

**Purpose**: User account management screen with tabbed interface for Profile, Settings, Billing, and Support.

**Location**: `app/(tabs)/account.tsx`

**Features**:
- **Header**: Uses `PageHeader` component with subtitle "ACCOUNT"
- **Tabs**: Uses `GangSwitch` with `allowDeselect={false}` to switch between:
  - **Profile**: User avatar, email, member since date
  - **Settings**: Dark mode toggle, Sound on/off toggle (persisted via `useSettings`)
  - **Billing**: Current plan display, premium plans coming soon placeholder
  - **Support**: Help links, app version, Sign Out button
- **Navigation**: Accessible by tapping the avatar button in `PageHeader`

**Settings Persistence**:
- Uses `SettingsContext` (`ctx/SettingsContext.tsx`) for app-wide settings
- Settings persisted to AsyncStorage
- Sound toggle integrates with all sound hooks (`soundEnabled` check)

---

## Design Patterns

### "Recessed Well" Pattern

Used in `GangSwitch`, `Search` input, `RotaryKnob` readout, and `FrequencyTuner` window.

**CSS Properties**:
- Background: `#d6d6d6` (Alloy) or `#e0e0e0`
- Inner Shadow: Top-left dark, bottom-right light

### "Tactile Control" Pattern

Physical metaphors for digital controls.
- **Switch**: Depressible buttons with LEDs + audio/haptic feedback
- **Tuner**: Sliding scale behind glass + audio/haptic feedback
- **Knob**: Rotation with haptics + audio feedback

### "Analog Glitch" Animation Pattern

Applied to `FrequencyTuner` and `RotaryKnob` text displays.
Creates a quick, slightly jittery slide animation for text value changes, evoking a mechanical or distorted signal aesthetic.

### "Audio + Haptic Feedback" Pattern

Every interactive component triggers both feedback types in sequence:
1. **Haptic**: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` (immediate)
2. **Audio**: `playSound()` from `useClickSound` hook (async, non-blocking)

Used in: `NavButton`, `GangSwitch`, `FrequencyTuner`, `RotaryKnob`, `SearchSuggestions`, `PageHeader`

**Implementation**:
```typescript
const handlePress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playSound();
  // Perform action
};
```

---

### StyledAlertModal & useStyledAlert

**Purpose**: Replaces native `Alert.alert()` with styled modals matching the Industrial Play aesthetic. **ALWAYS use this instead of native alerts.**

**Location**:
- `components/ui/modals/StyledAlertModal.tsx` - The modal component
- `hooks/useStyledAlert.tsx` - The provider and hook

**Setup**: App is wrapped with `StyledAlertProvider` in `app/_layout.tsx`

**Alert Types**:
| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `error` | AlertCircle | vermilion | Validation errors, API failures |
| `success` | CheckCircle | moss | Save success, operation complete |
| `info` | Info | deepSpaceBlue | Instructions, coming soon |
| `warning` | AlertTriangle | amber | Warnings, quota exceeded |

**Usage**:
```typescript
import { useStyledAlert } from '@/hooks/useStyledAlert';

function MyComponent() {
  const { showError, showSuccess, showInfo, showWarning, showConfirm } = useStyledAlert();

  // Simple alerts (single OK button)
  showError('Error', 'Something went wrong');
  showSuccess('Success', 'Song saved successfully!');
  showInfo('Info', 'Please save the song first');
  showWarning('Warning', 'API quota exceeded');

  // With callback on dismiss
  showSuccess('Success', 'Password updated', () => router.replace('/(auth)'));

  // Confirmation dialog (Cancel + Confirm buttons)
  showConfirm(
    'Delete Song',
    'Are you sure you want to delete this song?',
    () => handleDelete(),    // onConfirm callback
    'Delete',                // confirm button text (default: 'Confirm')
    'Cancel',                // cancel button text (default: 'Cancel')
    'error'                  // alert type (default: 'warning')
  );
}
```

**Visual Behavior**:
- Dark overlay (`rgba(0, 0, 0, 0.85)`)
- Spring animation on entry
- Haptic feedback based on alert type
- Bevel effects matching app aesthetic
- LinearGradient buttons

---

### PracticeCompleteModal

**Purpose**: Shown when a practice session is logged (no new achievements unlocked).

**Location**: `components/ui/practice/PracticeCompleteModal.tsx`

**Props**:
```typescript
interface PracticeCompleteModalProps {
  visible: boolean;
  seconds: number;      // Practice duration in seconds
  onClose: () => void;
}
```

---

### DailyGoalModal

**Purpose**: Celebration modal shown when user meets their daily practice goal.

**Location**: `components/ui/streaks/DailyGoalModal.tsx`

**Props**:
```typescript
interface DailyGoalModalProps {
  visible: boolean;
  goalMinutes?: number;      // Daily goal in minutes (default: 30)
  practiceMinutes?: number;  // Practice completed in minutes
  currentStreak: number;     // Current streak days
  onClose: () => void;
}
```

**Features**:
- Animated check mark celebration
- Shows extra practice bonus (if exceeded goal)
- Streak day count display
- Motivational messages based on streak length
- Green theme for goal achievement

---

### MilestoneModal

**Purpose**: Celebration modal for lifetime trophy/milestone unlocks.

**Location**: `components/ui/milestones/MilestoneModal.tsx`

**Props**:
```typescript
interface MilestoneModalProps {
  visible: boolean;
  milestones: LifetimeMilestone[];  // Newly unlocked milestones
  onClose: () => void;
}
```

**Features**:
- Displays one or more unlocked trophies
- Tier-based glow effects (bronze → diamond)
- Pulsing shine animation
- Motivational messages per category
- Button color matches highest tier

---

### StreakMilestoneModal

**Purpose**: Celebration modal for reaching streak milestones (7, 14, 30, etc. days).

**Location**: `components/ui/streaks/StreakMilestoneModal.tsx`

**Props**:
```typescript
interface StreakMilestoneModalProps {
  visible: boolean;
  streakDays: number;       // Current streak count
  freezeEarned?: boolean;   // Show freeze earned badge
  onClose: () => void;
}
```

**Features**:
- Animated streak flame display
- Pulsing flame animation
- Streak freeze earned badge (if applicable)
- Color changes based on streak level (ember → inferno)
- Motivational messages for each milestone

---

### CreateBandModal & JoinBandModal

**Purpose**: Modals for band management - creating new bands and joining existing bands via code.

**Location**: `components/ui/bands/`

**CreateBandModal Props**:
```typescript
interface CreateBandModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}
```

**JoinBandModal Props**:
```typescript
interface JoinBandModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (joinCode: string) => Promise<boolean>;
}
```

**Features**:
- Auto-uppercase join code input
- 6-character code with ABC-123 format display
- Error state handling
- Keyboard avoiding behavior

---

## Anti-Patterns

### Don't use native Alert.alert
**ALWAYS** use `useStyledAlert` hook instead of `Alert.alert()`. Native alerts don't match the app aesthetic.

```typescript
// ❌ WRONG - Native iOS alert
Alert.alert('Error', 'Something went wrong');

// ✅ CORRECT - Styled alert
const { showError } = useStyledAlert();
showError('Error', 'Something went wrong');
```

### Don't hardcode colors
Use `Colors` from `@/constants/Colors`.

### Don't inline complex styles
Extract to `StyleSheet.create`.

### Don't mix UI metaphors
Keep to the "Industrial/Analog" aesthetic (wells, knobs, switches, beveled modals).

---

## Metronome Components

### VUMeterDisplay (Dual Mode)

The `VUMeterDisplay` now supports two modes:
- **Progress mode** (default): Shows total practice time with static needle position
- **Metronome mode**: Shows pendulum swing synchronized with metronome beats

**Props**:
```typescript
interface VUMeterDisplayProps {
  totalSeconds?: number;              // For progress mode
  compact?: boolean;
  mode?: 'progress' | 'metronome';    // Default: 'progress'
  beatPosition?: number;              // 0 (left) or 1 (right) for pendulum
  isMetronomePlaying?: boolean;       // For LED beat effects
  currentBeat?: number;               // Current beat (1-indexed)
  beatsPerMeasure?: number;           // Beats in measure
  sessionSeconds?: number;            // Session time display
  sessionLabel?: string;              // Custom label
  showTimeDisplay?: boolean;          // Show embedded time (default: true)
  children?: React.ReactNode;         // Content to render at bottom of housing
}
```

**Visual Updates (Dec 15, 2025)**:
- **LED Indicators**: Uses the new `LEDIndicator` Skia primitive (16px size) with realistic bloom.
  - **Downbeat**: Vermilion glow.
  - **Other Beats**: Moss green glow.
- **Meter Face**: Uses `InsetWindow` (light variant) for a recessed glass look.
- **Typography**: Beat numbers (1, 2, 3, 4) increased to 24px for better readability.

**Note**: The `children` prop allows embedding content (like BPM display) inside the VU meter housing. `MetronomePanel` uses this to embed the BPM controls inside the meter housing.

### MetronomePanel (Composite Component)

**Purpose**: Composite component combining VU meter (with embedded BPM and transport controls) and session timer (tape counter) into a reusable panel.

**Location**: `components/ui/metronome/MetronomePanel.tsx`

**Props**:
```typescript
interface MetronomePanelProps {
  // Metronome state (from useMetronome)
  beatPosition: number;
  isMetronomePlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: number;

  // Time signature
  timeSignature: string;
  onTimeSignatureChange: (ts: string) => void;

  // Sound type (click, snare, bass, hihat)
  soundType: MetronomeSoundType;
  onSoundTypeChange: (type: MetronomeSoundType) => void;

  // Subdivision
  subdivision: Subdivision;
  onSubdivisionChange: (sub: Subdivision) => void;

  // BPM controls
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => number | null;

  // Transport controls
  onPlayPause: () => void;
  onReset: () => void;
  onComplete?: (seconds: number) => void;
  showComplete?: boolean;

  // Timer
  sessionSeconds: number;

  // Options
  compact?: boolean;
}
```

**Layout** (top to bottom inside housing):
1. Header row: TIME (FrequencyTuner) | SOUND (FrequencyTuner) | SUB (FrequencyTuner)
2. VU Meter pendulum
3. BPM Display (tappable with tap tempo)
4. Transport Controls (play/pause, reset, complete)
5. Session Timer (RamsTapeCounterDisplay - tape counter style, below housing)

**Usage**:
```typescript
import { MetronomePanel } from '@/components/ui/metronome';

<MetronomePanel
  beatPosition={metronome.beatPosition}
  isMetronomePlaying={metronome.isPlaying}
  currentBeat={metronome.currentBeat}
  beatsPerMeasure={metronome.beatsPerMeasure}
  timeSignature={metronome.timeSignature}
  onTimeSignatureChange={metronome.setTimeSignature}
  soundType={metronome.soundType}
  onSoundTypeChange={metronome.setSoundType}
  subdivision={metronome.subdivision}
  onSubdivisionChange={metronome.setSubdivision}
  bpm={metronome.bpm}
  onBpmChange={metronome.setBpm}
  onTapTempo={metronome.tapTempo}
  onPlayPause={handlePlayPause}
  onReset={handleReset}
  onComplete={handleComplete}
  showComplete={true}
  sessionSeconds={sessionSeconds}
/>
```

### RamsTapeCounterDisplay

**Purpose**: Skeuomorphic flip-chart style time display showing MM:SS format.

**Location**: `components/ui/practice/RamsTapeCounterDisplay.tsx`

**Props**:
```typescript
interface RamsTapeCounterDisplayProps {
  seconds: number;
  compact?: boolean;
  label?: string;  // Default: 'ELAPSED'
}
```

**Visual Behavior**:
- Four digit wheels (MM:SS)
- Red separator dots with glow
- Cylindrical reflection overlay
- Vintage tape deck aesthetic

### useMetronome Hook

Core metronome logic with drift-corrected timing and sound type support.

**Usage**:
```typescript
import { useMetronome } from '@/hooks/useMetronome';

const metronome = useMetronome({
  initialBpm: 120,
  initialTimeSignature: '4/4',
  initialSubdivision: 1,
  initialSoundType: 'click', // 'click' | 'snare' | 'bass' | 'hihat'
  onBeat: (beat, isDownbeat) => console.log(`Beat ${beat}`),
  onStateChange: (isPlaying) => console.log(`Playing: ${isPlaying}`),
});

// Actions
metronome.start();
metronome.stop();
metronome.toggle();
metronome.setBpm(140);
metronome.setTimeSignature('3/4');
metronome.setSubdivision(2);
metronome.setSoundType('snare'); // Change sound type
const bpm = metronome.tapTempo(); // Tap tempo

// State
console.log(metronome.bpm);           // 120
console.log(metronome.isPlaying);     // true/false
console.log(metronome.beatPosition);  // 0 or 1 for VU meter
console.log(metronome.currentBeat);   // 1-4
console.log(metronome.soundType);     // 'click' | 'snare' | 'bass' | 'hihat'
```

### BPMDisplay Component

Large, tappable BPM display with tap tempo and swipe adjustment.

**Props**:
```typescript
interface BPMDisplayProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => number | null;
  isPlaying?: boolean;
  compact?: boolean;
  readonly?: boolean;  // For song-specific mode
}
```

**Features**:
- Tap to detect tempo (tap tempo)
- Vertical swipe to adjust BPM
- +/- buttons for fine adjustment
- Visual flash on tap
- Haptic feedback

### MetronomeControls Component

**Purpose**: Combined time signature and subdivision controls. BPM controls are optional (omit when using `MetronomePanel`).

**Props**:
```typescript
interface MetronomeControlsProps {
  // BPM controls (optional - omit when using MetronomePanel)
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  onTapTempo?: () => number | null;

  // Time signature (required)
  timeSignature: string;
  onTimeSignatureChange: (ts: string) => void;

  // Subdivision (required)
  subdivision: Subdivision;
  onSubdivisionChange: (sub: Subdivision) => void;

  // State
  isPlaying?: boolean;
  compact?: boolean;
  readonly?: boolean;
}
```

**Usage with MetronomePanel** (BPM handled separately):
```typescript
<MetronomeControls
  timeSignature={metronome.timeSignature}
  onTimeSignatureChange={metronome.setTimeSignature}
  subdivision={metronome.subdivision}
  onSubdivisionChange={handleSubdivisionChange}
/>
```

**Usage standalone** (includes BPM):
```typescript
<MetronomeControls
  bpm={metronome.bpm}
  onBpmChange={metronome.setBpm}
  onTapTempo={metronome.tapTempo}
  timeSignature={metronome.timeSignature}
  onTimeSignatureChange={metronome.setTimeSignature}
  subdivision={metronome.subdivision}
  onSubdivisionChange={handleSubdivisionChange}
/>
```

### TransportControls Component

Play/Pause, Reset, and Complete buttons for metronome.

**Props**:
```typescript
interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onComplete?: (seconds: number) => void;
  sessionSeconds: number;
  compact?: boolean;
  showComplete?: boolean;
}
```

---

### LEDIndicator (Skia Primitive)

**Purpose**: Photorealistic, skeuomorphic LED indicator inspired by Dieter Rams' industrial design. Features a metal bezel, convex glass lens, and realistic bloom/glow effects.

**Location**: `components/skia/primitives/LEDIndicator.tsx`

**Props**:
```typescript
interface LEDIndicatorProps {
  size?: number;       // Diameter (default: 16)
  isActive: boolean;   // On/Off state
  color?: string;      // Color when active (default: Colors.vermilion)
}
```

**Visual Behavior**:
- **Off State**: Dark lens (#1a1a1a) inside a metal bezel (#2a2a2a) with a faint white center light (#ffffff 8%) and enhanced glass reflection.
- **On State**: 
  - Bright core color with radial gradient to simulate convexity.
  - Realistic bloom/glow (BlurMask) extending beyond the bezel.
  - High-contrast reflection highlight on the lens.
- **Construction**: Built using Skia primitives (`Circle`, `LinearGradient`, `RadialGradient`, `BlurMask`) for high-performance rendering.

---

### InsetWindow

**Purpose**: Reusable Skia-based inset window component with glass effect. Supports dark and light variants for consistent styling across the app.

**Location**: `components/ui/InsetWindow.tsx`

**Props**:
```typescript
interface InsetWindowProps {
  variant: 'dark' | 'light';    // Color scheme
  borderRadius?: number;         // Default: 6
  children?: React.ReactNode;
  style?: ViewStyle;
}
```

**Variants**:
- **Dark**: Dark background (#2a2a2a) with subtle white highlights - used for controls
- **Light**: Light background (softWhite) with shadow depth - used for displays/meters

**Visual Behavior**:
- Skia Canvas with Box + BoxShadow for realistic inset shadows
- Glass overlay gradient at top for depth
- Configurable border radius

**Usage**:
```typescript
import { InsetWindow } from '@/components/ui/InsetWindow';

// Light variant for displays
<InsetWindow variant="light" borderRadius={12} style={{ width: 280, height: 112 }}>
  {/* Content */}
</InsetWindow>

// Dark variant for controls
<InsetWindow variant="dark" borderRadius={6}>
  {/* Content */}
</InsetWindow>
```

---

### GlassOverlay

**Purpose**: Skia-based glass effect overlay that simulates physical glass windows with vintage hi-fi aesthetics. Use this to add depth and realism to control windows and displays.

**Location**: `components/ui/GlassOverlay.tsx`

**Props**:
```typescript
interface GlassOverlayProps {
  width: number;              // Width in pixels (required)
  height: number;             // Height in pixels (required)
  borderRadius?: number;      // Default: 6
  glareOpacity?: number;      // Glare intensity (default: 0.175)
  specularOpacity?: number;   // Specular highlight intensity (default: 0.25)
  variant?: 'light' | 'dark'; // Default: 'light' - adjusts intensity for background
}
```

**Visual Behavior**:
- **Glare gradient**: Top-to-bottom white gradient simulating light reflection
- **Specular highlight**: Circular bright spot in top-left area (like a light source reflection)
- **Bezel edges**: 3D depth with light top/left borders, dark bottom/right borders
- **pointerEvents="none"**: Touch events pass through to controls underneath

**Variant Support**:
- `light`: Full opacity glare/specular for light backgrounds
- `dark`: Reduced opacity (specular 40%, glare 70%) for dark backgrounds

**Usage**:
```typescript
import { GlassOverlay } from '@/components/ui/GlassOverlay';

// Basic usage (absolute positioned over a control)
<View style={{ position: 'relative' }}>
  <YourControl />
  <GlassOverlay
    width={200}
    height={44}
    borderRadius={6}
    glareOpacity={0.2}
    specularOpacity={0.3}
  />
</View>
```

**Where It's Applied**:
- `FrequencyTuner` - via `showGlassOverlay` prop
- `RotaryKnob` - via `showGlassOverlay` prop
- `InsetWindow` - via `showGlassOverlay` prop (used by VUMeterDisplay)
- `RamsTapeCounterDisplay` - on each individual digit wheel
- Album artwork thumbnails in song cards

---

### InsetShadowOverlay

**Purpose**: Creates recessed depth effect via edge gradients, simulating a bezel casting shadow onto the content surface. Use this below GlassOverlay to make content appear to sit 5mm behind the plastic frame.

**Location**: `components/skia/primitives/InsetShadowOverlay.tsx`

**Props**:
```typescript
interface InsetShadowOverlayProps {
  width: number;              // Width in pixels (required)
  height: number;             // Height in pixels (required)
  borderRadius?: number;      // Default: 6
  insetDepth?: number;        // Shadow spread in pixels (default: 8)
  shadowIntensity?: number;   // 0-1 multiplier (default: 1.0)
  variant?: 'light' | 'dark'; // Default: 'light' - adjusts highlight visibility
}
```

**Visual Behavior**:
- **Top edge**: Strongest shadow (0.35 opacity) - light blocked by bezel
- **Left edge**: Medium shadow (0.25 opacity)
- **Bottom edge**: Subtle highlight (light: 0.15, dark: 0.25 opacity) - bounced light
- **Right edge**: Lightest (light: 0.08, dark: 0.15 opacity)

**Dark Variant**: Increases bottom/right highlight opacity for visibility on dark backgrounds (#2a2a2a)

**Size Adaptation Guidelines**:
| Component Size | insetDepth | shadowIntensity |
|----------------|------------|-----------------|
| Small (<40px)  | 4-5px      | 0.7             |
| Medium (40-100px) | 6-8px   | 0.9             |
| Large (>100px) | 10-12px    | 1.0             |

**Usage**:
```typescript
import { InsetShadowOverlay } from '@/components/skia/primitives';

// Layer BELOW GlassOverlay
<InsetShadowOverlay
  width={200}
  height={44}
  borderRadius={6}
  insetDepth={6}
  shadowIntensity={0.9}
/>
```

---

### SurfaceTextureOverlay

**Purpose**: Adds subtle dust/grain texture using FractalNoise shader to simulate glass imperfections. Use this above GlassOverlay to make surfaces feel physical rather than digital.

**Location**: `components/skia/primitives/SurfaceTextureOverlay.tsx`

**Props**:
```typescript
interface SurfaceTextureOverlayProps {
  width: number;              // Width in pixels (required)
  height: number;             // Height in pixels (required)
  borderRadius?: number;      // Default: 6
  textureOpacity?: number;    // 0-1, very subtle (default: 0.03)
  variant?: 'light' | 'dark'; // Default: 'light' - adjusts opacity and blend mode
}
```

**Visual Behavior**:
- Uses Skia `FractalNoise` shader
- **Light variant**: `softLight` blend mode, base opacity
- **Dark variant**: `overlay` blend mode, 1.5x opacity for visibility
- Very subtle effect (2-4% opacity recommended)
- Fixed seed (42) ensures consistent appearance across renders

**Usage**:
```typescript
import { SurfaceTextureOverlay } from '@/components/skia/primitives';

// Layer ABOVE GlassOverlay
<SurfaceTextureOverlay
  width={200}
  height={44}
  borderRadius={6}
  textureOpacity={0.03}
/>
```

---

### Complete Overlay Stack

For full skeuomorphic realism, use all three overlays in this order (back to front):

```typescript
import { GlassOverlay } from '@/components/ui/GlassOverlay';
import { InsetShadowOverlay, SurfaceTextureOverlay } from '@/components/skia/primitives';

<View style={{ position: 'relative' }}>
  <YourContent />
  {/* Layer 1: Inset shadow (shadow cast BY bezel ONTO content) */}
  <InsetShadowOverlay width={200} height={44} insetDepth={6} shadowIntensity={0.9} />
  {/* Layer 2: Glass effect (glare + specular on glass surface) */}
  <GlassOverlay width={200} height={44} glareOpacity={0.2} specularOpacity={0.3} />
  {/* Layer 3: Surface texture (dust/scratches ON TOP of glass) */}
  <SurfaceTextureOverlay width={200} height={44} textureOpacity={0.03} />
</View>
```

---

*Last updated: Dec 19, 2025*

## Dec 18, 2025 Changes

### Root Note Highlighting in Chord Diagrams

**Enhancement**: Root notes are now visually distinguished in chord diagrams.

**Implementation** (`components/ui/theory/chords/GuitarChordDiagram.tsx`):

1. **New `rootNote` prop**: Accepts the root note of the chord (e.g., 'C', 'F#', 'Bb')

2. **Music theory helpers added**:
   - `normalizeNote()` - Converts flats to sharps for comparison (Db → C#)
   - `getNoteAtPosition()` - Calculates note at any string/fret position
   - `isRootNote()` - Compares notes with enharmonic handling

3. **Color scheme**:
   - Root notes: `Colors.moss` (green)
   - Other fretted notes: `Colors.vermilion` (orange)
   - Root open strings: `Colors.moss` (green stroke)
   - Other open strings: `Colors.charcoal` (dark stroke)

4. **Chord name alignment**: Left-aligned with fretboard edge (previously centered)

### Algorithmic Fingering Generation (Dec 18)

**Enhancement**: Chords generated algorithmically (not in static dictionary) now include finger numbers.

**Implementation** (`data/chords/generator/index.ts`):

1. **New `generateFingers()` function**: Assigns fingers based on fret positions and barre detection

2. **Algorithm**:
   - If barre chord: finger 1 assigned to all positions covered by the barre
   - Remaining fretted positions: collected and sorted by fret (lower first), then by string
   - Fingers 2, 3, 4 assigned in order to sorted positions
   - Open strings and muted strings return `null`

3. **Affected chords**: Any chord not in the static 21-chord dictionary (Fm, Cm, Gm, Bbm, etc.)

**Usage**:
```typescript
<GuitarChordDiagram
  fingering={voicing}
  chordName="Am7"
  rootNote="A"        // NEW: Highlights A notes in green
  showFingers={true}
  size="medium"
/>
```

**Files Updated**:
- `GuitarChordDiagram.tsx` - Core implementation
- `ChordVisualization.tsx` - Passes `rootNote={chordDef.root}`
- `TheoryChordSection.tsx` - Passes `rootNote={lookupResult.chord?.root}`

---

## Dec 17, 2025 Changes

### Chord Diagram Algorithmic Voicing Fixes

**Problem**: Extended chords like Am9, Cmaj7, Dm11 were generating incomplete voicings (only 1 dot shown) because the voicing generator was producing shapes with mostly open strings that missed essential chord tones (particularly the 3rd).

**Root Causes Fixed**:

1. **Lookup Order** (`data/chords/utils/lookup.ts`):
   - Fuzzy match was intercepting extended chords before algorithmic generation
   - Fixed: Algorithmic generation now runs BEFORE fuzzy match

2. **Voicing Generator Constraints** (`data/chords/generator/voicing-generator.ts`):
   - `requireThird: false` allowed voicings missing the 3rd (which defines major/minor)
   - Fixed: `requireThird: true` by default - voicings MUST include the 3rd
   - Fallback logic updated to try progressively relaxed constraints while still requiring third

3. **Voicing Scorer Weights** (`data/chords/generator/voicing-scorer.ts`):
   - Missing third wasn't penalized; completeness weight was too low
   - Fixed: -15 penalty for missing third, +10 bonus for having it
   - Completeness weight increased from 0-15 to 0-25 points

4. **GuitarChordDiagram Loading** (`components/ui/theory/chords/GuitarChordDiagram.tsx`):
   - Component returned `null` while fonts loaded, causing blank diagrams
   - Fixed: Shows ActivityIndicator loading state instead

5. **Instrument Comparison** (`components/ui/theory/TheoryChordSection.tsx`):
   - Case-sensitive comparison failed for some instrument types
   - Fixed: `instrument.toLowerCase() === 'guitar'`

6. **Sound File** (`hooks/useChordChartSound.ts`):
   - Referenced non-existent `sound-click-07.mp3`
   - Fixed: Uses `sound-shared-click.mp3`

**Result**: Extended chords now generate proper voicings with all essential notes displayed on the fretboard diagram. Root notes are highlighted in green (moss), other notes in orange (vermilion).

### Chord Generator Test Suite Fixes

**Problem**: Tests were failing due to:
1. `__DEV__` global not defined in Jest environment
2. `golden.test.ts` using outdated type structure (`generated.voicings` instead of `generated.chord.voicings`)

**Fixes Applied**:

1. **Jest Configuration** (`jest.config.js`):
   - Added `globals: { __DEV__: true }` to define React Native's `__DEV__` global in test environment

2. **Golden Test Types** (`data/chords/generator/golden.test.ts`):
   - Updated to use `GenerateChordResult.chord.voicings` instead of `GenerateChordResult.voicings`
   - The `GenerateChordResult` type returns `{ chord: ChordDefinition | null, isPartial, omittedNotes }`

**Test Results**: All 624 tests passing across 7 test suites:
- `golden.test.ts` - Static dictionary validation
- `music-theory.test.ts` - Note/interval calculations
- `fretboard.test.ts` - Guitar fretboard mapping
- `voicing-generator.test.ts` - Voicing generation
- `voicing-scorer.test.ts` - Voicing quality scoring
- `normalizer.test.ts` - Chord name normalization
- `lookup.test.ts` - Chord lookup system

### Deprecation Warning Fixes

**Problem**: Two deprecation warnings on app startup:
1. `SafeAreaView has been deprecated` - React Native's SafeAreaView being removed
2. `expo-av has been deprecated` - Will be removed in SDK 54

**Fixes Applied**:

1. **SafeAreaView Migration** (`components/ui/VideoPlayerModal.tsx`):
   - Changed import from `react-native` to `react-native-safe-area-context`
   - No API changes required - drop-in replacement

2. **expo-av → expo-audio Migration** (all sound hooks):
   - Installed `expo-audio` package
   - Migrated 7 UI sound hooks to use `useAudioPlayer` hook:
     - `useClickSound.ts`
     - `useNavButtonSound.ts`
     - `useGangSwitchSound.ts`
     - `useFABSound.ts`
     - `useRotaryKnobSound.ts`
     - `useChordChartSound.ts`
   - Migrated `useMetronomeSound.ts` to use `createAudioPlayer` (manual control for sound pooling)

**API Changes (expo-av → expo-audio)**:
```typescript
// OLD (expo-av)
import { Audio } from 'expo-av';
const { sound } = await Audio.Sound.createAsync(source);
await sound.setVolumeAsync(0.5);
await sound.stopAsync();
await sound.playAsync();

// NEW (expo-audio)
import { useAudioPlayer } from 'expo-audio';
const player = useAudioPlayer(source);
player.volume = 0.5;
player.seekTo(0);  // Reset position (doesn't auto-reset like expo-av)
player.play();
```

**Audio Mode Changes**:
```typescript
// OLD
await Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
});

// NEW
import { setAudioModeAsync } from 'expo-audio';
await setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  interruptionMode: 'mixWithOthers',
});
```

---

## Dec 16, 2025 Changes

### Theory Tab Components (NEW)

Created reusable components for the Theory tab with improved information hierarchy:

**TheorySection** (`components/ui/theory/TheorySection.tsx`)
- Generic section container with label + alloy content box
- Follows SettingsTab pattern for consistency
```typescript
interface TheorySectionProps {
  label: string;     // Section header (e.g., "HARMONY")
  children: ReactNode;
}
```

**TheoryMetricsRow** (`components/ui/theory/TheoryMetricsRow.tsx`)
- 2x2 grid display for Tuning, Key, Tempo, Time Signature
- Row 1: Tuning | Key
- Row 2: Tempo | Time
- Left-aligned, compact layout
```typescript
interface TheoryMetricsRowProps {
  tuning: string;      // Guitar/bass tuning (default: "Standard")
  keyValue: string;
  tempo: string;
  timeSignature: string;
}
```

**TheoryChipGroup** (`components/ui/theory/TheoryChipGroup.tsx`)
- Labeled chip container for chords, scales, techniques
- Supports optional icon prefix and empty state
```typescript
interface TheoryChipGroupProps {
  label: string;
  items: string[];
  chipColor: string;  // Colors.vermilion, deepSpaceBlue, moss
  emptyText?: string;
  icon?: LucideIcon;
}
```

**Theory Tab Information Architecture**:
| Group | Contents | Color |
|-------|----------|-------|
| SONG METRICS | Key, Tempo, Time Signature | vermilion icons |
| HARMONY | Chords, Scales | vermilion / deepSpaceBlue chips |
| TECHNIQUE | Techniques, Strumming Pattern | moss chips |

### Label & Styling Updates

**FrequencyTuner**:
- Default label color changed from vermilion to warmGray (matches RotaryKnob)
- Added `labelColor` prop for custom label colors
- Labels now left-aligned (was centered)
- Metronome FrequencyTuners (TIME, SOUND, SUBDIVISION) use `labelColor={Colors.vermilion}`

**LibraryHeader**:
- Removed "FIND" label from search input
- Instrument filter label changed from "INST" to "INSTRUMENT"

**GlassOverlay**:
- Added `variant` prop ('light' | 'dark')
- Dark variant reduces specular (40%) and glare (70%) for visibility on dark backgrounds

**InsetShadowOverlay & SurfaceTextureOverlay**:
- Both now support `variant` prop for dark/light theme adaptation
- Dark variant adjusts opacity and blend modes for visibility

**Album Art Thumbnails**:
- Now use `variant="dark"` on all overlays for proper effect on dark album images

### Enhanced Skeuomorphic Overlays

**InsetShadowOverlay** (`components/skia/primitives/InsetShadowOverlay.tsx`)
- Creates recessed depth via 4 edge gradients
- Top/left edges: dark shadows (bezel blocks light)
- Bottom/right edges: subtle highlights (bounced light)
- Props: `insetDepth`, `shadowIntensity`, `variant` for size/theme adaptation
- Dark variant: increases highlight opacity (0.25/0.15 vs 0.15/0.08) for visibility

**SurfaceTextureOverlay** (`components/skia/primitives/SurfaceTextureOverlay.tsx`)
- Adds dust/grain texture using Skia FractalNoise shader
- Props: `textureOpacity`, `variant` for theme adaptation
- Light variant: `softLight` blend mode, base opacity
- Dark variant: `overlay` blend mode, 1.5x opacity for visibility

**Integration**:
All components using GlassOverlay now include the full overlay stack:
1. InsetShadowOverlay (below glass)
2. GlassOverlay (existing)
3. SurfaceTextureOverlay (on top of glass)

Applied to: FrequencyTuner, RotaryKnob, InsetWindow, RamsTapeCounterDisplay (DigitWheel), Song thumbnails

---

## Dec 15, 2025 Changes

### Layout & Structure
- **timing.tsx**: Full-width metronome layout, VU meter touches PageHeader, session timer pinned to bottom
- **TactileNavbar**: Added padding (10px top, 25px bottom) for better spacing
- **RamsTapeCounterDisplay**: Added `fullWidth` prop with transparent background, no borders

### InsetWindow Component (NEW)
- Created reusable Skia-based inset window with `dark` and `light` variants
- Applied to VUMeterDisplay meter face (light variant)
- Consistent glass effect across the app

### FrequencyTuner Enhancements
- Added `variant` prop ('dark' | 'light') for theme support
- Light variant: softWhite background, charcoal text/chevrons, white glass highlight
- Labels now orange (Colors.vermilion) for metronome
- Renamed "SUB" label to "SUBDIVISION" in MetronomePanel

### VUMeterDisplay Updates
- Uses InsetWindow for meter face (light variant)
- Removed "BPM" label (transparent color, space preserved)
- Beat numbers (1,2,3,4) doubled in size: 12px → 24px
- **Skeuomorphic Power LEDs**: Redesigned beat indicators
  - 16px size (doubled from 8px)
  - Dark lens (#1a1a1a) with metal bezel (#2a2a2a) when off
  - Vermilion glow (12px bloom) for downbeat
  - Moss green glow (10px bloom) for other beats

### MetronomePanel Updates
- Increased spacing between BPM controls and transport (marginTop: 12 → 28)
- FrequencyTuners use `variant="light"` for light background

### Gradient Tuning
- Light variant inner shadow: 0.25 → 0.40 (darker bottom)
- Light variant glass overlay: Changed from dark (0.08 black) to bright (0.35 white)
- Scale markings in light FrequencyTuner use Colors.charcoal (matches chevrons)

### Changes (Dec 16, 2025)

**Metronome Timing Precision Fix**
- Eliminated 15-45ms latency from sequential async awaits in sound playback
- Removed setTimeout wrapper that caused 4-16ms jitter per beat
- Sound playback now uses fire-and-forget pattern: `setPositionAsync(0).then(() => playAsync())`
- All play functions (`playAccent`, `playTick`, `playSubdivision`, `playDrumBeat`) are now synchronous
- Drums mode timing is now consistent across all beats including 4→1 transition

**PageHeader Simplification**
- Removed `subtitle` prop - page titles no longer displayed under logo
- Updated all pages to use `<PageHeader />` without subtitle

**VUMeterDisplay Beat Indicator Updates**
- Beat indicators now support 6/8 and 7/8 time signatures (removed 5-beat cap)
- Beat numbers changed from charcoal to warmGray
- LED colors brightened for better visibility: orange `#FF6B35`, green `#16A34A`
- Removed downbeat triangle marker (▼) - orange LED alone distinguishes beat 1

**VUMeterDisplay Needle Improvements**
- Thinner needle: 4px → 3px (standard), 3px → 2px (compact)
- Tapered tip using borderRadius (3px top corners, 1px bottom)
- Skeuomorphic depth with cylindrical gradient simulating rounded metal:
  - 5-color gradient: `['#cc3300', Colors.vermilion, '#ff8866', Colors.vermilion, '#cc3300']`
- Drop shadow for depth: `shadowOffset: {1, 2}`, `shadowOpacity: 0.5`
- Left edge highlight: `borderLeftWidth: 0.5`, `borderLeftColor: rgba(255,255,255,0.3)`

**MetronomePanel Spacing**
- Increased gap between FrequencyTuners: 6px → 11px
- Reduced headerContainer marginBottom: 12px → 8px (compact: 8px → 6px)

**GlassOverlay Component (NEW)**
- Created reusable Skia-based glass overlay component (`components/ui/GlassOverlay.tsx`)
- Features: top-to-bottom glare gradient, specular highlight circle, 3D bezel edges
- Applied to: FrequencyTuner, RotaryKnob, InsetWindow (via `showGlassOverlay` prop)
- Applied to: Album artwork thumbnails in song cards
- Applied to: Individual digit wheels in RamsTapeCounterDisplay (not the overall container)
- Opacity values tuned to 50% for subtle effect (glareOpacity: 0.175, specularOpacity: 0.25)

### Previous Changes (Dec 14, 2025)
- Added sound type selector (click, snare, bass, hihat) to MetronomePanel
- Moved subdivision control into MetronomePanel header
- Fixed metronome sound race condition (load all sounds upfront)
- Added metronome drum samples: metronome-snare.wav, metronome-kick.wav, metronome-hihat.wav

---

## Guitar Tuner Components (Dec 22, 2025)

### Overview

Real-time guitar tuner using the **pitchy** library (MIT licensed) with McLeod Pitch Method for accurate pitch detection. Supports standard guitar tuning (E2-E4, 82Hz-330Hz).

### TunerMeter

**Purpose**: Visual meter showing pitch deviation from target note.

**Location**: `components/ui/tuner/TunerMeter.tsx`

**Props**:
```typescript
interface TunerMeterProps {
  cents: number | null;        // Deviation in cents (-50 to +50)
  direction: TuningDirection;  // 'flat' | 'sharp' | 'perfect' | null
  isInTune: boolean;           // Whether currently in tune
  isActive: boolean;           // Whether tuner is listening
}
```

**Visual Behavior**:
- Animated needle that moves based on cents deviation
- Color-coded feedback: green (in tune), yellow (close), red (off)
- Center zone indicator that glows when in tune
- Tick marks at 5-cent intervals
- "♭ FLAT" and "SHARP ♯" direction labels

### TunerNoteDisplay

**Purpose**: Large display showing detected note, frequency, and tuning guidance.

**Location**: `components/ui/tuner/TunerNoteDisplay.tsx`

**Props**:
```typescript
interface TunerNoteDisplayProps {
  detectedString: GuitarString | null;
  frequency: number | null;      // Hz
  cents: number | null;          // Deviation from target
  direction: TuningDirection;
  status: TunerStatus;
  isInTune: boolean;
}
```

**Visual Behavior**:
- Status indicator with LED dot (idle/detecting/in tune)
- Large note name (64px) with octave
- String label (e.g., "Low E (6th String)")
- Frequency display in Hz
- Deviation display in cents (color-coded)
- Tuning guidance arrows (↑ tighten / ↓ loosen)

### TunerStringSelector

**Purpose**: Row of 6 buttons for guitar strings with auto-detection.

**Location**: `components/ui/tuner/TunerStringSelector.tsx`

**Props**:
```typescript
interface TunerStringSelectorProps {
  detectedString: GuitarString | null;
  isInTune: boolean;
  onStringSelect?: (string: GuitarString) => void;
  isActive: boolean;
}
```

**Visual Behavior**:
- 6 tactile buttons (strings 6-1: E2, A2, D3, G3, B3, E4)
- Auto-highlights detected string (charcoal background)
- LED indicator appears on detected string
- LED turns green when in tune
- Audio + haptic feedback on press

### TunerControls

**Purpose**: Start/Stop button and signal strength meter.

**Location**: `components/ui/tuner/TunerControls.tsx`

**Props**:
```typescript
interface TunerControlsProps {
  status: TunerStatus;
  signalStrength: number;      // 0-1 normalized
  hasPermission: boolean;
  permissionStatus: string;
  onStart: () => void;
  onStop: () => void;
}
```

**Visual Behavior**:
- Large START/STOP button (vermilion when active)
- Signal strength meter (5 bars)
- Permission status indicator

### useTunerMachine Hook

**Purpose**: Central state machine managing all tuner functionality.

**Location**: `hooks/tuner/useTunerMachine.ts`

**Returns**:
```typescript
interface TunerHookReturn {
  // State
  status: TunerStatus;              // 'idle' | 'initializing' | 'listening' | 'detecting' | 'in_tune'
  detectedString: GuitarString | null;
  frequency: number | null;
  cents: number | null;
  direction: TuningDirection;
  isInTune: boolean;
  signalStrength: number;
  hasPermission: boolean;
  permissionStatus: string;

  // Actions
  start: () => void;
  stop: () => void;
}
```

**Usage**:
```typescript
import { useTunerMachine } from '@/hooks/tuner';

function TunerScreen() {
  const tuner = useTunerMachine();

  return (
    <>
      <TunerNoteDisplay
        detectedString={tuner.detectedString}
        frequency={tuner.frequency}
        cents={tuner.cents}
        direction={tuner.direction}
        status={tuner.status}
        isInTune={tuner.isInTune}
      />
      <TunerMeter
        cents={tuner.cents}
        direction={tuner.direction}
        isInTune={tuner.isInTune}
        isActive={tuner.status !== 'idle'}
      />
      <TunerStringSelector
        detectedString={tuner.detectedString}
        isInTune={tuner.isInTune}
        isActive={tuner.status !== 'idle'}
      />
      <TunerControls
        status={tuner.status}
        signalStrength={tuner.signalStrength}
        hasPermission={tuner.hasPermission}
        permissionStatus={tuner.permissionStatus}
        onStart={tuner.start}
        onStop={tuner.stop}
      />
    </>
  );
}
```

### Configuration

**Location**: `constants/TunerConfig.ts`

| Config | Purpose |
|--------|---------|
| `AUDIO_CONFIG` | Sample rate (44.1kHz), buffer sizes, FFT size |
| `YIN_CONFIG` | Pitch detection thresholds and frequency range |
| `VOLUME_THRESHOLD` | Noise gating thresholds for signal detection |
| `TUNING_CONFIG` | In-tune tolerance (±5 cents), stability timing |

### Guitar String Definitions

**Location**: `types/tuner.ts`

```typescript
export const GUITAR_STRINGS = {
  E2: { name: 'E', note: 'E2', frequency: 82.41, stringNumber: 6, fullName: 'Low E' },
  A2: { name: 'A', note: 'A2', frequency: 110.0, stringNumber: 5, fullName: 'A' },
  D3: { name: 'D', note: 'D3', frequency: 146.83, stringNumber: 4, fullName: 'D' },
  G3: { name: 'G', note: 'G3', frequency: 196.0, stringNumber: 3, fullName: 'G' },
  B3: { name: 'B', note: 'B3', frequency: 246.94, stringNumber: 2, fullName: 'B' },
  E4: { name: 'E', note: 'E4', frequency: 329.63, stringNumber: 1, fullName: 'High E' },
} as const;
```

### Licensing

The tuner uses **pitchy v4.1.0** (MIT licensed) for pitch detection, which is fully compatible with commercial/App Store distribution.

---

## Practice Player Components (Dec 23, 2025)

### Overview

Practice Player feature allows users to upload audio files and slow them down without changing pitch, similar to songscription.ai. Uses `expo-av` with `setRateAsync(rate, shouldCorrectPitch: true)` for pitch-preserved speed control.

### PracticePlayerModal

**Purpose**: Full-featured audio player modal with speed control for practicing along with recordings.

**Location**: `components/ui/practice/PracticePlayerModal.tsx`

**Props**:
```typescript
interface PracticePlayerModalProps {
  visible: boolean;
  onClose: () => void;
  initialAudioUrl?: string;    // Pre-loaded audio URL (for saved songs)
  initialNotes?: string;       // Pre-loaded practice notes
  onNotesChange?: (notes: string) => void;
}
```

**Features**:
- File picker for audio files (MP3, WAV, M4A, AIFF)
- Playback controls (play/pause, seek)
- Speed slider (50% - 100% - 150%) with pitch preservation
- Collapsible practice notes section
- File info display (name, size)
- Industrial Play aesthetic (dark theme, vermilion accents)

**Usage**:
```typescript
import { PracticePlayerModal } from '@/components/ui/practice';

<PracticePlayerModal
  visible={practicePlayerModalVisible}
  onClose={() => setPracticePlayerModalVisible(false)}
  initialNotes={practiceNotes}
  onNotesChange={setPracticeNotes}
/>
```

### PlaybackControls

**Purpose**: Transport and speed control component for audio playback.

**Location**: `components/ui/practice/PlaybackControls.tsx`

**Props**:
```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;         // Seconds
  duration: number;            // Seconds
  playbackSpeed: number;       // 0.5 to 1.5
  onPlayPause: () => void;
  onSeek: (position: number) => void;
  onSpeedChange: (speed: number) => void;
}
```

**Visual Behavior**:
- Timeline slider with current position indicator
- Time display (current / total) in MM:SS format
- Large play/pause button with vermilion accent
- Speed control slider with labeled stops (50%, 75%, 100%, 125%, 150%)
- Disabled state when no audio loaded

### usePracticePlayer Hook

**Purpose**: Manages audio playback with speed control and pitch preservation.

**Location**: `hooks/usePracticePlayer.ts`

**Returns**:
```typescript
interface PracticePlayerState {
  isLoaded: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;            // Total duration in seconds
  currentTime: number;         // Current position in seconds
  playbackSpeed: number;       // 0.5 to 1.5 (default: 1.0)
  error: string | null;
}

interface PracticePlayerActions {
  loadAudio: (uri: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayback: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  unload: () => Promise<void>;
}
```

**Key Feature - Pitch Preservation**:
```typescript
// Speed change without pitch shift
await sound.setRateAsync(speed, true); // shouldCorrectPitch = true
```

**Usage**:
```typescript
import { usePracticePlayer } from '@/hooks/usePracticePlayer';

function PracticeScreen() {
  const player = usePracticePlayer();

  const handleFileSelect = async (uri: string) => {
    await player.loadAudio(uri);
  };

  return (
    <PlaybackControls
      isPlaying={player.isPlaying}
      isLoading={player.isLoading}
      currentTime={player.currentTime}
      duration={player.duration}
      playbackSpeed={player.playbackSpeed}
      onPlayPause={player.togglePlayback}
      onSeek={player.seekTo}
      onSpeedChange={player.setSpeed}
    />
  );
}
```

### Types

**Location**: `types/practicePlayer.ts`

```typescript
export interface PracticePlayerState {
  isLoaded: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  playbackSpeed: number;
  error: string | null;
}

// Song type extended with practice fields
export interface Song {
  // ... existing fields
  practiceAudioUrl?: string;   // URL to uploaded practice audio
  practiceNotes?: string;      // User's practice notes
}
```

### Web Compatibility (Skia Fallbacks)

The Practice Player and related components work on web thanks to CSS-based fallback files:

| Component | Native (Skia) | Web (CSS) |
|-----------|---------------|-----------|
| `InsetWindow` | `InsetWindow.tsx` | `InsetWindow.web.tsx` |
| `LEDIndicator` | `LEDIndicator.tsx` | `LEDIndicator.web.tsx` |
| `InsetShadowOverlay` | `InsetShadowOverlay.tsx` | `InsetShadowOverlay.web.tsx` |
| `SurfaceTextureOverlay` | `SurfaceTextureOverlay.tsx` | `SurfaceTextureOverlay.web.tsx` |
| `GlassOverlay` | `GlassOverlay.tsx` | `GlassOverlay.web.tsx` |
| `FrequencyTuner` | `FrequencyTuner.tsx` | `FrequencyTuner.web.tsx` |
| `RotaryKnob` | `RotaryKnob.tsx` | `RotaryKnob.web.tsx` |

**Important**: Use direct imports (not barrel exports) for platform-specific resolution:
```typescript
// ✅ CORRECT - Direct import enables .web.tsx resolution
import { LEDIndicator } from '@/components/skia/primitives/LEDIndicator';

// ❌ WRONG - Barrel import doesn't resolve .web.tsx properly
import { LEDIndicator } from '@/components/skia/primitives';
```

---

## Gamification System (Dec 29, 2025)

### Overview

Complete practice gamification system featuring three interconnected features:
1. **Streak Flame** - Daily practice chain visualization with evolving flames
2. **Song Mastery** - RPG-style skill tree per song (Theory/Technique/Performance paths)
3. **Lifetime Milestones** - Trophy case with achievements across all songs

### Streak Components

#### StreakFlame

**Purpose**: Animated flame visualization that evolves based on streak length.

**Location**: `components/ui/streaks/StreakFlame.tsx` (Native) / `StreakFlame.web.tsx` (Web)

**Props**:
```typescript
interface StreakFlameProps {
  streakDays: number;     // Current streak length
  size?: number;          // Flame size (default: 100)
  animated?: boolean;     // Enable animations (default: true)
}
```

**Visual Behavior**:
| Level | Days | Color | Animation |
|-------|------|-------|-----------|
| Ember | 1-7 | Orange | Subtle flicker |
| Flame | 8-30 | Red-orange + sparks | Pronounced flicker |
| Blaze | 31-100 | Blue-white | Wave motion |
| Inferno | 100+ | Purple | Multi-layer spiral |

#### StreakStats

**Purpose**: Current and longest streak display with flame level indicator.

**Location**: `components/ui/streaks/StreakStats.tsx`

**Props**:
```typescript
interface StreakStatsProps {
  currentStreak: number;
  longestStreak: number;
  flameLevel: FlameLevel;
  isActive: boolean;
}
```

#### StreakFreezeIndicator

**Purpose**: Snowflake icons showing available streak freezes (max 3).

**Location**: `components/ui/streaks/StreakFreezeIndicator.tsx`

**Props**:
```typescript
interface StreakFreezeIndicatorProps {
  available: number;      // 0-3 freezes available
  size?: number;          // Icon size (default: 20)
}
```

#### DailyGoalProgress

**Purpose**: Progress bar showing today's practice toward daily goal.

**Location**: `components/ui/streaks/DailyGoalProgress.tsx`

**Props**:
```typescript
interface DailyGoalProgressProps {
  currentMinutes: number;
  goalMinutes: number;
  goalMet: boolean;
}
```

#### DailyGoalSelector

**Purpose**: Selector for daily practice goal (15/30/60 minutes).

**Location**: `components/ui/streaks/DailyGoalSelector.tsx`

**Props**:
```typescript
interface DailyGoalSelectorProps {
  selectedMinutes: DailyGoalMinutes;  // 15 | 30 | 60
  onSelect: (minutes: DailyGoalMinutes) => void;
}
```

#### StreakCalendar

**Purpose**: GitHub-style contribution calendar showing practice history.

**Location**: `components/ui/streaks/StreakCalendar.tsx`

**Props**:
```typescript
interface StreakCalendarProps {
  currentMonth: Date;
  calendarData: Map<string, DailyPracticeLog>;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  dailyGoalMinutes: number;
}
```

**Visual Behavior**:
- Color intensity based on practice percentage (25%/50%/75%/100%+)
- Streak freeze days shown with snowflake icon
- Month navigation with haptic feedback

### Song Mastery Components

#### SkillTree

**Purpose**: Radial 3-path skill tree visualization for song mastery.

**Location**: `components/ui/mastery/SkillTree.tsx`

**Props**:
```typescript
interface SkillTreeProps {
  masteryData: SongMasteryProgress | null;
  song: Song;
  practiceSeconds: number;
  compact?: boolean;       // Mini version for song cards (default: false)
  onNodePress?: (node: MasteryNode) => void;
}
```

**Visual Behavior**:
- 3 paths at 120° angles: Theory (left), Technique (center-right), Performance (right)
- 5 nodes per path, radiating outward
- Skia-based connecting lines with glow effects
- Nodes animate on unlock

#### SkillNode

**Purpose**: Individual skill tree node with locked/unlocked/completed states.

**Location**: `components/ui/mastery/SkillNode.tsx`

**Props**:
```typescript
interface SkillNodeProps {
  node: MasteryNode;
  status: NodeStatus;      // 'locked' | 'unlocked' | 'completed'
  progress?: number;       // 0-100 for technique nodes
  compact?: boolean;
  onPress?: () => void;
}
```

**Visual Behavior**:
- Locked: Grayscale, padlock icon
- Unlocked: Gold border, path color fill
- Completed: Full color with glow, checkmark badge

#### MiniSkillTree

**Purpose**: Compact 3-star display for song cards showing path completion.

**Location**: `components/ui/mastery/MiniSkillTree.tsx`

**Props**:
```typescript
interface MiniSkillTreeProps {
  starRating: number;      // 0-3 stars
  theoryComplete: boolean;
  techniqueComplete: boolean;
  performanceComplete: boolean;
}
```

#### StarRating

**Purpose**: 0-3 star display for overall song mastery.

**Location**: `components/ui/mastery/StarRating.tsx`

**Props**:
```typescript
interface StarRatingProps {
  rating: number;          // 0-3 stars
  size?: number;           // Star size (default: 24)
  showLabel?: boolean;     // Show "X/3" label
}
```

### Lifetime Milestone Components

#### Trophy

**Purpose**: Individual trophy display with tier styling and unlock state.

**Location**: `components/ui/milestones/Trophy.tsx`

**Props**:
```typescript
interface TrophyProps {
  milestone: LifetimeMilestone;
  unlocked: boolean;
  progress: number;        // 0-100
  compact?: boolean;
  onPress?: () => void;
}
```

**Visual Behavior**:
- 5 tier colors: Bronze, Silver, Gold, Platinum, Diamond
- Locked: Grayscale silhouette
- Unlocked: Full metallic color with shine
- Skia gradients for metallic effect (native)

#### TrophyCase

**Purpose**: Trophy shelves organized by category.

**Location**: `components/ui/milestones/TrophyCase.tsx`

**Props**:
```typescript
interface TrophyCaseProps {
  stats: UserGlobalStats;
  unlockedIds: string[];
  onTrophyPress?: (milestone: LifetimeMilestone) => void;
  compact?: boolean;
}
```

**Visual Behavior**:
- 4 shelves: Practice Time, Songs Mastered, Practice Streaks, Genre Mastery
- Horizontal scrolling per shelf
- Shelf progress counter (e.g., "3 / 6")
- Wood grain shelf edge effect

#### MilestoneProgress

**Purpose**: Progress bar toward next milestone in category.

**Location**: `components/ui/milestones/MilestoneProgress.tsx`

**Props**:
```typescript
interface MilestoneProgressProps {
  milestone: LifetimeMilestone;
  currentValue: number;
  progress: number;        // 0-100
}
```

#### StatsDashboard

**Purpose**: 2x2 grid showing global practice statistics.

**Location**: `components/ui/milestones/StatsDashboard.tsx`

**Props**:
```typescript
interface StatsDashboardProps {
  stats: UserGlobalStats;
  totalMilestones?: number;
  unlockedMilestones?: number;
  compact?: boolean;
}
```

**Visual Behavior**:
- Grid cells: Total Practice, Songs Mastered, Current Streak, Trophies
- Icon + value + label per cell
- Streak cell highlights when active (vermilion border)

### Gamification Hooks

| Hook | Purpose | Location |
|------|---------|----------|
| `useStreakData` | Daily streak management, goal tracking | `hooks/useStreakData.ts` |
| `useStreakCalendar` | Calendar data with month navigation | `hooks/useStreakCalendar.ts` |
| `useSongMastery` | Per-song skill tree progress | `hooks/useSongMastery.ts` |
| `useGlobalStats` | Lifetime stats aggregation | `hooks/useGlobalStats.ts` |
| `useMilestones` | Lifetime milestone tracking | `hooks/useMilestones.ts` |

#### useStreakData

**Returns**:
```typescript
interface UseStreakDataReturn {
  streakData: UserStreak | null;
  todayProgress: DailyPracticeLog | null;
  flameLevel: FlameLevel;
  dailyGoalProgress: number;      // 0-100
  todayGoalMet: boolean;
  isActive: boolean;
  updateDailyGoal: (minutes: DailyGoalMinutes) => Promise<void>;
  recordPractice: (minutes: number) => Promise<StreakUpdateResult | null>;
  refresh: () => Promise<void>;
  isLoading: boolean;
}
```

#### useSongMastery

**Returns**:
```typescript
interface UseSongMasteryReturn {
  masteryData: SongMasteryProgress | null;
  nodes: Map<string, { node: MasteryNode; status: NodeStatus }>;
  starRating: number;             // 0-3
  isLoading: boolean;
  refresh: () => Promise<void>;
}
```

#### useGlobalStats

**Returns**:
```typescript
interface UseGlobalStatsReturn {
  stats: UserGlobalStats | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

interface UserGlobalStats {
  total_practice_seconds: number;
  songs_mastered: number;         // 1hr+ each
  current_streak: number;
  genres_practiced: Map<string, number>;
  weekly_practice: number[];      // Last 7 days in minutes
}
```

#### useMilestones

**Returns**:
```typescript
interface UseMilestonesReturn {
  unlockedIds: string[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  checkForNew: (stats: UserGlobalStats) => LifetimeMilestone[];
}
```

### Types

| Type File | Contents |
|-----------|----------|
| `types/streak.ts` | `FlameLevel`, `UserStreak`, `DailyPracticeLog`, flame helpers |
| `types/mastery.ts` | `MasteryPath`, `MasteryNode`, `NodeStatus`, technique thresholds |
| `types/milestones.ts` | `LifetimeMilestone`, `MilestoneTier`, `MilestoneCategory`, ALL_MILESTONES |

### Flame Levels

| Level | Days | Colors | Key |
|-------|------|--------|-----|
| Ember | 1-7 | `#FF6B00`, `#FF8C00` | Starting fire |
| Flame | 8-30 | `#FF4500`, `#FF0000` | Building heat |
| Blaze | 31-100 | `#4169E1`, `#00BFFF` | Blue flame |
| Inferno | 100+ | `#9400D3`, `#FF00FF` | Purple fury |

### Milestone Tiers

| Tier | Color | Examples |
|------|-------|----------|
| Bronze | `#CD7F32` | 1hr practice, 1 song mastered |
| Silver | `#C0C0C0` | 10hr practice, 5 songs mastered |
| Gold | `#FFD700` | 50hr practice, 25 songs mastered |
| Platinum | `#E5E4E2` | 100hr practice, 50 songs mastered |
| Diamond | `#B9F2FF` | 1000hr practice, 100 songs mastered |

### Database Tables

| Table | Purpose |
|-------|---------|
| `user_streaks` | Current/longest streak, daily goal, freezes |
| `daily_practice_logs` | Per-day practice minutes, goal met status |
| `song_mastery_progress` | Per-song skill tree node completion |
| `lifetime_milestones` | Milestone definitions (seeded) |
| `user_lifetime_milestones` | User's unlocked milestones |

**Migration**: `docs/migrations/001_gamification_system.sql`

---

### Celebration Modals

#### DailyGoalModal

**Purpose**: Celebration modal shown when user meets their daily practice goal.

**Location**: `components/ui/streaks/DailyGoalModal.tsx`

**Props**:
```typescript
interface DailyGoalModalProps {
  visible: boolean;
  goalMinutes?: number;      // Daily goal (default: 30)
  practiceMinutes?: number;  // Practice completed (default: 0)
  currentStreak: number;     // Current streak days
  onClose: () => void;
}
```

**Visual Behavior**:
- Animated check mark with spring animation
- Shows goal achievement with target icon
- Extra practice bonus badge (if exceeded goal)
- Current streak display with flame styling
- Motivational messages based on streak length
- Green moss theme throughout

#### MilestoneModal

**Purpose**: Celebration modal for lifetime trophy/milestone unlocks.

**Location**: `components/ui/milestones/MilestoneModal.tsx`

**Props**:
```typescript
interface MilestoneModalProps {
  visible: boolean;
  milestones: LifetimeMilestone[];  // Newly unlocked milestones
  onClose: () => void;
}
```

**Visual Behavior**:
- Displays one or more unlocked trophies
- Tier-based glow effects (bronze → diamond)
- Pulsing shine animation on trophy icons
- Category label with icon
- Motivational messages per milestone category
- Button color matches highest tier unlocked

#### StreakMilestoneModal

**Purpose**: Celebration modal for reaching streak milestones (7, 14, 30, 60, 90, 180, 365 days).

**Location**: `components/ui/streaks/StreakMilestoneModal.tsx`

**Props**:
```typescript
interface StreakMilestoneModalProps {
  visible: boolean;
  streakDays: number;       // Current streak count
  freezeEarned?: boolean;   // Show freeze earned badge
  onClose: () => void;
}
```

**Visual Behavior**:
- Animated flame with pulse effect
- Streak count display with fire emoji
- Freeze earned badge (snowflake icon, shows when applicable)
- Color scheme evolves with streak level (ember → inferno)
- Motivational messages for each milestone tier

---

## Circle of Fifths Widget (Jan 1, 2026)

### Overview

Interactive Circle of Fifths music theory tool accessible from the Theory tab by tapping the Key metric. Features draggable rotation, tap-to-select keys, all 7 modes, and related key information.

### CircleOfFifths

**Purpose**: Core circular visualization showing major keys (outer ring) and relative minor keys (inner ring) with interactive rotation.

**Location**: `components/ui/theory/CircleOfFifths.tsx` (Native/Skia) / `CircleOfFifths.web.tsx` (Web/SVG)

**Props**:
```typescript
interface CircleOfFifthsProps {
  selectedKey: string;           // e.g., "C Major", "Am"
  mode?: ModeName;               // 'ionian' | 'dorian' | 'phrygian' | etc.
  onKeySelect?: (key: string, quality: 'major' | 'minor') => void;
  size?: number;                 // Circle diameter (default: 340)
}
```

**Visual Behavior**:
- **Outer ring**: 12 major keys in alloy-colored segments
- **Inner ring**: 12 relative minor keys in darker segments
- **Selected key**: Vermilion (major) or lobsterPink (minor) highlight with glow
- **Center well**: Dark recessed display showing selected key name
- **Bezel**: Charcoal ring simulating metal housing
- **LED indicator**: Vermilion dot at top marking 12 o'clock position

**Interaction**:
- **Drag to rotate**: Pan gesture rotates entire circle smoothly with spring physics
- **Tap to select**: Tap any segment to select that key
- **Haptic + audio feedback** on every interaction

### CircleOfFifthsModal

**Purpose**: Full-screen modal containing Circle of Fifths with mode selector, scale info, and related keys display.

**Location**: `components/ui/theory/CircleOfFifthsModal.tsx`

**Props**:
```typescript
interface CircleOfFifthsModalProps {
  visible: boolean;
  onClose: () => void;
  songKey: string;               // Initial key from analyzed song
  songTitle?: string;
  artist?: string;
}
```

**Features**:
- **Header**: "CIRCLE OF FIFTHS" title with song info subtitle
- **Mode selector**: GangSwitch for all 7 modes (Lydian → Locrian)
- **Circle visualization**: Interactive CircleOfFifths component
- **Info panel**: Scale notes, mode character description, related keys (IV-I-V)
- **Reset button**: Returns to song's original key
- **Song key badge**: Shows original analyzed key at bottom

**Mode Options**:
| Mode | Character |
|------|-----------|
| Lydian | Bright, dreamy |
| Major/Ionian | Happy, resolved |
| Mixolydian | Bluesy, dominant |
| Dorian | Minor with bright 6th |
| Natural Minor/Aeolian | Sad, dark |
| Phrygian | Spanish, exotic |
| Locrian | Diminished, unstable |

### Music Theory Utilities

**Location**: `utils/musicTheory.ts`

**Constants**:
```typescript
CIRCLE_OF_FIFTHS_MAJOR  // ['C', 'G', 'D', 'A', 'E', 'B', 'F#/Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']
CIRCLE_OF_FIFTHS_MINOR  // ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m/Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm']
KEY_SIGNATURES          // Number of sharps/flats per key
MODES                   // All 7 modes with scale patterns and descriptions
```

**Functions**:
```typescript
parseKey(keyString)              // "C Major" → { root: "C", quality: "major" }
getCircleIndex(root)             // "G" → 1 (position in circle)
getKeyRotation(root)             // Rotation angle to position key at top
getScaleNotes(root, mode)        // ["C", "D", "E", "F", "G", "A", "B"]
getRelatedKeys(root, quality)    // { tonic, dominant, subdominant, relative, parallel }
getEnharmonic(note)              // "C#" → "Db"
```

### Usage

The Circle of Fifths is accessed by tapping the **Key** metric in the Theory tab of any analyzed song:

```typescript
// TheoryMetricsRow automatically includes the modal
<TheoryMetricsRow
  tuning="Standard"
  keyValue="G Major"           // Tap this to open Circle of Fifths
  tempo="120 BPM"
  timeSignature="4/4"
  songTitle="Wonderwall"
  artist="Oasis"
/>
```

### Web Compatibility

The Circle of Fifths uses platform-specific implementations:
- **Native (iOS/Android)**: Skia Canvas with gesture handlers
- **Web**: SVG with CSS transforms and pointer events

Both provide identical functionality with haptic feedback (where available) and audio feedback.

**Platform-Specific Files**:
| Component | Native | Web |
|-----------|--------|-----|
| `CircleOfFifths` | `CircleOfFifths.tsx` (Skia) | `CircleOfFifths.web.tsx` (SVG) |
| `CircleOfFifthsModal` | `CircleOfFifthsModal.tsx` | `CircleOfFifthsModal.web.tsx` |
| `TheoryMetricsRow` | `TheoryMetricsRow.tsx` | `TheoryMetricsRow.web.tsx` |

---

## Chord Diagram Components

### GuitarChordDiagram

**Skia-based guitar chord visualization** with root note highlighting.

```tsx
import { GuitarChordDiagram } from '@/components/ui/theory/chords';

<GuitarChordDiagram
  fingering={voicing}
  chordName="Am7"
  rootNote="A"        // Highlights A notes in green
  showFingers={true}
  size="medium"       // "small" | "medium" | "large"
/>
```

### ChordVisualization

**Unified wrapper** for instrument-specific chord diagrams with chord lookup.

```tsx
import { ChordVisualization } from '@/components/ui/theory/chords';

<ChordVisualization
  chord="Am7"
  instrument="guitar"
  voicingIndex={0}
  showFingers={true}
  size="medium"
  showChordName={true}
/>
```

### TheoryChordSection

**Container for chord diagrams** with add/delete functionality.

```tsx
import { TheoryChordSection } from '@/components/ui/theory';

<TheoryChordSection
  label="HARMONY"
  chords={['Am', 'G', 'C', 'F']}
  instrument="guitar"
  editable={true}
  onAddChord={() => setAddModalVisible(true)}
  onDeleteChord={(chord) => handleDelete(chord)}
/>
```

### Web Compatibility (Chord Diagrams)

Chord diagram components use platform-specific implementations to work around Skia's `useFont` hook not functioning properly on web:

- **Native (iOS/Android)**: Skia Canvas with custom font rendering
- **Web**: react-native-svg with SVG text elements

**Platform-Specific Files**:
| Component | Native | Web |
|-----------|--------|-----|
| `GuitarChordDiagram` | `GuitarChordDiagram.tsx` (Skia) | `GuitarChordDiagram.web.tsx` (SVG) |
| `ChordVisualization` | `ChordVisualization.tsx` | `ChordVisualization.web.tsx` |
| `TheoryChordSection` | `TheoryChordSection.tsx` | `TheoryChordSection.web.tsx` |

**Barrel Exports**:
- `components/ui/theory/index.ts` - Native exports
- `components/ui/theory/index.web.ts` - Web exports (auto-resolved by bundler)
- `components/ui/theory/chords/index.ts` - Native chord exports
- `components/ui/theory/chords/index.web.ts` - Web chord exports

Both platforms provide identical visual output with the same chord fingering data.

---

*Last updated: Jan 1, 2026*
