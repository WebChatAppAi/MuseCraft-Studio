import React from 'react';
import { Card } from '../../ui/card';
import { BorderBeam } from '../../magicui/border-beam';
import { cn } from 'renderer/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showBorder?: boolean;
  borderColor?: 'cyan' | 'lime' | 'blue' | 'purple' | 'green' | 'red';
  borderDuration?: number;
  borderDelay?: number;
  children: React.ReactNode;
}

const borderColorMap = {
  cyan: 'from-transparent via-cyan-400 to-transparent',
  lime: 'from-transparent via-lime-400 to-transparent',
  blue: 'from-transparent via-blue-400 to-transparent',
  purple: 'from-transparent via-purple-400 to-transparent',
  green: 'from-transparent via-green-400 to-transparent',
  red: 'from-transparent via-red-400 to-transparent',
};

export function AnimatedCard({
  showBorder = false,
  borderColor = 'cyan',
  borderDuration = 4,
  borderDelay = 0,
  className,
  children,
  ...props
}: AnimatedCardProps) {
  return (
    <Card 
      className={cn('relative overflow-hidden', className)} 
      {...props}
    >
      {children}
      {showBorder && (
        <BorderBeam
          size={300}
          duration={borderDuration}
          delay={borderDelay}
          className={borderColorMap[borderColor]}
        />
      )}
    </Card>
  );
}