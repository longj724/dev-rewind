// External Dependencies

// Relative Dependencies
import { RecordingType, RequestMessage } from './types';

const checkRecording = async (): Promise<[boolean, RecordingType]> => {
  const recording = await chrome.storage.local.get(['recording', 'type']);
  console.log('recording', recording);
  const recordingStatus = recording.recording || false;
  const recordingType = recording.type || '';

  console.log('recording status', recordingStatus, recordingType);
  return [recordingStatus, recordingType];
};

const updateRecording = async (isRecording: boolean, type: RecordingType) => {
  console.log('update recording', type);
  chrome.storage.local.set({ recording: isRecording, type });
};

// Listen for changes to the focused / current tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('tab activated', activeInfo);

  // Grab the tab
  const activeTab = await chrome.tabs.get(activeInfo.tabId);
  if (!activeTab || !activeTab.url) return;

  const tabUrl = activeTab.url;

  // If chrome or extension page, return
  if (
    tabUrl.startsWith('chrome://') ||
    tabUrl.startsWith('chrome-extension://')
  ) {
    console.log('chrome or extension page - exiting');
    return;
  }

  // Check if we are recording & if we are recording the scren
  const [recording, recordingType] = await checkRecording();

  console.log('recording check after tab change', {
    recording,
    recordingType,
    tabUrl,
  });

  // removeCamera();
});

const startRecording = async (type: RecordingType) => {
  console.log('start recording', type);
  updateRecording(true, type);
  // chrome.action.setIcon({ path: '../../public/recording.png' });
  if (type === 'tab') {
    recordTabState();
  }
};

const stopRecording = async () => {
  updateRecording(false, 'stopped');
  // chrome.action.setIcon({ path: '../../public/not-recording.png' });
  recordTabState(false);
};

const recordTabState = async (start = true) => {
  // Setup offscreen document
  const existingContexts = await chrome.runtime.getContexts({});
  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );

  if (!offscreenDocument) {
    console.log('creating offscreen document');
    // Create an offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [
        chrome.offscreen.Reason.USER_MEDIA,
        chrome.offscreen.Reason.DISPLAY_MEDIA,
      ],
      justification: 'Recording from chrome.tabCapture API',
    });
  }

  if (start) {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('tab', tab);
    if (!tab) return;

    const tabId = tab[0].id;

    const exists = await chrome.offscreen.hasDocument();
    console.log('offscreen document exists', exists);

    chrome.tabCapture.getMediaStreamId(
      { targetTabId: tabId }, // Specify the target tab ID
      async (streamId) => {
        await chrome.runtime.sendMessage({
          type: 'start-recording',
          target: 'offscreen',
          recordingType: 'tab',
          data: streamId,
        });
      }
    );
  } else {
    chrome.runtime.sendMessage({
      type: 'stop-recording',
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

  // Send message to tab
  setTimeout(() => {
    // @ts-expect-error - Checking if id exists but ts isn't recognizing it
    chrome.tabs.sendMessage(newTab.id, {
      type: 'play-video',
      videoUrl,
      base64,
    });
  }, 500);
};

chrome.runtime.onMessage.addListener((request: RequestMessage) => {
  console.log('request', request);
  switch (request.message) {
    case 'open-tab':
      openTabWithVideo(request);
      break;
    case 'start-recording':
      if (request.recordingType) {
        startRecording(request.recordingType);
      }
      break;
    case 'stop-recording':
      if (request.recordingType === 'stopped') {
        stopRecording();
      }
      break;
    default:
      break;
  }

  return true;
});
