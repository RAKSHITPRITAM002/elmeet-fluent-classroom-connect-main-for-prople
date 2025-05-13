import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl'; // Import for WebGL backend
import * as bodySegmentation from '@tensorflow-models/body-segmentation';


interface BackgroundChangerProps {
  onStreamReady?: (stream: MediaStream) => void; // Callback with the processed stream
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

// Predefined background images (replace with your actual image URLs or upload logic)
const predefinedBackgrounds = [
  { id: 'blur', name: 'Blur Background', type: 'blur' as const },
  { id: 'office', name: 'Office', type: 'image' as const, url: 'https://via.placeholder.com/640x480/CCCCCC/808080?Text=Office+Background' },
  { id: 'beach', name: 'Beach', type: 'image' as const, url: 'https://via.placeholder.com/640x480/007bff/FFFFFF?Text=Beach+Background' },
  { id: 'none', name: 'No Background', type: 'none' as const },
];

type BackgroundOption = typeof predefinedBackgrounds[0];

export const BackgroundChanger: React.FC<BackgroundChangerProps> = ({
  onStreamReady,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null); // For raw camera feed (can be hidden)
  const canvasRef = useRef<HTMLCanvasElement>(null); // For processed output
  const [model, setModel] = useState<bodySegmentation.SelfieSegmentation | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(predefinedBackgrounds[0]);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Load the segmentation model
  useEffect(() => {
    async function loadModel() {
      setIsLoadingModel(true);
      setError(null);
      try {
        await tf.setBackend('webgl'); // Ensure WebGL backend is set
        const loadedModel = await bodySegmentation.load({
            modelUrl: 'https://tfhub.dev/mediapipe/tfjs-model/selfie_segmentation/landscape/1', // Example model URL
            // For different models or custom paths, adjust modelUrl
        });
        setModel(loadedModel);
        console.log('Selfie Segmentation model loaded.');
      } catch (err) {
        console.error('Error loading segmentation model:', err);
        setError('Failed to load background segmentation model. Please ensure your browser supports WebGL and try again.');
      } finally {
        setIsLoadingModel(false);
      }
    }
    loadModel();

    return () => {
        model?.dispose(); // Clean up model resources
    }
  }, []);


  // Load background image when selectedBackground changes to an image type
  useEffect(() => {
    if (selectedBackground.type === 'image' && selectedBackground.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Important if loading from different origins
      img.src = selectedBackground.url;
      img.onload = () => {
        backgroundImageRef.current = img;
        console.log('Background image loaded:', selectedBackground.url);
      };
      img.onerror = () => {
        console.error('Failed to load background image:', selectedBackground.url);
        setError(`Failed to load background: ${selectedBackground.name}`);
        backgroundImageRef.current = null; // Clear if error
      };
    } else {
      backgroundImageRef.current = null; // Clear if not an image type
    }
  }, [selectedBackground]);


  // Access camera
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: 'user' },
          audio: false, // We only need video for processing here
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
          console.log('Camera ready.');
        };
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Failed to access camera. Please check permissions and ensure a camera is connected.');
        setIsCameraReady(false);
      }
    }
    setupCamera();

    return () => { // Cleanup: stop camera stream when component unmounts
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [width, height]);


  // Main processing loop
  const processFrame = useCallback(async () => {
    if (
      !model ||
      !videoRef.current ||
      !canvasRef.current ||
      !isCameraReady ||
      // Access HAVE_METADATA directly from the global HTMLMediaElement constructor
      videoRef.current.readyState < HTMLMediaElement.HAVE_METADATA 
    ) {
      animationFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        animationFrameId.current = requestAnimationFrame(processFrame);
        return;
    }

    // Get segmentation mask
    // Use the .segment() method for @mediapipe/selfie_segmentation
    const segmentationResults = await model.segment(video); // No second argument needed for default segmentation
    // Draw background
    ctx.clearRect(0, 0, width, height); // Clear canvas

    if (selectedBackground.type === 'image' && backgroundImageRef.current) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
    } else if (selectedBackground.type === 'blur') {
      ctx.filter = 'blur(8px)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.filter = 'none';
    } else {
       ctx.drawImage(video, 0, 0, width, height);
    }

    // segmentationResults is an array of Segmentation objects.
    // For selfie segmentation, it's usually one result.
    if (segmentationResults && segmentationResults.length > 0) {
        const personMask = segmentationResults[0].mask; // This is a tf.Tensor

        // Convert the tf.Tensor mask to an ImageData object
        // The toBinaryMask function expects the segmentation results array, not just the tensor.
        const foregroundThreshold = 0.6; // Confidence threshold
        const binaryMaskImageData = await bodySegmentation.toBinaryMask(
            segmentationResults, // Pass the full results array
            {r:0,g:0,b:0,a:0},   // Background color (transparent black)
            {r:0,g:0,b:0,a:255}, // Foreground color (opaque black for the mask)
            false,               // Don't draw body parts
            foregroundThreshold
        );

        // Draw the original video (foreground) using the mask
        ctx.globalCompositeOperation = 'destination-in';
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
            maskCtx.putImageData(binaryMaskImageData, 0, 0);
            ctx.drawImage(maskCanvas, 0, 0, width, height);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(video, 0, 0, width, height);
    }
    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [model, isCameraReady, width, height, selectedBackground]);


  useEffect(() => {
    if (model && isCameraReady) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [model, isCameraReady, processFrame]);


  // Provide the processed stream from the canvas
  useEffect(() => {
    if (canvasRef.current && onStreamReady && isCameraReady && model) {
      // Check if canvas has content (simple check, might need refinement)
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && ctx.getImageData(0,0,1,1).data[3] > 0) { // Check if at least one pixel is not transparent
          const stream = canvasRef.current.captureStream(30); // 30 FPS
          onStreamReady(stream);
          console.log("Processed stream ready from canvas.");
      } else if (selectedBackground.type === 'none' && videoRef.current?.srcObject) {
          // If no background effect and camera is ready, provide original stream
          onStreamReady(videoRef.current.srcObject as MediaStream);
          console.log("Original camera stream provided (no background effect).");
      }
    }
  }, [onStreamReady, isCameraReady, model, selectedBackground]); // Re-check when selectedBackground changes for 'none' case


  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded text-sm">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-100">
      <h3 className="text-lg font-semibold mb-2">Background Settings</h3>
      {(isLoadingModel || !isCameraReady) && (
        <p className="text-sm text-gray-600">
          {isLoadingModel ? 'Loading segmentation model...' : ''}
          {!isCameraReady && !error ? 'Waiting for camera...' : ''}
        </p>
      )}

      {/* Hidden video element for raw camera feed */}
      <video ref={videoRef} width={width} height={height} style={{ display: 'none' }} playsInline />

      {/* Canvas for displaying processed video */}
      <canvas ref={canvasRef} width={width} height={height} className="border rounded-md bg-black mx-auto block" />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Choose Background:</label>
        <div className="flex flex-wrap gap-2">
          {predefinedBackgrounds.map(bg => (
            <button
              key={bg.id}
              onClick={() => setSelectedBackground(bg)}
              className={`px-3 py-1.5 text-xs rounded-md border
                ${selectedBackground.id === bg.id ? 'bg-blue-500 text-white border-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              {bg.name}
            </button>
          ))}
          {/* Add <input type="file" onChange={handleCustomBackgroundUpload} /> here */}
        </div>
      </div>
    </div>
  );
};
