# Ask About This Screen

A Chrome Extension (Manifest V3) that captures screenshots and uses Google Gemini AI to answer questions about them.

## Features

- 📸 **Screen Capture**: Capture screenshots of the active tab using Chrome's native API
- 🤖 **AI Analysis**: Powered by Google Gemini 2.5 Flash-Lite for fast, intelligent responses
- 💬 **Interactive Chat**: Ask questions about captured screenshots
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

1. Click the extension icon to open the side panel
2. Click "📸 Capture Screen" to take a screenshot of the active tab
3. The screenshot will appear in the panel
4. Type your question in the input field (e.g., "What's on this page?", "Summarize this content")
5. Click "🤖 Analyze" or press Enter
6. The AI will analyze the screenshot and provide an answer

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
Analyzes a screenshot with AI based on user prompt.

**Request Body:**
```json
{
  "image": "base64_encoded_image_string",
  "prompt": "Your question about the image"
}
```

**Response:**
```json
{
  "response": "AI generated answer"
}
```

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
