import React from 'react';
import { Ripple } from '../../magicui/ripple';
import { cn } from 'renderer/lib/utils';

interface BackgroundEffectsProps {
  variant?: 'ripple' | 'gradient' | 'grid' | 'combined';
  className?: string;
  rippleSize?: number;
  rippleCircles?: number;
}

export function BackgroundEffects({
  variant = 'combined',
  className,
  rippleSize = 250,
  rippleCircles = 8,
}: BackgroundEffectsProps) {
  const renderRipple = () => (
    <Ripple mainCircleSize={rippleSize} numCircles={rippleCircles} />
  );

  const renderGradient = () => (
    <div className="absolute inset-0">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-950/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-950/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );

  const renderGrid = () => (
    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
  );

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {(variant === 'ripple' || variant === 'combined') && renderRipple()}
      {(variant === 'gradient' || variant === 'combined') && renderGradient()}
      {(variant === 'grid' || variant === 'combined') && renderGrid()}
    </div>
  );
}