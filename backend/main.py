from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import os
from PIL import Image
from io import BytesIO
from typing import List, Optional
import json
import requests

app = FastAPI()

# CORS setup for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ollama configuration
OLLAMA_URL = "http://localhost:11434"
MODEL_NAME = "gemma3:4b"

# Command classifier instruction
COMMAND_CLASSIFIER_INSTRUCTION = """You are a natural language to JSON translator for browser commands.

TRANSLATION RULES:

1. open_new_tab - Opening a website
   Examples: "Open YouTube", "Go to Gmail"
   → {"function_call": {"name": "open_new_tab", "args": {"url": "https://youtube.com"}}}
   Note: Infer full URL from website name

2. search_google - Searching on Google
   Examples: "Search for Python", "Look up React"
   → {"function_call": {"name": "search_google", "args": {"query": "Python"}}}

3. switch_to_tab - Switching to existing tab
   Examples: "Switch to Gmail", "Go to YouTube tab"
   → {"function_call": {"name": "switch_to_tab", "args": {"keyword": "gmail"}}}

4. capture_screenshot - Taking a screenshot
   Examples: "Capture this", "Take a screenshot"
   → {"function_call": {"name": "capture_screenshot", "args": {}}}

5. NONE - Not a browser command
   Examples: "Hello", "How are you?"
   → {"function_call": null, "message": "Not a browser command"}

CRITICAL: Respond ONLY with valid JSON. No markdown, no explanations."""

# Screen analysis instruction
SCREEN_ANALYSIS_INSTRUCTION = """You are a helpful screen analysis assistant. Analyze the provided screenshots and answer the user's questions accurately and concisely.

Focus on:
- Describing what's visible in the screenshots
- Comparing products, prices, specs across multiple tabs
- Identifying UI elements and content
- Providing helpful insights and recommendations

Be concise but informative."""

class AnalyzeRequest(BaseModel):
    images: List[str]  # List of base64 encoded images
    prompt: str

class CommandRequest(BaseModel):
    prompt: str

def call_ollama_generate(prompt: str, images: List[str] = None, system: str = None) -> str:
    """Call Ollama generate API"""
    try:
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_ctx": 8192,
                "temperature": 0.7
            }
        }
        
        if system:
            payload["system"] = system
        
        if images:
            payload["images"] = images
        
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        raise Exception("Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434")
    except requests.exceptions.Timeout:
        raise Exception("Ollama request timed out")
    except Exception as e:
        raise Exception(f"Ollama error: {str(e)}")

@app.post("/analyze-screen")
async def analyze_screen(request: AnalyzeRequest):
    """
    Endpoint for AI Chat - Analyzes screenshots and provides helpful responses
    """
    try:
        # Build prompt with screen analysis instructions
        prompt = f"""User Question: {request.prompt}

Provide a helpful and concise answer based on the screenshots."""
        
        # Call Ollama with images
        response_text = call_ollama_generate(
            prompt=prompt,
            images=request.images,
            system=SCREEN_ANALYSIS_INSTRUCTION
        )
        
        return {
            "success": True,
            "type": "chat",
            "response": response_text,
            "tabs_analyzed": len(request.images)
        }
            
    except Exception as e:
        return {
            "success": False,
            "type": "error",
            "message": f"Error: {str(e)}"
        }

@app.post("/execute-command")
async def execute_command(request: CommandRequest):
    """
    Endpoint for Browser Commands - Translates natural language to function calls
    """
    try:
        # Build prompt for command classification
        prompt = f"""User said: "{request.prompt}"

Translate this to a JSON function call. Respond with ONLY valid JSON."""
        
        # Call Ollama
        response_text = call_ollama_generate(
            prompt=prompt,
            system=COMMAND_CLASSIFIER_INSTRUCTION
        )
        
        # Parse JSON response
        try:
            # Clean up response - remove markdown if present
            cleaned_response = response_text.strip()
            if "```json" in cleaned_response:
                cleaned_response = cleaned_response.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned_response:
                cleaned_response = cleaned_response.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            result = json.loads(cleaned_response)
            
            # Check if function_call exists
            if "function_call" in result and result["function_call"]:
                return {
                    "success": True,
                    "function_call": result["function_call"]
                }
            else:
                return {
                    "success": True,
                    "function_call": None,
                    "message": result.get("message", "No browser command detected")
                }
                
        except json.JSONDecodeError as e:
            # Fallback if JSON parsing fails
            return {
                "success": True,
                "function_call": None,
                "message": "Could not parse command. Please try again."
            }
            
    except Exception as e:
        return {
            "success": False,
            "function_call": None,
            "message": f"Error: {str(e)}"
        }

@app.get("/")
async def root():
    return {
        "message": "Ask About This Screen API - Ollama Edition",
        "model": MODEL_NAME,
        "provider": "Ollama (Local)",
        "ollama_url": OLLAMA_URL,
        "features": "Local AI with vision support",
        "endpoints": {
            "/analyze-screen": "AI Chat - Screen analysis and questions",
            "/execute-command": "Browser Commands - Natural language translation"
        },
        "available_functions": [
            "open_new_tab(url)",
            "search_google(query)",
            "switch_to_tab(keyword)",
            "capture_screenshot()"
        ]
    }

@app.get("/health")
async def health_check():
    """Check if Ollama is running and model is available"""
    try:
        # Check Ollama connection
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        
        if response.status_code == 200:
            models = response.json().get("models", [])
            model_names = [m.get("name") for m in models]
            
            # Check if our model is available
            model_available = any(MODEL_NAME in name for name in model_names)
            
            return {
                "status": "healthy" if model_available else "model_not_found",
                "ollama": "connected",
                "model": MODEL_NAME,
                "model_available": model_available,
                "available_models": model_names,
                "endpoints": ["analyze-screen", "execute-command"]
            }
        else:
            return {
                "status": "unhealthy",
                "error": f"Ollama API returned {response.status_code}"
            }
    except requests.exceptions.ConnectionError:
        return {
            "status": "unhealthy",
            "error": "Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
