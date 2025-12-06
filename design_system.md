The "Song Streak Design System"

Codename: Soft Industrial
Philosophy: "Weniger, aber besser" (Less, but better).

This design system moves away from "Flat Design" and embraces Tactile Minimalism. The interface should feel like a high-end physical object—milled aluminum, matte plastic, and precise mechanical switches.

### Aesthetic Direction: "Industrial Play"
*"Braun meets Nintendo" - Teenage Engineering-inspired tactile minimalism*

**Visual References:**
All visual reference images, mood boards, and detailed mockups are stored in the `/visual-direction` folder in the project root.

**Core Principles:**
- Feels like a high-end physical object
- Matte finishes, no glossy gradients
- Dark-first design (light mode inverted)
- Hardware-inspired controls
- Every interaction has haptic feedback
- Every interaction has audio feedback (click sounds)

1. The Visual Language

A. Color Palette (The "Chassis")

We are abandoning high-contrast blacks and neon borders for warm, matte neutrals.

Role

Color

Hex

Description

Chassis (Base)

Matte Fog

#E4DFDA

Main background. The "plastic" casing (Warm Bone).

Surface (Inset)

Soft White

#f0f0f0

Recessed areas, screen beds.

Control (Dark)

Charcoal

#333333

Dark toggle switches (Physical contrast).

Control (Light)

Alloy

#d6d6d6

Light buttons (match chassis but raised).

Action (Hero)

Vermilion

#EE6C4D

ONLY for primary actions (Save, Record, Play).

Text (Primary)

Ink

#221E22

Never pure black. Soft Black / Dark Charcoal.

Text (Label)

Graphite

#888888

Micro-copy, uppercase labels.

Accent (Highlight)

Lobster Pink

#DB5461

For subtle accents or highlights.

Dark Accent

Deep Space Blue

#0E273C

For deep, dark accents.

Secondary Text

Warm Gray

#847577

Warmer alternative to Graphite.

B. Typography

**Primary Font Family:** Lexend Deca (custom font, all weights loaded)
Why? Modern, highly legible typeface with excellent readability. Clean geometric forms complement the industrial aesthetic.

**Logo Font:** MomoTrustDisplay (custom font)
Why? Distinctive display font for the SongStreak brand. Used exclusively for the app logo.

**Available Lexend Deca Weights:**
- Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black

**Centralized Typography:** Import from `@/constants/Styles`
```typescript
import { Typography } from '@/constants/Styles';
// Typography.appLogo, Typography.pageSubtitle, Typography.songTitle, etc.
```

**Usage Table:**

| Use Case | Font | Size | Weight | Notes |
|----------|------|------|--------|-------|
| App Logo | MomoTrustDisplay | 24px | Bold | deepSpaceBlue color |
| Page Subtitles | LexendDecaRegular | 12px | Regular | uppercase, warmGray |
| Song Titles | LexendDecaBold | 14px | Bold | Title case |
| Artist Names | LexendDecaRegular | 12px | Regular | uppercase, warmGray |
| Labels | LexendDecaSemiBold | 9-10px | SemiBold | uppercase, wide tracking |
| Body/Values | LexendDecaRegular/Bold | 16px | Regular/Bold | |
| Inputs | LexendDecaRegular | 16px | Regular | |

C. Iconography

Style: Thin stroke (1.5px - 2px). Precise geometric shapes.

Library: Lucide React Native (perfect match).

Usage: Icons should often be enclosed in a circular or rounded-square "keycap."

2. Component "Recipes" (Skia & React Native Specifics)

The "Deep Dish" Button (Signature Component)

Unlike flat buttons, these have depth. We use **React Native Skia** for high-fidelity shadowing and rendering.

Shape: borderRadius: 12-16 (Soft industrial curve).

The "Well" (Container):

Background: Darker than chassis (#d6d6d6 / Alloy).

Shadow: Skia `BoxShadow` (inner) for realistic depth.

The "Cap" (Pressable Surface):

Gradient: Linear gradient (Top: White/Light Grey -> Bottom: Darker Grey).

Border: 1px, very subtle. Top border is lighter (highlight), bottom border is darker (shadow).

Interaction:

Press In: Scale down / Depress effect. Haptic Feedback (ImpactFeedbackStyle.Light).

The Input Field (The "Etched" Look)

No Boxes: Remove default borders.

The Well: Alloy background (`Colors.alloy`).

The Shadow: Inset borders (Top/Left: White, Bottom/Right: Dark) to create a "recessed" effect.

3. Migration Roadmap (Phased Approach)

Phase 1: The "Coat of Paint" (Completed)

Goal: Change the mood without rewriting complex components.

[x] Update constants/theme.ts: "Matte Fog" palette implemented.

[x] Global Background: #E4DFDA (Warm Bone).

[x] Typography: Lexend Deca implemented. MomoTrustDisplay for logo.

[x] Centralized Typography: `constants/Styles.ts` with Typography styles.

Phase 2: The "Tactile" Core (Component Library) (Completed)

Goal: Build the reusable physics-based components.

[x] Build Filter Widgets: `GangSwitch`, `FrequencyTuner`, `RotaryKnob` using Skia.

[x] Haptics Integration: Added Expo Haptics to interactive elements.

[x] DRY Refactoring: `PageHeader` component for consistent page headers.

[x] Centralized Hooks: `useSignOut` hook for sign-out logic.

Phase 3: The "Chassis" Layout (Depth & Structure) (In Progress)

Goal: Make the app feel like a device.

[x] "Recessed Well" Styling: Applied to Search inputs and thumbnail containers.

[ ] Noise Texture: Add the subtle SVG noise overlay (as an ImageBackground) to the main wrapper to kill the "digital flatness."

Phase 4: The Polish (Animation) (In Progress)

[x] Analog Glitch: Added slide/flicker animations to Tuner and Knob readouts.

[ ] LED Logic: Animate the little orange dots on your toggles with a "glow" (shadow opacity) when active.

4. Audio Feedback (The "Click")

**Philosophy:** Like a physical device, every interaction produces a satisfying click sound. Different component types have differentiated sounds reflecting their visual and functional hierarchy.

**Sound Library:** `/assets/audio/` contains component-specific click sounds for UI interactions.

### Component-Specific Sound Mapping

| Component Type | Sound File | Size | Hook | Purpose |
|---|---|---|---|---|
| **NavButton** (STREAK, SETLIST, METRONOME) | sound-click-01.wav | 12 KB | `useNavButtonSound` | Large primary navigation buttons |
| **GangSwitch** (Easy, Med, Hard filters) | sound-click-02.wav | 18 KB | `useGangSwitchSound` | Small multi-option filter selector |
| **FAB** (+ Add Song button) | sound-click-03.wav | 3.7 KB | `useFABSound` | Prominent call-to-action button |
| **FrequencyTuner** (Instrument selector) | sound-click-07.mp3 | 9.2 KB | `useClickSound` | Tuner control with glass effect |
| **RotaryKnob** (Genre selector) | sound-click-08.wav | TBD | `useRotaryKnobSound` | Rotary input control |
| **SearchSuggestions** & **PageHeader** | sound-click-07.mp3 | 9.2 KB | `useClickSound` | Secondary UI interactions |

### Implementation Pattern

For component-specific sounds, create a dedicated hook:

```typescript
import { useNavButtonSound } from '@/hooks/useNavButtonSound';

const { playSound } = useNavButtonSound();

const handlePress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playSound();
  // Perform action
};
```

For shared sounds, use the generic hook:

```typescript
import { useClickSound } from '@/hooks/useClickSound';

const { playSound } = useClickSound();

const handlePress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playSound();
  // Perform action
};
```

**Sound Hierarchy Strategy:**
- **Large Primary Actions** (NavButton, FAB): Distinctive, prominent sounds
- **Small Filters** (GangSwitch): Lighter, differentiated sounds
- **Controls** (FrequencyTuner, RotaryKnob): Specialized sounds
- **Secondary UI** (SearchSuggestions, PageHeader): Shared sound for consistency

**Feedback Order (Always):**
1. Haptic feedback (immediate)
2. Sound playback (async, non-blocking)
3. Action execution (navigation, state change, etc.)

**Audio Configuration:**
- Mode: `playsInSilentModeIOS: true` (plays even in silent mode)
- Mixing: `shouldDuckAndroid: false` (doesn't lower music volume)
- Lifecycle: Sound preloaded on component mount, unloaded on unmount

5. Technical "Gotchas" for React Native

Shadows on Android: shadowColor/Offset doesn't work well on Android. Use elevation for simple shadows, or react-native-skia / react-native-svg for complex soft shadows.

Gradients: You will need expo-linear-gradient heavily for the button surfaces.

Haptics: Don't overuse them. Use Selection for scrolling lists, Light for tapping plastic keys, and Medium for toggling power switches.

Audio: All interactive components should have sound feedback. Use `useClickSound` hook for consistency. Avoid loading sounds multiple times—the hook handles preloading and reuse.