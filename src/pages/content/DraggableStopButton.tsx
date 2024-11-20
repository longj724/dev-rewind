import React, { useEffect, useState } from 'react';
import { Move, StopCircle, Trash2 } from 'lucide-react';

interface Message {
  action: string;
  isRecording: boolean;
}

const DraggableStopButton: React.FC = () => {
  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isVisible) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisible]);

  useEffect(() => {
    const messageListener = (message: Message) => {
      if (message.action === 'show-stop-button') {
        setIsVisible(true);
      } else if (message.action === 'hide-stop-button') {
        setIsVisible(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.min(
        Math.max(0, e.clientX - dragOffset.x),
        window.innerWidth - 150
      );
      const newY = Math.min(
        Math.max(0, e.clientY - dragOffset.y),
        window.innerHeight - 50
      );

      setPosition({
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      action: 'stop-recording',
      recordingType: 'tab',
    });
  };

  const deleteRecording = (e: React.MouseEvent) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      action: 'delete-recording',
    });
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed flex items-center gap-1 bg-black rounded-full p-1 text-white w-fit cursor-move select-none h-12"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'scale(0.8)',
        zIndex: 9999,
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <Move
        className="w-6 h-6 hover:cursor-pointer"
        onMouseDown={handleMouseDown}
      />
      <span className="text-sm px-2">{formatTime(timer)}</span>

      <div className="bg-red-500 z-[1000]">
        <button
          onClick={stopRecording}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 px-2 py-1 rounded-full text-sm"
        >
          <StopCircle className="w-6 h-6" />
          <span>Stop & watch</span>
        </button>
      </div>

      <button
        className="p-1 hover:bg-gray-700 rounded-full"
        onClick={deleteRecording}
      >
        <Trash2 className="w-6 h-6 bg-red-500" />
      </button>
    </div>
  );
};

export default DraggableStopButton;
