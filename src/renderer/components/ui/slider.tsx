import * as React from "react";
import { cn } from "../../lib/utils";

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], onValueChange, max = 100, min = 0, step = 1, disabled, ...props }, ref) => {
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [parseFloat(event.target.value)];
      onValueChange?.(newValue);
    };

    const currentValue = value[0] || 0;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    // Use useEffect to add wheel listener with passive: false
    React.useEffect(() => {
      const sliderElement = sliderRef.current;
      if (!sliderElement) return;

      const handleWheel = (event: WheelEvent) => {
        if (disabled) return;
        
        // Only handle wheel events if the mouse is over the slider
        const rect = sliderElement.getBoundingClientRect();
        const isHovered = event.clientX >= rect.left && event.clientX <= rect.right &&
                         event.clientY >= rect.top && event.clientY <= rect.bottom;
        
        if (!isHovered) return;
        
        event.preventDefault();
        const currentValue = value[0] || 0;
        const delta = event.deltaY > 0 ? -step : step;
        const newValue = Math.max(min, Math.min(max, currentValue + delta));
        
        if (newValue !== currentValue) {
          onValueChange?.([newValue]);
        }
      };

      sliderElement.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        sliderElement.removeEventListener('wheel', handleWheel);
      };
    }, [disabled, value, min, max, step, onValueChange]);

    return (
      <div
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        ref={(node) => {
          sliderRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
          <div 
            className="absolute h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none"
        />
        <div 
          className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
