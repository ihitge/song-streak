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
| `RamsTapeCounterDisplay` | Flip-chart style time display (MM:SS) | `components/ui/practice/RamsTapeCounterDisplay.tsx` |

### Hooks

| Hook | Purpose | Sound File | Location |
|------|---------|------------|----------|
| `useSignOut` | Centralized sign-out logic with error handling | N/A | `hooks/useSignOut.ts` |
| `useSettings` | App settings (dark mode, sound enabled) | N/A | `hooks/useSettings.ts` |
| `useStyledAlert` | **Styled alert system (replaces native Alert.alert)** | N/A | `hooks/useStyledAlert.tsx` |
| `useNavButtonSound` | Audio feedback for NavButton (large nav) | sound-nav-button.wav | `hooks/useNavButtonSound.ts` |
| `useGangSwitchSound` | Audio feedback for GangSwitch (small filters) | sound-gang-switch.wav | `hooks/useGangSwitchSound.ts` |
| `useRotaryKnobSound` | Audio feedback for RotaryKnob (genre selector) | sound-rotary-knob.wav | `hooks/useRotaryKnobSound.ts` |
| `useFABSound` | Audio feedback for FAB (add song button) | sound-fab.wav | `hooks/useFABSound.ts` |
| `useClickSound` | Audio feedback for shared components | sound-shared-click.mp3 | `hooks/useClickSound.ts` |
| `useBands` | Band management (create, join, list bands) | N/A | `hooks/useBands.ts` |
| `useSetlists` | Setlist management for bands | N/A | `hooks/useSetlists.ts` |
| `usePracticeData` | Practice session tracking and achievements | N/A | `hooks/usePracticeData.ts` |
| `useSearch` | Debounced search with relevance scoring | N/A | `hooks/useSearch.ts` |
| `useMetronome` | Core metronome logic with drift-corrected timing | N/A | `hooks/useMetronome.ts` |
| `useMetronomeSound` | Sound pool for metronome clicks | sound-click-*.wav | `hooks/useMetronomeSound.ts` |

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

**Purpose**: Reusable page header component with SongStreak logo, page subtitle, and user controls. Use this for all new pages to ensure consistent branding.

**Location**: `components/ui/PageHeader.tsx`

**Props**:
```typescript
interface PageHeaderProps {
  subtitle: string;    // Page title (e.g., "LIBRARY", "ADD SONG")
  children?: ReactNode; // Optional content below header (e.g., filter deck)
}
```

**Usage**:
```typescript
// Basic page
<PageHeader subtitle="PAGE NAME" />

// Page with additional content below header
<PageHeader subtitle="LIBRARY">
  <FilterDeck>...</FilterDeck>
</PageHeader>
```

**Visual Behavior**:
- SongStreak logo (MomoTrustDisplay, deepSpaceBlue)
- Page subtitle (uppercase, warmGray)
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
  label: string; // Label above the tuner (increased to 10px)
  value: T;      // Current selected value (value text increased to 10px)
  options: FilterOption<T>[];
  onChange: (val: T) => void;
  disabled?: boolean;
}
```

**Visual Behavior**:
- **Height**: Reduced to 38px.
- Dark window with scale markings
- "Glass" reflection overlay
- Orange hairline indicator
- **Animated Text**: Value text animates with a "glitchy" slide from the side when changed.
- Audio + haptic feedback on chevron taps (`useClickSound` hook)

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
- **Top Bar**: "SongStreak" logo (MomoTrustDisplay, deepSpaceBlue) + page title + User Avatar/Logout
- **Filter Deck**: Two-row grid configuration
  - Row 1: Search Widget
  - Row 2: Instrument Widget | Genre Widget
- **Search Widget**: Flat, recessed input. Height reduced to 38px.

---

### AddSongScreen

**Purpose**: Screen for adding new songs, featuring a tabbed interface using `GangSwitch`.

**Location**: `app/(tabs)/add-song.tsx`

**Features**:
- **Header**: Uses `PageHeader` component for consistent branding.
- **Tabs**: Uses `GangSwitch` with `allowDeselect={false}` to switch between 'Basics', 'Theory', and 'Lyrics'.
- **Navigation**: Accessible via the FAB on the Library screen; integrated into the main Tab layout.

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

**Note**: The `children` prop allows embedding content (like BPM display) inside the VU meter housing. `MetronomePanel` uses this to embed the BPM controls inside the meter housing.

### MetronomePanel (Composite Component)

**Purpose**: Composite component combining VU meter (with embedded BPM) and session timer (tape counter) into a reusable panel.

**Location**: `components/ui/metronome/MetronomePanel.tsx`

**Props**:
```typescript
interface MetronomePanelProps {
  // Metronome state (from useMetronome)
  beatPosition: number;
  isMetronomePlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: number;

  // BPM controls
  bpm: number;
  onBpmChange: (bpm: number) => void;
  onTapTempo: () => number | null;

  // Timer
  sessionSeconds: number;

  // Options
  compact?: boolean;
}
```

**Layout** (top to bottom):
1. VU Meter Housing (contains pendulum + BPM display inside)
2. Session Timer (RamsTapeCounterDisplay - tape counter style, separate)

**Usage**:
```typescript
import { MetronomePanel } from '@/components/ui/metronome';

<MetronomePanel
  beatPosition={metronome.beatPosition}
  isMetronomePlaying={metronome.isPlaying}
  currentBeat={metronome.currentBeat}
  beatsPerMeasure={metronome.beatsPerMeasure}
  bpm={metronome.bpm}
  onBpmChange={metronome.setBpm}
  onTapTempo={metronome.tapTempo}
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

Core metronome logic with drift-corrected timing.

**Usage**:
```typescript
import { useMetronome } from '@/hooks/useMetronome';

const metronome = useMetronome({
  initialBpm: 120,
  initialTimeSignature: '4/4',
  initialSubdivision: 1,
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
const bpm = metronome.tapTempo(); // Tap tempo

// State
console.log(metronome.bpm);           // 120
console.log(metronome.isPlaying);     // true/false
console.log(metronome.beatPosition);  // 0 or 1 for VU meter
console.log(metronome.currentBeat);   // 1-4
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

*Last updated: Dec 11, 2025 (Added MetronomePanel composite, RamsTapeCounterDisplay, separated metronome from timer display)*
