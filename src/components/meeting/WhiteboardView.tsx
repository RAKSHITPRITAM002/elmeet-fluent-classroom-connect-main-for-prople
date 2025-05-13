import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, Download, Trash2, 
  Image, Grid3X3, Maximize2, Minimize2
} from "lucide-react";
import FloatingAnnotationToolbar from "@/components/FloatingAnnotationToolbar";

interface WhiteboardViewProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onSaveWhiteboard: (dataUrl: string) => void;
  onClearWhiteboard: () => void;
}

const WhiteboardView: React.FC<WhiteboardViewProps> = ({
  isFullScreen,
  onToggleFullScreen,
  onSaveWhiteboard,
  onClearWhiteboard,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [background, setBackground] = useState<'plain' | 'grid' | 'lines'>('plain');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Redraw background
      drawBackground();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    drawBackground();
  }, [background]);

  const drawBackground = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background pattern
    if (background === 'grid') {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // Draw grid
      const gridSize = 20;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    } else if (background === 'lines') {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // Draw lines
      const lineHeight = 30;
      for (let y = lineHeight; y <= canvas.height; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else {
      // Add a new page
      setTotalPages(totalPages + 1);
      setCurrentPage(totalPages + 1);
    }
  };

  const handleSaveWhiteboard = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSaveWhiteboard(dataUrl);
    }
  };

  const handleClearWhiteboard = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawBackground();
        onClearWhiteboard();
      }
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Explicitly use window.Image to refer to the DOM's Image constructor
        const img = new window.Image(); 
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return; // Add a guard for canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) return; // Add a guard for context

          // Your image drawing logic here, e.g.:
          // ctx.drawImage(img, 0, 0, img.width, img.height); 
          // Or scale it to fit canvas:
          // const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          // const x = (canvas.width / 2) - (img.width / 2) * scale;
          // const y = (canvas.height / 2) - (img.height / 2) * scale;
          // ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
        img.onerror = () => {
          console.error("Error loading image onto canvas.");
          // Handle image load error
        };
        if (event.target?.result && typeof event.target.result === 'string') {
          img.src = event.target.result;
        } else {
          console.error("FileReader did not return a valid string result for image source.");
        }
      };
      reader.onerror = () => {
        console.error("Error reading file with FileReader.");
        // Handle FileReader error
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullScreenToggle = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    onToggleFullScreen();
  };

  const handleBackgroundChange = (type: 'plain' | 'grid' | 'lines') => {
    setBackground(type);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-white"
    >
      <div className="absolute top-2 left-2 z-10 bg-white border rounded-lg shadow-md p-1 flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute top-2 right-2 z-10 bg-white border rounded-lg shadow-md p-1 flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleBackgroundChange('plain')}
          className={background === 'plain' ? 'bg-gray-100' : ''}
        >
          <div className="h-4 w-4 border rounded" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleBackgroundChange('grid')}
          className={background === 'grid' ? 'bg-gray-100' : ''}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleBackgroundChange('lines')}
          className={background === 'lines' ? 'bg-gray-100' : ''}
        >
          <div className="h-4 w-4 border rounded flex flex-col justify-around">
            <div className="h-px bg-current" />
            <div className="h-px bg-current" />
            <div className="h-px bg-current" />
          </div>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveWhiteboard}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearWhiteboard}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFullScreenToggle}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      <div className="absolute bottom-4 right-4 z-10">
        <FloatingAnnotationToolbar />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default WhiteboardView;