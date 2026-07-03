/**
 * Nexus Chrome Extension Content Script
 * Receives messages and injects floating visual notifications into webpages.
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'NEXUS_SAVED_NOTIFICATION') {
    showNexusSavedToast(message.data);
  }
});

function showNexusSavedToast(data) {
  // Create toast container if not exists
  let container = document.getElementById('nexus-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'nexus-toast-container';
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    background: #09090b;
    color: #f4f4f5;
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid #27272a;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
    margin-bottom: 10px;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
    opacity: 0;
    pointer-events: auto;
    max-width: 320px;
  `;

  // Icon: styled SVG checkmark inside an indigo block
  const icon = document.createElement('div');
  icon.style.cssText = `
    width: 24px;
    height: 24px;
    background: #4f46e5;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `;
  icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  // Content
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 2px;
  `;

  const title = document.createElement('div');
  title.style.cssText = `
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `;
  title.innerText = 'Saved to Memory';

  const desc = document.createElement('div');
  desc.style.cssText = `
    font-size: 11px;
    color: #a1a1aa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
  `;
  desc.innerText = data?.content || 'Snippet captured successfully.';

  content.appendChild(title);
  content.appendChild(desc);
  toast.appendChild(icon);
  toast.appendChild(content);
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }, 3000);
}
