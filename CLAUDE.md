# Claude Instructions for Song Streak

## Component-First Development

**Before creating ANY new UI element, ALWAYS check `COMPONENTS.md` first.**

### Rules

1. **Use existing components** - Never create new buttons, inputs, dropdowns, or cards when reusable components exist
2. **Use design tokens** - Import colors from `constants/Colors.ts`, never hardcode hex values
3. **Follow the "Industrial Play" aesthetic** - Recessed wells, tactile buttons, LED indicators
4. **Extract inline components** - If you create a component inline in a page, extract it to `/components/ui/`
5. **Update documentation** - When adding/modifying components, update `COMPONENTS.md`

### Component Lookup

| Need | Use This Component |
|------|-------------------|
| **Page header (new pages)** | `PageHeader` |
| Page header with filters | `LibraryHeader` (uses PageHeader) |
| Navigation button | `NavButton` |
| Selection Switch | `GangSwitch` |
| Tuner Control | `FrequencyTuner` |
| Rotary Control | `RotaryKnob` |
| Bottom navigation | `TactileNavbar` |

### Hooks

| Need | Use This Hook |
|------|---------------|
| Sign out functionality | `useSignOut` |
| Audio feedback for interactive elements | `useClickSound` |

### Design Tokens

**IMPORTANT**: Always use **named imports** for Colors (with curly braces). Never use default imports.
```typescript
// ✅ CORRECT - Named import
import { Colors } from '@/constants/Colors';

// ❌ WRONG - Default import (will cause ReferenceError)
// import Colors from '@/constants/Colors';

// Primary colors
Colors.matteFog      // #E4DFDA - Background/chassis (Warm Bone)
Colors.softWhite     // #f0f0f0 - Inset surfaces
Colors.charcoal      // #333333 - Dark controls/text
Colors.vermilion     // #EE6C4D - Action/accent (use sparingly)
Colors.ink           // #221E22 - Primary text (Off-Black)
Colors.graphite      // #888888 - Labels/secondary text
Colors.moss          // #417B5A - Success/Easy (Green)
Colors.lobsterPink   // #DB5461 - Accent/Highlight (Lobster Pink)
Colors.deepSpaceBlue // #0E273C - Dark Accent (Deep Space Blue)
Colors.warmGray      // #847577 - Secondary Text (Warm Gray)
```

### Audio Feedback (All Interactive Components)

**IMPORTANT**: All interactive components **must** have audio + haptic feedback.

**Pattern**:
```typescript
import { useClickSound } from '@/hooks/useClickSound';
import * as Haptics from 'expo-haptics';

const { playSound } = useClickSound();

const handlePress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playSound();
  // Perform action
};
```

**Sound File**: `sound-click-07.mp3` (located in `/assets/audio/`)
- Used by: NavButton, FrequencyTuner, GangSwitch, RotaryKnob, SearchSuggestions, PageHeader
- Size: 9.2 KB (optimized MP3)
- Quality: 128 kbps, 48 kHz stereo

**Feedback Order** (Always):
1. Haptic feedback (immediate, synchronous)
2. Sound playback (async, non-blocking)
3. Action execution (navigation, state change, etc.)

**Components that Already Have Audio**:
- ✅ NavButton (STREAK, SETLIST, METRONOME)
- ✅ FrequencyTuner (instrument selector)
- ✅ GangSwitch (difficulty/fluency)
- ✅ RotaryKnob (genre control)
- ✅ SearchSuggestions (suggestions + show more)
- ✅ PageHeader (avatar + logout buttons)

**When Adding New Interactive Components**:
- Always import and use `useClickSound` hook
- Always add haptic feedback with `Haptics.impactAsync(ImpactFeedbackStyle.Light)`
- Ensure both execute in the correct order

### Workflow

1. Read `COMPONENTS.md` before starting UI work
2. Check if an existing component can be used or extended
3. If new component needed, follow existing patterns
4. **For interactive components**: Always add audio + haptic feedback using the pattern above
5. Document new components in `COMPONENTS.md`
6. Test in browser (user must verify - Claude cannot browser test)

---

**GOLDEN RULES**:
- Never make assumptions. Never get lazy. Never hallucinate. Never take the easy route. Always engineer for scalability and the long-term view. Ask when unsure.
- Every interaction should feel tactile: visual + haptic + audio feedback.