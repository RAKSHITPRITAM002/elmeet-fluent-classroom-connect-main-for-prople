import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Camera, Image, Paintbrush, Video, VideoOff, Upload, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BackgroundOption {
  id: string;
  name: string;
  type: 'none' | 'blur' | 'color' | 'image';
  value: string;
  thumbnail?: string;
}

const BackgroundSelector: React.FC<{
  onBackgroundSelect?: (background: BackgroundOption) => void;
}> = ({ onBackgroundSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>({
    id: 'none',
    name: 'None',
    type: 'none',
    value: ''
  });
  const [blurAmount, setBlurAmount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([]);
  const { toast } = useToast();
  
  const backgroundOptions: BackgroundOption[] = [
    { id: 'none', name: 'None', type: 'none', value: '' },
    { id: 'slight-blur', name: 'Slight blur', type: 'blur', value: '5' },
    { id: 'blur', name: 'Blur', type: 'blur', value: '10' },
    { id: 'heavy-blur', name: 'Heavy blur', type: 'blur', value: '15' },
    { id: 'blue', name: 'Blue', type: 'color', value: '#16849b' },
    { id: 'orange', name: 'Orange', type: 'color', value: '#ffa700' },
    { 
      id: 'classroom', 
      name: 'Classroom', 
      type: 'image', 
      value: '/backgrounds/classroom.jpg',
      thumbnail: '/backgrounds/classroom-thumb.jpg'
    },
    { 
      id: 'office', 
      name: 'Office', 
      type: 'image', 
      value: '/backgrounds/office.jpg',
      thumbnail: '/backgrounds/office-thumb.jpg'
    },
    { 
      id: 'library', 
      name: 'Library', 
      type: 'image', 
      value: '/backgrounds/library.jpg',
      thumbnail: '/backgrounds/library-thumb.jpg'
    },
  ];

  const initCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        }, 
        audio: false 
      });
      
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleVideo = () => {
    if (videoEnabled) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    } else {
      initCamera();
    }
    setVideoEnabled(!videoEnabled);
  };

  useEffect(() => {
    initCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleBackgroundSelect = (background: BackgroundOption) => {
    setSelectedBackground(background);
    
    if (background.type === 'blur') {
      setBlurAmount(parseInt(background.value) || 10);
    }
    
    if (onBackgroundSelect) {
      onBackgroundSelect(background);
    }
  };

  const handleCustomBackgroundUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    
    // Create a new background option
    const newBackground: BackgroundOption = {
      id: `custom-${Date.now()}`,
      name: file.name.split('.')[0] || 'Custom background',
      type: 'image',
      value: imageUrl,
      thumbnail: imageUrl
    };
    
    // Add to custom backgrounds
    setCustomBackgrounds(prev => [...prev, newBackground]);
    
    // Select the new background
    setSelectedBackground(newBackground);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setIsProcessing(false);
    
    toast({
      title: "Background Added",
      description: "Your custom background has been added",
    });
  };

  // In a real implementation, this would use a segmentation model
  // to detect the person and apply background effects
  const applyBackgroundEffect = () => {
    // This is just a placeholder implementation
    // In a production app, you would use ML libraries like TensorFlow.js
    // with the BodyPix or Selfie Segmentation models
    
    if (!videoRef.current || !canvasRef.current || !videoEnabled) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply effects based on selection
    if (selectedBackground.type === 'blur') {
      // In a real implementation, you would only blur the background areas
      // This is just a visual placeholder
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.globalCompositeOperation = 'destination-over';
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';
    } else if (selectedBackground.type === 'color') {
      // Fill with solid color (would be behind person in real implementation)
      ctx.fillStyle = selectedBackground.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (selectedBackground.type === 'image') {
      // In real implementation, draw image behind person
      const img = new window.Image(); // Use window.Image()
        img.onload = () => {
        // Ensure canvas and ctx are still valid if this is async
        if (canvasRef.current && canvasRef.current.getContext('2d')) { // Assuming canvasRef
            const currentCanvas = canvasRef.current;
            const currentCtx = currentCanvas.getContext('2d');
            if (currentCtx) {
                // Your drawing logic, e.g.
                // currentCtx.drawImage(img, 0, 0, currentCanvas.width, currentCanvas.height);
      }
    }
  };
      img.onerror = () => {
        console.error("Failed to load background image:", selectedBackground.value);
};
      img.src = selectedBackground.value; // Assuming selectedBackground.value is the image URL
    }

    requestAnimationFrame(applyBackgroundEffect);
  };

  useEffect(() => {
    if (videoEnabled) {
      const animationId = requestAnimationFrame(applyBackgroundEffect);
      return () => cancelAnimationFrame(animationId);
    }
  }, [videoEnabled, selectedBackground, blurAmount]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Camera & Background</h3>
        <p className="text-sm text-gray-500 mb-4">
          Adjust your camera and select a virtual background before joining the meeting.
        </p>
      </div>
      
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-4">
        {videoEnabled ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full z-10 opacity-0"
            />
            <canvas
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full"
            />
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded">
              <VideoOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-white text-center text-sm">Camera is turned off</p>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 z-20">
          <Button
            variant="secondary"
            size="sm"
            className="bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={toggleVideo}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            <span className="ml-2">{videoEnabled ? 'Turn off' : 'Turn on'}</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Tabs defaultValue="backgrounds">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
            <TabsTrigger value="settings">Camera Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="backgrounds" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {/* None option */}
              <div 
                className={`aspect-video bg-gray-100 rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#16849b] ${selectedBackground.id === 'none' ? 'ring-2 ring-[#16849b]' : ''}`}
                onClick={() => handleBackgroundSelect(backgroundOptions[0])}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-500" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                  <p className="text-white text-xs text-center">None</p>
                </div>
              </div>
              
              {/* Blur options */}
              {backgroundOptions.filter(bg => bg.type === 'blur').map(bg => (
                <div 
                  key={bg.id}
                  className={`aspect-video bg-gray-200 rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#16849b] ${selectedBackground.id === bg.id ? 'ring-2 ring-[#16849b]' : ''}`}
                  onClick={() => handleBackgroundSelect(bg)}
                >
                  <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                    <Paintbrush className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                    <p className="text-white text-xs text-center">{bg.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Color options */}
              {backgroundOptions.filter(bg => bg.type === 'color').map(bg => (
                <div 
                  key={bg.id}
                  className={`aspect-video rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#16849b] ${selectedBackground.id === bg.id ? 'ring-2 ring-[#16849b]' : ''}`}
                  style={{ backgroundColor: bg.value }}
                  onClick={() => handleBackgroundSelect(bg)}
                >
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                    <p className="text-white text-xs text-center">{bg.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Image options */}
              {backgroundOptions.filter(bg => bg.type === 'image').map(bg => (
                <div 
                  key={bg.id}
                  className={`aspect-video bg-gray-200 rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#16849b] ${selectedBackground.id === bg.id ? 'ring-2 ring-[#16849b]' : ''}`}
                  onClick={() => handleBackgroundSelect(bg)}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg.thumbnail || bg.value})` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                    <p className="text-white text-xs text-center">{bg.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Custom backgrounds */}
              {customBackgrounds.map(bg => (
                <div 
                  key={bg.id}
                  className={`aspect-video bg-gray-200 rounded-md overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-[#16849b] ${selectedBackground.id === bg.id ? 'ring-2 ring-[#16849b]' : ''}`}
                  onClick={() => handleBackgroundSelect(bg)}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg.thumbnail || bg.value})` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                    <p className="text-white text-xs text-center truncate">{bg.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Upload custom background */}
              <div 
                className="aspect-video bg-gray-100 rounded-md overflow-hidden relative cursor-pointer hover:bg-gray-200 flex flex-col items-center justify-center"
                onClick={handleCustomBackgroundUpload}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {isProcessing ? (
                  <RefreshCw className="h-6 w-6 text-gray-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-500" />
                    <p className="text-gray-500 text-xs mt-1">Upload</p>
                  </>
                )}
              </div>
            </div>
            
            {selectedBackground.type === 'blur' && (
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="blurAmount">Blur Amount</Label>
                  <span className="text-sm text-gray-500">{blurAmount}px</span>
                </div>
                <Slider 
                  id="blurAmount"
                  min={1} 
                  max={20} 
                  step={1} 
                  value={[blurAmount]} 
                  onValueChange={(value) => setBlurAmount(value[0])}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div>
              <Label htmlFor="camera">Camera</Label>
              <select 
                id="camera" 
                className="w-full p-2 border rounded-md mt-1"
                disabled
              >
                <option>Default Camera</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Camera selection will be available when multiple cameras are detected
              </p>
            </div>
            
            <div>
              <Label htmlFor="microphone">Microphone</Label>
              <select 
                id="microphone" 
                className="w-full p-2 border rounded-md mt-1"
                disabled
              >
                <option>Default Microphone</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Microphone selection will be available when multiple audio inputs are detected
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full bg-[#16849b] hover:bg-[#0d7390] mt-4"
        >
          Join Meeting with Selected Background
        </Button>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-gray-500 text-center">
          Note: Background effects work best against a plain wall and with good lighting.
        </p>
      </div>
    </div>
  );
};

export default BackgroundSelector;
