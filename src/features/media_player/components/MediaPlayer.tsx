import React from 'react';
import { MediaFile } from '../types';

interface MediaPlayerProps {
  media: MediaFile | null;
  onClose?: () => void; // Optional: if used in a modal or overlay
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, onClose }) => {
  if (!media) {
    return null; // Or some placeholder if always visible
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-3xl w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">{media.name}</h3>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          )}
        </div>
        {media.type === 'video' && (
          <video
            key={media.url} // Important for re-rendering if src changes
            controls
            autoPlay
            className="w-full max-h-[70vh] rounded"
            src={media.url} // Ensure this URL is publicly accessible
            poster={media.thumbnailUrl} // Optional poster image
          >
            Your browser does not support the video tag.
          </video>
        )}
        {media.type === 'audio' && (
          <audio
            key={media.url} // Important for re-rendering if src changes
            controls
            autoPlay
            className="w-full"
            src={media.url} // Ensure this URL is publicly accessible
          >
            Your browser does not support the audio tag.
          </audio>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p>Type: {media.type}</p>
          {media.size && <p>Size: {(media.size / (1024*1024)).toFixed(2)} MB</p>}
          {/* Duration would be displayed here if available */}
        </div>
      </div>
    </div>
  );
};