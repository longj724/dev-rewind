export const initConsoleCapture = () => {
  const originalConsole = {
    log: window.console.log,
    info: window.console.info,
    warn: window.console.warn,
    error: window.console.error,
  };

  const createConsoleOverride = (type: 'log' | 'info' | 'warn' | 'error') => {
    return (...args: unknown[]) => {
      // Call original method
      originalConsole[type].apply(console, args);

      // Prepare message info
      const messageInfo = {
        message: args
          .map((arg) => {
            try {
              return typeof arg === 'object'
                ? JSON.stringify(arg)
                : String(arg);
            } catch (e) {
              return '[Unable to stringify]';
            }
          })
          .join(' '),
        type,
        timestamp: Date.now(),
      };

      // Dispatch custom event with console message
      window.dispatchEvent(
        new CustomEvent('console-message', {
          detail: messageInfo,
        })
      );
    };
  };

  // Override each console method
  console.log = createConsoleOverride('log');
  console.info = createConsoleOverride('info');
  console.warn = createConsoleOverride('warn');
  console.error = createConsoleOverride('error');
};

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined') {
  initConsoleCapture();
}
