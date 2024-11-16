import { useEffect, useRef } from 'react';
import { ConsoleMessageInfo, RequestMessage } from './types';

type ConsoleMessageInfoWithTime = ConsoleMessageInfo & {
  offset: number;
};

const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const roundToNearestThousand = (num: number) => {
    return Math.round(num / 1000) * 1000;
  };

  const saveVideo = (videoUrl: string) => {
    chrome.storage.local.set({ videoUrl });
  };

  const onVideoTimeUpdate = (
    event: Event,
    capturedConsoleMessages: ConsoleMessageInfoWithTime[]
  ) => {
    const videoElement = event.target as HTMLVideoElement;

    const currentVideoTime = roundToNearestThousand(
      videoElement.currentTime * 1000
    );

    capturedConsoleMessages.forEach(({ message, offset }) => {
      if (currentVideoTime === offset) {
        console.log(
          'message when equal is',
          message,
          'time is:',
          currentVideoTime
        );
      }
    });
  };

  const playVideo = (message: RequestMessage) => {
    const videoElement = videoRef.current;

    if (!videoElement) return;
    const url = (message?.videoUrl || message?.base64) as string;

    saveVideo(url);

    videoElement.src = url;
    videoElement.play();

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

    videoElement.addEventListener('timeupdate', (event) =>
      onVideoTimeUpdate(event, capturedConsoleMessagesWithTime)
    );
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'play-video') {
        playVideo(message);
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(() => {});
      if (video.src) {
        URL.revokeObjectURL(video.src);
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      style={{
        aspectRatio: '16/9',
        width: '70vw',
        border: 'none',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'black',
      }}
    />
  );
};

export default VideoPlayer;
