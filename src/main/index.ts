import { app, ipcMain, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { makeAppWithSingleInstanceLock } from '../lib/electron-app/factories/app/instance'
import { makeAppSetup } from '../lib/electron-app/factories/app/setup'
import { MainWindow } from './windows/main'

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady()
  const mainWindow = await makeAppSetup(MainWindow)
})

// Window control handlers
ipcMain.handle('window-minimize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.minimize();
});

ipcMain.handle('window-maximize', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) window.close();
});

// App version IPC handler
ipcMain.handle('app-get-version', () => {
  return app.getVersion();
});

// Get available soundfonts list
ipcMain.handle('get-available-soundfonts', () => {
  const isDev = process.env.NODE_ENV === 'development';
  const soundbankPath = isDev 
    ? path.join(process.cwd(), 'src', 'resources', 'soundbank')
    : path.join(process.resourcesPath, 'soundbank');
  
  try {
    if (!fs.existsSync(soundbankPath)) {
      console.warn(`⚠️ Soundbank directory not found: ${soundbankPath}`);
      return [];
    }
    
    const files = fs.readdirSync(soundbankPath);
    const soundfonts = files.filter(file => 
      file.toLowerCase().endsWith('.sf2') || file.toLowerCase().endsWith('.sf3')
    );
    
    console.log(`🎵 Found ${soundfonts.length} soundfonts:`, soundfonts);
    return soundfonts;
  } catch (error) {
    console.error('❌ Failed to read soundbank directory:', error);
    return [];
  }
});

// Handle file drag from renderer
ipcMain.on('drag-midi-file', (event, dataUri: string) => {
  // Generate a unique filename
  const uniqueSuffix = Math.random().toString(36).substring(2, 6);
  const fileName = `musecraft_studio_${uniqueSuffix}.mid`;
  const tempPath = path.join(os.tmpdir(), fileName);

  // Convert data URI to buffer
  const base64Data = dataUri.split(';base64,').pop();
  if (base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Write to a temporary file
    fs.writeFileSync(tempPath, buffer);

    // Start the drag operation
    event.sender.startDrag({
      file: tempPath,
      icon: path.join(process.cwd(), 'src/resources/midi.png'),
    });
  }
});

// Handle SF2 soundfont file access
ipcMain.handle('get-soundfont-path', (event, filename: string) => {
  // Get the path to the soundfont file in resources
  const isDev = process.env.NODE_ENV === 'development';
  const basePath = isDev 
    ? path.join(process.cwd(), 'src', 'resources', 'soundbank')
    : path.join(process.resourcesPath, 'soundbank');
  
  const soundfontPath = path.join(basePath, filename);
  
  // Check if file exists
  if (fs.existsSync(soundfontPath)) {
    return soundfontPath;
  } else {
    console.error(`❌ Soundfont not found: ${soundfontPath}`);
    return null;
  }
});

// Handle reading SF2 file as buffer for web audio
ipcMain.handle('read-soundfont-buffer', async (event, filename: string) => {
  try {
    console.log(`🔄 Reading soundfont buffer: ${filename}`);
    
    // Get the path to the soundfont file directly (don't use ipcMain.handleOnce inside handler)
    const isDev = process.env.NODE_ENV === 'development';
    const basePath = isDev 
      ? path.join(process.cwd(), 'src', 'resources', 'soundbank')
      : path.join(process.resourcesPath, 'soundbank');
    
    const soundfontPath = path.join(basePath, filename);
    
    // Check if file exists
    if (!fs.existsSync(soundfontPath)) {
      throw new Error(`Soundfont file not found: ${soundfontPath}`);
    }
    
    // Read and return the buffer
    const buffer = fs.readFileSync(soundfontPath);
    console.log(`✅ Loaded soundfont: ${filename} (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
    
    // Return as ArrayBuffer for web audio compatibility
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    
  } catch (error) {
    console.error(`❌ Failed to read soundfont ${filename}:`, error);
    throw error;
  }
});