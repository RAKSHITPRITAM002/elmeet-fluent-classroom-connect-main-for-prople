import { MediaFile } from '../types';

const API_BASE_URL = '/api/media';

export const mediaService = {
  uploadMedia: async (formData: FormData): Promise<MediaFile> => {
    // Note: FormData will contain the file and other fields like 'name' and 'type'
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
      // 'Content-Type' header is automatically set by the browser for FormData
      // Add Authorization header if needed
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to upload media' }));
      throw new Error(errorData.message || 'Failed to upload media');
    }
    return response.json();
  },

  getMediaFiles: async (): Promise<MediaFile[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch media files');
    }
    return response.json();
  },

  // Optional: Delete media
  deleteMedia: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { // Assuming an endpoint like /api/media/[id] for DELETE
      method: 'DELETE',
      // Add Authorization header if needed
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete media' }));
      throw new Error(errorData.message || 'Failed to delete media');
    }
  }
};