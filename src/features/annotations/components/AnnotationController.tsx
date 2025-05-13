import React, { useState, useEffect, useCallback } from 'react';
import { AnnotationTool, AnnotationElement } from '../types';
import { AnnotationCanvas } from './AnnotationCanvas';
import { FloatingAnnotationToolbar } from './FloatingAnnotationToolbar';

interface AnnotationControllerProps {
  // If annotating a specific element, pass its dimensions or a ref to it.
  // For fullscreen, use window dimensions.
  targetElementId?: string; // Optional: ID of element to overlay
  isInitiallyActive?: boolean;
}

export const AnnotationController: React.FC<AnnotationControllerProps> = ({
  targetElementId,
  isInitiallyActive = false,
}) => {
  const [isAnnotationActive, setIsAnnotationActive] = useState(isInitiallyActive);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('pen');
  const [currentColor, setCurrentColor] = useState('#FF0000'); // Default red
  const [currentLineWidth, setCurrentLineWidth] = useState(5);
  const [annotations, setAnnotations] = useState<AnnotationElement[]>([]);

  const [canvasDimensions, setCanvasDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update canvas dimensions if targetElementId is provided and its size changes, or on window resize for fullscreen
  useEffect(() => {
    const updateDimensions = () => {
      if (targetElementId) {
        const target = document.getElementById(targetElementId);
        if (target) {
          setCanvasDimensions({ width: target.offsetWidth, height: target.offsetHeight });
        } else {
          // Fallback to window if target not found, or handle error
          setCanvasDimensions({ width: window.innerWidth, height: window.innerHeight });
        }
      } else {
        // Fullscreen
        setCanvasDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    updateDimensions(); // Initial set
    window.addEventListener('resize', updateDimensions);
    // If targetElementId, might need a ResizeObserver for more robust dimension tracking of that element
    return () => window.removeEventListener('resize', updateDimensions);
  }, [targetElementId]);

  const handleToggleAnnotations = () => {
    setIsAnnotationActive(prev => !prev);
    if (isAnnotationActive) { // If turning off
        setCurrentTool(null); // Deselect tool
    } else { // If turning on
        setCurrentTool('pen'); // Default to pen
    }
  };

  const handleAnnotationsChange = useCallback((updatedAnnotations: AnnotationElement[]) => {
    setAnnotations(updatedAnnotations);
    // Here you would typically save annotations to a backend or local storage
    console.log('Annotations updated:', updatedAnnotations);
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      if (handleAnnotationsChange) { // Also notify about the change (empty array)
        handleAnnotationsChange([]);
      }
    }
  };

  // This button would typically be part of your main application UI, not the toolbar itself
  // For demo, we'll put a toggle button here.
  const AppLevelAnnotationToggleButton = () => (
    <button
        onClick={handleToggleAnnotations}
        className="fixed top-5 right-5 z-[102] px-3 py-1.5 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600"
        title={isAnnotationActive ? "Disable Annotations" : "Enable Annotations"}
    >
        {isAnnotationActive ? 'Stop Annotating' : 'Start Annotating'}
    </button>
  );


  return (
    <>
      {/* This button is just for demo; integrate toggle into your app's UI */}
      <AppLevelAnnotationToggleButton />

      {isAnnotationActive && (
        <AnnotationCanvas
          isActive={isAnnotationActive}
          currentTool={currentTool}
          currentColor={currentColor}
          currentLineWidth={currentLineWidth}
          canvasWidth={canvasDimensions.width}
          canvasHeight={canvasDimensions.height}
          onAnnotationsChange={handleAnnotationsChange}
          initialAnnotations={annotations} // Pass current annotations to re-render if needed
        />
      )}
      <FloatingAnnotationToolbar
        isOpen={isAnnotationActive} // Toolbar is open when annotation is active
        currentTool={currentTool}
        currentColor={currentColor}
        currentLineWidth={currentLineWidth}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onLineWidthChange={setCurrentLineWidth}
        onClearAll={handleClearAll}
        onToggleAnnotations={handleToggleAnnotations} // Button on toolbar to quickly disable
      />
      {/* Example target element for annotation (if not fullscreen) */}
      {/* {targetElementId && <div id={targetElementId} style={{ width: '800px', height: '600px', border: '1px solid green', margin: 'auto', position: 'relative' }}> Target Area </div>} */}
    </>
  );
};