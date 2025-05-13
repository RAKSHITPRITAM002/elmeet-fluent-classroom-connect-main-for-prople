
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { MousePointer, PenLine, Highlighter, Square, Circle, Type, Eraser, ChevronLeft, ChevronRight, Move } from 'lucide-react';

interface AnnotationToolbarProps {
  position?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

const AnnotationToolbar = ({ position = { x: 50, y: 100 }, onPositionChange }: AnnotationToolbarProps) => {
  const [tool, setTool] = useState<'select' | 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'text' | 'eraser'>('select');
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff'
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
  
  React.useEffect(() => {
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

  return (
    <div 
      className={`fixed shadow-lg rounded-lg bg-white z-50 p-2`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        width: collapsed ? 'auto' : '280px',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div 
        className="flex items-center justify-between mb-2 cursor-grab"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center">
          <Move className="h-4 w-4 mr-1 text-gray-500" />
          <span className="text-sm font-medium">Annotation Tools</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            <ToolButton 
              tool="select" 
              currentTool={tool} 
              onClick={() => setTool('select')} 
              icon={<MousePointer className="h-4 w-4" />} 
              tooltip="Select" 
            />
            <ToolButton 
              tool="pen" 
              currentTool={tool} 
              onClick={() => setTool('pen')} 
              icon={<PenLine className="h-4 w-4" />} 
              tooltip="Pen" 
            />
            <ToolButton 
              tool="highlighter" 
              currentTool={tool} 
              onClick={() => setTool('highlighter')} 
              icon={<Highlighter className="h-4 w-4" />} 
              tooltip="Highlighter" 
            />
            <ToolButton 
              tool="rectangle" 
              currentTool={tool} 
              onClick={() => setTool('rectangle')} 
              icon={<Square className="h-4 w-4" />} 
              tooltip="Rectangle" 
            />
            <ToolButton 
              tool="circle" 
              currentTool={tool} 
              onClick={() => setTool('circle')} 
              icon={<Circle className="h-4 w-4" />} 
              tooltip="Circle" 
            />
            <ToolButton 
              tool="text" 
              currentTool={tool} 
              onClick={() => setTool('text')} 
              icon={<Type className="h-4 w-4" />} 
              tooltip="Text" 
            />
            <ToolButton 
              tool="eraser" 
              currentTool={tool} 
              onClick={() => setTool('eraser')} 
              icon={<Eraser className="h-4 w-4" />} 
              tooltip="Eraser" 
            />
          </div>
          
          <div>
            <p className="text-xs mb-1">Color</p>
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
            <Button variant="outline" size="sm">
              Clear All
            </Button>
            <Button variant="outline" size="sm">
              Save
            </Button>
          </div>
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
  tooltip 
}: { 
  tool: string; 
  currentTool: string; 
  onClick: () => void; 
  icon: React.ReactNode; 
  tooltip: string;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toggle
          pressed={tool === currentTool}
          onClick={onClick}
          className="h-8 w-8"
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
  onClick 
}: { 
  color: string; 
  selected: boolean; 
  onClick: () => void;
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`h-6 w-6 p-0 rounded-full ${selected ? 'ring-2 ring-offset-1 ring-black' : ''}`}
      style={{ backgroundColor: color }}
    />
  );
};

export default AnnotationToolbar;
