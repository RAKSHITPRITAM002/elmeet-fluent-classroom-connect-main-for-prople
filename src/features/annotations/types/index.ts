export type AnnotationTool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'shapes' | 'select' | null;
// 'text' and 'shapes' are more advanced, we'll start with pen, highlighter, eraser

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface AnnotationStroke {
  id: string; // Unique ID for the stroke
  tool: 'pen' | 'highlighter';
  color: string;
  lineWidth: number;
  points: AnnotationPoint[];
  // For highlighter, we might also need opacity or blend mode
  isErased?: boolean; // Soft delete for eraser functionality
}

export interface AnnotationText {
    id: string;
    tool: 'text';
    text: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
    fontFamily: string;
    isErased?: boolean;
}

// We'll focus on strokes (pen/highlighter) first.
// `Annotation` could be a union type of AnnotationStroke, AnnotationText, etc. in the future.
export type AnnotationElement = AnnotationStroke | AnnotationText; // Extend with other types like shapes

export interface AnnotationState {
  elements: AnnotationElement[];
  // Potentially undo/redo stacks
  // currentZoom?: number; // If annotations need to scale with zoom
}