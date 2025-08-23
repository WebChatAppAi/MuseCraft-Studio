declare module 'midi-writer-js' {
  export class NoteEvent {
    constructor(event: {
      pitch: number | number[];
      duration: string;
      startTick?: number;
      wait?: string;
      velocity?: number;
      channel?: number;
    });
  }

  export class Track {
    addEvent(event: any, map?: (event: any) => any): this;
    setTempo(tempo: number): this;
  }

  export class Writer {
    constructor(tracks: Track[]);
    build(): Uint8Array;
    dataUri(): string;
  }

  export const Constants: {
    HEADER_CHUNK_TYPE: number[];
    HEADER_CHUNK_LENGTH: number[];
    HEADER_CHUNK_FORMAT0: number[];
    HEADER_CHUNK_FORMAT1: number[];
    HEADER_CHUNK_DIVISION: number[];
    TRACK_CHUNK_TYPE: number[];
    META_EVENT_ID: number;
    META_TEXT_ID: number;
    META_COPYRIGHT_ID: number;
    META_TRACK_NAME_ID: number;
    META_INSTRUMENT_NAME_ID: number;
    META_LYRIC_ID: number;
    META_MARKER_ID: number;
    META_CUE_POINT: number;
    META_TEMPO_ID: number;
    META_SMTPE_OFFSET: number;
    META_TIME_SIGNATURE_ID: number;
    META_KEY_SIGNATURE_ID: number;
    META_SEQUENCE_SPECIFIC: number;
    META_END_OF_TRACK_ID: number;
  };
}