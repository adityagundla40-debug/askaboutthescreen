# Dual-Mode UI Testing Guide

## Overview
The extension now has TWO separate modes with dedicated endpoints:

### 💬 AI Chat Mode
- **Endpoint**: `/analyze-screen`
- **Purpose**: Screen analysis, product comparison, visual Q&A
- **Input**: Text OR Voice
- **Features**:
  - Single Tab: Capture one screen and ask questions
  - Multi-Tab: Capture multiple tabs and compare them
  - TTS: Voice input triggers spoken responses

### 🎮 Browser Commands Mode
- **Endpoint**: `/execute-command`
- **Purpose**: Voice-controlled browser actions
- **Input**: Voice ONLY (text input is read-only)
- **Features**:
  - Intent classification for browser commands
  - Command confirmation cards
  - Error messages for invalid commands

---

## How to Test

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
5. Open side panel (click extension icon)

---

## Testing AI Chat Mode (💬)

### Single Tab Tests
1. Click "💬 AI Chat" tab
2. Click "Single Tab" mode
3. Click "📸 Capture Screen"
4. Type or speak: "What's on this screen?"
5. Click "🤖 Analyze"

**Voice Test**:
- Click 🎙️ microphone
- Say: "What products do you see?"
- Response will be spoken aloud

### Multi-Tab Tests
1. Open 3 different product pages (e.g., Amazon, eBay)
2. Click "Multi-Tab" mode
3. Click "➕ Add Tab to Session" on each tab
4. Type or speak: "Compare the prices of these products"
5. Click "🤖 Analyze All Tabs"

---

## Testing Browser Commands Mode (🎮)

### Valid Commands
1. Click "🎮 Browser Commands" tab
2. Click 🎙️ microphone
3. Say one of these:
   - "Switch to Gmail"
   - "Search for Python tutorials"
   - "Capture this screen"
4. Click "▶️ Execute Command"
5. See command confirmation card with icon

### Invalid Commands (Should Show Error)
1. Click 🎙️ microphone
2. Say: "Hello, how are you?"
3. Click "▶️ Execute Command"
4. Should see: "Please give a browser order like Switch Tab or Search"

---

## Expected Behavior

### AI Chat Mode
✅ Text input works  
✅ Voice input works  
✅ Voice input triggers TTS  
✅ Text input does NOT trigger TTS  
✅ Can analyze single or multiple tabs  
✅ Shows response in gray box  

### Browser Commands Mode
✅ Text input is READ-ONLY  
✅ Only voice input accepted  
✅ Valid commands show green confirmation card  
✅ Invalid commands show error message  
✅ Command card shows icon (🔄/🔍/📸)  
✅ TTS speaks command results  

---

## Troubleshooting

### Microphone Not Working
- Click 🔒 in address bar
- Allow microphone access
- Reload extension

### Backend Not Responding
- Check backend is running: `http://localhost:8000/health`
- Verify GEMINI_API_KEY in `.env` file

### Commands Not Executing
- Make sure you're in "🎮 Browser Commands" mode
- Use voice input (text input is disabled)
- Speak clearly and use command keywords

---

## Test Commands Reference

See `TEST_COMMANDS.txt` for 130+ example commands organized by category.
