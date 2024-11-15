export type RecordingType = 'tab' | 'stopped';

export type RequestMessage = {
  action:
    | 'open-tab'
    | 'start-recording'
    | 'stop-recording'
    | 'play-video'
    | 'get-recording-state'
    | 'console-message';
  videoUrl?: string;
  base64?: string;
  recordingType?: RecordingType;
  consoleMessageInfo?: ConsoleMessageInfo;
  capturedConsoleMessages?: ConsoleMessageInfo[];
};

export type ConsoleMessageInfo = {
  message: string;
  type: 'log' | 'info' | 'warn' | 'error';
  timestamp: number;
};
