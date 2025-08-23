import { useRef, useEffect } from 'react';

interface UnifiedPlayerHeadProps {
  position: number; // Position in beats - authoritative from unified engine
  beatWidth: number;
  height: number;
  isVisible: boolean;
  isPlaying: boolean;
}

/**
 * Unified Player Head - Synchronized with position-driven playback engine
 * 
 * This component simply reflects the authoritative position from the unified engine.
 * No complex timing calculations or animation loops - just direct position rendering.
 */
export function UnifiedPlayerHead({ 
  position, 
  beatWidth, 
  height, 
  isVisible, 
  isPlaying 
}: UnifiedPlayerHeadProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Direct position update when props change
  useEffect(() => {
    if (!isVisible || !lineRef.current || !indicatorRef.current) return;

    const leftPosition = position * beatWidth;

    // Debug: Log position updates in component
    console.log(`🎨 PlayerHead render: position=${position.toFixed(3)}, leftPosition=${leftPosition}px, beatWidth=${beatWidth}`);

    // Update line position with hardware acceleration
    lineRef.current.style.transform = `translate3d(${leftPosition}px, 0, 0)`;

    // Update position indicator
    indicatorRef.current.style.transform = `translate3d(${leftPosition - 25}px, 0, 0)`;
    
    // Update bar:beat display
    const bars = Math.floor(position / 4) + 1;
    const beats = ((position % 4) + 1).toFixed(2);
    indicatorRef.current.textContent = `${bars}:${beats.padStart(5, '0')}`;
  }, [position, beatWidth, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-50 w-full h-full">
      {/* Player head line */}
      <div
        ref={lineRef}
        className="absolute top-0"
        style={{
          width: '2px',
          height: `${height}px`,
          willChange: 'transform',
          backfaceVisibility: 'hidden', // GPU optimization
        }}
      >
        {/* The actual line with dynamic colors */}
        <div
          className={`w-full h-full transition-colors duration-150 ${
            isPlaying 
              ? 'bg-red-500 shadow-lg shadow-red-500/50' 
              : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
          }`}
        />
        
        {/* Triangle at top */}
        <div
          className="absolute -top-2 -left-1.5 transition-colors duration-150"
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: isPlaying ? '8px solid #ef4444' : '8px solid #eab308',
          }}
        />
        
        {/* Glow effect when playing */}
        {isPlaying && (
          <div
            className="absolute top-0 -left-1 w-1 bg-red-500/30 blur-sm"
            style={{ 
              height: `${height}px`,
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
      </div>

      {/* Position indicator */}
      <div
        ref={indicatorRef}
        className={`absolute -top-6 px-2 py-1 rounded text-xs font-mono transition-colors duration-150 ${
          isPlaying 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-500 text-black'
        }`}
        style={{ 
          width: '50px',
          textAlign: 'center',
          willChange: 'transform',
          backfaceVisibility: 'hidden', // GPU optimization
        }}
      >
        {Math.floor(position / 4) + 1}:{((position % 4) + 1).toFixed(2).padStart(5, '0')}
      </div>
    </div>
  );
}
