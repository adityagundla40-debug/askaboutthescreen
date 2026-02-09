// Maintain session screenshots across the extension
let sessionScreenshots = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
