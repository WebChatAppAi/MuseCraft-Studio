"use client";

import { useCallback, useEffect, useRef } from "react";

import { cn } from "../../lib/utils";

const morphTime = 1.5;
const cooldownTime = 0.5;

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      // Add null checks for texts array
      if (!texts || texts.length === 0) return;
      
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(
        8 / invertedFraction - 8,
        100,
      )}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length] || '';
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length] || '';
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  // Add null check for texts
  if (!texts || texts.length === 0) {
    return <span>Loading...</span>;
  }

  const { text1Ref, text2Ref } = useMorphingText(texts);
  
  // Color palette for cycling
  const colors = ['text-cyan-400', 'text-lime-400', 'text-purple-400', 'text-pink-400', 'text-blue-400'];
  
  return (
    <>
      <span
        className={`absolute inset-0 flex items-center justify-center w-full h-full ${colors[0]}`}
        ref={text1Ref}
      />
      <span
        className={`absolute inset-0 flex items-center justify-center w-full h-full ${colors[1]}`}
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
}) => {
  // Add null check for texts
  if (!texts || texts.length === 0) {
    return (
      <div className={cn("relative mx-auto h-16 w-full max-w-screen-lg text-center font-sans text-3xl font-bold leading-none sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl md:h-20 lg:h-24", className)}>
        <span className="flex items-center justify-center h-full">Loading...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto h-16 w-full max-w-screen-lg text-center font-sans text-3xl font-bold leading-none [filter:url(#threshold)_blur(0.6px)] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl md:h-20 lg:h-24",
        className,
      )}
    >
      <Texts texts={texts} />
      <SvgFilters />
    </div>
  );
}; 