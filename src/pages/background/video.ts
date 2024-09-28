// External Dependencies

// Relative Dependencies
import { ConsoleMessageInfo, RequestMessage } from './types';

let capturedConsoleMessages: ConsoleMessageInfo[] = [];
let videoStartTime: number;

const saveVideo = (videoUrl: string) => {
  chrome.storage.local.set({ videoUrl });
};

// On page open, check if there is a video url
chrome.storage.local.get(['videoUrl'], (result) => {
  if (result.videoUrl) {
    const message: RequestMessage = {
      action: 'play-video',
      videoUrl: result.videoUrl,
    };
    playVideo(message);
  }
});

const playVideo = (message: RequestMessage) => {
  const videoElement = document.querySelector(
    '#recorded-video'
  ) as HTMLVideoElement;

  if (!videoElement) return;
  const url = (message?.videoUrl || message?.base64) as string;

  saveVideo(url);

  videoElement.src = url;
  videoElement.play();

  capturedConsoleMessages =
    message?.capturedConsoleMessages as ConsoleMessageInfo[];

  videoElement.addEventListener('timeupdate', onVideoTimeUpdate);
  videoStartTime = Date.now();
};

const onVideoTimeUpdate = (event: Event) => {
  const videoElement = event.target as HTMLVideoElement;
  console.log('video current time', videoElement.currentTime);
  const currentVideoTime = videoElement.currentTime * 1000; // Convert to milliseconds
  const currentTimestamp = videoStartTime + currentVideoTime;

  capturedConsoleMessages.forEach(({ message, timestamp, type }) => {
    if (timestamp < currentTimestamp) {
      console.log('message', message);
      console.log('type', type);
    }
  });
};

chrome.runtime.onMessage.addListener((message) => {
  console.log('play video', message);
  switch (message.action) {
    case 'play-video':
      playVideo(message);
      break;
    default:
      console.log('default');
  }
});
