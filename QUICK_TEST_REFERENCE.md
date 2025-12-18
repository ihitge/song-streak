# Quick Browser Testing Reference

## TL;DR - Start Testing Now

```bash
# 1. Start your dev server
npm run web

# 2. Ask Claude to test something:
# Example:
# "Navigate to http://localhost:8081 and take a screenshot"

# 3. Done! Claude handles the rest
```

## Common Test Patterns (Copy & Paste)

### Pattern 1: Check Page Loads
```
"Navigate to http://localhost:8081 and take a screenshot.
Verify the page loaded correctly."
```

### Pattern 2: Test Button Click
```
"Navigate to http://localhost:8081
Click the [BUTTON_NAME] button
Take a screenshot after clicking
Verify [EXPECTED_RESULT]"
```

### Pattern 3: Test Form Submission
```
"Navigate to the [PAGE_NAME]
Take a screenshot of the form
Fill in:
- Field 1: 'Test Value 1'
- Field 2: 'Test Value 2'
Click the submit button
Take a screenshot of the result
Verify the [EXPECTED_OUTCOME]"
```

### Pattern 4: Navigate Through App
```
"Test the user flow:
1. Navigate to http://localhost:8081
2. Take screenshot of initial page
3. Click [Link/Button 1]
4. Take screenshot of new page
5. Verify [Expected content]
6. Click [Link/Button 2]
7. Take screenshot
8. Verify [Expected content]"
```

### Pattern 5: Test Error States
```
"Test error handling:
1. Navigate to [page]
2. Try to submit [form] without filling required fields
3. Take screenshot
4. Verify error messages appear
5. Verify form was not submitted"
```

## CSS Selectors Quick Guide

### Common Selectors
```javascript
// By text (easiest)
text=LOGIN              // Find element with "LOGIN" text
text=Submit Form        // Multi-word text

// By ID
#submit-button         // ID="submit-button"
#add-song-form         // ID="add-song-form"

// By class
.primary-button        // class="primary-button"
.form-input            // class="form-input"

// By attribute
[data-testid="add-song"]
[name="email"]
[aria-label="Close"]

// Combinations
button:has-text("LOGIN")
input[type="email"]
div.song-item >> nth=0
```

## Available Tools

When Claude is testing, it can use:

| Tool | What | Example |
|------|------|---------|
| `navigate` | Go to URL | `http://localhost:8081` |
| `click` | Click element | `#add-button` or `text=Submit` |
| `fill` | Type text | Fill `#email` with `test@example.com` |
| `screenshot` | Capture page | Save to `/tmp/screenshot.png` |
| `getPageContent` | Get all visible text | Check if text exists |
| `getHTML` | Get element HTML | Inspect structure |
| `waitForElement` | Wait for element | Wait 5 sec for modal |
| `evaluateScript` | Run JavaScript | Check element count |
| `close` | Cleanup | Close browser |

## Example: Full Feature Test

**Request:**
```
"Test creating a new song.

Steps:
1. Navigate to http://localhost:8081
2. Take a screenshot of the initial page
3. Click the '+ Add Song' button
4. Screenshot the modal that appears
5. Fill in the form:
   - Title: 'Yesterday'
   - Artist: 'The Beatles'
   - Genre: 'Rock'
6. Click the Save button
7. Wait for the modal to close
8. Take a screenshot of the song list
9. Verify 'Yesterday' appears in the list

Report back with:
- Whether each step succeeded
- Screenshots showing key states
- Whether the new song is visible"
```

**Claude will:**
1. Launch Chromium browser
2. Navigate to http://localhost:8081
3. Take screenshot before
4. Click the + Add Song button
5. Screenshot the modal
6. Fill each form field
7. Click Save
8. Wait for close
9. Screenshot result
10. Verify song exists
11. Report success with evidence

## Setup Status

- ✅ Playwright installed (`^1.57.0`)
- ✅ MCP SDK installed (`^1.25.1`)
- ✅ Chromium downloaded
- ✅ MCP server configured
- ✅ npm script ready: `npm run mcp:playwright`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect" | Verify dev server running: `npm run web` |
| "Element not found" | Ask: `"getPageContent() to see what's on the page"` |
| "Timeout" | Check if element exists with `getPageContent()` |
| "Page blank" | Dev server may not have started, give it time |
| "Wrong port" | App runs on 8081, adjust URL if needed |

## Key Ports

- **Dev server**: http://localhost:8081 (from `npm run web`)
- **Screenshots**: Saved to `/tmp/screenshot*.png`
- **Playwright**: Port-agnostic (works with any local port)

## Pro Tips

1. **Be specific with selectors** - `#add-song-button` is better than `button`
2. **Include waits** - Ask Claude to `waitForElement()` before checking content
3. **Screenshot often** - Ask for screenshots before/after each major action
4. **Describe expected behavior** - "Verify the modal closed and song is in the list"
5. **Test edge cases** - Empty fields, special characters, long text

## Files to Reference

- [BROWSER_TESTING_GUIDE.md](BROWSER_TESTING_GUIDE.md) - Full guide with examples
- [PLAYWRIGHT_MCP_SETUP.md](PLAYWRIGHT_MCP_SETUP.md) - Setup details
- [MCP_TESTING_VERIFIED.md](MCP_TESTING_VERIFIED.md) - Verification status
- [mcp-server-playwright.js](mcp-server-playwright.js) - Server implementation

---

**Ready to test!** Start with any of the patterns above.
