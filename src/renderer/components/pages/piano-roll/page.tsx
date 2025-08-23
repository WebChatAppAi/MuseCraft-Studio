import type React from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { CustomScrollArea, type CustomScrollAreaRef } from '../../ui/custom-scroll-area';
import { usePianoRollViewStore } from './logic/piano-roll-view-state';

// Import all components
import { ToolbarArea, type Tool, type InstrumentType } from './components/toolbar-area';
import { TimelineArea } from './components/timeline-area';
import { KeyboardArea, generatePianoKeys } from './components/keyboard-area';
import { GridArea, type MIDINote } from './components/grid-area';
import { VelocityArea } from './components/velocity-area';
import { UnifiedPlayerHead } from './components/unified-player-head';

// Import unified playback logic
import { UnifiedPlaybackControls } from './logic/unified-playback-controls';
import type { PlaybackState } from './logic/unified-playback-engine';

// Import AI logic
import { useAIGenerationStore } from './logic/ai-generation-state';
import { useAISetupStore } from '../ai-setup/logic/ai-setup-state';
import { setPianoRollNotesCallback, clearPianoRollNotesCallback } from '../ai-setup/services/websocket.service';

// Import MIDI parser
import { parseMIDIFile } from '../../../lib/services/midi-parser';
import { exportNotesToMidiDataUri } from '../../../lib/services/midi-writer';
import { useToast } from '../../../lib/toast';

export function PianoRollPage() {
  // State management
  const { toast } = useToast();
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [bpm, setBpm] = useState([128]);
  const [showVelocityLane, setShowVelocityLane] = useState(false);
  const [showPanLane, setShowPanLane] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('piano');
  const [notes, setNotes] = useState<MIDINote[]>([]);
  const { horizontalZoom, setZoom, calculateNewZoom } = usePianoRollViewStore();
  
  // Playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentPosition: 0,
    bpm: 128,
    isLooping: false
  });
  const [playerHeadVisible, setPlayerHeadVisible] = useState(false);
  
  // Unified playback controls
  const playbackControls = useMemo(() => new UnifiedPlaybackControls(), []);
  
  // AI Integration
  const aiGenerationStore = useAIGenerationStore();
  const aiSetupStore = useAISetupStore();

  // Expose AI generation store globally for WebSocket access
  useEffect(() => {
    (window as any).aiGenerationStore = aiGenerationStore;
    return () => {
      (window as any).aiGenerationStore = undefined;
    };
  }, [aiGenerationStore]);

  // Ensure WebSocket service stays connected
  useEffect(() => {
    const wsService = (window as any).wsService;
    if (wsService && !wsService.isConnected()) {
      console.log('🔌 Piano roll ensuring WebSocket connection...');
      wsService.connect();
    }
  }, []); // Run once on mount
  
  // Layout constants
  const keyHeight = 20; // Height of each piano key row
  const beatWidth = 64; // Width of each beat
  const pianoKeys = generatePianoKeys();
  
  // Dynamic grid width - minimum 16 bars, expand based on note content
  const getRequiredBars = useCallback(() => {
    if (notes.length === 0) return 16; // Default 16 bars when empty
    
    const maxNoteEnd = Math.max(...notes.map(note => note.start + note.duration));
    const requiredBars = Math.ceil(maxNoteEnd / 4); // Convert beats to bars (4 beats per bar)
    
    return Math.max(16, requiredBars + 1); // Minimum 16 bars, plus 1 extra bar for padding
  }, [notes]);
  
  const totalBars = getRequiredBars();
  const [viewportWidth, setViewportWidth] = useState(0);
  const contentWidth = beatWidth * totalBars * 4;
  const gridWidth = contentWidth * horizontalZoom;
  
  // Debug: Log dynamic expansion
  useEffect(() => {
    console.log(`📏 Dynamic grid: ${totalBars} bars, ${gridWidth}px width (notes: ${notes.length})`);
  }, [totalBars, gridWidth, notes.length]);
  const gridHeight = pianoKeys.length * keyHeight;
  const velocityLaneHeight = 120;
  
  // Refs for scroll containers
  const mainScrollRef = useRef<CustomScrollAreaRef>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const keyboardScrollRef = useRef<CustomScrollAreaRef>(null);
  const velocityScrollRef = useRef<CustomScrollAreaRef>(null);
  
  // Scroll position state for velocity area synchronization
  const [horizontalScrollPos, setHorizontalScrollPos] = useState(0);
  
  // Event handlers
  const handleKeyPress = (midi: number) => {
    console.log(`Piano key pressed: MIDI ${midi}`);
    // Play preview note
    playbackControls.playPreviewNote(midi);
  };
  
  const handleNoteSelect = (noteId: string, multiSelect = false) => {
    console.log(`Note selected: ${noteId}, multiSelect: ${multiSelect}`);
  };
  
  const handleVelocityChange = (noteId: string, velocity: number) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, velocity } : note
    );
    setNotes(updatedNotes);
  };
  
  // Handle instrument change
  const handleInstrumentChange = useCallback((instrumentType: InstrumentType) => {
    console.log('🎵 Piano Roll Page: Instrument changed to:', instrumentType);
    setSelectedInstrument(instrumentType);
    
    // Pass instrument change to playback engine
    const engine = (playbackControls as any).engine;
    if (engine) {
      engine.setInstrument(instrumentType);
    }
  }, [playbackControls]);

  // Setup playback controls
  useEffect(() => {
    console.log('📄 Page: Setting up direct engine callbacks...');
    
    // Get direct access to engine
    const engine = (playbackControls as any).engine;
    
    // Register callbacks directly on engine
    engine.onPositionChange((position: number) => {
      console.log(`📄 Direct position update: ${position.toFixed(3)}`);
      setPlaybackState(prev => ({ ...prev, currentPosition: position }));
    });

    engine.onPlaybackStateChange((state: any) => {
      console.log('📄 Direct state change:', state);
      setPlaybackState(state);
      // Show/hide playerhead based on playback state
      setPlayerHeadVisible(state.isPlaying);
    });

    // Update notes and BPM
    playbackControls.setNotes(notes);
    playbackControls.setBPM(bpm[0]);
    
    console.log('✅ Direct engine callbacks registered');
  }, [playbackControls, notes, bpm]);

  // AI Integration Setup
  useEffect(() => {
    // Sync AI generation store with AI setup store data
    aiGenerationStore.updateAvailableModels(aiSetupStore.models);
    aiGenerationStore.updateLoadedModels(aiSetupStore.systemStatus?.loaded_models || []);
  }, [aiSetupStore.models, aiSetupStore.systemStatus?.loaded_models]);

  // Register callback with AI setup WebSocket for generation events
  useEffect(() => {
    // Register our notes handler with the existing AI setup WebSocket
    setPianoRollNotesCallback((generatedNotes: MIDINote[]) => {
      console.log('🎵 Received generated notes from WebSocket:', generatedNotes.length);
      console.log('🎼 Note details:', generatedNotes.map(n => ({id: n.id, midi: n.midi, start: n.start, duration: n.duration})));
      setNotes(prevNotes => {
        const newNotes = [...prevNotes, ...generatedNotes];
        console.log('🎹 Piano roll notes updated. Total notes:', newNotes.length);
        return newNotes;
      });
    });

    // Cleanup callback on unmount
    return () => {
      clearPianoRollNotesCallback();
    };
  }, []);

  // Handle AI generated notes
  const handleAINotesGenerated = useCallback((generatedNotes: MIDINote[]) => {
    console.log('🎵 Replacing notes with AI generated notes:', generatedNotes.length);
    setNotes(generatedNotes); // Replace all notes with new generation
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle spacebar for play/stop
      if (playbackControls.shouldHandleSpaceBar(e)) {
        e.preventDefault();
        playbackControls.handleSpaceBar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [playbackControls]);

  // Scroll synchronization between timeline, keyboard, grid, and velocity
  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    const scrollTop = target.scrollTop;
    
    console.log(`🔄 Main grid scroll event: left=${scrollLeft}, top=${scrollTop}`);
    
    // Update scroll position state
    setHorizontalScrollPos(scrollLeft);
    
    // Sync horizontal scroll with timeline
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
    
    // Sync horizontal scroll with velocity area
    if (velocityScrollRef.current) {
      velocityScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
    
    // Sync vertical scroll with keyboard
    if (keyboardScrollRef.current) {
      keyboardScrollRef.current.scrollTo({ top: scrollTop, behavior: 'auto' });
    }
  };

  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    
    // Update scroll position state
    setHorizontalScrollPos(scrollLeft);
    
    // Sync horizontal scroll with main grid
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
    
    // Sync horizontal scroll with velocity area
    if (velocityScrollRef.current) {
      velocityScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
  };

  const handleKeyboardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    
    // Sync vertical scroll with main grid
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: scrollTop, behavior: 'auto' });
    }
  };

  const handleVelocityScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollLeft = target.scrollLeft;
    
    // Update scroll position state
    setHorizontalScrollPos(scrollLeft);
    
    // Sync horizontal scroll with main grid
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
    
    // Sync horizontal scroll with timeline
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollTo({ left: scrollLeft, behavior: 'auto' });
    }
  };

  // Handle timeline wheel scrolling
  const handleTimelineWheelScroll = (deltaX: number) => {
    const currentScrollLeft = horizontalScrollPos;
    const newScrollLeft = Math.max(0, currentScrollLeft + deltaX);
    
    console.log(`🎯 Timeline wheel: scrolling from ${currentScrollLeft} to ${newScrollLeft} (delta: ${deltaX})`);
    
    // Update state first
    setHorizontalScrollPos(newScrollLeft);
    
    // Manually sync all scroll areas (programmatic scrollTo doesn't trigger onScroll events)
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'auto' });
    }
    
    if (timelineScrollRef.current) {
      const timelineScrollWidth = timelineScrollRef.current.scrollWidth || 0;
      const timelineClientWidth = timelineScrollRef.current.clientWidth || 0;
      console.log('📏 Timeline dimensions: scrollWidth=', timelineScrollWidth, 'clientWidth=', timelineClientWidth, 'gridWidth=', gridWidth);
      console.log('📅 Timeline before scroll:', timelineScrollRef.current.scrollLeft);
      
      timelineScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'auto' });
      
      // Check timeline scroll result
      setTimeout(() => {
        const actualTimelineScroll = timelineScrollRef.current?.scrollLeft || 0;
        console.log('📅 Timeline after scroll:', actualTimelineScroll, 'expected:', newScrollLeft);
      }, 10);
    }
    
    if (velocityScrollRef.current) {
      velocityScrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'auto' });
    }
    
    console.log(`🔄 Manual sync: all areas scrolled to ${newScrollLeft}px`);
  };

  // Handle MIDI file drag & drop
  const handleMidiDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.name.toLowerCase().endsWith('.mid') || file.name.toLowerCase().endsWith('.midi')) {
        try {
          console.log('🎵 MIDI file dropped:', file.name);
          const midiNotes = await parseMIDIFile(file);
          
          if (midiNotes.length > 0) {
            // Add imported notes to existing notes
            setNotes(prevNotes => [...prevNotes, ...midiNotes]);
            console.log(`✅ Imported ${midiNotes.length} notes from ${file.name}`);
            
            toast({
              title: "MIDI File Imported",
              description: `Successfully imported ${midiNotes.length} notes from "${file.name}".`,
              type: "success",
            });
          } else {
            toast({
              title: "Empty MIDI File",
              description: `No notes were found in "${file.name}".`,
            });
          }
        } catch (error) {
          console.error('Failed to parse MIDI file:', error);
          toast({
            title: "Import Error",
            description: `Failed to parse MIDI file "${file.name}".`,
            type: "destructive",
          });
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleExportDragStart = () => {
    if (notes.length > 0) {
      const dataUri = exportNotesToMidiDataUri(notes, bpm[0]);
      window.electronAPI.dragMidiFile(dataUri);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playbackControls.dispose();
    };
  }, [playbackControls]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollElement = mainScrollRef.current?.getViewport();

    if (container && scrollElement) {
      const wheelHandler = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();

          const minZoom = viewportWidth > 0 ? viewportWidth / contentWidth : 0;
          const newZoom = calculateNewZoom(e.deltaY, minZoom);
          const oldZoom = horizontalZoom;
          
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          
          // Position of the mouse relative to the start of the scrollable content
          const scrollX = scrollElement.scrollLeft;
          const mouseRelativeX = mouseX + scrollX;
          
          // Calculate the new scroll position to keep the mouse position fixed
          const newScrollX = (mouseRelativeX * newZoom / oldZoom) - mouseX;

          setZoom(newZoom, minZoom);
          
          // Programmatically scroll all synchronized areas
          mainScrollRef.current?.scrollTo({ left: newScrollX, behavior: 'auto' });
          timelineScrollRef.current?.scrollTo({ left: newScrollX, behavior: 'auto' });
          velocityScrollRef.current?.scrollTo({ left: newScrollX, behavior: 'auto' });
        }
      };

      container.addEventListener('wheel', wheelHandler, { passive: false });
      return () => {
        container.removeEventListener('wheel', wheelHandler);
      };
    }
  }, [horizontalZoom, calculateNewZoom, setZoom, contentWidth, viewportWidth]);
  
  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-background overflow-hidden"
      onDrop={handleMidiDrop}
      onDragOver={handleDragOver}
    >
      {/* Toolbar */}
      <ToolbarArea
        currentTool={currentTool}
        bpm={bpm}
        showVelocityLane={showVelocityLane}
        showPanLane={showPanLane}
        isPlaying={playbackState.isPlaying}
        selectedInstrument={selectedInstrument}
        onToolChange={setCurrentTool}
        onBpmChange={setBpm}
        onVelocityLaneToggle={setShowVelocityLane}
        onPanLaneToggle={setShowPanLane}
        onPlayToggle={() => playbackControls.handleSpaceBar()}
        onStop={() => playbackControls.stop()}
        onInstrumentChange={handleInstrumentChange}
        currentNotes={notes}
        onNotesGenerated={handleAINotesGenerated}
        onExportDragStart={handleExportDragStart}
      />
      
      {/* Timeline Container - Fixed position with horizontal scroll sync */}
      <div className="flex">
        {/* Left spacer for piano keyboard alignment */}
        <div className="w-20 flex-shrink-0 h-8 bg-card border-r border-border" />
        
        {/* Timeline with horizontal scroll (hidden scrollbar) */}
        <div className="flex-1 overflow-hidden">
          <div
            className="h-8 w-full overflow-x-auto scrollbar-hide"
            ref={timelineScrollRef}
            onScroll={handleTimelineScroll}
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
          >
            <div style={{ width: gridWidth }}>
              <TimelineArea
                beatWidth={beatWidth}
                measures={totalBars} // Dynamic bars based on content
                onHorizontalScroll={handleTimelineWheelScroll}
                horizontalZoom={horizontalZoom}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Piano Roll Container */}
      <div className="flex-1 flex overflow-hidden border-t border-border">
        {/* Piano Keyboard - Fixed left with vertical scroll sync */}
        <div className="relative w-20 flex-shrink-0">
          <CustomScrollArea 
            className="h-full" 
            ref={keyboardScrollRef}
            orientation="vertical"
            onScroll={handleKeyboardScroll}
          >
            <KeyboardArea 
              keys={pianoKeys}
              keyHeight={keyHeight}
              onKeyPress={handleKeyPress}
            />
          </CustomScrollArea>
        </div>
        
        {/* Main Grid Area with both scrollbars */}
        <div className="flex-1 relative overflow-hidden" ref={(el) => setViewportWidth(el?.clientWidth ?? 0)}>
          <CustomScrollArea
            className="h-full w-full"
            ref={mainScrollRef}
            orientation="both"
            onScroll={handleMainScroll}
          >
            <div className="relative">
              <GridArea
                width={gridWidth}
                height={gridHeight}
                keyHeight={keyHeight}
                beatWidth={beatWidth}
                keys={pianoKeys}
                currentTool={currentTool}
                notes={notes}
                onNotesChange={setNotes}
                onNoteSelect={handleNoteSelect}
                horizontalZoom={horizontalZoom}
              />
              
              {/* Unified Player Head with Perfect Sync */}
              <UnifiedPlayerHead
                position={playbackState.currentPosition}
                beatWidth={beatWidth}
                height={gridHeight}
                isVisible={playerHeadVisible}
                isPlaying={playbackState.isPlaying}
              />
            </div>
          </CustomScrollArea>
        </div>
      </div>

      {/* Horizontal Scrollbar Area - Always visible, acts as separator */}
      <div className="flex border-t border-border/50">
        {/* Left spacer matching keyboard */}
        <div className="w-20 flex-shrink-0 bg-card/50" />
        
        {/* Horizontal scrollbar area */}
        <div className="flex-1 h-3 bg-muted/20 relative">
          <CustomScrollArea 
            className="h-full w-full" 
            ref={velocityScrollRef}
            orientation="horizontal"
            onScroll={handleVelocityScroll}
          >
            {/* Content that makes scrollbar always show */}
            <div style={{ width: gridWidth + 100, height: '100%' }} />
          </CustomScrollArea>
        </div>
      </div>
        
      {/* Velocity Lane */}
      {showVelocityLane && (
        <div>
          <div className="flex h-32">
            {/* Fixed Left Section - Velocity Header (matches keyboard width) */}
            <div className="w-20 flex-shrink-0 bg-card border-r border-border">
              <div className="h-8 bg-muted border-b border-border/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-medium">Velocity</span>
              </div>
              <div className="flex-1 bg-muted/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground font-semibold transform -rotate-90">
                  
                </span>
              </div>
            </div>
            
            {/* Velocity Content Area - synced with horizontal scrollbar */}
            <div className="flex-1 relative overflow-hidden">
              <div 
                className="h-full transition-transform duration-75"
                style={{ 
                  transform: `translateX(-${horizontalScrollPos}px)`,
                  width: gridWidth 
                }}
              >
                <VelocityArea
                  width={gridWidth} // Only the grid width, not including keyboard
                  height={velocityLaneHeight}
                  visible={showVelocityLane}
                  notes={notes}
                  beatWidth={beatWidth}
                  onVelocityChange={handleVelocityChange}
                  horizontalZoom={horizontalZoom}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}