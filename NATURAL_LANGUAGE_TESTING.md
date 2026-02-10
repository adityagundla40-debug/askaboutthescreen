# Natural Language Intent Testing Guide

## Overview
The Browser Commands mode now uses **Natural Language Intent Translation** powered by Gemma 3 4B. The AI translates your sentences into JSON actions automatically.

---

## How It Works

### Architecture Flow
1. **User speaks**: "Switch to Gmail"
2. **AI translates**: `{"action": "SWITCH_TAB", "value": "gmail"}`
3. **Background.js executes**: Uses `executeDynamicCommand()` with switch statement
4. **UI shows toast**: "Command Recognized: Switch Tab"
5. **Confirmation card**: Shows action details and result

---

## Supported Actions

### 1. SWITCH_TAB
**Trigger Words**: switch, go to, open, navigate to

**Examples**:
- "Switch to Gmail"
- "Go to YouTube"
- "Open the Amazon tab"
- "Navigate to Facebook"
- "Go to the tab with Python"

**JSON Output**: `{"action": "SWITCH_TAB", "value": "gmail"}`

---

### 2. SEARCH
**Trigger Words**: search, look for, find, google

**Examples**:
- "Search for Python tutorials"
- "Look for best laptops on Google"
- "Find machine learning courses"
- "Google React documentation"
- "Search JavaScript frameworks"

**JSON Output**: `{"action": "SEARCH", "value": "python tutorials"}`

---

### 3. CAPTURE
**Trigger Words**: capture, screenshot, take a picture

**Examples**:
- "Capture this screen"
- "Take a screenshot"
- "Screenshot this page"
- "Capture the current view"

**JSON Output**: `{"action": "CAPTURE", "value": "screen"}`

---

### 4. NONE (Non-Commands)
**Trigger**: Casual chat, questions, greetings

**Examples**:
- "Hello"
- "How are you?"
- "What's the weather?"
- "Tell me a joke"

**JSON Output**: `{"action": "NONE", "message": "Chatting mode..."}`

---

## Testing Steps

### 1. Start Backend
```bash
cd AskAboutTheScreen/backend
python -m uvicorn main:app --reload
```

### 2. Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `AskAboutTheScreen/dist` folder
5. Click extension icon to open side panel

### 3. Test Natural Language Commands

#### Test SWITCH_TAB
1. Open multiple tabs (Gmail, YouTube, Amazon)
2. Click "🎮 Browser Commands" tab
3. Click 🎙️ microphone
4. Say: "Switch to Gmail"
5. **Expected**:
   - Toast appears: "Command Recognized: Switch Tab"
   - Tab switches to Gmail
   - Green confirmation card shows action details
   - TTS says: "Switched to Gmail"

#### Test SEARCH
1. Click 🎙️ microphone
2. Say: "Look for Python tutorials on Google"
3. **Expected**:
   - Toast appears: "Command Recognized: Search"
   - New tab opens with Google search
   - Confirmation card shows search query
   - TTS says: "Searching for Python tutorials"

#### Test CAPTURE
1. Click 🎙️ microphone
2. Say: "Capture this screen"
3. **Expected**:
   - Toast appears: "Command Recognized: Capture Screen"
   - Screenshot is captured
   - Confirmation card shows capture success
   - TTS says: "Screenshot captured"

#### Test NONE (Invalid)
1. Click 🎙️ microphone
2. Say: "Hello, how are you?"
3. **Expected**:
   - No toast appears
   - Response shows: "Chatting mode... Please give a browser command."
   - No confirmation card
   - TTS says the error message

---

## UI Elements to Verify

### Toast Notification
- ✅ Appears in top-right corner
- ✅ Green background for success
- ✅ Shows "Command Recognized: [Action Name]"
- ✅ Auto-dismisses after 3 seconds
- ✅ Fade-in animation

### Confirmation Card
- ✅ Green border and background
- ✅ Shows icon (🔄 Switch Tab, 🔍 Search, 📸 Capture)
- ✅ Displays action type
- ✅ Shows target value
- ✅ Shows success message

### Voice Input
- ✅ Microphone button turns red when listening
- ✅ Pulsing animation while active
- ✅ Text field shows transcribed command
- ✅ Auto-processes when speech stops

---

## Advanced Natural Language Tests

### Variations of SWITCH_TAB
- "Go to the Gmail tab"
- "Open YouTube"
- "Navigate to Amazon"
- "Switch to the tab with Python"
- "Go to Facebook"

### Variations of SEARCH
- "Google machine learning"
- "Find best laptops"
- "Look for React tutorials"
- "Search JavaScript frameworks"
- "Look up Python documentation"

### Variations of CAPTURE
- "Take a screenshot"
- "Capture this page"
- "Screenshot the current view"
- "Take a picture of this screen"

---

## Troubleshooting

### Toast Not Appearing
- Check browser console for errors
- Verify CSS animation is loaded
- Ensure command is recognized (not NONE)

### Commands Not Executing
- Check backend is running: `http://localhost:8000/health`
- Verify GEMINI_API_KEY in `.env` file
- Check browser console for API errors

### AI Misclassifying Commands
- Speak clearly and use trigger words
- Check backend logs for JSON parsing errors
- Try rephrasing with more explicit keywords

### Background.js Not Responding
- Check extension is loaded correctly
- Reload extension in `chrome://extensions/`
- Check browser console for runtime errors

---

## Backend API Testing

### Test Intent Translation Directly
```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Switch to Gmail"}'
```

**Expected Response**:
```json
{
  "success": true,
  "command": {
    "action": "SWITCH_TAB",
    "value": "gmail"
  }
}
```

### Test Invalid Command
```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello there"}'
```

**Expected Response**:
```json
{
  "success": true,
  "command": {
    "action": "NONE",
    "message": "Chatting mode..."
  }
}
```

---

## Key Improvements

### Before (Old System)
- ❌ Rigid command structure
- ❌ Required exact keywords
- ❌ No natural language support
- ❌ Limited variations

### After (New System)
- ✅ Natural language understanding
- ✅ Flexible phrasing
- ✅ AI-powered intent translation
- ✅ Toast notifications
- ✅ Dynamic command execution
- ✅ Better error handling

---

## Files Modified

1. **backend/main.py**
   - Updated `COMMAND_CLASSIFIER_INSTRUCTION` for natural language
   - Changed response format to `{"action": "...", "value": "..."}`

2. **background.js**
   - Added `executeDynamicCommand()` function
   - Added `switchToTab()`, `performSearch()`, `captureScreen()` helpers
   - Switch statement for action routing

3. **src/App.jsx**
   - Added toast notification system
   - Updated `executeCommand()` to use background.js
   - Removed duplicate action handlers
   - Added confirmation card updates

4. **src/index.css**
   - Added fade-in animation for toasts

---

## Next Steps

Try these advanced commands:
- "Go to the tab with documentation"
- "Look up best practices for React"
- "Switch to my email"
- "Find tutorials on machine learning"
- "Capture what I'm looking at"

The AI should understand and translate all of these naturally!
