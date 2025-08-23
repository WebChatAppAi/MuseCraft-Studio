import { create } from 'zustand'

const MIN_ZOOM = 0.2
const MAX_ZOOM = 5.0
const ZOOM_SENSITIVITY = 0.001

interface PianoRollViewState {
  horizontalZoom: number
  setZoom: (zoom: number, minZoom?: number) => void
  zoomIn: () => void
  zoomOut: () => void
  calculateNewZoom: (deltaY: number, minZoom?: number) => number
}

export const usePianoRollViewStore = create<PianoRollViewState>((set, get) => ({
  horizontalZoom: 1,

  setZoom: (zoom, minZoom = MIN_ZOOM) => {
    const newZoom = Math.max(minZoom, Math.min(MAX_ZOOM, zoom))
    set({ horizontalZoom: newZoom })
  },

  zoomIn: () => {
    const { horizontalZoom } = get()
    get().setZoom(horizontalZoom * 1.2)
  },

  zoomOut: () => {
    const { horizontalZoom } = get()
    get().setZoom(horizontalZoom / 1.2)
  },

  calculateNewZoom: (deltaY, minZoom = MIN_ZOOM) => {
    const { horizontalZoom } = get()
    const zoomAmount = deltaY * ZOOM_SENSITIVITY
    const newZoom = horizontalZoom - zoomAmount
    return Math.max(minZoom, Math.min(MAX_ZOOM, newZoom))
  },
}))