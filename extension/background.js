/**
 * Nexus Chrome Extension Background Service Worker
 * Manifest V3 Ephemeral Script
 */

// TODO: after deploying, replace this with your live Render/Railway/Fly URL,
// e.g. 'https://nexus-ai.onrender.com' — then reload the extension in Chrome.
const BACKEND_URL = 'http://localhost:3000';

// 1. Initialize Extension Behaviors
chrome.runtime.onInstalled.addListener(() => {
  console.log('Nexus Extension Installed');
  
  // Set up side panel to open on action button click
  if (chrome.sidePanel) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error('SidePanel setup failed:', error));
  }

  // Set up Context Menu for Highlight-to-Save
  chrome.contextMenus.create({
    id: 'nexus-save-snippet',
    title: 'Save snippet to Nexus Memory',
    contexts: ['selection']
  });
});

// 2. Context Menu Action Handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'nexus-save-snippet' && info.selectionText && tab) {
    const snippet = info.selectionText;
    const url = tab.url || '';
    const title = tab.title || 'Webpage';

    // Post to Nexus local backend to store memory
    fetch(`${BACKEND_URL}/api/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        title,
        content: snippet,
        tags: ['Highlight', 'QuickSave']
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Snippet saved successfully to DB:', data);
      
      // Notify active tab or open sidepanel
      chrome.tabs.sendMessage(tab.id, {
        action: 'NEXUS_SAVED_NOTIFICATION',
        data
      }).catch(() => {});
    })
    .catch(err => {
      console.error('Failed to post memory to local server:', err);
    });
  }
});

// 3. Centralized Message Router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received background message:', request);

  // Example proxy routing
  if (request.action === 'GET_ACTIVE_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({ url: tabs[0].url, title: tabs[0].title });
      } else {
        sendResponse({ error: 'No active tab found.' });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'SUMMARIZE_PAGE') {
    fetch(`${BACKEND_URL}/api/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: request.url,
        title: request.title,
        text: request.text
      })
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'GET_RECOMMENDATIONS') {
    fetch(`${BACKEND_URL}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: request.url,
        title: request.title,
        text: request.text
      })
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
