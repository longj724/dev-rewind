export type RecordingType = 'tab' | 'stopped';

export type RequestMessage = {
  message: 'open-tab' | 'start-recording' | 'stop-recording' | 'play-video';
  videoUrl?: string;
  base64?: string;
  recordingType?: RecordingType;
};
