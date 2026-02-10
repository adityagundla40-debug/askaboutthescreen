# Function Calling Test Cases

## Quick Test Commands

### Test 1: Open New Tab
```
🎙️ "Open YouTube"
```
**Expected**:
- Toast: "Command recognized: Opening https://youtube.com..."
- New tab opens with YouTube
- Confirmation card:
  - Function: open_new_tab
  - Arguments: {"url": "https://youtube.com"}
  - ✅ Opened: https://youtube.com

---

### Test 2: Search Google
```
🎙️ "Search for Python tutorials"
```
**Expected**:
- Toast: "Command recognized: Searching for: Python tutorials..."
- New tab opens with Google search
- Confirmation card:
  - Function: search_google
  - Arguments: {"query": "Python tutorials"}
  - ✅ Searching for: Python tutorials

---

### Test 3: Switch to Tab
```
Prerequisites: Have Gmail tab open
🎙️ "Switch to Gmail"
```
**Expected**:
- Toast: "Command recognized: Switching to: gmail..."
- Tab switches to Gmail
- Confirmation card:
  - Function: switch_to_tab
  - Arguments: {"keyword": "gmail"}
  - ✅ Switched to: Gmail - [title]

---

### Test 4: Capture Screenshot
```
🎙️ "Take a screenshot"
```
**Expected**:
- Toast: "Command recognized: Capturing screenshot..."
- Screenshot captured
- **Auto-switches to Chat Mode**
- Screenshot preview visible
- Chat input auto-focused
- Confirmation card:
  - Function: capture_screenshot
  - Arguments: {}
  - ✅ Screenshot captured!

---

## URL Inference Tests

### Test 5: Common Websites
```
🎙️ "Open Gmail"
Expected: https://gmail.com

🎙️ "Go to Amazon"
Expected: https://amazon.com

🎙️ "Open Facebook"
Expected: https://facebook.com

🎙️ "Go to Twitter"
Expected: https://twitter.com

🎙️ "Open GitHub"
Expected: https://github.com

🎙️ "Go to Reddit"
Expected: https://reddit.com
```

---

## Natural Language Variations

### Test 6: Different Phrasings - Open Tab
```
🎙️ "Open YouTube"
🎙️ "Go to YouTube"
🎙️ "Navigate to YouTube"
🎙️ "Take me to YouTube"
🎙️ "I want to go to YouTube"
```
**All should call**: `open_new_tab(url="https://youtube.com")`

---

### Test 7: Different Phrasings - Search
```
🎙️ "Search for Python"
🎙️ "Look up Python"
🎙️ "Find Python tutorials"
🎙️ "Google Python"
🎙️ "I want to search for Python"
```
**All should call**: `search_google(query="Python...")`

---

### Test 8: Different Phrasings - Switch Tab
```
🎙️ "Switch to Gmail"
🎙️ "Go to Gmail tab"
🎙️ "Open the Gmail tab"
🎙️ "Navigate to Gmail"
🎙️ "Show me Gmail"
```
**All should call**: `switch_to_tab(keyword="gmail")`

---

### Test 9: Different Phrasings - Screenshot
```
🎙️ "Take a screenshot"
🎙️ "Capture this screen"
🎙️ "Screenshot this page"
🎙️ "Capture the current view"
🎙️ "Take a picture of this"
```
**All should call**: `capture_screenshot()`

---

## Edge Cases

### Test 10: No Function Match
```
🎙️ "Hello"
🎙️ "How are you?"
🎙️ "What's the weather?"
```
**Expected**:
- No toast
- Response: "No browser command detected. Try 'Open YouTube'..."
- No confirmation card

---

### Test 11: Tab Not Found
```
Prerequisites: No Gmail tab open
🎙️ "Switch to Gmail"
```
**Expected**:
- Toast: "Command recognized: Switching to: gmail..."
- Response: "❌ No tab found matching: gmail"
- Confirmation card shows failure

---

### Test 12: Complex URLs
```
🎙️ "Open google.com"
Expected: https://google.com

🎙️ "Go to youtube.com"
Expected: https://youtube.com

🎙️ "Open https://github.com"
Expected: https://github.com (already has protocol)
```

---

## Multi-Step Workflows

### Test 13: Search → Capture → Analyze
```
1. 🎙️ "Search for Python tutorials"
   → New tab opens with search results

2. 🎙️ "Take a screenshot"
   → Screenshot captured
   → Auto-switches to Chat Mode

3. 💬 "Summarize the top results"
   → AI analyzes screenshot
```

---

### Test 14: Open → Switch → Capture
```
1. 🎙️ "Open YouTube"
   → New tab opens

2. 🎙️ "Switch to Gmail"
   → Switches to Gmail tab

3. 🎙️ "Capture this"
   → Screenshot captured
   → Auto-switches to Chat Mode
```

---

## Performance Tests

### Test 15: Rapid Commands
```
1. 🎙️ "Open YouTube"
2. Wait 2 seconds
3. 🎙️ "Search for Python"
4. Wait 2 seconds
5. 🎙️ "Switch to Gmail"
```
**Expected**: All commands execute successfully

---

### Test 16: Long Query
```
🎙️ "Search for best Python tutorials for beginners with examples and projects"
```
**Expected**:
- Full query passed to search_google
- Google search opens with complete query

---

## Backend API Tests

### Test 17: Direct API Call - open_new_tab
```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Open YouTube"}'
```
**Expected Response**:
```json
{
  "success": true,
  "function_call": {
    "name": "open_new_tab",
    "args": {
      "url": "https://youtube.com"
    }
  }
}
```

---

### Test 18: Direct API Call - search_google
```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Search for Python"}'
```
**Expected Response**:
```json
{
  "success": true,
  "function_call": {
    "name": "search_google",
    "args": {
      "query": "Python"
    }
  }
}
```

---

### Test 19: Direct API Call - No Function
```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello"}'
```
**Expected Response**:
```json
{
  "success": true,
  "function_call": null,
  "message": "No browser command detected..."
}
```

---

## UI Element Verification

### Test 20: Toast Appearance
- ✅ Appears in top-right corner
- ✅ Green background
- ✅ Shows function-specific message
- ✅ Auto-dismisses after 3 seconds
- ✅ Fade-in animation

### Test 21: Confirmation Card
- ✅ Shows correct icon (🌐/🔍/🔄/📸)
- ✅ Displays function name
- ✅ Shows arguments in JSON format
- ✅ Shows success/error message
- ✅ Green border for success

### Test 22: Auto-Switch on Screenshot
- ✅ Capture screenshot command
- ✅ Auto-switches to Chat Mode
- ✅ Chat input auto-focused
- ✅ Screenshot preview visible
- ✅ Ready to ask questions

---

## Error Recovery

### Test 23: Backend Down
```
1. Stop backend server
2. 🎙️ "Open YouTube"
```
**Expected**:
- Error message displayed
- No crash
- Can retry after backend restarts

---

### Test 24: Invalid Response
```
Backend returns malformed JSON
```
**Expected**:
- Error message displayed
- Graceful fallback
- User can try again

---

## Checklist

### Basic Functions
- [ ] open_new_tab works
- [ ] search_google works
- [ ] switch_to_tab works
- [ ] capture_screenshot works

### URL Inference
- [ ] YouTube inferred correctly
- [ ] Gmail inferred correctly
- [ ] Amazon inferred correctly
- [ ] GitHub inferred correctly

### UI Elements
- [ ] Toast notifications appear
- [ ] Confirmation cards show
- [ ] Auto-switch on screenshot
- [ ] Chat input auto-focuses

### Natural Language
- [ ] Multiple phrasings work
- [ ] Different word orders work
- [ ] Casual language works

### Edge Cases
- [ ] Non-commands handled
- [ ] Tab not found handled
- [ ] Backend errors handled
- [ ] Rapid commands work

---

## Success Criteria

✅ All 4 functions callable via voice  
✅ URL inference works for common sites  
✅ Toast notifications appear correctly  
✅ Confirmation cards show function details  
✅ Auto-switch on screenshot capture  
✅ Natural language variations work  
✅ Error handling is graceful  

---

## Troubleshooting

### Function not called
1. Check backend logs
2. Verify function_call in response
3. Test with direct API call

### Wrong URL inferred
1. Check AI's URL inference
2. Provide full URL in command
3. Check function description

### Toast not appearing
1. Check showToast() is called
2. Verify CSS animation loaded
3. Check browser console

### Confirmation card not showing
1. Check lastCommand state
2. Verify function field exists
3. Check conditional rendering

---

## Next Steps

After testing:
1. Document any issues found
2. Test with different websites
3. Try complex multi-step workflows
4. Experiment with natural language variations

The Function Calling system should handle all these cases smoothly! 🚀
