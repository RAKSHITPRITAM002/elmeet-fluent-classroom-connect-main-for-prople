import React, { useState, useEffect } from 'react';
import { MediaFile } from '../types';
import { mediaService } from '../services/mediaService';
import { MediaUploadForm } from './MediaUploadForm';
import { MediaPlayer } from './MediaPlayer';

export const MediaLibraryDashboard: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [playingMedia, setPlayingMedia] = useState<MediaFile | null>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await mediaService.getMediaFiles();
      setMediaFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadSuccess = (newMedia: MediaFile) => {
    setMediaFiles(prevFiles => [newMedia, ...prevFiles]);
    setShowUploadForm(false); // Optionally close form on success
  };

  const handlePlayMedia = (media: MediaFile) => {
    setPlayingMedia(media);
  };

  const handleClosePlayer = () => {
    setPlayingMedia(null);
  };

  // Placeholder for delete
  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this media file?")) return;
    setIsLoading(true);
    try {
        // await mediaService.deleteMedia(id); // Uncomment when delete endpoint is ready
        // For now, filter out from local state
        setMediaFiles(prev => prev.filter(mf => mf.id !== id));
        alert(`Media ID ${id} would be deleted. (Frontend only for now)`);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete media.');
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-teal-700">Media Library</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6">
        <button
          onClick={() => setShowUploadForm(prev => !prev)}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          {showUploadForm ? 'Cancel Upload' : '+ Upload New Media'}
        </button>
      </div>

      {showUploadForm && (
        <div className="mb-6">
          <MediaUploadForm onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">Uploaded Media</h2>
        {isLoading && mediaFiles.length === 0 && <p>Loading media files...</p>}
        {!isLoading && mediaFiles.length === 0 && !showUploadForm && <p>No media uploaded yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaFiles.map(media => (
            <div key={media.id} className="border rounded-lg shadow p-3 bg-white flex flex-col justify-between">
              <div>
                {media.type === 'video' && media.thumbnailUrl && (
                  <img src={media.thumbnailUrl} alt={media.name} className="w-full h-32 object-cover rounded mb-2" />
                )}
                {media.type === 'video' && !media.thumbnailUrl && (
                  <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-500">No Preview</div>
                )}
                 {media.type === 'audio' && (
                  <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
                <h4 className="font-semibold text-sm truncate" title={media.name}>{media.name}</h4>
                <p className="text-xs text-gray-500 capitalize">{media.type}</p>
                <p className="text-xs text-gray-500">Uploaded: {new Date(media.uploadedAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handlePlayMedia(media)}
                  className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Play
                </button>
                <button
                    onClick={() => handleDeleteMedia(media.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    title="Delete Media"
                >
                    🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {playingMedia && <MediaPlayer media={playingMedia} onClose={handleClosePlayer} />}
    </div>
  );
};