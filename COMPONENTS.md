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
| `InsetWindow` | **Reusable Skia inset window (dark/light variants)** | `components/ui/InsetWindow.tsx` |
| `LEDIndicator` | **Skeuomorphic LED with metal bezel and bloom** | `components/skia/primitives/LEDIndicator.tsx` |
| `GlassOverlay` | **Skia-based glass effect overlay (glare, specular highlight, bezel)** | `components/ui/GlassOverlay.tsx` |
| `InsetShadowOverlay` | **Recessed depth effect via edge gradients** | `components/skia/primitives/InsetShadowOverlay.tsx` |
| `SurfaceTextureOverlay` | **Noise/grain texture for dust/scratches on glass** | `components/skia/primitives/SurfaceTextureOverlay.tsx` |
| `TheorySection` | **Section container with label + alloy content box** | `components/ui/theory/TheorySection.tsx` |
| `TheoryMetricsRow` | **2x2 grid display for Tuning, Key, Tempo, Time Signature** | `components/ui/theory/TheoryMetricsRow.tsx` |
| `TheoryChipGroup` | **Labeled chip container for chords/scales/techniques** | `components/ui/theory/TheoryChipGroup.tsx` |
| `TheoryChordSection` | **Chord diagrams with floating delete button (top-right)** | `components/ui/theory/TheoryChordSection.tsx` |
| `ChordChartModal` | **Full-screen chord diagram modal** | `components/ui/theory/ChordChartModal.tsx` |
| `AddChordModal` | **Modal for manually adding chords** | `components/ui/theory/chords/AddChordModal.tsx` |
| `GuitarChordDiagram` | **Skia-based guitar chord visualization** | `components/ui/theory/chords/GuitarChordDiagram.tsx` |
| `ChordVisualization` | **Unified chord diagram wrapper (multi-instrument)** | `components/ui/theory/chords/ChordVisualization.tsx` |
| `ChordChip` | **Tappable chord chip with diagram indicator + delete** | `components/ui/theory/chords/ChordChip.tsx` |

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
| `useChordChartSound` | Audio feedback for chord chart interactions | sound-shared-click.mp3 | `hooks/useChordChartSound.ts` |
| `useBands` | Band management (create, join, list bands) | N/A | `hooks/useBands.ts` |
| `useSetlists` | Setlist management for bands | N/A | `hooks/useSetlists.ts` |
| `usePracticeData` | Practice session tracking and achievements | N/A | `hooks/usePracticeData.ts` |
| `useSearch` | Debounced search with relevance scoring | N/A | `hooks/useSearch.ts` |
| `useMetronome` | Core metronome logic with drift-corrected timing | N/A | `hooks/useMetronome.ts` |
| `useMetronomeSound` | Sound pool for metronome (click, snare, bass, hihat) | metronome-*.wav, sound-click-*.wav | `hooks/useMetronomeSound.ts` |

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

*Last updated: Dec 17, 2025*

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

**Result**: Extended chords now generate proper voicings with all essential notes displayed as orange dots on the fretboard diagram.

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
