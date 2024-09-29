import { createRoot } from 'react-dom/client';
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  originalLog(...args);
  chrome.runtime.sendMessage({
    action: 'console-message',
    consoleMessageInfo: {
      type: 'log',
      message: args,
      timestamp: Date.now(),
    },
  });
};

console.error = (...args) => {
  originalError(...args);
  chrome.runtime.sendMessage({
    action: 'console-message',
    consoleMessageInfo: {
      type: 'error',
      message: args,
      timestamp: Date.now(),
    },
  });
};

console.warn = (...args) => {
  originalWarn(...args);
  chrome.runtime.sendMessage({
    action: 'console-message',
    consoleMessageInfo: {
      type: 'warn',
      message: args,
      timestamp: Date.now(),
    },
  });
};

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(<div className=""></div>);

try {
  console.log('content script loaded');
} catch (e) {
  console.error(e);
}
