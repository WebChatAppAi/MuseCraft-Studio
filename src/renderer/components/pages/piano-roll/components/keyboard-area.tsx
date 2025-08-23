import React from 'react';

export interface PianoKey {
  midi: number;
  name: string;
  octave: number;
  isBlack: boolean;
  displayName: string;
}

// Generate piano keys from C0 to C8 (108 keys total)
export const generatePianoKeys = (): PianoKey[] => {
  const keys: PianoKey[] = [];
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  for (let octave = 8; octave >= 0; octave--) { // Reverse order for display (high to low)
    for (let note = 11; note >= 0; note--) { // Reverse note order within octave
      const midi = octave * 12 + note;
      if (midi <= 127) { // MIDI limit
        const noteName = noteNames[note];
        const isBlack = noteName.includes('#');
        keys.push({
          midi,
          name: noteName,
          octave,
          isBlack,
          displayName: `${noteName}${octave}`
        });
      }
    }
  }
  
  return keys;
};

interface KeyboardAreaProps {
  keys: PianoKey[];
  keyHeight: number;
  onKeyPress?: (midi: number) => void;
  className?: string;
}

export function KeyboardArea({ keys, keyHeight, onKeyPress, className = '' }: KeyboardAreaProps) {
  return (
    <div className={`flex-shrink-0 w-20 bg-card border-r border-border relative ${className}`}>
      {keys.map((key, index) => (
        <div
          key={key.midi}
          className={`
            absolute left-0 right-0 border-b border-border/30 flex items-center justify-end pr-1 text-xs font-mono cursor-pointer
            transition-colors duration-75 select-none
            ${key.isBlack 
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600' 
              : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 active:bg-zinc-300'
            }
          `}
          style={{
            top: index * keyHeight,
            height: keyHeight,
            zIndex: key.isBlack ? 2 : 1
          }}
          onClick={() => onKeyPress?.(key.midi)}
          title={`${key.displayName} (MIDI ${key.midi})`}
        >
          <span className="text-[10px] font-bold">
            {key.displayName}
          </span>
        </div>
      ))}
    </div>
  );
}
