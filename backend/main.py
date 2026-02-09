from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import base64
import os
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from typing import List

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemma-3-12b-it")

class AnalyzeRequest(BaseModel):
    images: List[str]  # List of base64 encoded images
    prompt: str

@app.post("/analyze")
async def analyze_screen(request: AnalyzeRequest):
    try:
        # Convert all base64 images to PIL Images
        images = []
        for img_data in request.images:
            image_bytes = base64.b64decode(img_data)
            image = Image.open(BytesIO(image_bytes))
            images.append(image)
        
        # Prepend instructions to the user prompt for Gemma models
        enhanced_prompt = f"""You are a cross-tab assistant analyzing screenshots. Compare products, prices, specs, and reviews across images. Highlight key differences and similarities.

User Question: {request.prompt}"""
        
        # Build content list with enhanced prompt and all images
        content = [enhanced_prompt] + images
        
        # Generate response with all images
        response = model.generate_content(content)
        
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Ask About This Screen API - Multi-Tab Analysis Enabled"}
