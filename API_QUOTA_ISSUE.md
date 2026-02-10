# API Quota Issue - Troubleshooting

## Error Message
```
429 You exceeded your current quota, please check your plan and billing details.
```

## What Happened?

The Gemini API has usage quotas/limits. You've reached the limit for your API key.

---

## Solutions

### Option 1: Wait for Quota Reset
- Free tier quotas reset daily
- Wait 24 hours and try again
- Check: https://aistudio.google.com/app/apikey

### Option 2: Upgrade API Plan
- Go to: https://console.cloud.google.com/
- Navigate to Billing
- Upgrade to paid tier for higher quotas

### Option 3: Use New API Key
- Go to: https://aistudio.google.com/app/apikey
- Create a new API key
- Update `.env` file:
  ```
  GEMINI_API_KEY=your_new_key_here
  ```
- Restart backend

### Option 4: Switch to Fallback Model (Recommended)
Use a model with higher free tier limits:

**Current**: `gemini-2.0-flash-lite` (Function Calling)
**Fallback**: `gemini-2.5-flash-lite` (Higher quota)

---

## Quick Fix: Use Gemini 2.5 Flash Lite

### 1. Update Backend
Edit `backend/main.py`:

```python
# Change from:
analysis_model = genai.GenerativeModel("gemini-2.0-flash-lite")
command_model = genai.GenerativeModel("gemini-2.0-flash-lite", tools=[...])

# To:
analysis_model = genai.GenerativeModel("gemini-2.5-flash-lite")
command_model = genai.GenerativeModel("gemini-2.5-flash-lite", tools=[...])
```

### 2. Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Start again
cd AskAboutTheScreen/backend
python -m uvicorn main:app --reload
```

### 3. Test
```bash
curl http://localhost:8000/health
```

---

## Alternative: Disable Function Calling Temporarily

If function calling models are hitting quota, revert to JSON translation:

### 1. Restore Old execute-command Endpoint

Replace the function calling code with the previous JSON translation approach (see git history or `NATURAL_LANGUAGE_UPDATE.md`).

### 2. Benefits
- Uses simpler model calls
- Lower API usage
- Still works with natural language

### 3. Drawbacks
- No automatic URL inference
- Less accurate
- More frontend logic

---

## Check Your Quota

### Google AI Studio
1. Go to: https://aistudio.google.com/app/apikey
2. Click on your API key
3. View usage and limits

### Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Navigate to "APIs & Services" → "Dashboard"
3. Click on "Generative Language API"
4. View quotas and usage

---

## Model Comparison

| Model | Function Calling | Free Tier Quota | Speed |
|-------|-----------------|-----------------|-------|
| gemini-2.0-flash-lite | ✅ Yes | Low | Fast |
| gemini-2.5-flash-lite | ✅ Yes | Medium | Fast |
| gemini-2.5-flash | ✅ Yes | Medium | Medium |
| gemma-3-4b-it | ❌ No | High | Fast |

---

## Recommended Action

**For Development/Testing**:
1. Switch to `gemini-2.5-flash-lite`
2. Or use a new API key
3. Monitor usage at https://aistudio.google.com/

**For Production**:
1. Upgrade to paid tier
2. Implement rate limiting
3. Add error handling for quota exceeded
4. Cache common responses

---

## Error Handling in Code

The backend already handles this error gracefully:

```python
except Exception as e:
    return {
        "success": False,
        "function_call": None,
        "message": f"Error: {str(e)}"
    }
```

The frontend shows: "Failed to process command"

---

## Prevention

### 1. Rate Limiting
Add delays between API calls:
```python
import time
time.sleep(1)  # 1 second delay
```

### 2. Caching
Cache common commands:
```python
command_cache = {}
if prompt in command_cache:
    return command_cache[prompt]
```

### 3. Monitoring
Log API usage:
```python
import logging
logging.info(f"API call: {prompt}")
```

---

## Current Status

✅ Backend is running  
✅ Models configured correctly  
❌ API quota exceeded  
⏳ Waiting for quota reset or new key  

---

## Next Steps

1. **Immediate**: Get new API key or wait for reset
2. **Short-term**: Switch to gemini-2.5-flash-lite
3. **Long-term**: Implement caching and rate limiting

The extension code is working correctly - it's just an API quota issue! 🔑
