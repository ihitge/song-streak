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
| Navigation button | `NavButton` |
| Filter/dropdown trigger | `SelectorKey` |
| Dropdown menu | `InstrumentPicker` |
| Bottom navigation | `TactileNavbar` |
| Page header with filters | `LibraryHeader` |

### Design Tokens

```typescript
import { Colors } from '@/constants/Colors';

// Primary colors
Colors.matteFog      // #e6e6e6 - Background/chassis
Colors.softWhite     // #f0f0f0 - Inset surfaces
Colors.charcoal      // #333333 - Dark controls/text
Colors.vermilion     // #ea5428 - Action/accent (use sparingly)
Colors.graphite      // #888888 - Labels/secondary text
```

### Workflow

1. Read `COMPONENTS.md` before starting UI work
2. Check if an existing component can be used or extended
3. If new component needed, follow existing patterns
4. Document new components in `COMPONENTS.md`
5. Test in browser (user must verify - Claude cannot browser test)
