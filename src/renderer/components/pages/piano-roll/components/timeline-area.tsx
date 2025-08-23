import React from 'react';

interface TimelineAreaProps {
  beatWidth: number;
  measures?: number;
  onHorizontalScroll?: (deltaX: number) => void;
  horizontalZoom: number;
}

export function TimelineArea({ beatWidth, measures = 16, onHorizontalScroll, horizontalZoom }: TimelineAreaProps) {
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const zoomedBeatWidth = beatWidth * horizontalZoom;

  // Use useEffect to add non-passive wheel listener
  React.useEffect(() => {
    const element = timelineRef.current;
    if (!element || !onHorizontalScroll) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Convert vertical wheel to horizontal scroll
      const deltaX = e.deltaY * 2; // Multiply for faster scroll
      onHorizontalScroll(deltaX);
    };

    // Add non-passive event listener
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [onHorizontalScroll]);

  return (
    <div 
      ref={timelineRef}
      className="h-8 bg-muted border-b border-border flex-shrink-0 relative overflow-hidden cursor-ew-resize"
    >
      {/* Measures */}
      <div className="flex items-center h-full text-xs text-muted-foreground">
        {Array.from({ length: measures }, (_, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-2 border-r border-border/30 flex items-center justify-center"
            style={{ width: zoomedBeatWidth * 4 }} // 4 beats per measure
          >
            <span className="font-mono">{i + 1}</span>
          </div>
        ))}
      </div>
      
      {/* Beat subdivisions */}
      <div className="absolute top-4 left-0 right-0 h-4 border-t border-border/20">
        <div className="flex h-full text-[10px] text-muted-foreground/60">
          {Array.from({ length: measures * 4 }, (_, i) => (
            <div
              key={i}
              className="flex-shrink-0 border-r border-border/10 flex items-center justify-center"
              style={{ width: zoomedBeatWidth }}
            >
              <span className="font-mono">{(i % 4) + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
