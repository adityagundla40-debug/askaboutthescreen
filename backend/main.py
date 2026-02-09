from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import base64
import os
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv

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
model = genai.GenerativeModel("gemini-2.5-flash-lite")

class AnalyzeRequest(BaseModel):
    image: str
    prompt: str

@app.post("/analyze")
async def analyze_screen(request: AnalyzeRequest):
    try:
        image_data = base64.b64decode(request.image)
        image = Image.open(BytesIO(image_data))
        
        response = model.generate_content([request.prompt, image])
        
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Ask About This Screen API"}
