import React from 'react';
import { Minus, Square, X, Sparkles } from 'lucide-react';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title = "MUSECRAFT" }: TitleBarProps) {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  return (
    <div 
      className="flex items-center justify-between h-10 bg-zinc-950 border-b border-zinc-800 select-none relative" 
      style={{ 
        WebkitAppRegion: 'drag',
        backgroundColor: '#09090b',
        height: '40px',
        minHeight: '40px',
        maxHeight: '40px'
      } as React.CSSProperties}
    >
      {/* Left side - Logo */}
      <div 
        className="flex items-center px-4 bg-zinc-950 h-full" 
        style={{ 
          backgroundColor: '#09090b',
          WebkitAppRegion: 'drag'
        } as React.CSSProperties}
      >
        <div className="p-1 bg-gradient-to-r from-cyan-500/20 to-lime-500/20 rounded border border-cyan-500/30">
          <Sparkles className="h-4 w-4 text-cyan-400" />
        </div>
      </div>

      {/* Center - Title (Absolutely positioned for perfect centering) */}
      <div 
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ 
          WebkitAppRegion: 'drag'
        } as React.CSSProperties}
      >
        <h1 className="text-sm font-semibold text-white tracking-wide whitespace-nowrap">
          {title}
        </h1>
      </div>

      {/* Right side - Window Controls */}
      <div 
        className="flex items-center bg-zinc-950 h-full" 
        style={{ 
          WebkitAppRegion: 'no-drag',
          backgroundColor: '#09090b',
          height: '40px',
          minHeight: '40px'
        } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="group w-12 h-full flex items-center justify-center transition-all duration-200 ease-in-out hover:bg-zinc-700 active:bg-zinc-800 border-0 outline-none focus:outline-none"
          style={{
            WebkitAppRegion: 'no-drag',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            height: '40px',
            width: '48px',
            pointerEvents: 'auto',
            zIndex: 1000
          } as React.CSSProperties}
          title="Minimize"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <Minus className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors duration-200 pointer-events-none" />
        </button>
        <button
          onClick={handleMaximize}
          className="group w-12 h-full flex items-center justify-center transition-all duration-200 ease-in-out hover:bg-zinc-700 active:bg-zinc-800 border-0 outline-none focus:outline-none"
          style={{
            WebkitAppRegion: 'no-drag',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            height: '40px',
            width: '48px',
            pointerEvents: 'auto',
            zIndex: 1000
          } as React.CSSProperties}
          title="Maximize"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <Square className="h-3 w-3 text-gray-400 group-hover:text-white transition-colors duration-200 pointer-events-none" />
        </button>
        <button
          onClick={handleClose}
          className="group w-12 h-full flex items-center justify-center transition-all duration-200 ease-in-out hover:bg-red-600 active:bg-red-700 border-0 outline-none focus:outline-none"
          style={{
            WebkitAppRegion: 'no-drag',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            height: '40px',
            width: '48px',
            pointerEvents: 'auto',
            zIndex: 1000
          } as React.CSSProperties}
          title="Close"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <X className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors duration-200 pointer-events-none" />
        </button>
      </div>
    </div>
  );
}