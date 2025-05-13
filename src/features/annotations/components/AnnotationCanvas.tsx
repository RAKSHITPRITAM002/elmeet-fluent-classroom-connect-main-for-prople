import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AnnotationTool, AnnotationPoint, AnnotationStroke, AnnotationElement } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AnnotationCanvasProps {
  isActive: boolean;
  currentTool: AnnotationTool;
  currentColor: string;
  currentLineWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  onAnnotationsChange?: (annotations: AnnotationElement[]) => void;
  initialAnnotations?: AnnotationElement[];
}

const HIGHLIGHTER_OPACITY = 0.4;
export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  isActive,
  currentTool,
  currentColor,
  currentLineWidth,
  canvasWidth,
  canvasHeight,
  onAnnotationsChange,
  initialAnnotations = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<AnnotationPoint[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationElement[]>(initialAnnotations);

  // Effect to update internal state if initialAnnotations prop changes
  useEffect(() => {
    setAnnotations(initialAnnotations);
  }, [initialAnnotations]);

  // Redraw canvas when annotations, tool, or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Redraw all non-erased annotations
    annotations.forEach(element => {
      if (element.isErased) return;

      if (element.tool === 'pen' || element.tool === 'highlighter') {
        const stroke = element as AnnotationStroke;
        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (stroke.tool === 'highlighter') {
            ctx.globalAlpha = HIGHLIGHTER_OPACITY;
            // For highlighter, a wider lineCap might be better, or even drawing rectangles along the path
            // ctx.lineCap = 'butt';
        } else {
            ctx.globalAlpha = 1.0;
        }

        stroke.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
      // Add drawing logic for other element types (text, shapes) here
    });
    ctx.globalAlpha = 1.0; // Reset globalAlpha

    // Draw the current path being drawn (if any)
    if (isDrawing && currentPath.length > 1 && (currentTool === 'pen' || currentTool === 'highlighter')) {
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (currentTool === 'highlighter') {
        ctx.globalAlpha = HIGHLIGHTER_OPACITY;
      } else {
        ctx.globalAlpha = 1.0;
      }
      currentPath.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

  }, [annotations, currentPath, isDrawing, currentColor, currentLineWidth, currentTool, canvasWidth, canvasHeight]);

  const getMousePosition = useCallback((event: React.MouseEvent | React.TouchEvent): AnnotationPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in event) {
        if (event.touches.length === 0) return null;
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);
  const eraseAtPoint = useCallback((point: AnnotationPoint) => {
    const eraserSize = currentLineWidth * 2; 
    let changed = false;
    const updatedAnnotations = annotations.map(element => {
      if (element.isErased || element.tool === 'text') return element;
      const stroke = element as AnnotationStroke; // Assuming only strokes for now
      for (const p of stroke.points) {
        const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
        if (distance < eraserSize) {
          changed = true;
          return { ...stroke, isErased: true };
        }
      }
      return stroke;
    });
    if (changed) {
      setAnnotations(updatedAnnotations);
      if (onAnnotationsChange) {
        onAnnotationsChange(updatedAnnotations);
      }
    }
  }, [annotations, currentLineWidth, onAnnotationsChange]);

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || !currentTool || currentTool === 'select') return;
    event.preventDefault();
    const pos = getMousePosition(event);
    if (!pos) return;

    if (currentTool === 'pen' || currentTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPath([pos]);
    } else if (currentTool === 'eraser') {
      setIsDrawing(true); // Set isDrawing for eraser as well
      eraseAtPoint(pos);
    }
  }, [isActive, currentTool, getMousePosition, eraseAtPoint]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isActive || (currentTool !== 'pen' && currentTool !== 'highlighter' && currentTool !== 'eraser')) {
      return;
    }
    event.preventDefault();
    const pos = getMousePosition(event);
    if (!pos) return;

    if (currentTool === 'pen' || currentTool === 'highlighter') {
      setCurrentPath(prevPath => [...prevPath, pos]);
    } else if (currentTool === 'eraser') { // This is now reachable
      eraseAtPoint(pos);
    }
  }, [isDrawing, isActive, currentTool, getMousePosition, eraseAtPoint]);

  const endDrawing = useCallback(() => {
    if (!isDrawing || !isActive) return;

    if ((currentTool === 'pen' || currentTool === 'highlighter') && currentPath.length > 1) {
      const newStroke: AnnotationStroke = {
        id: uuidv4(),
        tool: currentTool,
        color: currentColor,
        lineWidth: currentLineWidth,
        points: [...currentPath],
      };
      const newAnnotations = [...annotations, newStroke];
      setAnnotations(newAnnotations);
      if (onAnnotationsChange) {
        onAnnotationsChange(newAnnotations);
      }
    }
    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, isActive, currentTool, currentColor, currentLineWidth, currentPath, annotations, onAnnotationsChange]);

  // Prevent context menu on canvas when annotating
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    canvas.addEventListener('contextmenu', preventContextMenu);
    return () => canvas.removeEventListener('contextmenu', preventContextMenu);
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isActive ? 100 : -1, 
        cursor: isActive && currentTool ? (currentTool === 'eraser' ? 'crosshair' : (currentTool === 'pen' || currentTool === 'highlighter' ? 'crosshair' : 'default')) : 'default',
        touchAction: isActive ? 'none' : 'auto',
      }}
      className={isActive ? 'annotation-canvas-active' : 'annotation-canvas-inactive'}
    />
  );
};
