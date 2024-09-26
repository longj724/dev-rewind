// External Dependencies

// Relative Dependencies
import { RequestMessage } from './types';

// To save the video to local storage
const saveVideo = (videoUrl: string) => {
  chrome.storage.local.set({ videoUrl });
};

// On page open, check if there is a video url
chrome.storage.local.get(['videoUrl'], (result) => {
  console.log('video url', result);
  if (result.videoUrl) {
    console.log('play video from storage', result);
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

  // Update the saved video url
  saveVideo(url);

  videoElement.src = url;
  videoElement.play();
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
