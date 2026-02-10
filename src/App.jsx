import { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:8000';

function App() {
  // ViewState: 'COMMAND' or 'CHAT'
  const [viewState, setViewState] = useState('COMMAND');
  
  // Image management
  const [screenshot, setScreenshot] = useState(null); // Single capture
  const [imageBuffer, setImageBuffer] = useState([]); // Multi-capture buffer
  
  // Separate input states for Command and Chat
  const [commandInput, setCommandInput] = useState(''); // Command mode input
  const [chatInput, setChatInput] = useState(''); // Chat mode input
  
  // Shared state
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Separate voice input states for each mode
  const [isCommandListening, setIsCommandListening] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);
  const [commandTranscript, setCommandTranscript] = useState('');
  const [chatTranscript, setChatTranscript] = useState('');
  const [shouldSpeakResponse, setShouldSpeakResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Command mode
  const [lastCommand, setLastCommand] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Separate recognition refs for each mode
  const commandRecognitionRef = useRef(null);
  const chatRecognitionRef = useRef(null);
  const chatInputRef = useRef(null);
  const commandInputRef = useRef(null);

  // Initialize speech recognition on mount
  useEffect(() => {
    initializeCommandRecognition();
    initializeChatRecognition();
  }, []);

  // Auto-focus chat input when switching to CHAT view
  useEffect(() => {
    if (viewState === 'CHAT' && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [viewState]);

  const initializeCommandRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      commandRecognitionRef.current = new SpeechRecognition();
      commandRecognitionRef.current.continuous = true;
      commandRecognitionRef.current.interimResults = true;
      commandRecognitionRef.current.lang = 'en-US';

      commandRecognitionRef.current.onstart = () => {
        console.log('Command recognition started');
        setIsCommandListening(true);
      };

      commandRecognitionRef.current.onresult = (event) => {
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
        setCommandTranscript(currentTranscript);
        setCommandInput(currentTranscript);
      };

      commandRecognitionRef.current.onerror = (event) => {
        console.error('Command recognition error:', event.error);
        setIsCommandListening(false);
        
        if (event.error === 'not-allowed') {
          setResponse('❌ Microphone access denied. Please:\n1. Click the site settings icon (🔒) in the address bar\n2. Allow microphone access\n3. Reload the extension');
        } else if (event.error === 'no-speech') {
          setResponse('⚠️ No speech detected. Please try again.');
        } else {
          setResponse(`⚠️ Speech recognition error: ${event.error}`);
        }
      };

      commandRecognitionRef.current.onend = () => {
        console.log('Command recognition ended');
        setIsCommandListening(false);
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  };

  const initializeChatRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      chatRecognitionRef.current = new SpeechRecognition();
      chatRecognitionRef.current.continuous = true;
      chatRecognitionRef.current.interimResults = true;
      chatRecognitionRef.current.lang = 'en-US';

      chatRecognitionRef.current.onstart = () => {
        console.log('Chat recognition started');
        setIsChatListening(true);
      };

      chatRecognitionRef.current.onresult = (event) => {
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
        setChatTranscript(currentTranscript);
        setChatInput(currentTranscript);
      };

      chatRecognitionRef.current.onerror = (event) => {
        console.error('Chat recognition error:', event.error);
        setIsChatListening(false);
        
        if (event.error === 'not-allowed') {
          setResponse('❌ Microphone access denied. Please:\n1. Click the site settings icon (🔒) in the address bar\n2. Allow microphone access\n3. Reload the extension');
        } else if (event.error === 'no-speech') {
          setResponse('⚠️ No speech detected. Please try again.');
        } else {
          setResponse(`⚠️ Speech recognition error: ${event.error}`);
        }
      };

      chatRecognitionRef.current.onend = () => {
        console.log('Chat recognition ended');
        setIsChatListening(false);
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  };

  const toggleCommandListening = () => {
    if (isCommandListening) {
      commandRecognitionRef.current?.stop();
      setIsCommandListening(false);
    } else {
      try {
        stopSpeaking();
        setCommandTranscript('');
        setResponse('');
        setShouldSpeakResponse(true);
        commandRecognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start command recognition:', error);
        setResponse('❌ Failed to start voice input. Please check microphone permissions.');
        setIsCommandListening(false);
      }
    }
  };

  const toggleChatListening = () => {
    if (isChatListening) {
      chatRecognitionRef.current?.stop();
      setIsChatListening(false);
    } else {
      try {
        stopSpeaking();
        setChatTranscript('');
        setResponse('');
        setShouldSpeakResponse(true);
        chatRecognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start chat recognition:', error);
        setResponse('❌ Failed to start voice input. Please check microphone permissions.');
        setIsChatListening(false);
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ============================================
  // CAPTURE FUNCTIONS
  // ============================================

  const handleSingleCapture = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      
      // 1) Capture the screen
      setScreenshot(dataUrl);
      
      // 2) Set viewState to 'CHAT'
      setViewState('CHAT');
      
      // 3) Auto-focus the chat input (handled by useEffect)
      setResponse('');
      showToast('Screenshot captured! Ready to chat.', 'success');
    } catch (error) {
      console.error('Capture failed:', error);
      showToast('Failed to capture screen', 'error');
    }
  };

  const handleMultiCapture = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      
      // Push to imageBuffer and stay in COMMAND mode
      const newImage = {
        id: Date.now(),
        dataUrl: dataUrl,
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString()
      };
      
      setImageBuffer(prev => [...prev, newImage]);
      showToast(`Image ${imageBuffer.length + 1} captured!`, 'success');
    } catch (error) {
      console.error('Multi-capture failed:', error);
      showToast('Failed to capture screen', 'error');
    }
  };

  const clearImageBuffer = () => {
    setImageBuffer([]);
    showToast('Image buffer cleared', 'success');
  };

  const removeFromBuffer = (id) => {
    setImageBuffer(prev => prev.filter(img => img.id !== id));
  };

  const processAllImages = async () => {
    if (imageBuffer.length === 0) {
      showToast('No images to process', 'error');
      return;
    }

    // Switch to CHAT view
    setViewState('CHAT');
    setResponse('');
    
    // Set a default query in chatInput if none exists
    if (!chatInput.trim()) {
      setChatInput('Analyze all these screenshots');
    }
    
    showToast(`Processing ${imageBuffer.length} images...`, 'success');
  };

  // ============================================
  // CHAT FUNCTIONS
  // ============================================

  const analyzeScreenshots = async () => {
    if (!chatInput.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }

    // Determine which images to analyze
    let imagesToAnalyze = [];
    
    if (imageBuffer.length > 0) {
      // Use image buffer if available
      imagesToAnalyze = imageBuffer.map(img => img.dataUrl.split(',')[1]);
    } else if (screenshot) {
      // Use single screenshot
      imagesToAnalyze = [screenshot.split(',')[1]];
    } else {
      showToast('Please capture a screenshot first', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze-screen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imagesToAnalyze, prompt: chatInput })
      });
      const data = await res.json();
      
      if (data.success) {
        setResponse(data.response);
        if (shouldSpeakResponse) {
          speakResponse(data.response);
        }
      } else {
        setResponse(data.message || 'Failed to analyze');
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

  // ============================================
  // COMMAND EXECUTION (Function Calling)
  // ============================================

  const executeCommand = async () => {
    if (!commandInput.trim()) return;

    setLoading(true);
    setLastCommand(null);
    setResponse('');
    
    try {
      // Call backend with function calling
      const res = await fetch(`${API_URL}/execute-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: commandInput })
      });
      const data = await res.json();
      
      if (data.success && data.function_call) {
        const functionCall = data.function_call;
        const functionName = functionCall.name;
        const functionArgs = functionCall.args;
        
        // Show toast notification
        const actionMessages = {
          'open_new_tab': `Opening ${functionArgs.url}...`,
          'search_google': `Searching for: ${functionArgs.query}...`,
          'switch_to_tab': `Switching to: ${functionArgs.keyword}...`,
          'capture_screenshot': 'Capturing screenshot...'
        };
        
        showToast(`Command recognized: ${actionMessages[functionName] || 'Executing...'}`, 'success');
        
        // Execute the function
        const result = await executeFunctionCall(functionName, functionArgs);
        
        if (result.success) {
          setLastCommand({
            function: functionName,
            args: functionArgs,
            message: result.message
          });
          setResponse(result.message);
          if (shouldSpeakResponse) {
            speakResponse(result.message);
          }
          
          // Clear command input after successful execution
          setCommandInput('');
          
          // Handle screenshot capture
          if (functionName === 'capture_screenshot' && result.dataUrl) {
            setScreenshot(result.dataUrl);
            setViewState('CHAT'); // Auto-switch to chat mode
          }
        } else {
          setResponse(result.message);
          if (shouldSpeakResponse) {
            speakResponse(result.message);
          }
        }
      } else if (data.success && !data.function_call) {
        // No function call detected
        const msg = data.message || "No browser command detected. Try 'Open YouTube' or 'Search for Python'.";
        setResponse(msg);
        if (shouldSpeakResponse) {
          speakResponse(msg);
        }
      } else {
        setResponse('Failed to process command');
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

  const executeFunctionCall = async (functionName, args) => {
    try {
      switch (functionName) {
        case 'open_new_tab':
          return await openNewTab(args.url);
        
        case 'search_google':
          return await searchGoogle(args.query);
        
        case 'switch_to_tab':
          return await switchToTab(args.keyword);
        
        case 'capture_screenshot':
          return await captureScreenshot();
        
        default:
          return {
            success: false,
            message: `Unknown function: ${functionName}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to execute ${functionName}: ${error.message}`
      };
    }
  };

  const openNewTab = async (url) => {
    try {
      // Ensure URL has protocol
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }
      
      await chrome.tabs.create({ url: fullUrl });
      return {
        success: true,
        message: `✅ Opened: ${fullUrl}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to open tab: ${error.message}`
      };
    }
  };

  const searchGoogle = async (query) => {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await chrome.tabs.create({ url: searchUrl });
      return {
        success: true,
        message: `✅ Searching for: ${query}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to search: ${error.message}`
      };
    }
  };

  const switchToTab = async (keyword) => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const targetTab = tabs.find(tab => 
        tab.title.toLowerCase().includes(keyword.toLowerCase()) ||
        tab.url.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (targetTab) {
        await chrome.tabs.update(targetTab.id, { active: true });
        return {
          success: true,
          message: `✅ Switched to: ${targetTab.title}`
        };
      } else {
        return {
          success: false,
          message: `❌ No tab found matching: ${keyword}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to switch tab: ${error.message}`
      };
    }
  };

  const captureScreenshot = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      return {
        success: true,
        message: '✅ Screenshot captured!',
        dataUrl: dataUrl
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to capture screenshot: ${error.message}`
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Ask About This Screen</h1>
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <p className="font-semibold">{toast.message}</p>
        </div>
      )}
      
      {/* ViewState Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewState('COMMAND')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            viewState === 'COMMAND' ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          🎮 Command Mode
        </button>
        <button
          onClick={() => setViewState('CHAT')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
            viewState === 'CHAT' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          💬 Chat Mode
        </button>
      </div>

      {/* ============================================ */}
      {/* COMMAND MODE VIEW */}
      {/* ============================================ */}
      {viewState === 'COMMAND' && (
        <>
          <div className="mb-4 p-4 bg-orange-900 bg-opacity-30 border border-orange-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">🎮 Command Mode</h2>
            <p className="text-sm text-gray-300 mb-3">
              Capture screenshots or control your browser with voice commands.
            </p>
            
            {/* Capture Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleSingleCapture}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                📸 Capture This
              </button>
              <button
                onClick={handleMultiCapture}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition relative"
              >
                📸+ Multi-Capture
                {imageBuffer.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {imageBuffer.length}
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-400">
              <strong>Capture This:</strong> Single capture → Auto-switch to Chat<br/>
              <strong>Multi-Capture:</strong> Build image buffer → Process all together
            </p>
          </div>

          {/* Image Buffer Display */}
          {imageBuffer.length > 0 && (
            <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  📦 Image Buffer ({imageBuffer.length} images)
                </h3>
                <button
                  onClick={clearImageBuffer}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1 px-3 rounded transition"
                >
                  🗑️ Clear
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto mb-3">
                {imageBuffer.map((img) => (
                  <div key={img.id} className="relative group">
                    <img 
                      src={img.dataUrl} 
                      alt={img.title} 
                      className="w-full h-24 object-cover rounded border border-gray-700"
                    />
                    <button
                      onClick={() => removeFromBuffer(img.id)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    <div className="text-xs mt-1 truncate text-gray-400" title={img.url}>
                      {img.title}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={processAllImages}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                ✨ Process All Images
              </button>
            </div>
          )}

          {/* Voice Commands Section */}
          <div className="mb-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <h3 className="text-md font-semibold mb-2">🎙️ Voice Commands</h3>
            <p className="text-sm text-gray-400 mb-3">
              Control your browser with natural language:
            </p>
            <ul className="text-sm text-gray-400 mb-3 space-y-1">
              <li>• "Switch to Gmail"</li>
              <li>• "Search for Python tutorials"</li>
              <li>• "Capture this screen"</li>
            </ul>

            <div className="flex gap-2 mb-2">
              <input
                ref={commandInputRef}
                type="text"
                value={commandInput}
                readOnly
                placeholder={isCommandListening ? "🎤 Listening..." : "Click mic for voice command"}
                className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none cursor-not-allowed"
              />
              <button
                onClick={toggleCommandListening}
                className={`px-4 py-3 rounded-lg font-semibold transition ${
                  isCommandListening 
                    ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {isCommandListening ? '🎤' : '🎙️'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition"
                >
                  🔇
                </button>
              )}
            </div>

            <button
              onClick={executeCommand}
              disabled={!commandInput.trim() || loading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              {loading ? '⏳ Processing...' : '▶️ Execute Command'}
            </button>
          </div>

          {/* Last Command Confirmation */}
          {lastCommand && lastCommand.function && (
            <div className="mb-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                {lastCommand.function === 'open_new_tab' && '🌐'}
                {lastCommand.function === 'search_google' && '🔍'}
                {lastCommand.function === 'switch_to_tab' && '🔄'}
                {lastCommand.function === 'capture_screenshot' && '📸'}
                Function Executed
              </h3>
              <div className="text-sm space-y-1">
                <p><strong>Function:</strong> {lastCommand.function}</p>
                {lastCommand.args && Object.keys(lastCommand.args).length > 0 && (
                  <p><strong>Arguments:</strong> {JSON.stringify(lastCommand.args, null, 2)}</p>
                )}
                <p className="text-green-300">{lastCommand.message}</p>
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">
                {response.includes('❌') || response.includes('⚠️') ? 'Error:' : 'Status:'}
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* CHAT MODE VIEW */}
      {/* ============================================ */}
      {viewState === 'CHAT' && (
        <>
          <div className="mb-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">💬 Chat Mode</h2>
            <p className="text-sm text-gray-300">
              Ask questions about your captured screenshots.
            </p>
          </div>

          {/* Screenshot Preview */}
          {screenshot && imageBuffer.length === 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Current Screenshot:</h3>
              <img src={screenshot} alt="Screenshot" className="w-full rounded-lg border border-gray-700" />
            </div>
          )}

          {/* Image Buffer Preview */}
          {imageBuffer.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">
                Analyzing {imageBuffer.length} screenshots:
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {imageBuffer.map((img) => (
                  <img 
                    key={img.id}
                    src={img.dataUrl} 
                    alt={img.title} 
                    className="w-full h-20 object-cover rounded border border-gray-700"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="mb-4 flex gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                setShouldSpeakResponse(false);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setShouldSpeakResponse(false);
                  analyzeScreenshots();
                }
              }}
              placeholder={isChatListening ? "Listening..." : "Ask a question about the screenshot(s)..."}
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={toggleChatListening}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                isChatListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isChatListening ? '🎤' : '🎙️'}
            </button>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
              >
                🔇
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setShouldSpeakResponse(false);
              analyzeScreenshots();
            }}
            disabled={loading || (!screenshot && imageBuffer.length === 0)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg mb-4 transition"
          >
            {loading ? '⏳ Analyzing...' : '🤖 Analyze Screenshots'}
          </button>

          {/* Response Display */}
          {response && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Response:</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
            </div>
          )}

          {/* Back to Command Mode */}
          <button
            onClick={() => setViewState('COMMAND')}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Back to Command Mode
          </button>
        </>
      )}
    </div>
  );
}

export default App;
