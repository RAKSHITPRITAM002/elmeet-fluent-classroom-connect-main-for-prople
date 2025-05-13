import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable } from 'formidable'; // Using formidable for multipart/form-data
import fs from 'fs'; // For file system operations (if storing locally)
import path from 'path'; // For path manipulation
import { v4 as uuidv4 } from 'uuid';
import { MediaFile } from '@/features/media_player/types';

// Configure formidable
export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for formidable to work
  },
};

// In-memory store for demonstration. Replace with a database.
let mediaDB: MediaFile[] = [];
// Local storage path for uploaded files (for demonstration)
// In production, use cloud storage (S3, GCS, Azure Blob)
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'media');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'mock-user-id'; // Replace with actual auth

  if (req.method === 'POST') {
    const form = new Formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit (adjust as needed)
      // Naming convention for uploaded files to avoid conflicts
      filename: (name: any, ext: any, part: any, form: any) => {
        return `${uuidv4()}${ext}`;
      }
    });

    try {
      await new Promise<void>((resolve, reject) => {
        form.parse(req, (err: any, fields: { name: any[]; type: (string | undefined)[]; }, files: { mediaFile: any[]; }) => {
          if (err) {
            console.error('File upload error:', err);
            // Clean up partially uploaded file if error occurs
            if (files.mediaFile && files.mediaFile[0] && fs.existsSync(files.mediaFile[0].filepath)) {
                fs.unlinkSync(files.mediaFile[0].filepath);
            }
            return reject(err);
          }

          const mediaFile = files.mediaFile?.[0];
          const name = fields.name?.[0] || mediaFile?.originalFilename || 'Untitled';
          const mediaTypeField = fields.type?.[0] as 'audio' | 'video' | undefined;

          if (!mediaFile) {
            return reject(new Error('No media file uploaded.'));
          }

          // Basic validation (add more robust checks)
          const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];
          const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
          let determinedType: 'audio' | 'video';

          if (mediaTypeField) {
            determinedType = mediaTypeField;
          } else if (mediaFile.mimetype && allowedAudioTypes.includes(mediaFile.mimetype)) {
            determinedType = 'audio';
          } else if (mediaFile.mimetype && allowedVideoTypes.includes(mediaFile.mimetype)) {
            determinedType = 'video';
          } else {
            // Clean up unallowed file type
            fs.unlinkSync(mediaFile.filepath);
            return reject(new Error(`Unsupported file type: ${mediaFile.mimetype}. Please upload common audio or video formats.`));
          }


          const newMedia: MediaFile = {
            id: uuidv4(),
            name: name,
            type: determinedType,
            // URL should point to where the file is served from
            // For local storage, it's relative to the public folder
            url: `/uploads/media/${path.basename(mediaFile.filepath)}`,
            uploadedAt: new Date().toISOString(),
            uploadedBy: userId,
            size: mediaFile.size,
            // Duration and thumbnail would typically be extracted using a library like ffmpeg (fluent-ffmpeg)
            // This is an advanced step and often done asynchronously after upload.
          };

          mediaDB.push(newMedia);
          console.log('Media DB:', mediaDB);
          res.status(201).json(newMedia);
          resolve();
        });
      });
    } catch (error: any) {
      console.error('Error processing media upload:', error);
      // Ensure response is sent only once
      if (!res.headersSent) {
        if (error.message.includes('Unsupported file type') || error.message.includes('No media file uploaded')) {
            res.status(400).json({ message: error.message });
        } else if (error.message.toLowerCase().includes('maxfilesize')) {
            res.status(413).json({ message: 'File too large.' });
        }
        else {
            res.status(500).json({ message: 'Error uploading media file.' });
        }
      }
    }
  } else if (req.method === 'GET') {
    try {
      // In a real app, add pagination, filtering by type, etc.
      return res.status(200).json(mediaDB);
    } catch (error) {
      console.error('Error fetching media:', error);
      return res.status(500).json({ message: 'Error fetching media files.' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}