import { BrowserWindow } from 'electron'
import { join } from 'node:path'

import { createWindow } from '../../lib/electron-app/factories/windows/create'
import { ENVIRONMENT } from '../../shared/constants'

export async function MainWindow() {
  const window = createWindow({
    id: 'main',
    title: 'QuantumGram',
    width: 1450,
    height: 998,
    minWidth: 700,
    minHeight: 500,
    show: false,
    center: true,
    movable: true,
    resizable: true,
    alwaysOnTop: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    frame: false,
    titleBarOverlay: false,

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  window.webContents.on('did-finish-load', () => {
    if (ENVIRONMENT.IS_DEV) {
      window.webContents.openDevTools({ mode: 'detach' })
    }

    window.show()
  })

  window.on('close', () => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.destroy()
    }
  })

  return window
}