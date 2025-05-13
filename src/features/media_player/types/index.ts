export interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'video'; // Could be more specific like 'audio/mpeg', 'video/mp4'
  url: string; // URL to access the media file (could be a direct link or a streaming URL)
  uploadedAt: string; // ISO date string
  uploadedBy: string; // User ID
  duration?: number; // in seconds, optional
  thumbnailUrl?: string; // for videos, optional
  size?: number; // in bytes, optional
}

// Payload for uploading a new media file (metadata)
// The actual file will be sent as FormData
export interface UploadMediaPayload {
  name: string;
  type: 'audio' | 'video';
  // Other metadata can be extracted on the backend (duration, size)
}