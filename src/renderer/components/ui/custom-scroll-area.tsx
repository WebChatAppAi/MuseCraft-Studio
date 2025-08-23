import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export interface CustomScrollAreaRef {
  scrollTo: (options: { left?: number; top?: number; behavior?: 'smooth' | 'auto' }) => void;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  getViewport: () => HTMLDivElement | null;
}

export const CustomScrollArea = forwardRef<CustomScrollAreaRef, CustomScrollAreaProps>(
  ({ children, className = '', orientation = 'both', onScroll }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const verticalThumbRef = useRef<HTMLDivElement>(null);
    const horizontalThumbRef = useRef<HTMLDivElement>(null);

    // Expose scroll methods via ref
    useImperativeHandle(ref, () => ({
      scrollTo: (options) => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo(options);
        }
      },
      get scrollLeft() {
        return scrollContainerRef.current?.scrollLeft || 0;
      },
      get scrollTop() {
        return scrollContainerRef.current?.scrollTop || 0;
      },
      get scrollWidth() {
        return scrollContainerRef.current?.scrollWidth || 0;
      },
      get scrollHeight() {
        return scrollContainerRef.current?.scrollHeight || 0;
      },
      get clientWidth() {
        return scrollContainerRef.current?.clientWidth || 0;
      },
      get clientHeight() {
        return scrollContainerRef.current?.clientHeight || 0;
      },
      getViewport: () => scrollContainerRef.current,
    }), []);

    // Update scrollbar thumbs
    const updateScrollbars = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container;

      // Update vertical scrollbar
      if (verticalThumbRef.current && (orientation === 'vertical' || orientation === 'both')) {
        const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
        const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * (clientHeight - thumbHeight);
        
        verticalThumbRef.current.style.height = `${thumbHeight}px`;
        verticalThumbRef.current.style.transform = `translateY(${thumbTop}px)`;
        verticalThumbRef.current.style.opacity = scrollHeight > clientHeight ? '1' : '0';
      }

      // Update horizontal scrollbar
      if (horizontalThumbRef.current && (orientation === 'horizontal' || orientation === 'both')) {
        const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 20);
        const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * (clientWidth - thumbWidth);
        
        horizontalThumbRef.current.style.width = `${thumbWidth}px`;
        horizontalThumbRef.current.style.transform = `translateX(${thumbLeft}px)`;
        horizontalThumbRef.current.style.opacity = scrollWidth > clientWidth ? '1' : '0';
      }
    };

    // Handle scroll events
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      updateScrollbars();
      onScroll?.(e);
    };

    // Setup scroll event listeners and initial state
    useEffect(() => {
      updateScrollbars();
      
      // Update scrollbars on window resize
      const handleResize = () => updateScrollbars();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }, [orientation]);

    // Update scrollbars when content changes
    useEffect(() => {
      const observer = new ResizeObserver(updateScrollbars);
      if (contentRef.current) {
        observer.observe(contentRef.current);
      }
      return () => observer.disconnect();
    }, [children]);

    // Handle scrollbar track clicks
    const handleScrollbarClick = (e: React.MouseEvent, direction: 'vertical' | 'horizontal') => {
      e.preventDefault();
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = e.currentTarget.getBoundingClientRect();
      
      if (direction === 'vertical') {
        const clickY = e.clientY - rect.top;
        const scrollRatio = clickY / rect.height;
        const scrollTop = scrollRatio * (container.scrollHeight - container.clientHeight);
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      } else {
        const clickX = e.clientX - rect.left;
        const scrollRatio = clickX / rect.width;
        const scrollLeft = scrollRatio * (container.scrollWidth - container.clientWidth);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    };

    // Handle thumb dragging
    const handleThumbDrag = (e: React.MouseEvent, direction: 'vertical' | 'horizontal') => {
      e.preventDefault();
      e.stopPropagation();
      
      const container = scrollContainerRef.current;
      if (!container) return;

      const startPos = direction === 'vertical' ? e.clientY : e.clientX;
      const startScroll = direction === 'vertical' ? container.scrollTop : container.scrollLeft;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentPos = direction === 'vertical' ? moveEvent.clientY : moveEvent.clientX;
        const delta = currentPos - startPos;
        
        if (direction === 'vertical') {
          const scrollRatio = delta / container.clientHeight;
          const scrollDelta = scrollRatio * (container.scrollHeight - container.clientHeight);
          container.scrollTop = startScroll + scrollDelta;
        } else {
          const scrollRatio = delta / container.clientWidth;
          const scrollDelta = scrollRatio * (container.scrollWidth - container.clientWidth);
          container.scrollLeft = startScroll + scrollDelta;
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'vertical' ? 'ns-resize' : 'ew-resize';
    };

    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Main scroll container */}
        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-auto scrollbar-hide"
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          <div ref={contentRef}>
            {children}
          </div>
        </div>

        {/* Custom vertical scrollbar */}
        {(orientation === 'vertical' || orientation === 'both') && (
          <div 
            className="absolute right-0 top-0 w-2 h-full bg-transparent hover:bg-muted/20 transition-colors duration-200 group"
            onMouseDown={(e) => handleScrollbarClick(e, 'vertical')}
          >
            <div
              ref={verticalThumbRef}
              className="absolute right-0 w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60 group-hover:bg-muted-foreground/80 rounded-full transition-all duration-200 cursor-pointer opacity-0"
              style={{ minHeight: '20px' }}
              onMouseDown={(e) => handleThumbDrag(e, 'vertical')}
            />
          </div>
        )}

        {/* Custom horizontal scrollbar */}
        {(orientation === 'horizontal' || orientation === 'both') && (
          <div 
            className="absolute bottom-0 left-0 w-full h-2 bg-transparent hover:bg-muted/20 transition-colors duration-200 group"
            onMouseDown={(e) => handleScrollbarClick(e, 'horizontal')}
          >
            <div
              ref={horizontalThumbRef}
              className="absolute bottom-0 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60 group-hover:bg-muted-foreground/80 rounded-full transition-all duration-200 cursor-pointer opacity-0"
              style={{ minWidth: '20px' }}
              onMouseDown={(e) => handleThumbDrag(e, 'horizontal')}
            />
          </div>
        )}

        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  }
);

CustomScrollArea.displayName = 'CustomScrollArea';
