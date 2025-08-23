import React from 'react';
import { Button, ButtonProps } from '../../ui/button';
import { BorderBeam } from '../../magicui/border-beam';
import { cn } from 'renderer/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  showBorder?: boolean;
  borderColor?: 'cyan' | 'lime' | 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  borderDuration?: number;
  borderSize?: number;
  children: React.ReactNode;
}

const borderColorMap = {
  cyan: 'from-transparent via-cyan-400 to-transparent',
  lime: 'from-transparent via-lime-400 to-transparent',
  blue: 'from-transparent via-blue-400 to-transparent',
  purple: 'from-transparent via-purple-400 to-transparent',
  green: 'from-transparent via-green-400 to-transparent',
  red: 'from-transparent via-red-400 to-transparent',
  yellow: 'from-transparent via-yellow-400 to-transparent',
};

export function AnimatedButton({
  showBorder = false,
  borderColor = 'cyan',
  borderDuration = 4,
  borderSize = 40,
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  return (
    <Button 
      className={cn('relative overflow-hidden', className)} 
      {...props}
    >
      {children}
      {showBorder && (
        <BorderBeam
          size={borderSize}
          duration={borderDuration}
          className={borderColorMap[borderColor]}
        />
      )}
    </Button>
  );
}