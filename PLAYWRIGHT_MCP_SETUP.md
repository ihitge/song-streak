# Playwright MCP Server Setup - Complete ✅

## What Was Installed

### Dependencies (added to package.json)
- **playwright** v1.57.0 - Browser automation library
- **@modelcontextprotocol/sdk** v1.25.1 - MCP server framework

### New Files Created
1. **mcp-server-playwright.js** - MCP server wrapper for Playwright
2. **~/.claude/mcp-config.json** - MCP server configuration for Claude Code
3. **BROWSER_TESTING_GUIDE.md** - Comprehensive testing guide with examples
4. **PLAYWRIGHT_MCP_SETUP.md** - This file

### Configuration Updated
- **package.json** - Added `npm run mcp:playwright` script
- **CLAUDE.md** - Added browser testing section with workflow

## How to Use

### Start Browser Testing

1. **Ensure your dev server is running**:
   ```bash
   npm run web
   # or
   npm start
   ```

2. **Ask Claude to test a feature**:
   ```
   "Test the new song creation flow. Navigate to http://localhost:3000,
   click the + Add Song button, fill in the form with test data, submit,
   and verify the song appears in the library."
   ```

3. **Claude will automatically**:
   - Launch Playwright (headless Chrome)
   - Navigate to your URL
   - Interact with UI elements
   - Take screenshots as evidence
   - Verify expected behavior
   - Report results

### Example Test Request

```
"Test the library page:
1. Navigate to http://localhost:3000/library
2. Take a screenshot
3. Verify the page loaded by checking for song items
4. Click the first song
5. Verify the song detail page opened
6. Take a final screenshot"
```

## Available Browser Tools

| Tool | What It Does |
|------|-------------|
| `navigate(url)` | Go to a URL (e.g., `http://localhost:3000`) |
| `screenshot(path)` | Save page as PNG to `/tmp/screenshot.png` |
| `click(selector)` | Click element (e.g., `#add-button`, `.song-item`) |
| `fill(selector, text)` | Type into input field |
| `getPageContent()` | Get all visible text from page |
| `getHTML(selector)` | Get HTML structure of element/page |
| `waitForElement(selector)` | Wait up to 5 seconds for element to appear |
| `evaluateScript(script)` | Run JavaScript in page context |
| `close()` | Clean up and close browser |

## Key Features

✅ **Full End-to-End Testing** - Navigate, interact, verify
✅ **Screenshot Evidence** - Visual proof of UI states
✅ **Headless Chrome** - Fast, no visible window
✅ **CSS Selectors** - Use standard web selectors
✅ **JavaScript Execution** - Run custom logic in page
✅ **Element Waiting** - Handle async content
✅ **Content Inspection** - Get text/HTML for verification

## What Claude Can Now Do

Previously (⚠️ **Old Way**):
- "Code changes complete. User must test in browser."
- Cannot verify UI rendering
- Cannot test user flows

Now (✅ **New Way**):
- Navigate to app and test features
- Take screenshots for evidence
- Click buttons, fill forms, verify results
- Test complete user flows
- Report findings with confidence
- Eliminate "I can't test in browser" disclaimers

## Limitations

The MCP server cannot:
- Test on mobile/tablet viewports (fixed 1280x720)
- Verify haptic feedback or audio playback
- Test authentication flows requiring manual approval
- Test features requiring external services/APIs
- Verify pixel-perfect CSS (but can verify layout/positioning)

## Testing Best Practices

### Clear CSS Selectors
```javascript
// ✅ GOOD
#add-song-button
[data-testid="submit-btn"]
.library-song-item

// ❌ AVOID
button              // Too generic
div                 // Not specific enough
```

### Specific Requests
```
✅ GOOD:
"Click the + Add Song button, fill in 'Song Name' with 'Yesterday',
fill 'Artist' with 'The Beatles', and click submit."

❌ VAGUE:
"Add a new song"
```

### Verification
```
✅ GOOD:
"Verify the new song appears in the list with the title 'Yesterday'
and verify it has 3 chords listed."

❌ VAGUE:
"Make sure it works"
```

## Architecture

```
Your Dev Server (localhost:3000)
         ↑
         │
    Playwright
    (headless Chrome)
         ↑
         │
    MCP Server
  (mcp-server-playwright.js)
         ↑
         │
    Claude Code
    (uses tools)
```

## Files Reference

| File | Purpose |
|------|---------|
| [mcp-server-playwright.js](mcp-server-playwright.js) | MCP server implementation |
| [~/.claude/mcp-config.json](~/.claude/mcp-config.json) | MCP configuration |
| [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md) | Detailed testing guide |
| [CLAUDE.md](CLAUDE.md) | Project guidelines (includes testing section) |

## Troubleshooting

### "Cannot connect to browser"
- Verify dev server is running: `npm run web`
- Check URL format: `http://localhost:3000` (not `localhost:3000`)

### "Element not found"
- Ask Claude to take a screenshot to see current state
- Ask Claude to get page HTML to inspect structure
- Verify the CSS selector is correct

### "Page shows blank"
- Dev server may not have loaded yet
- Try waiting: `waitForElement('body')`
- Check server logs for errors

### "Timeout waiting for element"
- Element may have different selector than expected
- Get page HTML to verify element exists
- May need to click something first to reveal element

## Next Steps

1. ✅ Test a simple feature (e.g., "Navigate to http://localhost:3000 and take a screenshot")
2. ✅ Test form interaction (e.g., fill in and submit a form)
3. ✅ Test complete user flows (e.g., add song → edit song → delete song)
4. ✅ Request browser testing for all new features

## Integration with Development

### In Code Review
```
"Please test this new feature by:
1. Navigating to the page
2. Testing the main user flow
3. Testing error cases
4. Taking screenshots of key states"
```

### In PR Descriptions
```
Tested with:
- ✅ Browser test: Add new song flow (screenshot attached)
- ✅ Browser test: Edit existing song (screenshot attached)
- ✅ Browser test: Delete song confirmation (screenshot attached)
```

### In Bug Reports
```
"Reproduce this bug:
1. Navigate to http://localhost:3000/library
2. Click the first song
3. Click the edit button
4. Try to submit without filling required fields
5. Take a screenshot showing the error"
```

---

**Ready to use!** Start testing by asking Claude to navigate to your app and test features.

For detailed examples and patterns, see [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md)
