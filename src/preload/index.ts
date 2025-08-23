import { contextBridge, ipcRenderer } from 'electron'

declare global {
  interface Window {
    App: typeof API
    electronAPI: {
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
      getVersion: () => Promise<string>
      dragMidiFile: (dataUri: string) => void
      getSoundfontPath: (filename: string) => Promise<string | null>
      readSoundfontBuffer: (filename: string) => Promise<ArrayBuffer>
      getAvailableSoundfonts: () => Promise<string[]>
    }
  }
}

const API = {
  sayHelloFromBridge: () => console.log('\nHello from your Electron App! 👋\n\n'),
  username: process.env.USER || 'User',
}

// Expose API to renderer process
contextBridge.exposeInMainWorld('App', API);

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  getVersion: () => ipcRenderer.invoke('app-get-version'),
  dragMidiFile: (dataUri: string) => ipcRenderer.send('drag-midi-file', dataUri),
  getSoundfontPath: (filename: string) => ipcRenderer.invoke('get-soundfont-path', filename),
  readSoundfontBuffer: (filename: string) => ipcRenderer.invoke('read-soundfont-buffer', filename),
  getAvailableSoundfonts: () => ipcRenderer.invoke('get-available-soundfonts'),
});