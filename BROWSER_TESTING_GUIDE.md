# Browser Testing Guide for SongStreak

This guide explains how Claude Code now has access to automated browser testing via Playwright MCP.

## Quick Start

### Prerequisites
1. Playwright and MCP SDK are already installed in `package.json`
2. Dev server running (e.g., `npm run web` or `npm start`)

### Testing a Feature

Simply ask Claude to test a feature:

```
"Test the new song upload flow:
1. Navigate to http://localhost:3000
2. Click the + Add Song button
3. Fill in the song form with test data
4. Submit the form
5. Verify the song appears in the library
6. Take screenshots at each step"
```

Claude will automatically:
- Navigate to URLs
- Click elements using CSS selectors
- Fill form inputs
- Take screenshots as evidence
- Verify page content
- Report findings

## Available Playwright Tools

### Navigation & Pages
- **navigate(url)** - Go to a URL
- **screenshot(path)** - Capture the page as PNG
- **getPageContent()** - Get all visible text
- **getHTML(selector)** - Get HTML of element or page
- **close()** - Clean up resources

### User Interactions
- **click(selector)** - Click an element
- **fill(selector, text)** - Type text into input
- **waitForElement(selector, timeout)** - Wait for element to appear
- **evaluateScript(script)** - Run JavaScript in page context

## Tips for Effective Testing

### Use Clear CSS Selectors
```javascript
// ✅ GOOD - Specific, meaningful
#add-song-button
.library-song-item
[data-testid="submit-btn"]

// ❌ AVOID - Brittle, too generic
button
div
span
```

### Describe Expected Behavior
```
"After clicking the save button, the form should close and
the new song should appear at the top of the library list.
Take a screenshot to verify."
```

### Include Multiple Assertions
```
"Verify:
1. The error message is displayed
2. The form fields are highlighted in red
3. The submit button is disabled"
```

## Common Test Patterns

### Form Submission Testing
```
1. Navigate to http://localhost:3000/new-song
2. Fill in the form:
   - Song name: "Test Song"
   - Artist: "Test Artist"
   - Genre: "Rock"
3. Click the submit button
4. Wait for success message
5. Verify the song is in the library list
6. Take screenshot of final state
```

### Modal Testing
```
1. Navigate to page
2. Click button to open modal
3. Verify modal is visible
4. Get modal HTML to inspect structure
5. Fill form in modal
6. Click submit
7. Verify modal closes
8. Take screenshot
```

### Navigation Testing
```
1. Navigate to page A
2. Click link to page B
3. Verify URL changed
4. Verify page content updated
5. Take screenshots before/after
```

### Error Handling Testing
```
1. Navigate to form
2. Try to submit empty form
3. Verify error messages appear
4. Verify form is not submitted
5. Take screenshot of error state
```

## Limitations

- **No visual rendering verification** - Screenshots show what renders, but can't verify pixel-perfect layouts
- **No real-time interaction** - Testing is fast but happens in headless mode
- **No audio/haptic feedback verification** - Can't hear sounds or feel vibrations
- **Local server only** - Must be running `npm run web` or similar locally
- **No authentication state** - Each test starts fresh; no persistent sessions

## Debugging Failed Tests

When a test fails, Claude will:
1. Try again with clearer selectors
2. Take screenshots to visualize the issue
3. Get page HTML to inspect structure
4. Extract text content to verify data
5. Run JavaScript to inspect component state

Ask Claude to:
- Take a screenshot to see current state
- Get the HTML to understand page structure
- Check the page content/text to verify data loaded
- Use evaluateScript to run custom checks

## Integration with Development

### Before Submitting PR
```
"Run a full test of the new feature:
1. Navigate through the entire user flow
2. Test with edge cases (empty inputs, special characters)
3. Test error scenarios
4. Take screenshots of key states
5. Verify the implementation matches the design"
```

### After Code Changes
```
"Regression test the [feature name]:
1. Navigate to the feature
2. Verify it still works as expected
3. Test the related flows
4. Report any issues"
```

### Design Verification
```
"Compare the current UI with the design spec:
1. Navigate to the page
2. Take a screenshot
3. Describe what you see and check if it matches the design
4. List any discrepancies"
```

## Example: Complete Feature Test

```
User Request:
"Test the new song creation flow. Create a song with title 'Wonderwall',
artist 'Oasis', and genre 'Rock'. Verify it appears in the library with
the correct metadata. Take screenshots of the form and the final result."

What Claude Will Do:
1. Navigate to http://localhost:3000
2. Take screenshot of initial state
3. Click the + Add Song button
4. Take screenshot of form modal
5. Fill in the song title field with "Wonderwall"
6. Fill in the artist field with "Oasis"
7. Click the genre dropdown and select "Rock"
8. Click the submit button
9. Wait for modal to close
10. Take screenshot of updated library
11. Verify the new song is in the list with correct metadata
12. Report: "✅ Song created successfully with all correct metadata"
```

## Troubleshooting

### "Element not found" Error
- Check the selector is correct
- Wait for element to load with `waitForElement()`
- Take screenshot to see what's actually on the page

### "Navigation failed"
- Verify dev server is running
- Check the URL is correct (e.g., http://localhost:3000, not just localhost:3000)
- Check for network errors in server logs

### "Text not found"
- Use `getPageContent()` to see all visible text
- Check for dynamic content that needs time to load
- Use `waitForElement()` before checking for text

### Screenshot shows blank page
- Dev server may not have started yet
- Network may be slow; add delays with `waitForElement()`
- Try navigating again

## For Development Team

When filing bug reports or PRs, ask Claude to:
1. **Reproduce bugs** - Test exact steps to reproduce
2. **Verify fixes** - Test that bug is actually fixed
3. **Regression test** - Test related features still work
4. **Visual verification** - Screenshots of UI in different states
5. **Edge case testing** - Test boundary conditions

This improves code quality and reduces the back-and-forth of manual testing.

---

**See also**: [CLAUDE.md](CLAUDE.md) - Full component and development guidelines
