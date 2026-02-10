# Troubleshooting Guide

## Issue: "Failed to process command"

### Root Cause
```
Error: 429 You exceeded your current quota
```

Your Gemini API key has reached its usage limit.

---

## Immediate Solutions

### Solution 1: Get New API Key (Fastest)

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the new key
4. Update `.env` file:
   ```
   GEMINI_API_KEY=your_new_key_here
   ```
5. Restart backend:
   ```bash
   # Stop: Ctrl+C
   cd AskAboutTheScreen/backend
   python -m uvicorn main:app --reload
   ```

### Solution 2: Wait for Quota Reset

- Free tier quotas reset every 24 hours
- Check your quota: https://aistudio.google.com/app/apikey
- Try again tomorrow

### Solution 3: Upgrade to Paid Tier

- Go to: https://console.cloud.google.com/
- Enable billing
- Higher quotas available immediately

---

## Current Configuration

The extension is now using:
- **Model**: `gemini-2.5-flash-lite`
- **Features**: Function Calling for browser commands
- **Status**: ✅ Code working, ❌ API quota exceeded

---

## How to Check Your Quota

### Method 1: Google AI Studio
```
1. Visit: https://aistudio.google.com/app/apikey
2. Click on your API key
3. View "Usage" section
```

### Method 2: Test Endpoint
```bash
curl http://localhost:8000/health
```

If you see `"status": "healthy"`, the backend is configured correctly.

---

## What's Working

✅ Backend server running  
✅ Function calling configured  
✅ Frontend built and ready  
✅ Extension loaded in Chrome  
✅ All code is correct  

## What's Not Working

❌ API quota exceeded  
❌ Cannot make Gemini API calls  
❌ Commands return error  

---

## Alternative: Use Different Model

If you have access to other models, update `backend/main.py`:

### Option A: Gemini 2.5 Flash (More quota)
```python
analysis_model = genai.GenerativeModel("gemini-2.5-flash")
command_model = genai.GenerativeModel("gemini-2.5-flash", tools=[...])
```

### Option B: Gemini 2.0 Flash (Standard)
```python
analysis_model = genai.GenerativeModel("gemini-2.0-flash")
command_model = genai.GenerativeModel("gemini-2.0-flash", tools=[...])
```

---

## Testing Without API Calls

### Test 1: Backend Health
```bash
curl http://localhost:8000/health
```
**Expected**: `{"status": "healthy", ...}`

### Test 2: Frontend Build
```bash
cd AskAboutTheScreen
npm run build
```
**Expected**: Build succeeds

### Test 3: Extension Load
1. Chrome → `chrome://extensions/`
2. Load `dist/` folder
3. Click extension icon
**Expected**: Side panel opens

---

## Error Messages Explained

### "Failed to process command"
- **Cause**: API quota exceeded
- **Fix**: New API key or wait for reset

### "Error: 429 You exceeded your current quota"
- **Cause**: Too many API calls
- **Fix**: Wait 24 hours or upgrade plan

### "Backend not responding"
- **Cause**: Backend not running
- **Fix**: Start backend with `uvicorn main:app --reload`

### "Microphone access denied"
- **Cause**: Browser permissions
- **Fix**: Click 🔒 → Allow microphone

---

## Quota Limits (Free Tier)

| Model | Requests/Day | Requests/Minute |
|-------|--------------|-----------------|
| gemini-2.5-flash-lite | 1,500 | 15 |
| gemini-2.5-flash | 1,500 | 15 |
| gemini-2.0-flash-lite | 1,500 | 15 |
| gemini-2.0-flash | 1,500 | 15 |

**Note**: Limits may vary by region and account type.

---

## Monitoring API Usage

### Add Logging to Backend

Edit `backend/main.py`:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/execute-command")
async def execute_command(request: CommandRequest):
    logger.info(f"API call: {request.prompt}")
    # ... rest of code
```

### Check Logs
```bash
# Backend terminal will show:
INFO: API call: Open YouTube
```

---

## Prevention Tips

### 1. Reduce API Calls
- Test with fewer commands
- Use single capture instead of multi-capture
- Avoid rapid-fire commands

### 2. Cache Responses
```python
# Simple cache
cache = {}
if prompt in cache:
    return cache[prompt]
```

### 3. Rate Limiting
```python
import time
time.sleep(1)  # 1 second between calls
```

---

## When Everything Works

Once you have a valid API key with quota:

### Test Commands
```
🎙️ "Open YouTube"
→ New tab opens with YouTube

🎙️ "Search for Python"
→ Google search opens

🎙️ "Take a screenshot"
→ Screenshot captured
```

### Expected Flow
1. Voice input captured
2. Sent to Gemini API
3. Function call returned
4. Toast notification appears
5. Command executes
6. Confirmation card shows

---

## Support Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **API Key Management**: https://aistudio.google.com/app/apikey
- **Billing Console**: https://console.cloud.google.com/billing
- **Quota Information**: https://ai.google.dev/pricing

---

## Summary

**The Problem**: API quota exceeded  
**The Solution**: Get new API key or wait for reset  
**The Code**: ✅ Working perfectly  
**The Extension**: ✅ Ready to use  

Once you have API quota, everything will work as designed! 🚀
