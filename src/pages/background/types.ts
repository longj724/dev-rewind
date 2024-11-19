export type RecordingType = 'tab' | 'stopped';

export type RequestMessage = {
  action:
    | 'open-tab'
    | 'start-recording'
    | 'stop-recording'
    | 'load-video'
    | 'get-recording-state'
    | 'console-message';
  videoUrl?: string;
  base64?: string;
  recordingType?: RecordingType;
  consoleMessageInfo?: ConsoleMessageInfo;
  capturedConsoleMessages?: ConsoleMessageInfo[];
  recordingStartTime?: number;
  recordingEndTime?: number;
  tabId?: number;
};

export type ConsoleMessageInfo = {
  message: string;
  type: 'log' | 'info' | 'warn' | 'error';
  timestamp: number;
};
