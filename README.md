# Ask About This Screen

A Chrome Extension (Manifest V3) that captures screenshots and uses Google Gemini AI to answer questions about them.

## Features

- 📸 **Screen Capture**: Capture screenshots of the active tab using Chrome's native API
- 🔄 **Multi-Tab Analysis**: Capture and analyze multiple tabs simultaneously
- 🎤 **Voice-to-Text Input**: Speak your questions using Web Speech API with real-time transcription
- 🔊 **Conditional Text-to-Speech**: AI responses are read aloud when using voice input
- 🤖 **AI Analysis**: Powered by Google Gemini 2.5 Flash-Lite for fast, intelligent responses
- 🔍 **Cross-Tab Comparison**: Compare products, prices, specs, and reviews across multiple tabs
- 💬 **Interactive Chat**: Ask questions about captured screenshots via text or voice
- 🖼️ **Session Gallery**: Visual thumbnails of all captured tabs in your session
- 🎨 **Modern UI**: Dark-themed interface built with React and Tailwind CSS
- ⚡ **Fast Backend**: FastAPI server for efficient image processing

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3

### Backend
- FastAPI
- Google Generative AI (Gemini 2.5 Flash-Lite)
- Python 3.14
- Pillow for image processing

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- Chrome Browser
- Google Gemini API Key

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Create virtual environment (optional but recommended):
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

5. Run the backend server:
```bash
python -m uvicorn main:app --reload
```

The backend will run on `http://127.0.0.1:8000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from this project
5. The extension icon will appear in your Chrome toolbar

## Usage

### Single Tab Mode
1. Click the extension icon to open the side panel
2. Click "📸 Capture Screen" to take a screenshot of the active tab
3. The screenshot will appear in the panel
4. **Text Input**: Type your question in the input field
5. **Voice Input**: Click the 🎙️ microphone button and speak your question
   - The mic icon will pulse red while listening
   - Your speech will be transcribed in real-time
   - When you stop speaking, analysis will automatically begin
6. Click "🤖 Analyze" or press Enter (or wait for auto-process after voice input)
7. The AI will analyze the screenshot and provide an answer

### Multi-Tab Mode
1. Click the extension icon to open the side panel
2. Switch to "Multi-Tab" mode using the toggle
3. Navigate to different tabs and click "➕ Add Tab to Session" for each tab you want to analyze
4. View all captured tabs in the session gallery (thumbnails with URLs)
5. **Text or Voice**: Type or speak your question (e.g., "Compare the prices", "Which product has better reviews?")
6. Click "🤖 Analyze All Tabs" (or wait for auto-process after voice input)
7. The AI will analyze all screenshots together and provide a comprehensive comparison

### Voice Input Features
- **Real-time Transcription**: See your words appear as you speak
- **Visual Feedback**: Pulsing red microphone icon indicates active listening
- **Auto-Process**: Analysis automatically starts when you stop speaking
- **Conditional TTS**: AI responses are automatically read aloud when using voice input
- **Manual TTS Control**: Click 🔇 button to stop speech at any time
- **Smart Interruption**: Starting new voice input stops any ongoing speech
- **Hands-Free**: Perfect for multitasking or accessibility needs
- **Language Support**: Defaults to English (en-US), configurable in code

**TTS Behavior:**
- ✅ **Voice Input** → AI response is spoken aloud
- ❌ **Text/Keyboard Input** → AI response is silent (text only)
- 🔇 **Stop Button** → Appears when TTS is active, click to interrupt

**Multi-Tab Use Cases:**
- Compare products across e-commerce sites
- Analyze pricing differences
- Compare specifications and features
- Review sentiment analysis across multiple sources
- Cross-reference information from different pages

## Project Structure

```
AskAboutTheScreen/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables (not in git)
├── src/
│   ├── App.jsx             # Main React component
│   ├── main.jsx            # React entry point
│   └── index.css           # Tailwind styles
├── dist/                    # Built extension (generated)
├── manifest.json           # Chrome extension manifest
├── background.js           # Service worker
├── index.html              # Extension HTML
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Node dependencies
```

## API Endpoints

### POST /analyze
Analyzes one or more screenshots with AI based on user prompt.

**Request Body:**
```json
{
  "images": ["base64_encoded_image_1", "base64_encoded_image_2", "..."],
  "prompt": "Your question about the image(s)"
}
```

**Response:**
```json
{
  "response": "AI generated answer with cross-tab analysis"
}
```

**System Instructions:**
The AI is configured as a cross-tab assistant that:
- Compares products across different tabs
- Identifies differences and similarities
- Provides structured comparisons
- References specific tabs in responses

## Development

### Run Frontend in Dev Mode
```bash
npm run dev
```

### Run Backend with Auto-reload
```bash
python -m uvicorn main:app --reload
```

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
