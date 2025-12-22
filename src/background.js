chrome.runtime.onInstalled.addListener(() => {
  console.log('Pefl LS extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ type: 'PONG', at: new Date().toISOString() });
    return true;
  }
  return false;
});
