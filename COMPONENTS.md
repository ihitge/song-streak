# Song Streak Component Library

> **For Claude AI**: Always check this file before creating new UI components. Reuse existing components to avoid tech debt.

---

## Quick Reference

| Component | Purpose | Location |
|-----------|---------|----------|
| `PageHeader` | **Reusable page header with logo and user controls** | `components/ui/PageHeader.tsx` |
| `NavButton` | Tactile navigation button with LED indicator | `components/ui/NavButton.tsx` |
| `GangSwitch` | Horizontal/vertical switch with LED indicators | `components/ui/filters/GangSwitch.tsx` |
| `FrequencyTuner` | Horizontal tuner with glass overlay | `components/ui/filters/FrequencyTuner.tsx` |
| `RotaryKnob` | Rotary control with digital readout | `components/ui/filters/RotaryKnob.tsx` |
| `TactileNavbar` | Bottom navigation bar | `components/ui/TactileNavbar.tsx` |
| `LibraryHeader` | Page header with search and filters (uses PageHeader) | `components/ui/LibraryHeader.tsx` |
| `SearchSuggestions` | Dropdown for search results | `components/ui/SearchSuggestions.tsx` |

### Hooks

| Hook | Purpose | Location |
|------|---------|----------|
| `useSignOut` | Centralized sign-out logic with error handling | `hooks/useSignOut.ts` |

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
- User avatar button
- Logout button (uses `useSignOut` hook)

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

---

### FrequencyTuner

**Purpose**: Horizontal sliding tuner control with a glass overlay effect.

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

---

### RotaryKnob

**Purpose**: Rotary control with a digital readout display.

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
  difficultyFilter?: ReactNode; // Slot for GangSwitch
  instrumentFilter?: ReactNode; // Slot for FrequencyTuner
  genreFilter?: ReactNode;      // Slot for RotaryKnob
}
```

**Visual Behavior**:
- **Top Bar**: "SongStreak" logo (MomoTrustDisplay, deepSpaceBlue) + page title + User Avatar/Logout
- **Filter Deck**: Two-row grid configuration
  - Row 1: Search Widget | Difficulty Widget
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

## Design Patterns

### "Recessed Well" Pattern

Used in `GangSwitch`, `Search` input, `RotaryKnob` readout, and `FrequencyTuner` window.

**CSS Properties**:
- Background: `#d6d6d6` (Alloy) or `#e0e0e0`
- Inner Shadow: Top-left dark, bottom-right light

### "Tactile Control" Pattern

Physical metaphors for digital controls.
- **Switch**: Depressible buttons with LEDs
- **Tuner**: Sliding scale behind glass
- **Knob**: Rotation with haptics

### "Analog Glitch" Animation Pattern

Applied to `FrequencyTuner` and `RotaryKnob` text displays.
Creates a quick, slightly jittery slide animation for text value changes, evoking a mechanical or distorted signal aesthetic.

---

## Anti-Patterns

### Don't hardcode colors
Use `Colors` from `@/constants/Colors`.

### Don't inline complex styles
Extract to `StyleSheet.create`.

### Don't mix UI metaphors
Keep to the "Industrial/Analog" aesthetic (wells, knobs, switches).

---

*Last updated: Dec 2, 2025*
