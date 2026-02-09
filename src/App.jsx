import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
  const [screenshot, setScreenshot] = useState(null);
  const [sessionScreenshots, setSessionScreenshots] = useState([]);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'multi'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [shouldSpeakResponse, setShouldSpeakResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Load session on mount
  useEffect(() => {
    loadSession();
    initializeSpeechRecognition();
  }, []);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        setQuery(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          setResponse('❌ Microphone access denied. Please:\n1. Click the site settings icon (🔒) in the address bar\n2. Allow microphone access\n3. Reload the extension');
        } else if (event.error === 'no-speech') {
          setResponse('⚠️ No speech detected. Please try again.');
        } else {
          setResponse(`⚠️ Speech recognition error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        // Auto-process if we have a transcript
        if (transcript.trim()) {
          setTimeout(() => {
            if (mode === 'single' && screenshot) {
              analyzeSingle();
            } else if (mode === 'multi' && sessionScreenshots.length > 0) {
              analyzeAll();
            }
          }, 500);
        }
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        // Stop any ongoing TTS when starting new voice input
        stopSpeaking();
        
        setTranscript('');
        setQuery('');
        setResponse('');
        setShouldSpeakResponse(true); // Enable TTS for voice input
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setResponse('❌ Failed to start voice input. Please check microphone permissions.');
        setIsListening(false);
      }
    }
  };

  const stopSpeaking = () => {
    if (chrome.tts) {
      chrome.tts.stop();
      setIsSpeaking(false);
    }
  };

  const speakResponse = (text) => {
    if (chrome.tts && shouldSpeakResponse) {
      // Stop any ongoing speech first
      chrome.tts.stop();
      
      setIsSpeaking(true);
      chrome.tts.speak(text, {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        onEvent: (event) => {
          if (event.type === 'end' || event.type === 'interrupted' || event.type === 'cancelled') {
            setIsSpeaking(false);
          }
        }
      });
    }
  };

  const loadSession = async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getSession' });
    setSessionScreenshots(response.screenshots || []);
  };

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

  const addTabToSession = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'addTabToSession' });
      if (response.success) {
        await loadSession();
        setResponse(`✅ Added tab to session! Total: ${response.total} tabs`);
      }
    } catch (error) {
      console.error('Add to session failed:', error);
      setResponse('❌ Failed to add tab to session');
    }
  };

  const removeFromSession = async (id) => {
    const response = await chrome.runtime.sendMessage({ action: 'removeFromSession', id });
    if (response.success) {
      await loadSession();
    }
  };

  const clearSession = async () => {
    await chrome.runtime.sendMessage({ action: 'clearSession' });
    await loadSession();
    setResponse('🗑️ Session cleared');
  };

  const analyzeSingle = async () => {
    if (!screenshot || !query.trim()) return;

    setLoading(true);
    try {
      const base64Image = screenshot.split(',')[1];
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [base64Image], prompt: query })
      });
      const data = await res.json();
      setResponse(data.response);
      
      // Speak response if triggered by voice input
      if (shouldSpeakResponse) {
        speakResponse(data.response);
      }
    } catch (error) {
      const errorMsg = 'Error: ' + error.message;
      setResponse(errorMsg);
      if (shouldSpeakResponse) {
        speakResponse(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeAll = async () => {
    if (sessionScreenshots.length === 0 || !query.trim()) {
      const errorMsg = '❌ Please add tabs to session and enter a query';
      setResponse(errorMsg);
      if (shouldSpeakResponse) {
        speakResponse(errorMsg);
      }
      return;
    }

    setLoading(true);
    try {
      const base64Images = sessionScreenshots.map(s => s.dataUrl.split(',')[1]);
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: base64Images, prompt: query })
      });
      const data = await res.json();
      setResponse(data.response);
      
      // Speak response if triggered by voice input
      if (shouldSpeakResponse) {
        speakResponse(data.response);
      }
    } catch (error) {
      const errorMsg = 'Error: ' + error.message;
      setResponse(errorMsg);
      if (shouldSpeakResponse) {
        speakResponse(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Ask About This Screen</h1>
      
      {/* Microphone Permission Info */}
      {!isListening && (
        <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm">
          <p className="text-gray-400">
            💡 <strong>Voice Input:</strong> Click 🎙️ to use voice. If blocked, click the 🔒 icon in the address bar and allow microphone access.
          </p>
        </div>
      )}
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('single')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            mode === 'single' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Single Tab
        </button>
        <button
          onClick={() => setMode('multi')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            mode === 'multi' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Multi-Tab ({sessionScreenshots.length})
        </button>
      </div>

      {/* Single Tab Mode */}
      {mode === 'single' && (
        <>
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

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShouldSpeakResponse(false); // Disable TTS for text input
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setShouldSpeakResponse(false); // Disable TTS for keyboard submission
                  analyzeSingle();
                }
              }}
              placeholder={isListening ? "Listening..." : "Ask a question or click mic..."}
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={toggleListening}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
                title="Stop speaking"
              >
                🔇
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setShouldSpeakResponse(false); // Disable TTS for button click
              analyzeSingle();
            }}
            disabled={!screenshot || !query.trim() || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-4 transition"
          >
            {loading ? '⏳ Analyzing...' : '🤖 Analyze'}
          </button>
        </>
      )}

      {/* Multi-Tab Mode */}
      {mode === 'multi' && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={addTabToSession}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              ➕ Add Tab to Session
            </button>
            <button
              onClick={clearSession}
              disabled={sessionScreenshots.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              🗑️ Clear
            </button>
          </div>

          {/* Session Gallery */}
          {sessionScreenshots.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Session ({sessionScreenshots.length} tabs)</h2>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto bg-gray-800 p-2 rounded-lg">
                {sessionScreenshots.map((shot) => (
                  <div key={shot.id} className="relative group">
                    <img 
                      src={shot.dataUrl} 
                      alt={shot.title} 
                      className="w-full h-24 object-cover rounded border border-gray-700"
                    />
                    <button
                      onClick={() => removeFromSession(shot.id)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    <div className="text-xs mt-1 truncate text-gray-400" title={shot.url}>
                      {shot.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShouldSpeakResponse(false); // Disable TTS for text input
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setShouldSpeakResponse(false); // Disable TTS for keyboard submission
                  analyzeAll();
                }
              }}
              placeholder={isListening ? "Listening..." : "Compare products, analyze differences..."}
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={toggleListening}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? '🎤' : '🎙️'}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
                title="Stop speaking"
              >
                🔇
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setShouldSpeakResponse(false); // Disable TTS for button click
              analyzeAll();
            }}
            disabled={sessionScreenshots.length === 0 || !query.trim() || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-4 transition"
          >
            {loading ? '⏳ Analyzing All Tabs...' : '🤖 Analyze All Tabs'}
          </button>
        </>
      )}

      {/* Response Display */}
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
