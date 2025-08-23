// Piano Roll specific types

export type Tool = 'select' | 'draw' | 'delete' | 'resize';

export type LaneType = 'velocity' | 'pan' | 'modulation' | 'pitch_bend';

export interface LaneState {
  velocity: boolean;
  pan: boolean;
  modulation: boolean;
  pitch_bend: boolean;
}

export type VisibleLanes = LaneState;

export interface ToolState {
  currentTool: Tool;
  drawNoteLength: number; // Default note length when drawing (in beats)
  drawVelocity: number; // Default velocity when drawing
  quantization: number; // Quantization grid (e.g., 0.25 for sixteenth notes)
}

export interface UIState {
  showPianoKeys: boolean;
  showTimeline: boolean;
  showVelocityLane: boolean;
  showPanLane: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
}

export interface MouseState {
  isDown: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  button: number; // 0 = left, 1 = middle, 2 = right
}

export interface DragState {
  isDragging: boolean;
  dragType: 'note' | 'selection' | 'resize_start' | 'resize_end' | 'velocity' | 'pan';
  targetNoteId?: string;
  startPosition: { x: number; y: number };
  offset: { x: number; y: number };
}

export interface ResizeHandle {
  noteId: string;
  type: 'start' | 'end';
  position: { x: number; y: number };
}

export interface NoteVelocity {
  noteId: string;
  velocity: number;
}

export interface NotePan {
  noteId: string;
  pan: number; // -1.0 (left) to 1.0 (right)
}

export interface GridConfiguration {
  beatsPerMeasure: number;
  noteValue: number; // 4 = quarter note, 8 = eighth note, etc.
  subdivisions: number; // Grid subdivisions per beat
  showMajorLines: boolean;
  showMinorLines: boolean;
  showBeatNumbers: boolean;
}

export interface ThemeColors {
  // Piano keys
  whiteKey: string;
  blackKey: string;
  keyHover: string;
  keyPressed: string;
  
  // Grid
  gridBackground: string;
  gridLinesMajor: string;
  gridLinesMinor: string;
  rowEven: string;
  rowOdd: string;
  
  // Notes
  noteDefault: string;
  noteSelected: string;
  noteHover: string;
  noteText: string;
  
  // Lanes
  velocityBar: string;
  panControl: string;
  laneBackground: string;
  
  // UI
  timelineBackground: string;
  timelineText: string;
  toolbarBackground: string;
  selectionBox: string;
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: string;
}

export interface KeyboardShortcuts {
  selectTool: KeyboardShortcut;
  drawTool: KeyboardShortcut;
  deleteTool: KeyboardShortcut;
  selectAll: KeyboardShortcut;
  delete: KeyboardShortcut;
  copy: KeyboardShortcut;
  paste: KeyboardShortcut;
  undo: KeyboardShortcut;
  redo: KeyboardShortcut;
  play: KeyboardShortcut;
  stop: KeyboardShortcut;
  zoomIn: KeyboardShortcut;
  zoomOut: KeyboardShortcut;
}
