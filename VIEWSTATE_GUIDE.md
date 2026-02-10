# ViewState System Guide

## Overview
The extension now uses a **ViewState system** with two modes: `COMMAND` and `CHAT`.

---

## ViewState Flow

### COMMAND Mode
- **Purpose**: Capture screenshots and execute browser commands
- **Features**:
  - Single capture (auto-switches to CHAT)
  - Multi-capture with image buffer
  - Voice commands for browser control
  - Process All button

### CHAT Mode
- **Purpose**: Analyze captured screenshots with AI
- **Features**:
  - Ask questions about screenshots
  - Text or voice input
  - Analyzes single or multiple images
  - Auto-focus on chat input

---

## Key Features

### 1. Single Capture (`handleSingleCapture`)
**Flow**:
1. Capture the current screen
2. Set `viewState` to `CHAT`
3. Auto-focus the chat input
4. Show toast: "Screenshot captured! Ready to chat."

**Usage**:
- Click "📸 Capture This" button
- Immediately switches to Chat Mode
- Ready to ask questions

---

### 2. Multi-Capture (`handleMultiCapture`)
**Flow**:
1. Capture the current screen
2. Push to `imageBuffer` array
3. Stay in `COMMAND` mode
4. Show count badge on button
5. Show toast: "Image X captured!"

**Usage**:
- Click "📸+ Multi-Capture" button
- Capture multiple tabs/screens
- Badge shows count (e.g., "3")
- Build up image buffer

---

### 3. Image Buffer
**Features**:
- Array of captured images
- Shows thumbnails in grid
- Remove individual images
- Clear all button
- Count badge on Multi-Capture button

**Display**:
```
📦 Image Buffer (3 images)
[Thumbnail 1] [Thumbnail 2] [Thumbnail 3]
✨ Process All Images
```

---

### 4. Process All (`processAllImages`)
**Flow**:
1. Check if `imageBuffer` has images
2. Switch to `CHAT` mode
3. Auto-set query if empty: "Analyze all these screenshots"
4. Auto-focus chat input
5. Show toast: "Processing X images..."

**Usage**:
- Click "✨ Process All Images" button
- Switches to Chat Mode
- Ready to analyze all captured images

---

## User Workflows

### Workflow 1: Quick Single Analysis
1. Open extension → **COMMAND Mode**
2. Click "📸 Capture This"
3. **Auto-switches to CHAT Mode**
4. Chat input is auto-focused
5. Type/speak question: "What's on this screen?"
6. Click "🤖 Analyze Screenshots"

### Workflow 2: Multi-Tab Comparison
1. Open extension → **COMMAND Mode**
2. Navigate to Tab 1 → Click "📸+ Multi-Capture"
3. Navigate to Tab 2 → Click "📸+ Multi-Capture"
4. Navigate to Tab 3 → Click "📸+ Multi-Capture"
5. Badge shows "3"
6. Click "✨ Process All Images"
7. **Auto-switches to CHAT Mode**
8. Ask: "Compare the prices of these products"
9. Click "🤖 Analyze Screenshots"

### Workflow 3: Voice Commands
1. Open extension → **COMMAND Mode**
2. Click 🎙️ microphone
3. Say: "Switch to Gmail"
4. Command executes
5. Stay in **COMMAND Mode**
6. Continue with more commands

---

## UI Elements

### Command Mode
```
🎮 Command Mode | 💬 Chat Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Command Mode
Capture screenshots or control browser

[📸 Capture This] [📸+ Multi-Capture (3)]

📦 Image Buffer (3 images)
[Thumb] [Thumb] [Thumb]
[✨ Process All Images]

🎙️ Voice Commands
[Input (read-only)] [🎙️]
[▶️ Execute Command]
```

### Chat Mode
```
🎮 Command Mode | 💬 Chat Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Chat Mode
Ask questions about screenshots

Analyzing 3 screenshots:
[Thumb] [Thumb] [Thumb]

[Chat Input (auto-focused)] [🎙️]
[🤖 Analyze Screenshots]

Response:
[AI response here]

[← Back to Command Mode]
```

---

## State Management

### Key States
```javascript
const [viewState, setViewState] = useState('COMMAND'); // 'COMMAND' or 'CHAT'
const [screenshot, setScreenshot] = useState(null); // Single capture
const [imageBuffer, setImageBuffer] = useState([]); // Multi-capture array
const [query, setQuery] = useState(''); // User question
const [response, setResponse] = useState(''); // AI response
```

### Auto-Focus Logic
```javascript
useEffect(() => {
  if (viewState === 'CHAT' && chatInputRef.current) {
    chatInputRef.current.focus();
  }
}, [viewState]);
```

---

## Testing Steps

### Test Single Capture
1. Start extension in COMMAND mode
2. Click "📸 Capture This"
3. **Expected**:
   - Toast: "Screenshot captured! Ready to chat."
   - Auto-switch to CHAT mode
   - Chat input is focused
   - Screenshot preview visible

### Test Multi-Capture
1. Start extension in COMMAND mode
2. Open 3 different tabs
3. On each tab, click "📸+ Multi-Capture"
4. **Expected**:
   - Badge shows "1", then "2", then "3"
   - Toast: "Image X captured!"
   - Stay in COMMAND mode
   - Image buffer shows 3 thumbnails

### Test Process All
1. After multi-capture (3 images)
2. Click "✨ Process All Images"
3. **Expected**:
   - Toast: "Processing 3 images..."
   - Auto-switch to CHAT mode
   - Query auto-filled: "Analyze all these screenshots"
   - Chat input focused
   - 3 thumbnails visible

### Test Voice Commands
1. In COMMAND mode
2. Click 🎙️
3. Say: "Switch to Gmail"
4. Click "▶️ Execute Command"
5. **Expected**:
   - Toast: "Command Recognized: Switch Tab"
   - Tab switches
   - Stay in COMMAND mode
   - Confirmation card shows

---

## Benefits

✅ **Clear separation**: Command vs Chat modes  
✅ **Smart auto-switching**: Single capture → Chat  
✅ **Multi-capture buffer**: Build up multiple screenshots  
✅ **Auto-focus**: Chat input ready immediately  
✅ **Count badges**: Visual feedback for buffer size  
✅ **Process All**: Batch analyze multiple images  
✅ **Flexible workflow**: Stay in command or switch to chat  

---

## API Integration

### Single Screenshot Analysis
```javascript
// Uses screenshot state
const imagesToAnalyze = [screenshot.split(',')[1]];
```

### Multi-Screenshot Analysis
```javascript
// Uses imageBuffer array
const imagesToAnalyze = imageBuffer.map(img => img.dataUrl.split(',')[1]);
```

### Backend Call
```javascript
fetch(`${API_URL}/analyze-screen`, {
  method: 'POST',
  body: JSON.stringify({ 
    images: imagesToAnalyze, 
    prompt: query 
  })
});
```

---

## Troubleshooting

### Chat input not focused
- Check `chatInputRef` is attached
- Verify `useEffect` dependency on `viewState`

### Multi-capture not working
- Check `imageBuffer` state updates
- Verify badge calculation: `imageBuffer.length`

### Process All not switching
- Check `setViewState('CHAT')` is called
- Verify toast appears

### Images not analyzing
- Check if `screenshot` or `imageBuffer` has data
- Verify backend is running
- Check browser console for errors

---

## Files Modified

1. **src/App.jsx**
   - Added `viewState` state ('COMMAND' or 'CHAT')
   - Added `imageBuffer` array for multi-capture
   - Added `handleSingleCapture()` function
   - Added `handleMultiCapture()` function
   - Added `processAllImages()` function
   - Added `chatInputRef` for auto-focus
   - Restructured UI into two distinct views

---

## Next Steps

Try these workflows:
1. **Quick Analysis**: Capture This → Ask question
2. **Product Comparison**: Multi-capture 3 tabs → Process All → Compare
3. **Mixed Mode**: Capture → Chat → Back to Command → Voice command
4. **Buffer Management**: Multi-capture → Remove one → Process remaining

The ViewState system makes the workflow intuitive and efficient! 🎉
