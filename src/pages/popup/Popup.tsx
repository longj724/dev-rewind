// External Dependencies
import { useState } from 'react';
import {
  Camera,
  CircleStop,
  EyeOff,
  HelpCircle,
  Home,
  Maximize2,
  Menu,
  Video,
} from 'lucide-react';

// Relative Dependencies
import { Button } from '../components/button';
// import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../components/select';

export default function Popup(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (!isRecording) {
      chrome.runtime.sendMessage({
        message: 'start-recording',
        recordingType: 'tab',
      });
    } else {
      chrome.runtime.sendMessage({
        message: 'stop-recording',
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
      {/* <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-center">
          <CardTitle className="text-xl font-bold">DevRewind</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select>
            <SelectTrigger className="w-full">
              <Maximize2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Set Recording Dimensions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="full">Full Screen</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full justify-start">
            <EyeOff className="mr-2 h-4 w-4" />
            Hide Sensitive Data
          </Button>
        </CardContent>
      </Card> */}
    </div>
  );
}
