import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import FloatingAnnotationToolbar from "@/components/FloatingAnnotationToolbar";

interface ScreenShareViewProps {
  stream: MediaStream;
  sharerName: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  allowAnnotation: boolean;
}

const ScreenShareView: React.FC<ScreenShareViewProps> = ({
  stream,
  sharerName,
  isFullScreen,
  onToggleFullScreen,
  allowAnnotation,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleFullScreenToggle = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    onToggleFullScreen();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col"
    >
      <div className="absolute top-2 left-2 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {sharerName} is sharing screen
      </div>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
        onClick={handleFullScreenToggle}
      >
        {isFullScreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black"
      />
      
      {allowAnnotation && (
        <div className="absolute bottom-4 right-4 z-10">
          <FloatingAnnotationToolbar />
        </div>
      )}
    </div>
  );
};

export default ScreenShareView;