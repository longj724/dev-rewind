console.log('offscreen');

chrome.runtime.onMessage.addListener((message, sender) => {
  console.log('offscreen message received', message, sender);

  switch (message.type) {
    case 'start-recording':
      console.log('offscreen start recording', message.recordType);
      startRecording(message.streamId);
      break;
    case 'stop-recording':
      console.log('offscreen stop recording');
      stopRecording();
      break;
    default:
      console.log('default');
  }

  return true;
});

// @ts-expect-error - js files are not shared
let recorder: MediaRecorder;
const data: Blob[] = [];

// @ts-expect-error - js files are not shared
async function stopRecording() {
  if (recorder?.state === 'recording') {
    recorder.stop();

    // Stop all streams
    recorder.stream.getTracks().forEach((t) => t.stop());
  }
}

// @ts-expect-error - js files are not shared
async function startRecording(streamId: string) {
  try {
    if (recorder?.state === 'recording') {
      throw new Error('Called startRecording while recording is in progress.');
    }

    console.log('start recording', streamId);

    // Use the tabCaptured streamId
    const media = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
        },
      } as MediaTrackConstraints,
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
        },
      } as MediaTrackConstraints,
    });

    // Get microphone audio
    const microphone = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false },
    });
    // Combine the streams
    const mixedContext = new AudioContext();
    const mixedDest = mixedContext.createMediaStreamDestination();

    mixedContext.createMediaStreamSource(microphone).connect(mixedDest);
    mixedContext.createMediaStreamSource(media).connect(mixedDest);

    const combinedStream = new MediaStream([
      media.getVideoTracks()[0],
      mixedDest.stream.getTracks()[0],
    ]);

    recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

    // listen for data
    recorder.ondataavailable = (event) => {
      console.log('data available', event);
      data.push(event.data);
    };

    // listen for when recording stops
    recorder.onstop = async () => {
      console.log('recording stopped');
      // send the data to the service worker
      console.log('sending data to service worker');

      // convert this into a blog and open window
      const blob = new Blob(data, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      // Send message to service worker to open tab
      chrome.runtime.sendMessage({ type: 'open-tab', url });
    };

    // start recording
    recorder.start();
  } catch (err) {
    console.log('error', err);
  }
}
