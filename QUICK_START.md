# Quick Start Guide - Ask About This Screen

Get up and running in 5 minutes! 🚀

---

## ✅ Prerequisites Check

Before starting, verify you have:

1. **Ollama Installed**
   ```bash
   ollama --version
   ```
   If not installed: https://ollama.ai/download

2. **Model Downloaded**
   ```bash
   ollama list
   ```
   Should show `gemma3:4b`. If not:
   ```bash
   ollama pull gemma3:4b
   ```

3. **Python 3.8+**
   ```bash
   python --version
   ```

4. **Chrome Browser**
   - Any recent version

---

## 🚀 Step 1: Start the Backend

### Option A: Backend Already Running ✅
The backend is currently running on http://localhost:8000 (Process ID: 1)

Verify it's working:
```bash
curl http://localhost:8000/health
```

### Option B: Start Backend Manually
If backend is not running:

```bash
cd AskAboutTheScreen/backend
python -m uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

---

## 🔌 Step 2: Load the Extension

1. **Open Chrome Extensions Page**
   - Navigate to: `chrome://extensions`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Select folder: `AskAboutTheScreen`
   - Extension should appear in the list

4. **Verify Installation**
   - Look for "Ask About This Screen" in extensions
   - Should show version 1.0.0
   - No errors in the card

---

## 🎮 Step 3: Open the Side Panel

1. **Click Extension Icon**
   - Find the extension icon in Chrome toolbar
   - Click it to open the side panel

2. **Grant Permissions (if prompted)**
   - Allow microphone access (for voice input)
   - Allow tab access (for screenshots)

3. **You Should See**
   - Two mode buttons: "🎮 Command Mode" and "💬 Chat Mode"
   - Capture buttons in Command Mode
   - Dark theme UI

---

## 🧪 Step 4: Test Basic Features

### Test 1: Single Screenshot Capture
```
1. Click "📸 Capture This"
2. Should auto-switch to Chat Mode
3. Type: "What's on this screen?"
4. Click "🤖 Analyze Screenshots"
5. AI should describe the screenshot
```

### Test 2: Voice Command
```
1. Switch to Command Mode
2. Click 🎙️ microphone button
3. Say: "Open YouTube"
4. Click "▶️ Execute Command"
5. YouTube should open in new tab
```

### Test 3: Multi-Capture
```
1. In Command Mode
2. Click "📸+ Multi-Capture" (3 times on different tabs)
3. Should see count badge (3)
4. Click "✨ Process All Images"
5. Auto-switches to Chat Mode
6. Ask: "Compare these screenshots"
7. AI analyzes all 3 images
```

---

## 🎯 Common Use Cases

### Use Case 1: Product Comparison
```
1. Open 3 product pages (e.g., laptops on Amazon)
2. Multi-capture each page
3. Ask: "Which laptop has the best specs for the price?"
4. AI compares all products
```

### Use Case 2: Quick Tab Navigation
```
1. Command Mode
2. Voice: "Switch to Gmail"
3. Instantly switches to Gmail tab
```

### Use Case 3: Research Assistant
```
1. Capture article screenshot
2. Ask: "Summarize this article in 3 bullet points"
3. AI provides summary
```

### Use Case 4: Code Review
```
1. Capture code screenshot
2. Ask: "Are there any bugs in this code?"
3. AI analyzes and suggests fixes
```

---

## 🎙️ Voice Commands Cheat Sheet

### Browser Actions
- "Open YouTube"
- "Open Gmail"
- "Search for Python tutorials"
- "Switch to Gmail"
- "Switch to YouTube tab"
- "Take a screenshot"
- "Capture this screen"

### Chat Questions
- "What's on this screen?"
- "Summarize this page"
- "What are the prices?"
- "Compare these products"
- "Are there any errors?"
- "Explain this code"

---

## 🔧 Troubleshooting

### Issue: Extension Not Loading
**Solution**:
1. Check for errors in `chrome://extensions`
2. Make sure all files are in `AskAboutTheScreen` folder
3. Try "Reload" button on extension card

### Issue: Backend Connection Failed
**Solution**:
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not, start it
cd AskAboutTheScreen/backend
python -m uvicorn main:app --reload
```

### Issue: Ollama Not Connected
**Solution**:
```bash
# Check Ollama
ollama list

# Start Ollama (if needed)
ollama serve

# Verify model
ollama pull gemma3:4b
```

### Issue: Microphone Not Working
**Solution**:
1. Click 🔒 icon in Chrome address bar
2. Allow microphone access
3. Reload extension
4. Try again

### Issue: Screenshots Not Capturing
**Solution**:
1. Make sure you're on a regular webpage (not chrome:// pages)
2. Check tab permissions in extension settings
3. Try refreshing the page

### Issue: AI Not Responding
**Solution**:
1. Check backend logs for errors
2. Verify Ollama is running: `ollama ps`
3. Check model is loaded: `ollama list`
4. Restart backend if needed

---

## 📊 Performance Tips

### Faster Responses
```bash
# Keep model loaded in memory
ollama run gemma3:4b
# Press Ctrl+D to exit but keep loaded
```

### Better Quality
```bash
# Use larger model (needs 8GB VRAM)
ollama pull gemma3:12b

# Update backend/main.py:
MODEL_NAME = "gemma3:12b"
```

### Lower Memory Usage
```bash
# Use smaller model
ollama pull gemma3:1b

# Update backend/main.py:
MODEL_NAME = "gemma3:1b"
```

---

## 🎓 Learning Path

### Beginner (Day 1)
1. ✅ Install and setup
2. ✅ Test single capture
3. ✅ Try voice commands
4. ✅ Ask simple questions

### Intermediate (Week 1)
1. ✅ Multi-capture workflow
2. ✅ Product comparisons
3. ✅ Tab management
4. ✅ Custom questions

### Advanced (Month 1)
1. ✅ Complex multi-tab analysis
2. ✅ Code review workflows
3. ✅ Research assistance
4. ✅ Custom model tuning

---

## 📚 Next Steps

### Explore Features
- Read `PROJECT_STATUS.md` for complete feature list
- Check `TEST_COMMANDS.txt` for 130+ test commands
- Review `BACKEND_STATUS.md` for API details

### Customize
- Try different Ollama models
- Adjust temperature in `backend/main.py`
- Modify UI colors in `src/App.jsx`

### Extend
- Add new browser functions
- Create custom commands
- Integrate with other tools

---

## 🎉 You're Ready!

The extension is now fully operational. Here's what you can do:

✅ **Capture screenshots** with one click  
✅ **Ask AI questions** about any webpage  
✅ **Control browser** with voice commands  
✅ **Compare products** across multiple tabs  
✅ **Analyze code** and get suggestions  
✅ **Navigate tabs** hands-free  

**All running locally. No API keys. No costs. Unlimited usage!** 🚀

---

## 🆘 Need Help?

### Check Documentation
- `PROJECT_STATUS.md` - Complete project overview
- `BACKEND_STATUS.md` - Backend health and API
- `OLLAMA_SETUP_GUIDE.md` - Ollama installation
- `TEST_COMMANDS.txt` - Test commands library

### Verify Status
```bash
# Backend health
curl http://localhost:8000/health

# Ollama status
ollama list
ollama ps

# Extension status
chrome://extensions
```

### Common Commands
```bash
# Start backend
cd AskAboutTheScreen/backend && python -m uvicorn main:app --reload

# Check Ollama
ollama serve

# Pull model
ollama pull gemma3:4b

# Test endpoint
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Open YouTube"}'
```

---

**Happy exploring! 🎊**
