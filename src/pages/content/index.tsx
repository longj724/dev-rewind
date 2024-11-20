import { createRoot } from 'react-dom/client';
import DraggableStopButton from './DraggableStopButton';
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

// Inject the console capture script
const injectConsoleCapture = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('consoleCapture.js');
  (document.head || document.documentElement).appendChild(script);
};

// Listen for console messages from the injected script
window.addEventListener('console-message', ((event: CustomEvent) => {
  chrome.runtime.sendMessage({
    action: 'console-message',
    consoleMessageInfo: event.detail,
  });
}) as EventListener);

// Execute injection
injectConsoleCapture();

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(<DraggableStopButton />);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}
