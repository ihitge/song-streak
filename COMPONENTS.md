# Song Streak Component Library

> **For Claude AI**: Always check this file before creating new UI components. Reuse existing components to avoid tech debt.

---

## Quick Reference

| Component | Purpose | Location |
|-----------|---------|----------|
| `NavButton` | Tactile navigation button with LED indicator | `components/ui/NavButton.tsx` |
| `SelectorKey` | Filter/dropdown trigger button | `components/ui/SelectorKey.tsx` |
| `InstrumentPicker` | Dropdown menu for selection | `components/ui/InstrumentPicker.tsx` |
| `TactileNavbar` | Bottom navigation bar | `components/ui/TactileNavbar.tsx` |
| `LibraryHeader` | Page header with search and filters | `components/ui/LibraryHeader.tsx` |

---

## Design Tokens

### Colors

Import: `import { Colors } from '@/constants/Colors';`

| Token | Hex | Usage |
|-------|-----|-------|
| `Colors.matteFog` | `#e6e6e6` | Chassis/background |
| `Colors.softWhite` | `#f0f0f0` | Inset surfaces, highlights |
| `Colors.charcoal` | `#333333` | Dark controls, primary text |
| `Colors.alloy` | `#d6d6d6` | Light controls, wells |
| `Colors.vermilion` | `#ea5428` | Action/accent (hero color) |
| `Colors.ink` | `#222222` | Text primary |
| `Colors.graphite` | `#888888` | Labels, secondary text |

### Typography

| Use Case | Font | Size | Weight |
|----------|------|------|--------|
| Headlines | System (default) | 20px | Bold |
| Body text | System | 16px | Regular |
| Labels | SpaceMono | 9-10px | Bold, uppercase |
| Values | SpaceGrotesk | 12-16px | Bold |

### Spacing

| Size | Value | Usage |
|------|-------|-------|
| xs | 4px | Gap between icon and text |
| sm | 8px | Internal padding, small gaps |
| md | 12px | Component padding |
| lg | 16px | Section spacing |
| xl | 24px | Page margins |

### Shadow Pattern (Recessed Well)

```typescript
// Standard inset shadow for wells/inputs
{
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 5,
  elevation: 3,
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderColor: '#c0c0c0',
  borderBottomWidth: 1,
  borderRightWidth: 1,
  borderBottomColor: '#f0f0f0',
  borderRightColor: '#f0f0f0',
}
```

---

## Component Catalog

### NavButton

**Purpose**: Tactile navigation button with "Deep Dish" design - includes well, cap, and LED indicator.

**Location**: `components/ui/NavButton.tsx`

**Props**:
```typescript
interface NavButtonProps {
  iconName: React.ComponentProps<typeof FontAwesome>['name']; // FontAwesome icon name
  label: string;                                               // Button label (uppercase, small)
  isActive: boolean;                                           // Active state (LED on, pressed look)
  onPress: () => void;                                         // Press handler
}
```

**Usage**:
```tsx
import { NavButton } from '@/components/ui/NavButton';

<NavButton
  iconName="bolt"
  label="Streak"
  isActive={currentRoute === '/practice'}
  onPress={() => router.push('/practice')}
/>
```

**Visual Behavior**:
- **Inactive**: Cap raised (`translateY: -2`), LED grey (`#cccccc`)
- **Active**: Cap pressed (`translateY: 2`), LED orange with glow (`#ea5428`), icon turns orange

**Do**:
- Use for primary navigation actions
- Pair with `TactileNavbar` for bottom navigation

**Don't**:
- Don't use for form submissions
- Don't use for inline actions (use `SelectorKey` instead)

---

### SelectorKey

**Purpose**: Filter/dropdown trigger with label, icon, value display, and chevron indicator. Creates a "recessed well" appearance.

**Location**: `components/ui/SelectorKey.tsx`

**Props**:
```typescript
interface SelectorKeyProps {
  label: string;                              // Top label (uppercase, small)
  value: string;                              // Current value displayed
  IconComponent: React.ComponentType<any>;   // Lucide icon component
  onPress?: () => void;                       // Press handler (toggle dropdown)
}
```

**Usage**:
```tsx
import { SelectorKey } from '@/components/ui/SelectorKey';
import { Guitar } from 'lucide-react-native';

<SelectorKey
  label="INST"
  value="Guitar"
  IconComponent={Guitar}
  onPress={() => setShowDropdown(true)}
/>
```

**Visual Behavior**:
- 40px height with recessed well styling
- Chevron down indicator on right side
- Label above button in small uppercase

**Do**:
- Use for filter controls
- Pair with `InstrumentPicker` for dropdown functionality
- Use Lucide icons (thin stroke, 16px)

**Don't**:
- Don't use for navigation (use `NavButton`)
- Don't nest inside other pressables

---

### InstrumentPicker

**Purpose**: Dropdown menu displaying selectable options with icons. Positioned absolutely below its trigger.

**Location**: `components/ui/InstrumentPicker.tsx`

**Props**:
```typescript
interface InstrumentPickerProps {
  options: {
    instrument: Instrument;                    // Option value
    IconComponent: React.ComponentType<any>;   // Lucide icon
  }[];
  onSelect: (instrument: Instrument) => void;  // Selection handler
  onClose: () => void;                         // Close handler
  currentValue: Instrument;                    // Currently selected value
}
```

**Usage**:
```tsx
import { InstrumentPicker } from '@/components/ui/InstrumentPicker';
import { Guitar, Drum, Piano, Music } from 'lucide-react-native';

const options = [
  { instrument: 'All', IconComponent: Music },
  { instrument: 'Guitar', IconComponent: Guitar },
  { instrument: 'Drums', IconComponent: Drum },
  { instrument: 'Keys', IconComponent: Piano },
];

{showPicker && (
  <InstrumentPicker
    options={options}
    onSelect={handleSelect}
    onClose={() => setShowPicker(false)}
    currentValue={currentInstrument}
  />
)}
```

**Visual Behavior**:
- 200px width, absolute positioned
- Active option: darker background, vermilion text/icon
- Pressed state: even darker background
- Recessed well shadow styling

**Do**:
- Wrap parent in `{ position: 'relative', zIndex: 100 }`
- Always provide `onClose` handler
- Call `onClose` after selection

**Don't**:
- Don't render without a visible trigger
- Don't forget zIndex wrapper

---

### TactileNavbar

**Purpose**: Bottom navigation bar containing `NavButton` instances. Provides app-wide navigation.

**Location**: `components/ui/TactileNavbar.tsx`

**Props**: None (internally manages navigation items)

**Usage**:
```tsx
import { TactileNavbar } from '@/components/ui/TactileNavbar';

// In your layout
<View style={{ flex: 1 }}>
  <View style={{ flex: 1 }}>{/* Page content */}</View>
  <TactileNavbar />
</View>
```

**Current Navigation Items**:
| Name | Icon | Label | Route |
|------|------|-------|-------|
| streak | bolt | Streak | /practice |
| set-list | list | Set List | / |
| metronome | play | Metronome | /timing |

**Visual Behavior**:
- 128px height
- Matte fog background (`#e6e6e6`)
- White top border (seam effect)
- Active detection via `usePathname()`

**Do**:
- Place at bottom of tab layouts
- Let it handle its own routing

**Don't**:
- Don't override with custom nav items (currently hardcoded)

---

### LibraryHeader

**Purpose**: Page header with branding, user controls, search input, and filter keys.

**Location**: `components/ui/LibraryHeader.tsx`

**Props**:
```typescript
interface LibraryHeaderProps {
  instrumentFilter: Instrument;                                              // Current filter value
  onInstrumentFilterChange: (instrument: Instrument) => void;               // Filter change handler
  instrumentOptions: { instrument: Instrument; IconComponent: React.ComponentType<any>; }[];  // Dropdown options
}
```

**Usage**:
```tsx
import { LibraryHeader } from '@/components/ui/LibraryHeader';
import { Guitar, Drum, Piano, Music, MinusCircle } from 'lucide-react-native';

const instrumentOptions = [
  { instrument: 'All', IconComponent: MinusCircle },
  { instrument: 'Guitar', IconComponent: Guitar },
  // ...more options
];

<LibraryHeader
  instrumentFilter={selectedInstrument}
  onInstrumentFilterChange={setSelectedInstrument}
  instrumentOptions={instrumentOptions}
/>
```

**Sections**:
1. **Top Bar**: "SONG STREAK" title, "LIBRARY" subtitle, avatar, logout button
2. **Filter Deck**: Search input, divider, filter keys row (INST, LEVEL, GENRE)

**Visual Behavior**:
- Matte fog chassis background
- White border seams between sections
- Recessed search input
- InstrumentPicker dropdown on INST press

**Do**:
- Use at top of library/list pages
- Pass instrument options with appropriate Lucide icons

**Don't**:
- Don't customize title/subtitle (currently hardcoded)
- Don't expect LEVEL/GENRE filters to work (placeholder `console.log`)

---

## Design Patterns

### "Deep Dish" Button Pattern

Used in `NavButton`. Creates tactile, hardware-inspired buttons.

**Structure**:
```
┌─────────────────┐
│     Well        │  ← Recessed container (dark shadow)
│  ┌───────────┐  │
│  │    Cap    │  │  ← Raised surface (press transforms)
│  │   [LED]   │  │  ← Status indicator (glow when active)
│  │   [Icon]  │  │
│  └───────────┘  │
└─────────────────┘
     [Label]         ← Uppercase small text
```

### "Recessed Well" Pattern

Used in `SelectorKey`, inputs, and filter areas. Creates inset appearance.

**CSS Properties**:
- Background: `#e0e0e0`
- Border: Top/left lighter (`#c0c0c0`), bottom/right lighter (`#f0f0f0`)
- Shadow: Soft inner shadow effect
- Border radius: 8px

### "LED Indicator" Pattern

Used in `NavButton` for active state feedback.

**States**:
- **Inactive**: `#cccccc` (dead grey)
- **Active**: `#ea5428` with glow shadow

---

## Anti-Patterns (Don't Do This)

### Don't hardcode colors
```typescript
// BAD
backgroundColor: '#e6e6e6'

// GOOD
import { Colors } from '@/constants/Colors';
backgroundColor: Colors.matteFog
```

### Don't create inline button styles
```typescript
// BAD - Creating custom button in page
<Pressable style={{ backgroundColor: '#ea5428', padding: 12 }}>
  <Text>Click me</Text>
</Pressable>

// GOOD - Use existing component
<NavButton iconName="play" label="Action" isActive={false} onPress={handlePress} />
```

### Don't define components inline in pages
```typescript
// BAD - Component defined in page file
const SongCard = ({ song }) => { ... }; // In app/(tabs)/index.tsx

// GOOD - Extract to components folder
// components/ui/SongCard.tsx
export const SongCard = ({ song }) => { ... };
```

### Don't mix icon libraries
```typescript
// BAD - Using multiple icon libraries
import { FontAwesome } from '@expo/vector-icons';
import { Guitar } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

// GOOD - Stick to one library per context
// Navigation: FontAwesome (via NavButton)
// UI elements: Lucide React Native (thin stroke, consistent)
```

---

## Future Improvements

Components that should be extracted or created:

1. **SongCard** - Currently inline in `app/(tabs)/index.tsx`
2. **Generic Dropdown** - Make `InstrumentPicker` more reusable
3. **Button variants** - Primary, Secondary, Ghost buttons
4. **Input** - Standalone input component (currently in LibraryHeader)

---

*Last updated: Document first, refactor later.*
