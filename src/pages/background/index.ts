// External Dependencies

// Relative Dependencies
import { ConsoleMessageInfo, RequestMessage } from './types';

let recordingStartTime = 0;
let recordingEndTime = 0;

const updateRecording = async (isRecording: boolean) => {
  chrome.storage.local.set({ isRecording });
};

const startRecording = async () => {
  updateRecording(true);
  recordingStartTime = Date.now();
  // TODO: Get right icon path
  // chrome.action.setIcon({ path: '../../public/recording.png' });
  recordTabState();
};

const stopRecording = async () => {
  updateRecording(false);
  recordingEndTime = Date.now();
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
  const { videoUrl, base64 } = request;

  if (!videoUrl || !base64) return;

  const url = chrome.runtime.getURL('src/pages/background/video.html');
  const newTab = await chrome.tabs.create({ url });

  if (!newTab.id) return;

  console.log('capturedConsoleMessages', capturedConsoleMessages);

  setTimeout(() => {
    // @ts-expect-error - Checking if id exists but ts isn't recognizing it
    chrome.tabs.sendMessage(newTab.id, {
      action: 'load-video',
      videoUrl,
      base64,
      capturedConsoleMessages: capturedConsoleMessages,
      recordingStartTime,
      recordingEndTime,
    });
  }, 500);
};

let capturedConsoleMessages: ConsoleMessageInfo[] = [];

const getRecordingState = async () => {
  const result = await chrome.storage.local.get('isRecording');
  return result.isRecording || false;
};
chrome.runtime.onMessage.addListener(async (request: RequestMessage) => {
  let isRecording = false;

  switch (request.action) {
    case 'get-recording-state':
      isRecording = await getRecordingState();
      chrome.runtime.sendMessage({
        action: 'recording-state-changed',
        isRecording,
      });
      break;
    case 'open-tab':
      openTabWithVideo(request);
      break;
    case 'start-recording':
      capturedConsoleMessages = [];
      if (request.recordingType) {
        await startRecording();

        chrome.tabs.sendMessage(request.tabId as number, {
          action: 'show-stop-button',
          isRecording: true,
        });
      }
      break;
    case 'stop-recording':
      stopRecording();

      chrome.tabs.sendMessage(request.tabId as number, {
        action: 'hide-stop-button',
        isRecording: false,
      });
      break;
    case 'console-message':
      isRecording = await getRecordingState();

      if (isRecording && request.consoleMessageInfo) {
        capturedConsoleMessages.push(request.consoleMessageInfo);
      }
      break;
    default:
      break;
  }

  return true;
});
