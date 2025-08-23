import ReactDom from 'react-dom/client'
import React from 'react'

import { AppRoutes } from './routes'
import { ToastProvider } from './lib/toast'
import { AudioInitializationService } from './lib/services/audio-initialization'

import './globals.css'

// Track app start time for persistent state management
localStorage.setItem('app-start-time', Date.now().toString());

// Initialize audio system at app startup
console.log('🚀 Starting MuseCraft V1 - Initializing audio system...');
AudioInitializationService.getInstance().initializeAudioSystem().then(() => {
  console.log('🎵 Audio system ready for professional music production!');
}).catch((error) => {
  console.warn('⚠️ Audio system initialization failed, but app will continue:', error);
});

ReactDom.createRoot(document.querySelector('app') as HTMLElement).render(
  <React.StrictMode>
    <div className="dark">
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </div>
  </React.StrictMode>
)
