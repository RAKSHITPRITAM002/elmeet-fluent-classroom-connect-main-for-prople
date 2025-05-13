import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { 
  MousePointer, PenLine, Highlighter, Square, Circle, 
  Type, Eraser, ChevronLeft, ChevronRight, Move, X,
  ArrowUp, Download, Trash2, Undo, Redo, Stamp, Star,
  Maximize2, Minimize2, Grip, Palette, LineChart
} from 'lucide-react';

interface FloatingAnnotationToolbarProps {
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onClear?: () => void;
  onSave?: () => void;
  isScreenSharing?: boolean;
  onClose?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const FloatingAnnotationToolbar = ({ 
  position = { x: 50, y: 100 }, 
  onPositionChange,
  onClear,
  onSave,
  isScreenSharing = false,
  onClose,
  onUndo,
  onRedo
}: FloatingAnnotationToolbarProps) => {
  const [tool, setTool] = useState<'select' | 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'arrow' | 'spotlight' | 'stamp'>('select');
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#16849b'); // Using the brand color
  const [penSize, setPenSize] = useState(2);
  const [isVertical, setIsVertical] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#16849b', '#ffa700', '#ff00ff', '#00ffff', '#ff8000'
  ];
  
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleDragMove = (e: MouseEvent) => {
    if (isDragging && onPositionChange) {
      onPositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleToolClick = (newTool: typeof tool) => {
    setTool(newTool);
  };
  
  const handleClear = () => {
    if (onClear) onClear();
  };
  
  const handleSave = () => {
    if (onSave) onSave();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleUndo = () => {
    if (onUndo) onUndo();
  };

  const handleRedo = () => {
    if (onRedo) onRedo();
  };

  const toggleOrientation = () => {
    setIsVertical(!isVertical);
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  // Keep toolbar in viewport
  useEffect(() => {
    const checkBoundaries = () => {
      if (!toolbarRef.current) return;
      
      const rect = toolbarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = position.x;
      let newY = position.y;
      
      // Check horizontal bounds
      if (rect.right > viewportWidth) {
        newX = viewportWidth - rect.width;
      } else if (rect.left < 0) {
        newX = 0;
      }
      
      // Check vertical bounds
      if (rect.bottom > viewportHeight) {
        newY = viewportHeight - rect.height;
      } else if (rect.top < 0) {
        newY = 0;
      }
      
      // Update position if needed
      if (newX !== position.x || newY !== position.y) {
        if (onPositionChange) {
          onPositionChange({ x: newX, y: newY });
        }
      }
    };
    
    checkBoundaries();
    window.addEventListener('resize', checkBoundaries);
    
    return () => {
      window.removeEventListener('resize', checkBoundaries);
    };
  }, [position, toolbarRef.current, isVertical]);

  return (
    <div 
      ref={toolbarRef}
      className={`fixed shadow-lg rounded-lg bg-white z-50 p-2 ${isScreenSharing ? 'animate-fade-in' : ''} transition-all duration-200`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        width: collapsed ? 'auto' : isVertical ? '60px' : '280px',
        height: isVertical && !collapsed ? '320px' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div 
        className="flex items-center justify-between mb-2 cursor-grab"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center">
          <Grip className="h-4 w-4 mr-1 text-gray-500" />
          {!isVertical && !collapsed && (
            <span className="text-sm font-medium">Annotation Tools</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={toggleOrientation}
            title={isVertical ? "Switch to horizontal" : "Switch to vertical"}
          >
            {isVertical ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleClose}
            title="Close annotation toolbar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!collapsed && (
        <div className={`${isVertical ? 'flex flex-col' : 'space-y-4'}`}>
          <div className={`${isVertical ? 'flex flex-col gap-1' : 'flex flex-wrap gap-1'}`}>
            <ToolButton 
              tool="select" 
              currentTool={tool} 
              onClick={() => handleToolClick('select')} 
              icon={<MousePointer className="h-4 w-4" />} 
              tooltip="Select" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="pen" 
              currentTool={tool} 
              onClick={() => handleToolClick('pen')} 
              icon={<PenLine className="h-4 w-4" />} 
              tooltip="Pen" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="highlighter" 
              currentTool={tool} 
              onClick={() => handleToolClick('highlighter')} 
              icon={<Highlighter className="h-4 w-4" />} 
              tooltip="Highlighter" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="rectangle" 
              currentTool={tool} 
              onClick={() => handleToolClick('rectangle')} 
              icon={<Square className="h-4 w-4" />} 
              tooltip="Rectangle" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="circle" 
              currentTool={tool} 
              onClick={() => handleToolClick('circle')} 
              icon={<Circle className="h-4 w-4" />} 
              tooltip="Circle" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="arrow" 
              currentTool={tool} 
              onClick={() => handleToolClick('arrow')} 
              icon={<ArrowUp className="h-4 w-4" />} 
              tooltip="Arrow" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="text" 
              currentTool={tool} 
              onClick={() => handleToolClick('text')} 
              icon={<Type className="h-4 w-4" />} 
              tooltip="Text" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="spotlight" 
              currentTool={tool} 
              onClick={() => handleToolClick('spotlight')} 
              icon={<Star className="h-4 w-4" />} 
              tooltip="Spotlight" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="stamp" 
              currentTool={tool} 
              onClick={() => handleToolClick('stamp')} 
              icon={<Stamp className="h-4 w-4" />} 
              tooltip="Stamp" 
              vertical={isVertical}
            />
            <ToolButton 
              tool="eraser" 
              currentTool={tool} 
              onClick={() => handleToolClick('eraser')} 
              icon={<Eraser className="h-4 w-4" />} 
              tooltip="Eraser" 
              vertical={isVertical}
            />
          </div>
          
          {!isVertical && (
            <>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs">Color</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </div>
                {showColorPicker && (
                  <div className="flex flex-wrap gap-1">
                    {colors.map((c) => (
                      <ColorButton 
                        key={c} 
                        color={c} 
                        selected={color === c} 
                        onClick={() => setColor(c)} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs">Size</p>
                  <span className="text-xs">{penSize}px</span>
                </div>
                <Slider
                  value={[penSize]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setPenSize(value[0])}
                />
              </div>
              
              <div className="flex justify-between pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUndo}
                  className="flex items-center gap-1 px-2"
                  title="Undo"
                >
                  <Undo className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRedo}
                  className="flex items-center gap-1 px-2"
                  title="Redo"
                >
                  <Redo className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2"
                  title="Clear all annotations"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSave}
                  className="flex items-center gap-1 px-2"
                  title="Save annotations"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
          
          {isVertical && (
            <div className="mt-auto flex flex-col gap-1">
              <ColorButton 
                color={color} 
                selected={true} 
                onClick={() => setShowColorPicker(!showColorPicker)} 
                large
              />
              
              {showColorPicker && (
                <div className="grid grid-cols-2 gap-1 my-1">
                  {colors.map((c) => (
                    <ColorButton 
                      key={c} 
                      color={c} 
                      selected={color === c} 
                      onClick={() => setColor(c)} 
                    />
                  ))}
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUndo}
                className="w-full flex items-center justify-center"
                title="Undo"
              >
                <Undo className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRedo}
                className="w-full flex items-center justify-center"
                title="Redo"
              >
                <Redo className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClear}
                className="w-full flex items-center justify-center"
                title="Clear all annotations"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                className="w-full flex items-center justify-center"
                title="Save annotations"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ToolButton = ({ 
  tool, 
  currentTool, 
  onClick, 
  icon, 
  tooltip,
  vertical = false
}: { 
  tool: string; 
  currentTool: string; 
  onClick: () => void; 
  icon: React.ReactNode; 
  tooltip: string;
  vertical?: boolean;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle
          pressed={tool === currentTool}
          onClick={onClick}
          className={`${vertical ? 'w-full' : 'h-8 w-8'} flex items-center justify-center`}
          variant="outline"
        >
          {icon}
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1">
        <p className="text-xs">{tooltip}</p>
      </PopoverContent>
    </Popover>
  );
};

const ColorButton = ({ 
  color, 
  selected, 
  onClick,
  large = false
}: { 
  color: string; 
  selected: boolean; 
  onClick: () => void;
  large?: boolean;
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`${large ? 'h-8 w-8' : 'h-6 w-6'} p-0 rounded-full ${selected ? 'ring-2 ring-offset-1 ring-black' : ''}`}
      style={{ backgroundColor: color }}
    />
  );
};

export default FloatingAnnotationToolbar;
