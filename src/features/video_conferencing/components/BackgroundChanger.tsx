import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

interface BackgroundChangerProps {
  onStreamReady?: (stream: MediaStream) => void;
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

const predefinedBackgrounds = [
  { id: 'blur', name: 'Blur Background', type: 'blur' as const },
  {
    id: 'office',
    name: 'Office',
    type: 'image' as const,
    url: 'https://via.placeholder.com/640x480/CCCCCC/808080?Text=Office+Background',
  },
  {
    id: 'beach',
    name: 'Beach',
    type: 'image' as const,
    url: 'https://via.placeholder.com/640x480/007bff/FFFFFF?Text=Beach+Background',
  },
  { id: 'none', name: 'No Background', type: 'none' as const },
];

type BackgroundOption = (typeof predefinedBackgrounds)[0];

export const BackgroundChanger: React.FC<BackgroundChangerProps> = ({
  onStreamReady,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [segmenter, setSegmenter] = useState<bodySegmentation.BodySegmenter | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(predefinedBackgrounds[0]);

  // Load segmentation model
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.setBackend('webgl');
        await tf.ready();

        const segmenter = await bodySegmentation.createSegmenter(
          bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
          {
            runtime: 'tfjs',
            modelType: 'general',
          }
        );

        setSegmenter(segmenter);
        console.log('Segmentation model loaded.');
      } catch (err) {
        console.error(err);
        setError('Failed to load segmentation model.');
      } finally {
        setIsLoadingModel(false);
      }
    }

    loadModel();
  }, []);

  // Load background image if selected
  useEffect(() => {
    if (selectedBackground.type === 'image' && selectedBackground.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedBackground.url;
      img.onload = () => {
        backgroundImageRef.current = img;
      };
      img.onerror = () => {
        setError(`Failed to load background: ${selectedBackground.name}`);
      };
    } else {
      backgroundImageRef.current = null;
    }
  }, [selectedBackground]);

  // Camera access
  useEffect(() => {
    async function setupCamera() {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: 'user' },
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      } catch (err) {
        console.error(err);
        setError('Camera access denied or not available.');
      }
    }

    setupCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [width, height]);

  // Frame processor
  const processFrame = useCallback(async () => {
    if (
      !segmenter ||
      !videoRef.current ||
      !canvasRef.current ||
      !isCameraReady ||
      videoRef.current.readyState < HTMLMediaElement.HAVE_METADATA
    ) {
      animationFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    const video = videoRef.current;

    if (!ctx) return;

    const segmentation = await segmenter.segmentPeople(video);
    ctx.clearRect(0, 0, width, height);

    if (selectedBackground.type === 'image' && backgroundImageRef.current) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, width, height);
    } else if (selectedBackground.type === 'blur') {
      ctx.filter = 'blur(8px)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.filter = 'none';
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    if (segmentation.length > 0) {
      const mask = await bodySegmentation.toBinaryMask(
        segmentation,
        { r: 0, g: 0, b: 0, a: 0 },
        { r: 0, g: 0, b: 0, a: 255 },
        false,
        0.6
      );

      ctx.globalCompositeOperation = 'destination-in';
      ctx.putImageData(mask, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(video, 0, 0, width, height);
    }

    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [segmenter, selectedBackground, isCameraReady]);

  useEffect(() => {
    if (segmenter && isCameraReady) {
      animationFrameId.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [segmenter, isCameraReady, processFrame]);

  // Provide stream
  useEffect(() => {
    if (canvasRef.current && onStreamReady && isCameraReady && segmenter) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && ctx.getImageData(0, 0, 1, 1).data[3] > 0) {
        const stream = canvasRef.current.captureStream(30);
        onStreamReady(stream);
      } else if (selectedBackground.type === 'none' && videoRef.current?.srcObject) {
        onStreamReady(videoRef.current.srcObject as MediaStream);
      }
    }
  }, [onStreamReady, isCameraReady, segmenter, selectedBackground]);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded text-sm">{error}</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-100">
      <h3 className="text-lg font-semibold mb-2">Background Settings</h3>
      {(isLoadingModel || !isCameraReady) && (
        <p className="text-sm text-gray-600">
          {isLoadingModel ? 'Loading model...' : ''}
          {!isCameraReady && !error ? ' Waiting for camera...' : ''}
        </p>
      )}
      <video ref={videoRef} width={width} height={height} style={{ display: 'none' }} playsInline />
      <canvas ref={canvasRef} width={width} height={height} className="border rounded-md bg-black mx-auto block" />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Choose Background:</label>
        <div className="flex flex-wrap gap-2">
          {predefinedBackgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBackground(bg)}
              className={`px-3 py-1.5 text-xs rounded-md border ${
                selectedBackground.id === bg.id
                  ? 'bg-blue-500 text-white border-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
