import React, { useState } from 'react';
import { Music, ChevronDown } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../../../ui/dropdown-menu';

export type InstrumentType = 'piano' | 'synth' | 'amSynth' | 'fmSynth' | 'monoSynth' | 'duoSynth' | 'membraneSynth' | 'metalSynth' | 'pluckSynth';

export interface Instrument {
  id: InstrumentType;
  name: string;
  description: string;
}

export const AVAILABLE_INSTRUMENTS: Instrument[] = [
  { id: 'piano', name: 'Piano', description: 'FM Piano sound' },
  { id: 'synth', name: 'Synth', description: 'Classic poly synth' },
  { id: 'amSynth', name: 'AM Synth', description: 'Amplitude modulation' },
  { id: 'fmSynth', name: 'FM Synth', description: 'Frequency modulation' },
  { id: 'monoSynth', name: 'Mono Synth', description: 'Monophonic synth' },
  { id: 'duoSynth', name: 'Duo Synth', description: 'Two voice synth' },
  { id: 'pluckSynth', name: 'Pluck Synth', description: 'Karplus-Strong string' },
  { id: 'membraneSynth', name: 'Membrane', description: 'Drum membrane synth' },
  { id: 'metalSynth', name: 'Metal Synth', description: 'Metallic percussion' },
];

interface InstrumentsProps {
  selectedInstrument?: InstrumentType;
  onInstrumentChange?: (instrument: InstrumentType) => void;
}

export function Instruments({ 
  selectedInstrument = 'piano', 
  onInstrumentChange 
}: InstrumentsProps) {
  const handleInstrumentSelect = (value: string) => {
    onInstrumentChange?.(value as InstrumentType);
  };

  const currentInstrument = AVAILABLE_INSTRUMENTS.find(i => i.id === selectedInstrument);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg border border-border/50 hover:bg-accent">
          <Music className="h-4 w-4 mr-2" />
          <span className="text-sm">{currentInstrument?.name || 'Synth'}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Select Instrument</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup 
          value={selectedInstrument} 
          onValueChange={handleInstrumentSelect}
        >
          {AVAILABLE_INSTRUMENTS.map((instrument) => (
            <DropdownMenuRadioItem key={instrument.id} value={instrument.id}>
              <div className="flex flex-col">
                <span className="font-medium">{instrument.name}</span>
                <span className="text-xs text-muted-foreground">{instrument.description}</span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
