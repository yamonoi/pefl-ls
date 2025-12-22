const log = document.querySelector('#log');
const ping = document.querySelector('#ping');

ping.addEventListener('click', async () => {
  const response = await chrome.runtime.sendMessage({ type: 'PING' });
  log.textContent = JSON.stringify(response, null, 2);
});
