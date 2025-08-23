import React, { useState, useCallback, useRef } from 'react';
import type { MIDINote } from './grid-area';

interface VelocityAreaProps {
  width: number;
  height: number;
  visible: boolean;
  notes: MIDINote[];
  beatWidth: number;
  onVelocityChange?: (noteId: string, velocity: number) => void;
  horizontalZoom: number;
}

export function VelocityArea({ 
  width, 
  height, 
  visible,
  notes,
  beatWidth,
  onVelocityChange,
  horizontalZoom
}: VelocityAreaProps) {
  const zoomedBeatWidth = beatWidth * horizontalZoom;
  const [isDragging, setIsDragging] = useState(false);
  const [dragNoteId, setDragNoteId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const calculateVelocityFromY = useCallback((y: number, containerHeight: number) => {
    const velocity = Math.round((1 - y / containerHeight) * 127);
    return Math.max(1, Math.min(127, velocity));
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent, note: MIDINote) => {
    e.preventDefault();
    setIsDragging(true);
    setDragNoteId(note.id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const velocity = calculateVelocityFromY(y, height);
    onVelocityChange?.(note.id, velocity);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragNoteId || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const velocity = calculateVelocityFromY(y, height);
    onVelocityChange?.(dragNoteId, velocity);
  }, [isDragging, dragNoteId, height, calculateVelocityFromY, onVelocityChange]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNoteId(null);
  }, []);
  
  // Add global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Debug: Log velocity area dimensions
  React.useEffect(() => {
    console.log(`🎵 Velocity area: width=${width}px, beatWidth=${beatWidth}px, calculated beats=${Math.ceil(width / beatWidth)}`);
  }, [width, beatWidth]);
  
  // Render nothing if not visible
  if (!visible) return null;
  
  return (
    <div 
      className="relative"
      style={{ 
        height: height, 
        width: width,
        background: 'linear-gradient(to bottom, rgba(239, 68, 68, 0.1) 0%, rgba(234, 179, 8, 0.1) 50%, rgba(34, 197, 94, 0.1) 100%)',
        minWidth: width // Ensure minimum width
      }}
      ref={containerRef}
    >
      {/* Grid lines */}
      <div className="absolute inset-0">
        {/* Horizontal reference lines */}
        {[25, 50, 75, 100].map(percent => (
          <div
            key={percent}
            className="absolute left-0 right-0 border-t border-border/20"
            style={{ top: `${100 - percent}%` }}
          />
        ))}
        
        {/* Vertical beat lines - ensure full coverage */}
        {Array.from({ length: Math.ceil(width / zoomedBeatWidth) + 2 }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-border/10"
            style={{ left: i * zoomedBeatWidth }}
          />
        ))}
      </div>

      {/* Velocity scale indicators */}
      <div className="absolute right-2 inset-y-0 flex flex-col justify-between text-[10px] text-muted-foreground py-2">
        <span>127</span>
        <span>64</span>
        <span>1</span>
      </div>
      
      {/* Velocity lollipops for each note */}
      {notes.map(note => {
        const lollipopLeft = note.start * zoomedBeatWidth;
        const lollipopHeight = (note.velocity / 127) * height;
        const isDraggingThis = isDragging && dragNoteId === note.id;

        const color = note.selected ? '#d9aa77' : '#b38855';

        return (
          <div
            key={note.id}
            className="absolute bottom-0 group"
            style={{
              left: lollipopLeft,
              height: Math.max(lollipopHeight, 8),
              transform: `translateX(-50%)`, // Center the lollipop on the note start
            }}
            onMouseDown={(e) => handleMouseDown(e, note)}
            title={`Velocity: ${note.velocity} (Drag to adjust)`}
          >
            {/* Stem */}
            <div
              className="w-0.5 mx-auto transition-colors duration-100"
              style={{
                height: `calc(100% - 4px)`, // Leave space for the handle
                backgroundColor: color,
                opacity: isDraggingThis ? 1 : 0.8,
              }}
            />
            {/* Handle */}
            <div
              className={`
                absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border transition-all duration-100
                ${isDraggingThis ? 'scale-125 shadow-lg' : 'group-hover:scale-110'}
              `}
              style={{
                backgroundColor: color,
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
