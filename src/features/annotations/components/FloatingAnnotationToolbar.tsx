import React from 'react';
import { AnnotationTool } from '../types';

interface FloatingAnnotationToolbarProps {
  isOpen: boolean;
  currentTool: AnnotationTool;
  currentColor: string;
  currentLineWidth: number;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onLineWidthChange: (width: number) => void;
  onClearAll: () => void;
  onToggleAnnotations: () => void; // To show/hide annotations or the toolbar itself
}

const commonColors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#000000', '#FFFFFF'];
const lineWidths = [2, 5, 10, 15]; // Pen/Eraser widths
const highlighterWidths = [10, 15, 20]; // Highlighter typically wider

export const FloatingAnnotationToolbar: React.FC<FloatingAnnotationToolbarProps> = ({
  isOpen,
  currentTool,
  currentColor,
  currentLineWidth,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onClearAll,
  onToggleAnnotations,
}) => {
  if (!isOpen) {
    return null;
  }

  const activeToolStyle = "bg-blue-500 text-white";
  const inactiveToolStyle = "bg-gray-200 hover:bg-gray-300 text-gray-700";

  const widthsToShow = currentTool === 'highlighter' ? highlighterWidths : lineWidths;

  return (
    <div
      className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-2xl flex items-center space-x-2 z-[101]"
      // Prevent toolbar from capturing mouse events meant for canvas if mouse passes over it quickly
      style={{ pointerEvents: 'auto' }}
    >
      {/* Toggle Annotations Button (could be part of a main app bar too) */}
      <button
        onClick={onToggleAnnotations}
        title="Toggle Annotations"
        className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600"
      >
        {/* Icon for close/disable annotations */}
        ✏️ Off
      </button>

      {/* Tools */}
      <button
        onClick={() => onToolChange('pen')}
        title="Pen"
        className={`p-2 rounded-md ${currentTool === 'pen' ? activeToolStyle : inactiveToolStyle}`}
      >
        🖊️
      </button>
      <button
        onClick={() => onToolChange('highlighter')}
        title="Highlighter"
        className={`p-2 rounded-md ${currentTool === 'highlighter' ? activeToolStyle : inactiveToolStyle}`}
      >
        🖍️
      </button>
      <button
        onClick={() => onToolChange('eraser')}
        title="Eraser"
        className={`p-2 rounded-md ${currentTool === 'eraser' ? activeToolStyle : inactiveToolStyle}`}
      >
        🧼
      </button>
      {/* Add Text and Shapes tools later */}
      {/* <button onClick={() => onToolChange('text')} title="Text" className={`p-2 rounded-md ${currentTool === 'text' ? activeToolStyle : inactiveToolStyle}`}>T</button> */}

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Colors (only if not eraser) */}
      {currentTool !== 'eraser' && commonColors.map(color => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          title={`Color: ${color}`}
          className="w-6 h-6 rounded-full border-2"
          style={{ backgroundColor: color, borderColor: currentColor === color ? 'black' : 'transparent' }}
        />
      ))}
      {currentTool !== 'eraser' && (
        <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-7 h-7 p-0 border-none rounded-full cursor-pointer"
            title="Custom Color"
        />
      )}


      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Line Widths */}
      {widthsToShow.map(width => (
        <button
          key={width}
          onClick={() => onLineWidthChange(width)}
          title={`Line width: ${width}`}
          className={`p-1 rounded-full border-2 flex items-center justify-center
                      ${currentLineWidth === width ? 'border-blue-500 bg-blue-100' : 'border-transparent hover:bg-gray-200'}`}
        >
          <span
            className="block rounded-full"
            style={{
              width: `${width}px`,
              height: `${width}px`,
              minWidth: '5px', minHeight: '5px', // Ensure very small widths are clickable
              maxWidth: '20px', maxHeight: '20px', // Cap visual size for large widths
              backgroundColor: currentTool === 'eraser' ? 'gray' : currentColor,
            }}
          />
        </button>
      ))}

      {/* Separator */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Clear All */}
      <button
        onClick={onClearAll}
        title="Clear All Annotations"
        className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
      >
        🗑️ Clear
      </button>
    </div>
  );
};