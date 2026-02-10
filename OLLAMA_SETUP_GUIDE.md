# Ollama Setup Guide

## Overview
The backend now uses **Ollama** with **gemma3:4b** model running locally. No API keys needed!

---

## Installation Steps

### 1. Install Ollama

**Windows**:
```bash
# Download from https://ollama.ai/download
# Run the installer
```

**macOS**:
```bash
# Download from https://ollama.ai/download
# Or use Homebrew:
brew install ollama
```

**Linux**:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull the Model

```bash
ollama pull gemma3:4b
```

**Expected output**:
```
pulling manifest
pulling 8b8dc0d7e7c0... 100% ▕████████████████▏ 2.5 GB
pulling 097a36493f71... 100% ▕████████████████▏ 8.4 KB
pulling 109037bec39c... 100% ▕████████████████▏  136 B
pulling 22a838ceb7fb... 100% ▕████████████████▏   84 B
pulling 887433b89a90... 100% ▕████████████████▏  483 B
verifying sha256 digest
writing manifest
removing any unused layers
success
```

### 3. Verify Installation

```bash
ollama list
```

**Expected output**:
```
NAME            ID              SIZE    MODIFIED
gemma3:4b       abc123def456    2.5 GB  2 minutes ago
```

### 4. Test the Model

```bash
ollama run gemma3:4b "Hello, how are you?"
```

**Expected**: Model responds with a greeting

---

## Starting the Backend

### 1. Install Python Dependencies

```bash
cd AskAboutTheScreen/backend
pip install -r requirements.txt
```

### 2. Start Ollama (if not running)

Ollama usually starts automatically after installation. If not:

**Windows/macOS**: Ollama runs as a service automatically

**Linux**:
```bash
ollama serve
```

### 3. Start FastAPI Backend

```bash
python -m uvicorn main:app --reload
```

### 4. Check Health

```bash
curl http://localhost:8000/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "ollama": "connected",
  "model": "gemma3:4b",
  "model_available": true,
  "available_models": ["gemma3:4b"],
  "endpoints": ["analyze-screen", "execute-command"]
}
```

---

## Configuration

### Default Settings

- **Ollama URL**: `http://localhost:11434`
- **Model**: `gemma3:4b`
- **Context Window**: 8192 tokens
- **Temperature**: 0.7

### Custom Configuration

Edit `backend/main.py`:

```python
# Change Ollama URL
OLLAMA_URL = "http://your-server:11434"

# Change model
MODEL_NAME = "gemma3:12b"  # or any other model

# Adjust options
"options": {
    "num_ctx": 4096,  # Smaller context for faster responses
    "temperature": 0.5  # Lower for more deterministic responses
}
```

---

## Available Models

### Gemma 3 Family

| Model | Size | VRAM | Speed | Quality |
|-------|------|------|-------|---------|
| gemma3:1b | 1.5 GB | 2 GB | Very Fast | Good |
| gemma3:4b | 2.5 GB | 4 GB | Fast | Better |
| gemma3:12b | 7 GB | 8 GB | Medium | Best |
| gemma3:27b | 16 GB | 20 GB | Slow | Excellent |

### Recommended for 4GB VRAM
```bash
ollama pull gemma3:4b
```

### For Better Performance (if you have 8GB+ VRAM)
```bash
ollama pull gemma3:12b
```

---

## Testing

### Test Screen Analysis

```bash
curl -X POST http://localhost:8000/analyze-screen \
  -H "Content-Type: application/json" \
  -d '{
    "images": ["base64_image_here"],
    "prompt": "What do you see?"
  }'
```

### Test Command Execution

```bash
curl -X POST http://localhost:8000/execute-command \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Open YouTube"}'
```

**Expected response**:
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

## Troubleshooting

### Issue: "Cannot connect to Ollama"

**Solution**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve
```

### Issue: "Model not found"

**Solution**:
```bash
# Pull the model
ollama pull gemma3:4b

# Verify it's installed
ollama list
```

### Issue: "Ollama request timed out"

**Solution**:
- First request may be slow (model loading)
- Increase timeout in `main.py`:
  ```python
  timeout=300  # 5 minutes
  ```
- Or warm up the model:
  ```bash
  ollama run gemma3:4b "test"
  ```

### Issue: "Out of memory"

**Solution**:
- Use smaller model:
  ```bash
  ollama pull gemma3:1b
  ```
- Reduce context window:
  ```python
  "num_ctx": 4096
  ```

---

## Performance Tips

### 1. Keep Model Loaded
```bash
# Keep model in memory
ollama run gemma3:4b
# Press Ctrl+D to exit but keep model loaded
```

### 2. Adjust Context Window
```python
# Smaller context = faster responses
"num_ctx": 4096  # Default: 8192
```

### 3. Use GPU
Ollama automatically uses GPU if available. Check:
```bash
ollama ps
```

### 4. Optimize for Speed
```python
"options": {
    "num_ctx": 4096,
    "temperature": 0.5,
    "top_p": 0.9,
    "top_k": 40
}
```

---

## Advantages of Ollama

✅ **No API Keys**: Runs completely locally  
✅ **No Quotas**: Unlimited usage  
✅ **Privacy**: Data never leaves your machine  
✅ **Fast**: Local inference, no network latency  
✅ **Free**: No costs for API calls  
✅ **Offline**: Works without internet  

---

## Comparison: Gemini API vs Ollama

| Feature | Gemini API | Ollama |
|---------|------------|--------|
| API Key | Required | Not needed |
| Quota | Limited | Unlimited |
| Cost | Pay per use | Free |
| Privacy | Cloud | Local |
| Speed | Network dependent | Local (fast) |
| Setup | Easy | Requires installation |
| VRAM | None | 4GB+ recommended |

---

## Next Steps

1. ✅ Install Ollama
2. ✅ Pull gemma3:4b model
3. ✅ Start backend
4. ✅ Test with extension
5. 🎉 Enjoy unlimited local AI!

---

## Resources

- **Ollama Website**: https://ollama.ai
- **Ollama GitHub**: https://github.com/ollama/ollama
- **Model Library**: https://ollama.ai/library
- **Documentation**: https://github.com/ollama/ollama/blob/main/docs/api.md

---

## Support

If you encounter issues:
1. Check Ollama is running: `ollama list`
2. Check backend health: `curl http://localhost:8000/health`
3. Check Ollama logs: `ollama logs`
4. Restart Ollama: `ollama serve`

The backend is now completely free and runs locally! 🚀
