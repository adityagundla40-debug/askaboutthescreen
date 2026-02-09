import { useState } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const captureScreen = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      setScreenshot(dataUrl);
      setResponse('');
    } catch (error) {
      console.error('Capture failed:', error);
    }
  };

  const analyzeScreen = async () => {
    if (!screenshot || !query.trim()) return;

    setLoading(true);
    try {
      const base64Image = screenshot.split(',')[1];
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, prompt: query })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Ask About This Screen</h1>
      
      <button
        onClick={captureScreen}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg mb-4 transition"
      >
        📸 Capture Screen
      </button>

      {screenshot && (
        <div className="mb-4">
          <img src={screenshot} alt="Screenshot" className="w-full rounded-lg border border-gray-700" />
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && analyzeScreen()}
          placeholder="Ask a question about the screen..."
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={analyzeScreen}
        disabled={!screenshot || !query.trim() || loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-4 transition"
      >
        {loading ? '⏳ Analyzing...' : '🤖 Analyze'}
      </button>

      {response && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
