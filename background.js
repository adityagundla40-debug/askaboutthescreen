// Maintain session screenshots across the extension
let sessionScreenshots = [];
let offscreenDocumentCreated = false;

// Create offscreen document for wake word detection
async function createOffscreenDocument() {
  // Check if offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  
  if (existingContexts.length > 0) {
    console.log('[Background] Offscreen document already exists');
    offscreenDocumentCreated = true;
    return;
  }
  
  if (offscreenDocumentCreated) {
    return;
  }
  
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Continuous wake word detection using speech recognition'
    });
    offscreenDocumentCreated = true;
    console.log('[Background] Offscreen document created');
  } catch (error) {
    console.error('[Background] Failed to create offscreen document:', error);
    // If error is about document already existing, mark as created
    if (error.message.includes('Only a single offscreen document')) {
      offscreenDocumentCreated = true;
    }
  }
}

// Close offscreen document
async function closeOffscreenDocument() {
  if (!offscreenDocumentCreated) {
    return;
  }
  
  try {
    // Check if offscreen document exists before closing
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });
    
    if (existingContexts.length === 0) {
      console.log('[Background] No offscreen document to close');
      offscreenDocumentCreated = false;
      return;
    }
    
    await chrome.offscreen.closeDocument();
    offscreenDocumentCreated = false;
    console.log('[Background] Offscreen document closed');
  } catch (error) {
    console.error('[Background] Failed to close offscreen document:', error);
    offscreenDocumentCreated = false;
  }
}

// Initialize offscreen document on startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('[Background] Extension started');
  const result = await chrome.storage.sync.get(['wakeWordEnabled']);
  if (result.wakeWordEnabled !== false) {
    await createOffscreenDocument();
  }
});

// Also create on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed');
  const result = await chrome.storage.sync.get(['wakeWordEnabled']);
  if (result.wakeWordEnabled !== false) {
    await createOffscreenDocument();
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Dynamic command executor
async function executeDynamicCommand(jsonResponse) {
  const { action, value, message } = jsonResponse;
  
  switch (action) {
    case 'SWITCH_TAB':
      return await switchToTab(value);
    
    case 'SEARCH':
      return await performSearch(value);
    
    case 'CAPTURE':
      return await captureScreen();
    
    case 'NONE':
      return {
        success: false,
        message: message || "Chatting mode... Please give a browser command."
      };
    
    default:
      return {
        success: false,
        message: `Unknown action: ${action}`
      };
  }
}

// Switch to a tab by keyword
async function switchToTab(keyword) {
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
        message: `✅ Switched to: ${targetTab.title}`,
        action: 'SWITCH_TAB',
        target: targetTab.title
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
}

// Perform a Google search
async function performSearch(searchQuery) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    await chrome.tabs.create({ url: searchUrl });
    return {
      success: true,
      message: `✅ Searching for: ${searchQuery}`,
      action: 'SEARCH',
      target: searchQuery
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to perform search: ${error.message}`
    };
  }
}

// Capture current screen
async function captureScreen() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    return {
      success: true,
      message: '✅ Screenshot captured!',
      action: 'CAPTURE',
      dataUrl: dataUrl
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to capture screen: ${error.message}`
    };
  }
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle wake word detection from offscreen document
  if (request.action === 'wakeWordDetected') {
    console.log('[Background] Wake word detected:', request.command);
    
    if (request.command === 'wake') {
      // Open side panel
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId });
          
          // Show visual feedback on extension icon
          chrome.action.setBadgeText({ text: '👂' });
          chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
          
          // Clear badge after 2 seconds
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 2000);
        }
      });
      
      sendResponse({ success: true });
    }
    
    if (request.command === 'sleep') {
      // Close side panel
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.close({ windowId: tabs[0].windowId });
          
          // Show visual feedback
          chrome.action.setBadgeText({ text: '💤' });
          chrome.action.setBadgeBackgroundColor({ color: '#FF9800' });
          
          // Clear badge after 2 seconds
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 2000);
        }
      });
      
      sendResponse({ success: true });
    }
    
    return true;
  }
  
  // Handle wake word status updates
  if (request.action === 'wakeWordStatus') {
    console.log('[Background] Wake word status:', request.status);
    
    // Broadcast status to side panel if open
    chrome.runtime.sendMessage({
      action: 'wakeWordStatusUpdate',
      status: request.status,
      error: request.error
    }).catch(() => {
      // Side panel might not be open, ignore error
    });
    
    return true;
  }
  
  // Handle wake word control from side panel
  if (request.action === 'startWakeWord') {
    createOffscreenDocument().then(() => {
      chrome.runtime.sendMessage({ action: 'startWakeWordDetection' });
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'stopWakeWord') {
    chrome.runtime.sendMessage({ action: 'stopWakeWordDetection' });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'updateAgentName') {
    chrome.runtime.sendMessage({ 
      action: 'updateAgentName',
      agentName: request.agentName
    });
    sendResponse({ success: true });
    return true;
  }
  
  // Handle dynamic command execution
  if (request.action === 'executeDynamicCommand') {
    executeDynamicCommand(request.command).then(result => {
      sendResponse(result);
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'addTabToSession') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const screenshot = {
          id: Date.now(),
          dataUrl: dataUrl,
          url: tabs[0]?.url || 'Unknown',
          title: tabs[0]?.title || 'Unknown Tab',
          timestamp: new Date().toISOString()
        };
        
        sessionScreenshots.push(screenshot);
        sendResponse({ success: true, screenshot, total: sessionScreenshots.length });
      });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'getSession') {
    sendResponse({ screenshots: sessionScreenshots });
    return true;
  }
  
  if (request.action === 'clearSession') {
    sessionScreenshots = [];
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'removeFromSession') {
    sessionScreenshots = sessionScreenshots.filter(s => s.id !== request.id);
    sendResponse({ success: true, total: sessionScreenshots.length });
    return true;
  }
});
