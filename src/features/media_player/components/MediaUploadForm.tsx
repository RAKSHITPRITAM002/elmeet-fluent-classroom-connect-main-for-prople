import React, { useState, useRef } from 'react';
import { mediaService } from '../services/mediaService';
import { MediaFile } from '../types';

interface MediaUploadFormProps {
  onUploadSuccess: (newMedia: MediaFile) => void;
}

export const MediaUploadForm: React.FC<MediaUploadFormProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video'); // Default or auto-detect
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // For future progress bar
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!mediaName) {
        setMediaName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      }
      // Basic auto-detection of type
      if (file.type.startsWith('audio/')) {
        setMediaType('audio');
      } else if (file.type.startsWith('video/')) {
        setMediaType('video');
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!mediaName.trim()) {
      setError('Please provide a name for the media.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress(0); // Reset progress

    const formData = new FormData();
    formData.append('mediaFile', selectedFile);
    formData.append('name', mediaName);
    formData.append('type', mediaType);

    try {
      // For actual progress, you'd use XMLHttpRequest or a library that supports it with fetch.
      // This is a simplified version.
      const newMedia = await mediaService.uploadMedia(formData);
      onUploadSuccess(newMedia);
      setSelectedFile(null);
      setMediaName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
      setUploadProgress(100); // Simulate completion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      console.error(err);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md space-y-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-700">Upload New Media</h3>
      {error && <div className="p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
      <div>
        <label htmlFor="media-file" className="block text-sm font-medium text-gray-700">
          Select File (Audio or Video)
        </label>
        <input
          type="file"
          id="media-file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,video/*" // Be more specific if needed: "audio/mpeg,audio/wav,video/mp4,video/webm"
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          required
        />
        {selectedFile && <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name} ({(selectedFile.size / (1024*1024)).toFixed(2)} MB)</p>}
      </div>
      <div>
        <label htmlFor="media-name" className="block text-sm font-medium text-gray-700">
          Media Name
        </label>
        <input
          type="text"
          id="media-name"
          value={mediaName}
          onChange={(e) => setMediaName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="e.g., Lecture Recording 1"
          required
        />
      </div>
      <div>
        <label htmlFor="media-type" className="block text-sm font-medium text-gray-700">
          Media Type
        </label>
        <select
          id="media-type"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value as 'audio' | 'video')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
        >
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
      </div>
      {isLoading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          <p className="text-xs text-center text-gray-600">Uploading... {uploadProgress > 0 && `${uploadProgress}%`}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isLoading || !selectedFile}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Uploading...' : 'Upload Media'}
      </button>
    </form>
  );
};