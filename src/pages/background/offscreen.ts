chrome.runtime.onMessage.addListener(async (message) => {
  // console.log('offscreen message received', message, sender);

  switch (message.action) {
    case 'start-recording':
      // console.log('offscreen start recording', message.recordType);
      await startRecording(message.streamId);
      break;
    case 'stop-recording':
      stopRecording();
      break;
    default:
      break;
  }

  return true;
});

let recorder: MediaRecorder;
const data: Blob[] = [];

async function stopRecording() {
  if (recorder?.state === 'recording') {
    console.log('stopping recorder');
    recorder.stop();

    recorder.stream.getTracks().forEach((t) => t.stop());
  }
}

async function startRecording(streamId: string) {
  try {
    if (recorder?.state === 'recording') {
      throw new Error('Called startRecording while recording is in progress.');
    }

    const media = await navigator.mediaDevices.getUserMedia({
      video: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId,
        },
      } as MediaTrackConstraints,
    });

    const combinedStream = new MediaStream([
      media.getVideoTracks()[0],
      // mixedDest.stream.getTracks()[0],
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

      // convert this into a blob
      const blob = new Blob(data, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;

        chrome.runtime.sendMessage({
          action: 'open-tab',
          videoUrl: url,
          base64: base64data,
        });
      };
      reader.readAsDataURL(blob); // This will trigger onloadend
    };

    // start recording
    recorder.start();
  } catch (err) {
    console.log('error', err);
  }
}
