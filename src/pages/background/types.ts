export type RecordingType = 'tab' | 'stopped';

export type RequestMessage = {
  action:
    | 'open-tab'
    | 'start-recording'
    | 'stop-recording'
    | 'play-video'
    | 'get-recording-state';
  videoUrl?: string;
  base64?: string;
  recordingType?: RecordingType;
};
