// Maintain session screenshots across the extension
let sessionScreenshots = [];

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
