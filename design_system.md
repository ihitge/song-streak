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

1. The Visual Language

A. Color Palette (The "Chassis")

We are abandoning high-contrast blacks and neon borders for warm, matte neutrals.

Role

Color

Hex

Description

Chassis (Base)

Matte Fog

#e6e6e6

Main background. The "plastic" casing.

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

#ea5428

ONLY for primary actions (Save, Record, Play).

Text (Primary)

Ink

#222222

Never pure black. Soft, legible dark grey.

Text (Label)

Graphite

#888888

Micro-copy, uppercase labels.

B. Typography

Font Family: **Lexend Deca** (custom font, all weights loaded)
Why? Modern, highly legible typeface with excellent readability. Clean geometric forms complement the industrial aesthetic.

**Available Weights:**
- Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black

**Usage:**
- Headings: `LexendDecaBold`, tight tracking
- Labels (Micro-copy): `LexendDecaSemiBold`, uppercase, wide tracking, small size (9-10px)
- Body/Values: `LexendDecaRegular` or `LexendDecaBold`
- Inputs: `LexendDecaRegular`

C. Iconography

Style: Thin stroke (1.5px - 2px). Precise geometric shapes.

Library: Lucide React Native (perfect match).

Usage: Icons should often be enclosed in a circular or rounded-square "keycap."

2. Component "Recipes" (React Native Specifics)

The "Deep Dish" Button (Signature Component)

Unlike flat buttons, these have depth. In React Native, this requires layering.

Shape: borderRadius: 12-16 (Soft industrial curve).

The "Well" (Container):

Background: Darker than chassis (#d6d6d6).

Shadow: Inner shadow (use an inset SVG gradient or react-native-inset-shadow).

The "Cap" (Pressable Surface):

Gradient: Linear gradient (Top: White/Light Grey -> Bottom: Darker Grey).

Border: 1px, very subtle. Top border is lighter (highlight), bottom border is darker (shadow).

Interaction:

Press In: Scale down to 0.98. translateY down by 2px. Haptic Feedback (ImpactFeedbackStyle.Light).

The Input Field (The "Etched" Look)

No Boxes: Remove borderWidth: 1.

The Well: Light grey background (#f0f0f0).

The Line: A single 2px bottom border (borderBottomColor: #ccc).

Depth: A 1px white line below the bottom border to create a "groove" effect in the plastic.

3. Migration Roadmap (Phased Approach)

Phase 1: The "Coat of Paint" (Low Effort, High Impact)

Goal: Change the mood without rewriting complex components.

[ ] Update constants/theme.ts: Replace the "Industrial Play" palette with the "Matte Fog" palette above.

[ ] Global Background: Change the main <View> background from Black/Slate to #e6e6e6.

[ ] Typography: Switch all headers to font-weight: 300 and all micro-labels to uppercase tracking-widest.

[ ] Remove Borders: Strip the thick borders from your existing cards and inputs.

Phase 2: The "Tactile" Core (Component Library)

Goal: Build the reusable physics-based components.

[ ] Build <RamsButton />: Create the single component described above. Use react-native-svg for the gradients. Replace all main buttons with this.

[ ] Build <RamsToggle />: Replace standard React Native switches with the custom "Physical Toggle" (the square dark button with the LED).

[ ] Haptics Integration: Add Expo Haptics to these two components.

Phase 3: The "Chassis" Layout (Depth & Structure)

Goal: Make the app feel like a device.

[ ] Container Shadows: Add "drop shadows" to your main content cards (shadowRadius: 20, shadowOpacity: 0.1) to make them float above the background.

[ ] The "Well" Effect: For the Tab Bar and Control Panels, add inner shadows (or darker backgrounds) to make them look recessed into the device body.

[ ] Noise Texture: Add the subtle SVG noise overlay (as an ImageBackground) to the main wrapper to kill the "digital flatness."

Phase 4: The Polish (Animation)

[ ] LED Logic: Animate the little orange dots on your toggles with a "glow" (shadow opacity) when active.

[ ] Transitions: Use LayoutAnimation or Reanimated to make content fade in/slide up smoothly, mimicking an old TV or stereo turning on.

4. Technical "Gotchas" for React Native

Shadows on Android: shadowColor/Offset doesn't work well on Android. Use elevation for simple shadows, or react-native-skia / react-native-svg for complex soft shadows.

Gradients: You will need expo-linear-gradient heavily for the button surfaces.

Haptics: Don't overuse them. Use Selection for scrolling lists, Light for tapping plastic keys, and Medium for toggling power switches.