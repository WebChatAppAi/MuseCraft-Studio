import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { Tool } from './toolbar-area';
import type { PianoKey } from './keyboard-area';
import { NoteEditingLogic } from '../logic/note-editing';

export interface MIDINote {
  id: string;
  midi: number;
  start: number; // In beats
  duration: number; // In beats
  velocity: number;
  selected: boolean;
}

interface GridAreaProps {
  width: number;
  height: number;
  keyHeight: number;
  beatWidth: number;
  keys: PianoKey[];
  currentTool: Tool;
  notes: MIDINote[];
  onNotesChange: (notes: MIDINote[]) => void;
  onNoteSelect: (noteId: string, multiSelect?: boolean) => void;
  horizontalZoom: number;
}

// Helper function to draw rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Hardware-accelerated Grid Component using Canvas
const GridCanvas: React.FC<{
  width: number;
  height: number;
  keyHeight: number;
  beatWidth: number;
  horizontalZoom: number;
  notes: MIDINote[];
  keys: PianoKey[];
}> = ({ width, height, keyHeight, beatWidth, horizontalZoom, notes, keys }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.fillStyle = '#111113'; // was 'oklch(0.1 0 0)' // background color
    ctx.fillRect(0, 0, width, height);
    
    // Draw zebra pattern for piano keys (alternate row colors)
    ctx.fillStyle = 'oklch(0.12 0 0)'; // slightly lighter for alternate rows
    for (let y = keyHeight; y < height; y += keyHeight * 2) {
      ctx.fillRect(0, y, width, keyHeight);
    }
    
    // Draw horizontal lines (for each piano key)
    ctx.strokeStyle = '#222222ff'; // was 'oklch(0.25 0 0)' // border color
    ctx.lineWidth = 0.5;
    for (let y = 0; y <= height; y += keyHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw vertical lines (for beats) - major and minor grid lines
    const baseLineWidth = 0.5;
    const dynamicLineWidth = Math.min(1.5, Math.max(0.4, baseLineWidth / horizontalZoom));

    for (let x = 0; x <= width; x += beatWidth) {
      // Major grid lines every 4 beats (measures)
      const isMajorLine = (x / beatWidth) % 4 === 0;
      ctx.strokeStyle = isMajorLine ? 'oklch(0.25 0 0)' : 'oklch(0.15 0 0)';
      ctx.lineWidth = isMajorLine ? dynamicLineWidth * 1.5 : dynamicLineWidth;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw subdivision lines (16th notes), but only if zoomed in enough
    if (horizontalZoom > 0.5) {
      ctx.strokeStyle = 'oklch(0.2 0 0)';
      ctx.lineWidth = dynamicLineWidth * 0.75;
      for (let x = beatWidth / 4; x < width; x += beatWidth / 4) {
        if ((x / (beatWidth / 4)) % 4 !== 0) { // Skip beat lines
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      }
    }

    // Draw notes
    notes.forEach(note => {
      const keyIndex = keys.findIndex(key => key.midi === note.midi);
      if (keyIndex === -1) return;

      const noteLeft = note.start * beatWidth;
      const noteWidth = note.duration * beatWidth;
      const noteTop = keyIndex * keyHeight;

      // Set color based on selection and velocity
      const velocityOpacity = 0.6 + (note.velocity / 127) * 0.4;
      const baseColor = '#b38855';
      const selectedColor = '#d9aa77';
      
      ctx.fillStyle = note.selected ? selectedColor : baseColor;
      ctx.globalAlpha = velocityOpacity;

      // Draw the note body with rounded corners
      roundRect(ctx, noteLeft, noteTop + 2, noteWidth - 2, keyHeight - 4, 3);
      ctx.fill();
      
      ctx.globalAlpha = 1.0; // Reset alpha

      // Draw note label if it fits
      const noteName = keys.find(key => key.midi === note.midi)?.displayName || '';
      if (noteName) {
        ctx.font = 'bold 10px sans-serif';
        const textMetrics = ctx.measureText(noteName);
        if (textMetrics.width < noteWidth - 8) {
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(noteName, noteLeft + noteWidth / 2, noteTop + keyHeight / 2);
        }
      }
    });
    
  }, [width, height, keyHeight, beatWidth, horizontalZoom, notes, keys]);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

// Selection Box Component
const SelectionBox: React.FC<{
  box: { startX: number; startY: number; endX: number; endY: number };
  isActive: boolean;
}> = ({ box, isActive }) => {
  if (!isActive) return null;

  const left = Math.min(box.startX, box.endX);
  const top = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  return (
    <div
      className="absolute border border-cyan-400 bg-cyan-400/10 pointer-events-none z-50"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
};

export function GridArea({
  width,
  height,
  keyHeight,
  beatWidth,
  keys,
  currentTool,
  notes,
  onNotesChange,
  onNoteSelect,
  horizontalZoom
}: GridAreaProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const zoomedBeatWidth = beatWidth * horizontalZoom;
  
  // Note editing logic instance
  const noteLogic = useMemo(() => new NoteEditingLogic(), []);
  
  // Grid configuration
  const gridConfig = useMemo(() => ({
    keyHeight,
    beatWidth: zoomedBeatWidth,
    snapToBeat: true,
    snapResolution: 0.25 // 16th notes
  }), [keyHeight, zoomedBeatWidth]);

  // Get current states from logic
  const [states, setStates] = useState(noteLogic.getStates());
  const [cursor, setCursor] = useState('default');

  // Get relative mouse position within grid
  const getRelativeMousePos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (currentTool !== 'select') return;
    
    const { x, y } = getRelativeMousePos(e);
    const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    
    const result = noteLogic.startMouseInteraction(
      x, y, e.button, notes, keys, gridConfig, multiSelect
    );
    
    if (result.updatedNotes) {
      onNotesChange(result.updatedNotes);
    }
    
    setStates(noteLogic.getStates());
  }, [currentTool, getRelativeMousePos, noteLogic, notes, keys, gridConfig, onNotesChange]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getRelativeMousePos(e);
    
    // Update cursor based on hover state
    const newCursor = noteLogic.getCursorStyle(x, y, notes, keys, gridConfig);
    setCursor(newCursor);
    
    // Update active interaction
    const updatedNotes = noteLogic.updateMousePosition(x, y, notes, keys, gridConfig);
    if (updatedNotes) {
      onNotesChange(updatedNotes);
    }
    
    setStates(noteLogic.getStates());
  }, [getRelativeMousePos, noteLogic, notes, keys, gridConfig, onNotesChange]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    const updatedNotes = noteLogic.endMouseInteraction(notes, keys, gridConfig);
    if (updatedNotes) {
      onNotesChange(updatedNotes);
    }
    
    setStates(noteLogic.getStates());
  }, [noteLogic, notes, keys, gridConfig, onNotesChange]);

  // Global mouse events for dragging outside grid
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!states.drag.isDragging && !states.resize.isResizing) return;
      
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const updatedNotes = noteLogic.updateMousePosition(x, y, notes, keys, gridConfig);
      if (updatedNotes) {
        onNotesChange(updatedNotes);
      }
      
      setStates(noteLogic.getStates());
    };

    const handleGlobalMouseUp = () => {
      const updatedNotes = noteLogic.endMouseInteraction(notes, keys, gridConfig);
      if (updatedNotes) {
        onNotesChange(updatedNotes);
      }
      
      setStates(noteLogic.getStates());
    };

    if (states.drag.isDragging || states.resize.isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [states.drag.isDragging, states.resize.isResizing, noteLogic, notes, keys, gridConfig, onNotesChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNotes = notes.filter(note => !note.selected);
        onNotesChange(selectedNotes);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notes, onNotesChange]);

  return (
    <div 
      ref={gridRef}
      className="relative bg-background overflow-hidden"
      style={{ 
        width,
        height,
        cursor: currentTool === 'draw' ? 'crosshair' : cursor
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hardware-accelerated Grid */}
      <GridCanvas
        width={width}
        height={height}
        keyHeight={keyHeight}
        beatWidth={zoomedBeatWidth}
        horizontalZoom={horizontalZoom}
        notes={notes}
        keys={keys}
      />
      
      {/* Selection Box */}
      <SelectionBox
        box={states.selection.selectionBox}
        isActive={states.selection.selectionBox.isActive}
      />
    </div>
  );
}