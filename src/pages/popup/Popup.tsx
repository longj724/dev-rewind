// External Dependencies
import { useCallback, useEffect, useState } from 'react';
import { CircleStop, Video } from 'lucide-react';

// Relative Dependencies
import { Button } from '../components/button';

interface Message {
  action: string;
  isRecording: boolean;
}

export default function Popup(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);

  const checkRecordingState = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'get-recording-state' });
  }, []);

  useEffect(() => {
    checkRecordingState();

    const messageListener = (message: Message) => {
      console.log('message', message);
      if (
        message.action === 'recording-state-changed' &&
        message.isRecording !== undefined
      ) {
        setIsRecording(message.isRecording);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const toggleRecording = () => {
    if (!isRecording) {
      chrome.runtime.sendMessage({
        action: 'start-recording',
        recordingType: 'tab',
      });
    } else {
      chrome.runtime.sendMessage({
        action: 'stop-recording',
        recordingType: 'tab',
      });
    }

    setIsRecording(!isRecording);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold leading-none tracking-tight mt-4">
        DevRewind
      </h1>

      <Button
        className={`w-4/5 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
        onClick={toggleRecording}
      >
        {isRecording ? (
          <CircleStop className="mr-2 h-5 w-5" />
        ) : (
          <Video className="mr-2 h-5 w-5" />
        )}
        {isRecording ? 'Stop Recording' : 'Record Tab'}
      </Button>
    </div>
  );
}
