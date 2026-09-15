/**
 * Viral Video AI Studio — Chrome Extension MV3 Service Worker
 * Brand: Rahul Scripts
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Viral Video AI Studio installed successfully.');
    // Set initial configuration
    chrome.storage.local.set({
      installedAt: Date.now(),
      version: '3.0.0',
    });
  }
});

// Periodic alarm for heartbeat / queue health monitoring
chrome.alarms.create('queue_heartbeat', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'queue_heartbeat') {
    // Keep background service healthy without keeping persistent state in memory
  }
});

// Listen for messages from popup or options page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'GET_EXTENSION_INFO') {
    sendResponse({
      name: 'Viral Video AI Studio',
      brand: 'Rahul Scripts',
      version: '3.0.0',
    });
    return false;
  }

  return true;
});
