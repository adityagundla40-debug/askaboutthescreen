# Ollama Setup Guide

This extension uses **Ollama** to run AI models locally on your machine. This means all your data stays private and you don't need any API keys!

## What is Ollama?

Ollama is a tool that lets you run large language models (LLMs) locally on your computer. It's like having ChatGPT running on your own machine.

## Installation Steps

### 1. Install Ollama

**Windows:**
- Download from [https://ollama.ai/download](https://ollama.ai/download)
- Run the installer
- Ollama will start automatically

**Mac:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Verify Installation

Open a terminal and run:
```bash
ollama --version
```

You should see the version number.

### 3. Pull the Qwen2.5-VL-3B Model

This extension uses the Qwen2.5-VL-3B model optimized for 4GB VRAM. Download it with:

```bash
ollama pull qwen2.5vl:3b
```

This will download about 2GB of data. It's specifically designed for vision tasks with excellent performance on limited VRAM!

### 4. Verify the Model

Check that the model is installed:
```bash
ollama list
```

You should see `qwen2.5vl:3b` in the list.

### 5. Test Ollama

Test that Ollama is working:
```bash
ollama run qwen2.5vl:3b "Hello, how are you?"
```

You should get a response from the model.

## Starting Ollama

### Windows
Ollama starts automatically when you install it. You can check if it's running by looking for the Ollama icon in your system tray.

### Mac/Linux
Start Ollama with:
```bash
ollama serve
```

Keep this terminal window open while using the extension.

## Troubleshooting

### Ollama Not Running
If you get connection errors, make sure Ollama is running:
- **Windows**: Check system tray for Ollama icon
- **Mac/Linux**: Run `ollama serve` in a terminal

### Port Already in Use
Ollama uses port 11434 by default. If this port is already in use, you can change it:
```bash
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

Then update your `.env` file:
```
OLLAMA_API_URL=http://localhost:11435/api/generate
```

### Model Not Found
If you get "model not found" errors:
```bash
ollama pull qwen2.5vl:3b
```

### VRAM Management (4GB GPU)
The Qwen2.5-VL-3B model is optimized for 4GB VRAM:
- **Context Window**: 4096 tokens (sweet spot for 4GB)
- **Max Tabs**: 3 screenshots simultaneously
- **Minimum VRAM**: 3GB
- **Recommended VRAM**: 4GB

**VRAM Safety Features:**
- Automatic warning when trying to add more than 3 tabs
- Optimized context window prevents GPU crashes
- Clear session to free VRAM and add more tabs

**Performance Tips:**
- Keep sessions under 3 tabs for optimal performance
- Clear session regularly to free VRAM
- Close other GPU-intensive applications
- Monitor GPU usage with `nvidia-smi` (NVIDIA) or Task Manager

If you have more VRAM (6GB+), you can use larger models:
```bash
ollama pull qwen2.5vl:7b
```

Then update your `.env` file:
```
OLLAMA_MODEL=qwen2.5vl:7b
```

## Alternative Models

You can use other vision-capable models with Ollama:

### For 4GB VRAM (Recommended)
```bash
ollama pull qwen2.5vl:3b  # Current default - optimized for 4GB VRAM
ollama pull llava:7b      # Alternative vision model
```

### For 6GB+ VRAM
```bash
ollama pull qwen2.5vl:7b  # Better quality, needs more VRAM
ollama pull llama3.2-vision:11b
```

### For 8GB+ VRAM
```bash
ollama pull llava:13b
ollama pull llama3.2-vision:90b
```

Update the `.env` file to use a different model:
```
OLLAMA_MODEL=qwen2.5vl:7b
```

**Note:** Larger models require more VRAM and may reduce the number of tabs you can analyze simultaneously.

## Privacy Benefits

✅ **All processing happens locally** - your screenshots never leave your computer
✅ **No API keys needed** - no accounts, no tracking
✅ **Works offline** - once the model is downloaded
✅ **Free forever** - no usage limits or costs

## Performance Tips

1. **Close other applications** to free up RAM
2. **Use GPU acceleration** if you have an NVIDIA GPU
3. **Use smaller models** if performance is slow
4. **Increase timeout** in backend if responses are slow

## Getting Help

- Ollama Documentation: [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- Ollama Discord: [https://discord.gg/ollama](https://discord.gg/ollama)
- Extension Issues: [GitHub Issues](https://github.com/adityagundla40-debug/askaboutthescreen/issues)
