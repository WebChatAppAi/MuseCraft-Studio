import type { MIDINote } from '../components/grid-area';
import type { PianoKey } from '../components/keyboard-area';

// Note editing modes
export type EditMode = 'select' | 'draw' | 'resize' | 'drag';
export type ResizeDirection = 'start' | 'end';

// Mouse interaction state
export interface MouseState {
  isDown: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  button: number; // 0 = left, 2 = right
}

// Drag state for notes
export interface DragState {
  isDragging: boolean;
  draggedNotes: string[]; // IDs of notes being dragged
  startPositions: Map<string, { start: number; midi: number }>; // Original positions
  mouseOffset: { x: number; y: number }; // Offset from mouse to note anchor
}

// Resize state for notes
export interface ResizeState {
  isResizing: boolean;
  noteId: string;
  direction: ResizeDirection;
  originalNote: MIDINote;
  minDuration: number;
}

// Selection state
export interface SelectionState {
  selectedNoteIds: Set<string>;
  selectionBox: {
    isActive: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}

// Grid configuration
export interface GridConfig {
  keyHeight: number;
  beatWidth: number;
  snapToBeat: boolean;
  snapResolution: number; // 0.25 = 16th notes, 0.125 = 32nd notes
}

// Note editing operations
export class NoteEditingLogic {
  private mouseState: MouseState = {
    isDown: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    button: 0
  };

  private dragState: DragState = {
    isDragging: false,
    draggedNotes: [],
    startPositions: new Map(),
    mouseOffset: { x: 0, y: 0 }
  };

  private resizeState: ResizeState = {
    isResizing: false,
    noteId: '',
    direction: 'end',
    originalNote: {} as MIDINote,
    minDuration: 0.125 // Minimum 32nd note
  };

  private selectionState: SelectionState = {
    selectedNoteIds: new Set(),
    selectionBox: {
      isActive: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0
    }
  };

  // Convert mouse coordinates to grid position
  public getGridPosition(
    mouseX: number, 
    mouseY: number, 
    gridConfig: GridConfig
  ): { beat: number; keyIndex: number } {
    const beat = mouseX / gridConfig.beatWidth;
    const keyIndex = Math.floor(mouseY / gridConfig.keyHeight);
    
    // Snap to grid if enabled
    if (gridConfig.snapToBeat) {
      const snappedBeat = Math.round(beat / gridConfig.snapResolution) * gridConfig.snapResolution;
      return { beat: Math.max(0, snappedBeat), keyIndex: Math.max(0, keyIndex) };
    }
    
    return { beat: Math.max(0, beat), keyIndex: Math.max(0, keyIndex) };
  }

  // Check if mouse is over a note
  public getNoteAtPosition(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): { note: MIDINote | null; resizeHandle: ResizeDirection | null } {
    const { beat, keyIndex } = this.getGridPosition(mouseX, mouseY, gridConfig);
    
    // Find note at position
    for (const note of notes) {
      const noteKeyIndex = keys.findIndex(key => key.midi === note.midi);
      if (noteKeyIndex !== keyIndex) continue;
      
      const noteStart = note.start;
      const noteEnd = note.start + note.duration;
      
      if (beat >= noteStart && beat <= noteEnd) {
        // Check for resize handles (first/last 10% of note)
        const noteWidth = note.duration;
        const handleSize = Math.min(0.125, noteWidth * 0.1); // Max 32nd note handle
        
        if (beat <= noteStart + handleSize) {
          return { note, resizeHandle: 'start' };
        } else if (beat >= noteEnd - handleSize) {
          return { note, resizeHandle: 'end' };
        } else {
          return { note, resizeHandle: null };
        }
      }
    }
    
    return { note: null, resizeHandle: null };
  }

  // Start mouse interaction
  public startMouseInteraction(
    mouseX: number,
    mouseY: number,
    button: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig,
    multiSelect: boolean = false
  ): {
    action: 'drag' | 'resize' | 'select' | 'create' | 'none';
    updatedNotes?: MIDINote[];
  } {
    this.mouseState = {
      isDown: true,
      startX: mouseX,
      startY: mouseY,
      currentX: mouseX,
      currentY: mouseY,
      button
    };

    const { note, resizeHandle } = this.getNoteAtPosition(mouseX, mouseY, notes, keys, gridConfig);
    
    if (note) {
      // Clicking on existing note
      if (resizeHandle) {
        // Start resizing
        this.startResize(note, resizeHandle);
        return { action: 'resize' };
      } else {
        // Start dragging or select
        if (button === 0) { // Left click
          if (this.selectionState.selectedNoteIds.has(note.id)) {
            // Start dragging selected notes
            this.startDrag(mouseX, mouseY, notes, keys, gridConfig);
            return { action: 'drag' };
          } else {
            // Select note
            const updatedNotes = this.selectNote(note.id, notes, multiSelect);
            return { action: 'select', updatedNotes };
          }
        } else if (button === 2) { // Right click
          // Delete note
          const updatedNotes = notes.filter(n => n.id !== note.id);
          this.clearSelection();
          return { action: 'select', updatedNotes };
        }
      }
    } else {
      // Clicking on empty space
      if (button === 0) { // Left click
        if (multiSelect) {
          // Start selection box
          this.startSelectionBox(mouseX, mouseY);
          return { action: 'select' };
        } else {
          // Create new note
          const { beat, keyIndex } = this.getGridPosition(mouseX, mouseY, gridConfig);
          if (keyIndex < keys.length) {
            const newNote: MIDINote = {
              id: `note_${Date.now()}_${Math.random()}`,
              midi: keys[keyIndex].midi,
              start: beat,
              duration: gridConfig.snapResolution * 2, // Default duration
              velocity: 80,
              selected: false
            };
            const updatedNotes = [...notes, newNote];
            return { action: 'create', updatedNotes };
          }
        }
      } else {
        // Right click on empty space - clear selection
        const updatedNotes = this.clearSelection(notes);
        return { action: 'select', updatedNotes };
      }
    }

    return { action: 'none' };
  }

  // Update mouse position during interaction
  public updateMousePosition(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): MIDINote[] | null {
    this.mouseState.currentX = mouseX;
    this.mouseState.currentY = mouseY;

    if (this.dragState.isDragging) {
      return this.updateDrag(mouseX, mouseY, notes, keys, gridConfig);
    } else if (this.resizeState.isResizing) {
      return this.updateResize(mouseX, mouseY, notes, gridConfig);
    } else if (this.selectionState.selectionBox.isActive) {
      this.updateSelectionBox(mouseX, mouseY);
      return null;
    }

    return null;
  }

  // End mouse interaction
  public endMouseInteraction(
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): MIDINote[] | null {
    this.mouseState.isDown = false;

    if (this.selectionState.selectionBox.isActive) {
      // Complete selection box
      const updatedNotes = this.completeSelectionBox(notes, keys, gridConfig);
      return updatedNotes;
    }

    // Reset states
    this.dragState.isDragging = false;
    this.resizeState.isResizing = false;
    this.dragState.draggedNotes = [];
    this.dragState.startPositions.clear();

    return null;
  }

  // Start dragging selected notes
  private startDrag(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ) {
    const selectedNotes = notes.filter(note => this.selectionState.selectedNoteIds.has(note.id));
    
    this.dragState.isDragging = true;
    this.dragState.draggedNotes = selectedNotes.map(note => note.id);
    
    // Store original positions
    for (const note of selectedNotes) {
      this.dragState.startPositions.set(note.id, {
        start: note.start,
        midi: note.midi
      });
    }

    // Calculate mouse offset from first selected note
    if (selectedNotes.length > 0) {
      const firstNote = selectedNotes[0];
      const noteKeyIndex = keys.findIndex(key => key.midi === firstNote.midi);
      const noteX = firstNote.start * gridConfig.beatWidth;
      const noteY = noteKeyIndex * gridConfig.keyHeight;
      
      this.dragState.mouseOffset = {
        x: mouseX - noteX,
        y: mouseY - noteY
      };
    }
  }

  // Update dragging
  private updateDrag(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): MIDINote[] {
    const { beat: targetBeat, keyIndex: targetKeyIndex } = this.getGridPosition(
      mouseX - this.dragState.mouseOffset.x,
      mouseY - this.dragState.mouseOffset.y,
      gridConfig
    );

    // Calculate offset from first note's original position
    const firstNoteId = this.dragState.draggedNotes[0];
    const firstOriginalPos = this.dragState.startPositions.get(firstNoteId);
    
    if (!firstOriginalPos) return notes;

    const beatOffset = targetBeat - firstOriginalPos.start;
    const originalKeyIndex = keys.findIndex(key => key.midi === firstOriginalPos.midi);
    const keyOffset = targetKeyIndex - originalKeyIndex;

    // Update all dragged notes
    return notes.map(note => {
      if (this.dragState.draggedNotes.includes(note.id)) {
        const originalPos = this.dragState.startPositions.get(note.id);
        if (!originalPos) return note;

        const originalNoteKeyIndex = keys.findIndex(key => key.midi === originalPos.midi);
        const newKeyIndex = Math.max(0, Math.min(keys.length - 1, originalNoteKeyIndex + keyOffset));
        
        return {
          ...note,
          start: Math.max(0, originalPos.start + beatOffset),
          midi: keys[newKeyIndex].midi
        };
      }
      return note;
    });
  }

  // Start resizing
  private startResize(note: MIDINote, direction: ResizeDirection) {
    this.resizeState.isResizing = true;
    this.resizeState.noteId = note.id;
    this.resizeState.direction = direction;
    this.resizeState.originalNote = { ...note };
  }

  // Update resizing
  private updateResize(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    gridConfig: GridConfig
  ): MIDINote[] {
    const { beat } = this.getGridPosition(mouseX, mouseY, gridConfig);
    const originalNote = this.resizeState.originalNote;

    return notes.map(note => {
      if (note.id === this.resizeState.noteId) {
        if (this.resizeState.direction === 'start') {
          // Resize from start
          const newStart = Math.min(beat, originalNote.start + originalNote.duration - this.resizeState.minDuration);
          const newDuration = originalNote.start + originalNote.duration - newStart;
          
          return {
            ...note,
            start: Math.max(0, newStart),
            duration: Math.max(this.resizeState.minDuration, newDuration)
          };
        } else {
          // Resize from end
          const newDuration = Math.max(this.resizeState.minDuration, beat - originalNote.start);
          
          return {
            ...note,
            duration: newDuration
          };
        }
      }
      return note;
    });
  }

  // Select note
  private selectNote(noteId: string, notes: MIDINote[], multiSelect: boolean): MIDINote[] {
    if (!multiSelect) {
      this.selectionState.selectedNoteIds.clear();
    }
    
    this.selectionState.selectedNoteIds.add(noteId);
    
    return notes.map(note => ({
      ...note,
      selected: this.selectionState.selectedNoteIds.has(note.id)
    }));
  }

  // Clear selection
  private clearSelection(notes?: MIDINote[]): MIDINote[] {
    this.selectionState.selectedNoteIds.clear();
    
    if (notes) {
      return notes.map(note => ({ ...note, selected: false }));
    }
    
    return [];
  }

  // Start selection box
  private startSelectionBox(mouseX: number, mouseY: number) {
    this.selectionState.selectionBox = {
      isActive: true,
      startX: mouseX,
      startY: mouseY,
      endX: mouseX,
      endY: mouseY
    };
  }

  // Update selection box
  private updateSelectionBox(mouseX: number, mouseY: number) {
    this.selectionState.selectionBox.endX = mouseX;
    this.selectionState.selectionBox.endY = mouseY;
  }

  // Complete selection box
  private completeSelectionBox(
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): MIDINote[] {
    const box = this.selectionState.selectionBox;
    const minX = Math.min(box.startX, box.endX);
    const maxX = Math.max(box.startX, box.endX);
    const minY = Math.min(box.startY, box.endY);
    const maxY = Math.max(box.startY, box.endY);

    // Find notes within selection box
    for (const note of notes) {
      const noteKeyIndex = keys.findIndex(key => key.midi === note.midi);
      const noteStartX = note.start * gridConfig.beatWidth;
      const noteEndX = (note.start + note.duration) * gridConfig.beatWidth;
      const noteY = noteKeyIndex * gridConfig.keyHeight;
      const noteBottomY = noteY + gridConfig.keyHeight;

      // Check if note overlaps with selection box
      if (noteStartX < maxX && noteEndX > minX && noteY < maxY && noteBottomY > minY) {
        this.selectionState.selectedNoteIds.add(note.id);
      }
    }

    // Reset selection box
    this.selectionState.selectionBox.isActive = false;

    return notes.map(note => ({
      ...note,
      selected: this.selectionState.selectedNoteIds.has(note.id)
    }));
  }

  // Get current states (for UI feedback)
  public getStates() {
    return {
      mouse: { ...this.mouseState },
      drag: { ...this.dragState },
      resize: { ...this.resizeState },
      selection: {
        selectedIds: new Set(this.selectionState.selectedNoteIds),
        selectionBox: { ...this.selectionState.selectionBox }
      }
    };
  }

  // Get cursor style based on current state
  public getCursorStyle(
    mouseX: number,
    mouseY: number,
    notes: MIDINote[],
    keys: PianoKey[],
    gridConfig: GridConfig
  ): string {
    if (this.dragState.isDragging) return 'grabbing';
    if (this.resizeState.isResizing) return this.resizeState.direction === 'start' ? 'w-resize' : 'e-resize';

    const { note, resizeHandle } = this.getNoteAtPosition(mouseX, mouseY, notes, keys, gridConfig);
    
    if (resizeHandle) {
      return resizeHandle === 'start' ? 'w-resize' : 'e-resize';
    } else if (note && this.selectionState.selectedNoteIds.has(note.id)) {
      return 'grab';
    } else if (note) {
      return 'pointer';
    }

    return 'default';
  }
}
