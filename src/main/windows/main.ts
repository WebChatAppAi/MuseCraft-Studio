import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import { app } from 'electron'

import { createWindow } from '../../lib/electron-app/factories/windows/create'
import { ENVIRONMENT } from '../../shared/constants'

// Get the icon path based on platform
function getIconPath() {
  const resourcesPath = app.isPackaged 
    ? process.resourcesPath  // In packaged app, icons are in the root of resources
    : join(__dirname, '../../resources')  // In dev, they're in src/resources
    
  if (process.platform === 'win32') {
    return join(resourcesPath, 'icon.ico')
  } else if (process.platform === 'darwin') {
    return join(resourcesPath, 'icon.icns')
  } else {
    return join(resourcesPath, 'icon.png')
  }
}

export async function MainWindow() {
  const window = createWindow({
    id: 'main',
    title: 'MuseCraft Studio',
    icon: getIconPath(),
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