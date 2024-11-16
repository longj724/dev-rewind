// External Dependencies
import { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Maximize2 } from 'lucide-react';

// Internal Dependencies
import { Button } from '../components/button';
import { Slider } from '../components/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/table';
import { ScrollArea } from '../components/scroll-area';
import { ConsoleMessageInfo, RequestMessage } from './types';
import '@assets/styles/tailwind.css';

type ConsoleMessageInfoWithTime = ConsoleMessageInfo & {
  offset: number;
};

const VideoPlayer = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<
    ConsoleMessageInfoWithTime[]
  >([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const roundToNearestThousand = (num: number) => {
    return Math.round(num / 1000) * 1000;
  };

  const saveVideo = (videoUrl: string) => {
    chrome.storage.local.set({ videoUrl });
  };

  const onVideoTimeUpdate = (event: Event) => {
    const videoElement = event.target as HTMLVideoElement;
    const currentOffsetTime = roundToNearestThousand(
      videoElement.currentTime * 1000
    );

    console.log('currentTime', videoRef.current?.currentTime);

    setCurrentTime(videoRef.current?.currentTime || 0);
    setCurrentOffset(currentOffsetTime);

    // capturedConsoleMessages.forEach(({ message, offset }) => {
    //   if (currentVideoTime === offset) {
    //     console.log(
    //       'message when equal is',
    //       message,
    //       'time is:',
    //       currentVideoTime
    //     );
    //   }
    // });
  };

  const loadVideo = (message: RequestMessage) => {
    const videoElement = videoRef.current;

    if (!videoElement) return;
    const url = (message?.videoUrl || message?.base64) as string;

    saveVideo(url);
    videoElement.src = url;

    const capturedConsoleMessagesWithTime: ConsoleMessageInfoWithTime[] = (
      message?.capturedConsoleMessages as ConsoleMessageInfo[]
    ).map((msg) => {
      return {
        ...msg,
        offset: roundToNearestThousand(
          msg.timestamp - (message?.recordingStartTime as number)
        ),
      };
    });

    setDuration(
      ((message?.recordingEndTime as number) -
        (message?.recordingStartTime as number)) /
        1000
    );
    setConsoleMessages(capturedConsoleMessagesWithTime);

    videoElement.addEventListener('timeupdate', (event) =>
      onVideoTimeUpdate(event)
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'load-video') {
        loadVideo(message);
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(() => {});
      if (video.src) {
        URL.revokeObjectURL(video.src);
      }
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatMillisecondsToTime = (time: number) => {
    const timeInSeconds = time / 1000;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Video Section (2/3) */}
      <div className="w-2/3 p-4">
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video ref={videoRef} className="w-full aspect-video" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              className="mb-4"
              onValueChange={([value]) => {
                if (videoRef.current) {
                  console.log('value', value);
                  videoRef.current.currentTime = value;
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-white hover:bg-white/20"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 border-l">
        <div className="bg-zinc-900 text-white h-full">
          <div className="p-2 border-b bg-zinc-800 font-mono text-sm">
            Console
          </div>
          <ScrollArea className="h-[calc(100vh-40px)]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-24">Time</TableHead>
                  <TableHead className="text-zinc-400">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTime !== 0 &&
                  consoleMessages
                    .filter((msg) => msg.offset <= currentOffset)
                    .map((msg, index) => (
                      <TableRow key={index} className="hover:bg-zinc-800/50">
                        <TableCell className="text-zinc-400 font-mono">
                          {formatMillisecondsToTime(msg.offset)}
                        </TableCell>
                        <TableCell
                          className={`font-mono ${
                            msg.type === 'error'
                              ? 'text-red-400'
                              : msg.type === 'warn'
                              ? 'text-yellow-400'
                              : msg.type === 'info'
                              ? 'text-blue-400'
                              : 'text-white'
                          }`}
                        >
                          {msg.message}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
