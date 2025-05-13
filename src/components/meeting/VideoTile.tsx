import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MicOff, Video, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream?: MediaStream;
  displayName: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isLocal: boolean;
  isActive: boolean;
  isPinned: boolean;
  avatarUrl?: string;
  backgroundUrl?: string;
  size?: 'small' | 'medium' | 'large';
  onPin?: () => void;
}

const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  displayName,
  audioEnabled,
  videoEnabled,
  isLocal,
  isActive,
  isPinned,
  avatarUrl,
  backgroundUrl,
  size = 'medium',
  onPin,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && videoEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoEnabled]);

  const sizeClasses = {
    small: 'w-[160px] h-[120px]',
    medium: 'w-[320px] h-[240px]',
    large: 'w-full h-full max-w-4xl',
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        'relative rounded-lg overflow-hidden',
        isActive && 'ring-2 ring-blue-500',
        isPinned && 'ring-2 ring-yellow-500'
      )}
    >
      {/* Background effect if any */}
      {backgroundUrl && videoEnabled && (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: backgroundUrl === 'blur' ? 'none' : `url(${backgroundUrl})`,
            filter: backgroundUrl === 'blur' ? 'blur(10px)' : 'none'
          }} 
        />
      )}

      {/* Video element */}
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-gray-800 flex items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-2xl bg-blue-600">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay with name and status */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white text-sm font-medium truncate max-w-[150px]">
              {displayName} {isLocal && '(You)'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {!audioEnabled && (
              <MicOff className="h-4 w-4 text-red-500" />
            )}
            {isPinned && (
              <Pin className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
          
      {/* Pin button */}
      {onPin && (
        <button
          onClick={onPin}
          className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
        >
          <Pin className={cn("h-4 w-4", isPinned ? "text-yellow-500" : "text-white")} />
        </button>
      )}
    </div>
  );
};

export default VideoTile;