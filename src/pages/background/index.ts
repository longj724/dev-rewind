// External Dependencies

// Relative Dependencies
import { RequestMessage } from './types';

const updateRecording = async (isRecording: boolean) => {
  chrome.storage.local.set({ isRecording });
};

const startRecording = async () => {
  updateRecording(true);
  // TODO: Get right icon path
  // chrome.action.setIcon({ path: '../../public/recording.png' });
  recordTabState();
};

const stopRecording = async () => {
  updateRecording(false);
  // TODO: Get right icon path
  // chrome.action.setIcon({ path: '../../public/not-recording.png' });
  recordTabState(false);
};

const recordTabState = async (start = true) => {
  const existingContexts = await chrome.runtime.getContexts({});
  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );

  if (!offscreenDocument) {
    await chrome.offscreen.createDocument({
      url: 'src/pages/background/offscreen.html',
      reasons: [
        chrome.offscreen.Reason.USER_MEDIA,
        chrome.offscreen.Reason.DISPLAY_MEDIA,
      ],
      justification: 'Recording from chrome.tabCapture API',
    });
  }

  if (start) {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab[0]?.id) return;

    chrome.tabCapture.getMediaStreamId(
      { targetTabId: tab[0].id },
      async (streamId) => {
        await chrome.runtime.sendMessage({
          action: 'start-recording',
          target: 'offscreen',
          recordType: 'tab',
          streamId,
        });
      }
    );
  } else {
    chrome.runtime.sendMessage({
      action: 'stop-recording',
      target: 'offscreen',
    });
  }
};

const openTabWithVideo = async (request: RequestMessage) => {
  console.log('request to open tab with video');

  const { videoUrl, base64 } = request;

  if (!videoUrl || !base64) return;

  const url = chrome.runtime.getURL('video.html');
  const newTab = await chrome.tabs.create({ url });

  if (!newTab.id) return;

  setTimeout(() => {
    // @ts-expect-error - Checking if id exists but ts isn't recognizing it
    chrome.tabs.sendMessage(newTab.id, {
      type: 'play-video',
      videoUrl,
      base64,
    });
  }, 500);
};

const getRecordingState = async () => {
  const result = await chrome.storage.local.get('isRecording');
  return result.isRecording || false;
};
chrome.runtime.onMessage.addListener(async (request: RequestMessage) => {
  console.log('request', request);
  let isRecording = false;

  switch (request.action) {
    case 'get-recording-state':
      isRecording = await getRecordingState();
      console.log('isRecording in get-recording-state', isRecording);
      chrome.runtime.sendMessage({
        action: 'recording-state-changed',
        isRecording,
      });
      break;
    case 'open-tab':
      openTabWithVideo(request);
      break;
    case 'start-recording':
      if (request.recordingType) {
        startRecording();
      }
      break;
    case 'stop-recording':
      stopRecording();
      break;
    default:
      break;
  }

  return true;
});
