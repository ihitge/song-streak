# Claude Instructions for Song Streak

## Related Projects

| Project | Description | Location |
|---------|-------------|----------|
| **Song Streak App** | React Native mobile app (Expo) | This repository |
| **[Marketing Site](../song-streak-site/)** | Landing page at [songstreak.app](https://songstreak.app) | `../song-streak-site/` |

---

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
| **Dark device screen wrapper** | `DeviceCasing` (includes noise, screws, title bar) |
| Page header with filters | `LibraryHeader` (uses PageHeader) |
| Navigation button | `NavButton` |
| Selection Switch | `GangSwitch` |
| Filter/Tuner Control | `FrequencyTuner` |
| Rotary Control | `RotaryKnob` |
| Bottom navigation | `TactileNavbar` |
| **Alert/Error/Success dialogs** | `useStyledAlert` hook |
| Create band modal | `CreateBandModal` |
| Join band modal | `JoinBandModal` |
| Practice complete modal | `PracticeCompleteModal` |
| Achievement celebration | `AchievementModal` |
| Video player | `VideoPlayerModal` |
| **Guitar tuner meter** | `TunerMeter` |
| **Guitar tuner note display** | `TunerNoteDisplay` |
| **Guitar tuner string selector** | `TunerStringSelector` |
| **Guitar tuner controls** | `TunerControls` |

### Hooks

| Need | Use This Hook |
|------|---------------|
| **Alert dialogs (NEVER use native Alert)** | `useStyledAlert` |
| Sign out functionality | `useSignOut` |
| Audio feedback for NavButton | `useNavButtonSound` |
| Audio feedback for GangSwitch | `useGangSwitchSound` |
| Audio feedback for RotaryKnob | `useRotaryKnobSound` |
| Audio feedback for FAB button | `useFABSound` |
| Audio feedback for other components | `useClickSound` |
| Band management | `useBands` |
| Setlist management | `useSetlists` |
| Practice tracking | `usePracticeData` |
| Debounced search | `useSearch` |
| **Guitar tuner state machine** | `useTunerMachine` |
| Pitch detection (pitchy) | `usePitchDetection` |
| Microphone audio streaming | `useAudioSession` |

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
Colors.moss          // #417B5A - Success/positive states (Green)
Colors.lobsterPink   // #DB5461 - Accent/Highlight (Lobster Pink)
Colors.deepSpaceBlue // #0E273C - Dark Accent (Deep Space Blue)
Colors.warmGray      // #847577 - Secondary Text (Warm Gray)
```

### Audio Feedback (All Interactive Components)

**IMPORTANT**: All interactive components **must** have audio + haptic feedback using component-specific sound hooks.

**Component-Specific Sound Pattern**:
```typescript
import { useNavButtonSound } from '@/hooks/useNavButtonSound'; // Example: NavButton
import * as Haptics from 'expo-haptics';

const { playSound } = useNavButtonSound();

const handlePress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await playSound();
  // Perform action
};
```

**Sound Hierarchy** (Sound files located in `/assets/audio/`):

| Component | Sound File | Size | Purpose |
|-----------|-----------|------|---------|
| NavButton | sound-click-01.wav | 12 KB | Large primary navigation buttons |
| GangSwitch | sound-click-02.wav | 18 KB | Small filter selectors |
| FAB Button | sound-click-03.wav | 3.7 KB | Call-to-action (+ Add Song) |
| FrequencyTuner | sound-click-07.mp3 | 9.2 KB | Tuner control |
| RotaryKnob | sound-click-08.wav | TBD | Rotary genre selector |
| SearchSuggestions, PageHeader | sound-click-07.mp3 | 9.2 KB | Secondary UI interactions |

**Feedback Order** (Always):
1. Haptic feedback (immediate, synchronous)
2. Sound playback (async, non-blocking)
3. Action execution (navigation, state change, etc.)

**Components that Already Have Audio**:
- ✅ NavButton (STREAK, SETLIST, METRONOME) - `useNavButtonSound`
- ✅ GangSwitch (difficulty/fluency) - `useGangSwitchSound`
- ✅ FAB Button (+ Add Song) - `useFABSound`
- ✅ FrequencyTuner (instrument selector) - `useClickSound`
- ✅ RotaryKnob (genre control) - `useRotaryKnobSound`
- ✅ SearchSuggestions (suggestions + show more) - `useClickSound`
- ✅ PageHeader (avatar + logout buttons) - `useClickSound`

**When Adding New Interactive Components**:
- Choose the appropriate sound hook based on component purpose
- If component type is unique, create a new component-specific hook
- Always add haptic feedback with `Haptics.impactAsync(ImpactFeedbackStyle.Light)`
- Ensure both execute in the correct order

### Workflow

1. Read `COMPONENTS.md` before starting UI work
2. Check if an existing component can be used or extended
3. If new component needed, follow existing patterns
4. **For interactive components**: Always add audio + haptic feedback using the pattern above
5. Document new components in `COMPONENTS.md`
6. Browser testing: Claude can now use Playwright MCP for automated browser testing

---

## Browser Testing with Playwright MCP

Claude now has access to automated browser testing via Playwright MCP server. This enables full end-to-end testing without manual user intervention.

### Setup

The Playwright MCP server is configured and ready to use:
- **Server script**: `mcp-server-playwright.js`
- **Command to run**: `npm run mcp:playwright`
- **Config location**: `~/.claude/mcp-config.json`

### Available Browser Testing Tools

Claude can use these browser automation capabilities:

| Tool | Purpose | Example |
|------|---------|---------|
| `navigate` | Navigate to a URL | Navigate to `http://localhost:3000` |
| `screenshot` | Capture page screenshot | Save screenshot to `/tmp/screenshot.png` |
| `click` | Click elements | Click button with selector `#submit-btn` |
| `fill` | Fill form inputs | Fill email input with user data |
| `getPageContent` | Extract visible text | Get all text from page body |
| `getHTML` | Get HTML structure | Inspect component HTML |
| `waitForElement` | Wait for element to appear | Wait 5 seconds for modal |
| `evaluateScript` | Execute JavaScript | Run custom logic in page context |
| `close` | Cleanup browser | Close browser after tests |

### Testing Workflow

When testing UI changes or new features:

1. Start your dev server: `npm start` or `npm run web`
2. Request Claude to test the feature using browser automation
3. Claude will:
   - Navigate to the URL
   - Interact with UI elements
   - Take screenshots as evidence
   - Verify page content and structure
   - Assert on expected behavior

### Example Browser Test Request

```
"Add a new song to the library and verify it appears in the list.
Show me screenshots of:
1. The initial library page
2. The + Add Song modal
3. The song successfully added to the library"
```

Claude will automatically:
1. Navigate to the app
2. Click the + Add Song button
3. Take screenshot of modal
4. Fill in form fields
5. Submit the form
6. Take screenshot of updated library
7. Verify the new song appears in the list

### Important Notes

- **Local dev server required**: Browser tests only work against a running local server (http://localhost:3000 or similar)
- **Headless testing**: Tests run in headless Chrome (no visible browser)
- **Screenshots**: Claude saves evidence to `/tmp/` for inspection
- **Viewport**: Fixed 1280x720 for consistent results
- **No real user interaction**: Tests are automated; haptic/audio feedback cannot be verified this way

---

### Alert Dialogs (CRITICAL)

**NEVER use native `Alert.alert()` - ALWAYS use `useStyledAlert` hook.**

```typescript
// ❌ WRONG - Native iOS alert (breaks app aesthetic)
import { Alert } from 'react-native';
Alert.alert('Error', 'Something went wrong');

// ✅ CORRECT - Styled alert matching app design
import { useStyledAlert } from '@/hooks/useStyledAlert';

const { showError, showSuccess, showInfo, showWarning, showConfirm } = useStyledAlert();

// Simple alerts
showError('Error', 'Something went wrong');
showSuccess('Success', 'Song saved!');
showInfo('Info', 'Please save first');
showWarning('Warning', 'API quota exceeded');

// Confirmation dialog
showConfirm(
  'Delete Song',
  'Are you sure?',
  () => handleDelete(),  // onConfirm
  'Delete',              // confirmText
  'Cancel',              // cancelText
  'error'                // type
);
```

---

## Browser Testing Capabilities (Playwright MCP)

Claude can now perform **full automated browser testing** for this project. This means:

✅ **What Claude CAN Do**:
- Navigate to http://localhost:8081 (or your dev server port)
- Click buttons, fill forms, submit data
- Take screenshots as visual evidence
- Extract and verify page content
- Test complete user flows end-to-end
- Wait for async content to load
- Inspect page structure and HTML
- Run custom JavaScript in page context

✅ **When Testing**:
- Always ensure dev server is running (`npm run web`)
- Provide clear test requests with expected outcomes
- Review screenshot evidence provided by Claude
- Mark test tasks as completed when results are verified

⚠️ **Limitations**:
- Local dev server only (http://localhost:8081, not production)
- Headless browser (no visible window)
- Fixed 1280x720 viewport (desktop only)
- Cannot test OAuth/Apple Sign-in flows
- Cannot verify haptic/audio feedback directly

📖 **See Also**:
- [QUICK_TEST_REFERENCE.md](QUICK_TEST_REFERENCE.md) - Quick patterns & examples
- [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md) - Comprehensive guide
- [PLAYWRIGHT_MCP_SETUP.md](PLAYWRIGHT_MCP_SETUP.md) - Technical setup

---

---

## EAS Builds & Environment Variables

### Environment Variable Architecture

| Environment | Source | Access Method |
|-------------|--------|---------------|
| **Local Dev** | `.env.local` | `process.env.EXPO_PUBLIC_*` |
| **EAS Build** | EAS env variables | `Constants.expoConfig.extra.*` |

### Key Files

- **`app.config.js`** - Exposes env vars via `expo.extra` at build time
- **`utils/supabase/client.ts`** - Reads config with fallback pattern
- **`eas.json`** - Build profiles (development, preview, production)

### EAS Commands

```bash
# List environment variables
eas env:list --environment preview

# Create new variable
eas env:create --environment preview --name VAR_NAME --value "value" --visibility sensitive

# Delete variable
eas env:delete --variable-name VAR_NAME

# Build for preview (ad-hoc distribution)
eas build --platform ios --profile preview

# Build for production (App Store)
eas build --platform ios --profile production
```

### Required EAS Variables (preview environment)

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GEMINI_API_URL`
- `EXPO_PUBLIC_GEMINI_API_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### Testing EAS Builds

1. Build: `eas build --platform ios --profile preview`
2. Install on registered device (Developer Mode required on iOS 16+)
3. Check logs for `[Supabase] Config source:` to verify env vars loaded

---

**GOLDEN RULES**:
- Never make assumptions. Never get lazy. Never hallucinate. Never take the easy route. Always engineer for scalability and the long-term view. Ask when unsure.
- Every interaction should feel tactile: visual + haptic + audio feedback.
- **NEVER use native Alert.alert() - always use useStyledAlert hook.**
- **Browser testing with Playwright MCP is now available** - use it to verify UI changes with confidence