// Offscreen document for continuous wake word detection
let recognition = null;
let isListening = false;
let customAgentName = 'assistant'; // Default wake word

console.log('[Offscreen] Wake word listener initialized');

// Initialize speech recognition
function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.error('[Offscreen] Speech recognition not supported');
    chrome.runtime.sendMessage({ 
      action: 'wakeWordStatus', 
      status: 'unsupported'
    }).catch(err => console.error('[Offscreen] Failed to send unsupported status:', err));
    return;
  }
  
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[Offscreen] Speech recognition started');
      isListening = true;
      chrome.runtime.sendMessage({ 
        action: 'wakeWordStatus', 
        status: 'listening' 
      }).catch(err => console.error('[Offscreen] Failed to send listening status:', err));
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        console.log('[Offscreen] Transcript:', transcript);
        
        // Check for wake word
        if (transcript.includes(`${customAgentName} wake up`) || 
            transcript.includes(`hey ${customAgentName}`) ||
            transcript.includes(`${customAgentName} wake`)) {
          console.log('[Offscreen] Wake word detected!');
          chrome.runtime.sendMessage({ 
            action: 'wakeWordDetected',
            command: 'wake'
          }).catch(err => console.error('[Offscreen] Failed to send wake message:', err));
        }
        
        // Check for sleep word
        if (transcript.includes(`${customAgentName} sleep`) || 
            transcript.includes(`${customAgentName} go to sleep`) ||
            transcript.includes(`goodbye ${customAgentName}`)) {
          console.log('[Offscreen] Sleep word detected!');
          chrome.runtime.sendMessage({ 
            action: 'wakeWordDetected',
            command: 'sleep'
          }).catch(err => console.error('[Offscreen] Failed to send sleep message:', err));
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('[Offscreen] Speech recognition error:', event.error);
      
      // Send detailed error to background
      chrome.runtime.sendMessage({ 
        action: 'wakeWordStatus', 
        status: 'error',
        error: event.error
      }).catch(err => console.error('[Offscreen] Failed to send error status:', err));
      
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (isListening) {
            console.log('[Offscreen] Restarting recognition after error...');
            startListening();
          }
        }, 1000);
      } else if (event.error === 'not-allowed') {
        console.error('[Offscreen] Microphone permission denied');
        isListening = false;
      } else {
        // For other errors, try to restart
        setTimeout(() => {
          if (isListening) {
            console.log('[Offscreen] Attempting restart after error:', event.error);
            startListening();
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      console.log('[Offscreen] Speech recognition ended');
      
      // Auto-restart if still supposed to be listening
      if (isListening) {
        console.log('[Offscreen] Auto-restarting recognition...');
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };
    
    console.log('[Offscreen] Speech recognition initialized successfully');
  } catch (error) {
    console.error('[Offscreen] Failed to initialize speech recognition:', error);
    chrome.runtime.sendMessage({ 
      action: 'wakeWordStatus', 
      status: 'error',
      error: error.message
    }).catch(err => console.error('[Offscreen] Failed to send error:', err));
  }
}

function startListening() {
  if (recognition && !isListening) {
    try {
      recognition.start();
      isListening = true;
      console.log('[Offscreen] Started listening for wake word');
    } catch (error) {
      console.error('[Offscreen] Failed to start recognition:', error);
      // If already started, just update flag
      if (error.message.includes('already started')) {
        isListening = true;
      }
    }
  }
}

function stopListening() {
  if (recognition && isListening) {
    isListening = false;
    try {
      recognition.stop();
      console.log('[Offscreen] Stopped listening for wake word');
    } catch (error) {
      console.error('[Offscreen] Error stopping recognition:', error);
    }
    chrome.runtime.sendMessage({ 
      action: 'wakeWordStatus', 
      status: 'stopped'
    }).catch(err => console.error('[Offscreen] Failed to send stopped status:', err));
  }
}

function updateAgentName(newName) {
  customAgentName = newName.toLowerCase().trim();
  console.log('[Offscreen] Agent name updated to:', customAgentName);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Offscreen] Received message:', request);
  
  if (request.action === 'startWakeWordDetection') {
    startListening();
    sendResponse({ success: true });
  }
  
  if (request.action === 'stopWakeWordDetection') {
    stopListening();
    sendResponse({ success: true });
  }
  
  if (request.action === 'updateAgentName') {
    updateAgentName(request.agentName);
    sendResponse({ success: true });
  }
  
  return true;
});

// Initialize on load
initializeSpeechRecognition();

// Load saved agent name and start listening
chrome.storage.sync.get(['customAgentName', 'wakeWordEnabled'], (result) => {
  if (result.customAgentName) {
    customAgentName = result.customAgentName.toLowerCase().trim();
    console.log('[Offscreen] Loaded agent name:', customAgentName);
  }
  
  // Auto-start if enabled
  if (result.wakeWordEnabled !== false) {
    console.log('[Offscreen] Auto-starting wake word detection');
    setTimeout(() => startListening(), 1000);
  }
});
