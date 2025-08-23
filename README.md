# 🎵 MuseCraft - AI MIDI Generation Studio

<div align="center">

![MuseCraft Logo](src/resources/public/illustration.svg)

**Professional AI-Powered MIDI Generation Desktop Application**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)  
[![Electron](https://img.shields.io/badge/electron-37.2.5-blue.svg)](https://electronjs.org/)  
[![TypeScript](https://img.shields.io/badge/typescript-5.1.6-blue.svg)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)

🎹 **Create beautiful MIDI compositions with AI assistance**

</div>

## 🎯 What is MuseCraft?

MuseCraft is a professional desktop application that combines the power of AI with intuitive MIDI composition tools. Built with Electron, React, and TypeScript, it provides a seamless experience for musicians, producers, and composers to generate, edit, and refine MIDI compositions using AI models.

### 🎵 **Core Features**
- **AI-Powered MIDI Generation**: Generate musical notes using local AI models
- **Professional Piano Roll Editor**: Full-featured MIDI editor with note editing, velocity control, and timing precision
- **AI Model Management**: Load, unload, and manage multiple AI models with real-time status monitoring
- **Real-time Generation Feedback**: Live progress updates and WebSocket integration
- **Modern UI/UX**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS

### 🏗️ **Architecture**
- **Frontend**: React 19 + TypeScript + Zustand state management
- **Backend Integration**: REST API + WebSocket communication with MuseCraftEngine
- **Desktop Platform**: Electron with secure IPC communication
- **Real-time Updates**: WebSocket service for live model status and generation events

## 🔧 **System Architecture & Data Flow**

### **AI Generation Workflow**
```
1. AI Setup Page → Load Model → Model Status: Loaded
2. Piano Roll Page → Click Generate → AI Generation API Call
3. Backend → Process with AI Model → Generate MIDI Notes
4. Frontend → Poll REST API → Retrieve Generated Notes
5. Piano Roll → Convert Note Format → Display Notes
```

### **Key Components**
```
┌─ AI Setup ─────────────────────────────────────────┐
│ • Model discovery and loading                      │
│ • Real-time status monitoring                      │
│ • WebSocket connection management                  │
│ • System health checks                             │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌─ Piano Roll ───────────────────────────────────────┐
│ • MIDI note visualization and editing              │
│ • AI generation integration                        │
│ • Real-time playback and controls                  │
│ • Note format conversion (backend ↔ frontend)      │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌─ Backend Communication ────────────────────────────┐
│ • REST API for generation requests                 │
│ • WebSocket for real-time updates                  │
│ • Polling mechanism for completion detection       │
│ • Error handling and retry logic                   │
└────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **pnpm** (recommended) or npm
- **MuseCraftEngine Backend**: Running on `http://localhost:8899`
- **Git** for cloning the repository

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/MuseCraft-V1.git
cd MuseCraft-V1
```

### 2. Install Dependencies
```bash
pnpm install
# or if you prefer npm
npm install
```

### 3. Start MuseCraftEngine Backend
Ensure the MuseCraftEngine backend is running on `localhost:8899` before starting the frontend.

### 4. Start Development
```bash
pnpm dev
```

This will:
- Build the Electron main process
- Start the development server with hot reload
- Launch the MuseCraft desktop application

### 5. First Time Setup
1. **Navigate to AI Setup** - Configure your AI models
2. **Load a Model** - Select and load an AI model for generation
3. **Go to Piano Roll** - Start creating and generating MIDI notes
4. **Generate Notes** - Click generate to create AI-powered MIDI compositions

## 🎹 How MuseCraft Works

### **AI Setup Page** - Model Management Hub

The AI Setup page is your control center for managing AI models and backend connectivity.

#### Key Features:
- **Backend Connection Testing**: Verify connection to MuseCraftEngine
- **Model Discovery**: Automatically detect available AI models
- **Model Loading/Unloading**: Manage which models are active in memory
- **Real-time Status**: Live updates on model status and system health
- **WebSocket Integration**: Persistent connection for real-time updates

#### Workflow:
```
1. Launch MuseCraft → AI Setup Page loads
2. Test Connection → Verify backend connectivity
3. Discover Models → Scan for available AI models
4. Load Model → Select and load desired model into memory
5. Monitor Status → Real-time updates via WebSocket
6. Navigate to Piano Roll → Ready for generation
```

### **Piano Roll Page** - MIDI Creation Studio

The Piano Roll is a professional MIDI editor with integrated AI generation capabilities.

#### Core Components:
- **Grid Area**: Visual representation of MIDI notes on a time/pitch grid
- **Piano Keyboard**: Left sidebar showing note names and keys
- **Timeline**: Top bar showing measure markers and time positions
- **AI Toolbar**: Generation controls and parameter settings
- **Velocity Lane**: Bottom panel for editing note velocities

#### AI Generation Process:
```
1. Configure Parameters:
   - Temperature (creativity level)
   - Max Notes (quantity)
   - Note Duration (timing)
   - Velocity (dynamics)

2. Click Generate Button:
   - Validates loaded AI model
   - Ensures WebSocket connectivity
   - Sends generation request to backend

3. Backend Processing:
   - AI model processes request
   - Generates MIDI note data
   - Stores result with unique job ID

4. Frontend Polling:
   - Polls backend every second for completion
   - Monitors generation progress
   - Handles success/failure states

5. Note Conversion & Display:
   - Converts backend note format to frontend format
   - Replaces existing notes (no overlap)
   - Updates piano roll visualization
```

### **Note Format Conversion**

MuseCraft handles two different note formats:

#### Backend Format (MuseCraftEngine):
```json
{
  "pitch": 60,        // MIDI note number (0-127)
  "velocity": 90,     // Note dynamics (0-127)
  "start": 0.0,       // Start time in seconds
  "end": 0.32,        // End time in seconds
  "channel": 0        // MIDI channel
}
```

#### Frontend Format (Piano Roll):
```typescript
{
  id: "generated-timestamp-index",  // Unique identifier
  midi: 60,                         // MIDI note number
  start: 0.0,                       // Start position in beats
  duration: 0.32,                   // Duration in beats
  velocity: 90,                     // Note dynamics
  selected: false                   // Selection state
}
```

#### Conversion Logic:
- `pitch` → `midi`
- `start` (seconds) → `start` (beats using BPM conversion)
- `(end - start)` → `duration` (in beats)
- Add `id` and `selected` fields for frontend state management

## 📁 Project Structure

```
MuseCraft-V1/
├── src/
│   ├── renderer/                      # React Frontend
│   │   ├── App.tsx                   # Main App component with routing
│   │   ├── main.tsx                  # React root & app initialization
│   │   ├── globals.css               # Global styles & CSS variables
│   │   │
│   │   ├── components/               # React Components
│   │   │   ├── ui/                   # shadcn/ui Base Components
│   │   │   │   ├── button.tsx        # Customizable button variants
│   │   │   │   ├── card.tsx          # Card containers & layouts
│   │   │   │   ├── input.tsx         # Form input components
│   │   │   │   └── ...               # 20+ other UI components
│   │   │   │
│   │   │   ├── magicui/             # Magic UI Effects Library
│   │   │   │   ├── border-beam.tsx   # Animated border effects
│   │   │   │   ├── morphing-text.tsx # Text transformation animations
│   │   │   │   ├── ripple.tsx        # Ripple click effects
│   │   │   │   └── ...               # Many more effect components
│   │   │   │
│   │   │   ├── pages/                # Page Components
│   │   │   │   ├── ai-setup/         # AI Model Management
│   │   │   │   │   ├── page.tsx      # Main AI setup interface
│   │   │   │   │   ├── components/   # AI-specific UI components
│   │   │   │   │   ├── services/     # WebSocket & API services
│   │   │   │   │   │   └── websocket.service.ts # Real-time updates
│   │   │   │   │   └── stores/       # Zustand state management
│   │   │   │   │       └── ai-setup.store.ts   # AI model state
│   │   │   │   │
│   │   │   │   ├── piano-roll/       # MIDI Editor & Generation
│   │   │   │   │   ├── page.tsx      # Main piano roll interface
│   │   │   │   │   ├── components/   # Piano roll UI components
│   │   │   │   │   │   ├── grid-area.tsx       # Note visualization grid
│   │   │   │   │   │   ├── piano-keyboard.tsx  # Left piano keys
│   │   │   │   │   │   ├── timeline.tsx        # Top timeline ruler
│   │   │   │   │   │   └── ai-toolbar.tsx      # Generation controls
│   │   │   │   │   ├── logic/        # Business logic
│   │   │   │   │   │   ├── ai-generation-state.ts # AI integration
│   │   │   │   │   │   └── piano-roll-state.ts    # MIDI editor state
│   │   │   │   │   └── types/        # TypeScript definitions
│   │   │   │   │       └── midi.types.ts # MIDI note interfaces
│   │   │   │   │
│   │   │   │   ├── main-dashboard/   # App dashboard layout
│   │   │   │   └── quantum-landing/  # Welcome landing page
│   │   │   │
│   │   │   └── layout/               # Layout Components
│   │   │       ├── app-sidebar.tsx   # Collapsible navigation
│   │   │       ├── page-header.tsx   # Consistent page headers
│   │   │       └── breadcrumb.tsx    # Navigation breadcrumbs
│   │   │
│   │   └── lib/                      # Utilities & Configuration
│   │       ├── utils.ts              # Helper functions & utilities
│   │       └── electron-router-dom.ts # Electron-specific routing
│   │
│   ├── lib/                          # Shared Utilities
│   │   ├── electron-app/             # Electron-specific utilities
│   │   ├── utils.ts                  # General helper functions
│   │   └── electron-router-dom.ts    # Routing for Electron
│   │
│   ├── shared/                       # Cross-process shared code
│   │   ├── types/                    # Common TypeScript definitions
│   │   └── constants/                # App-wide constants
│   │
│   └── resources/                    # Static Assets
│       └── public/                   # Images, icons, fonts
│
├── engine-test/                      # Backend Testing Scripts
│   ├── simple_test.py               # Python test for AI generation
│   └── test-results.json           # Test output results
│
├── scripts/                         # Build and utility scripts
├── package.json                     # Dependencies & scripts
├── electron.vite.config.ts          # Vite configuration for Electron
├── electron-builder.ts             # App packaging configuration
├── biome.json                       # Code formatting & linting rules
├── components.json                  # shadcn/ui configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This comprehensive guide
```

## 🛠️ Customization Guide

### 🎨 Branding Your App

1. **Update App Information**
   ```json
   // package.json
   {
     "displayName": "My Awesome App",
     "name": "my-awesome-app",
     "description": "Description of my app"
   }
   ```

2. **Customize Landing Page**
   ```tsx
   // src/renderer/components/pages/quantum-landing/quantum-landing.tsx
   
   // Update the title and description
   <h1>My App Title</h1>
   <h2>My App Subtitle</h2>
   <p>Your custom description here...</p>
   ```

3. **Update Title Bar and Sidebar**
   ```tsx
   // src/renderer/components/layout/app-layout/app-layout.tsx
   <TitleBar title="My App" />
   
   // src/renderer/components/layout/sidebar/sidebar.tsx  
   <h1>My App</h1>
   ```

### 🎯 Adding New Features

1. **Create a New Page**
   ```bash
   mkdir src/renderer/components/pages/my-feature
   ```

   ```tsx
   // src/renderer/components/pages/my-feature/my-feature.tsx
   import React from 'react';
   import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
   import { Button } from '../../ui/button';
   import { BorderBeam } from '../../magicui/border-beam';

   export function MyFeature() {
     return (
       <div className="p-6">
         <Card className="relative max-w-md mx-auto">
           <CardHeader>
             <CardTitle>My New Feature</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground mb-4">
               This is my awesome new feature!
             </p>
             <Button className="w-full">Get Started</Button>
           </CardContent>
           <BorderBeam size={250} duration={12} delay={9} />
         </Card>
       </div>
     );
   }
   ```

2. **Add Route**
   ```tsx
   // src/renderer/routes.tsx
   import { MyFeature } from './components/pages/my-feature/my-feature';

   // Add to your routes:
   <Route path="/my-feature" element={
     <AppLayout>
       <MyFeature />
     </AppLayout>
   } />
   ```

3. **Add Navigation**
   ```tsx
   // src/renderer/components/layout/sidebar/sidebar.tsx
   import { Star } from 'lucide-react';

   const navigationItems = [
     // ... existing items
     {
       id: 'my-feature',
       label: 'My Feature',
       icon: Star,
       path: '/my-feature',
     },
   ];
   ```

## 🎨 UI Components Guide

### shadcn/ui Components
```tsx
import { Button, Card, Input, Badge } from '../ui';

<Button variant="default" size="lg">Click Me</Button>
<Card className="p-4">Card Content</Card>
<Input placeholder="Enter text..." />
<Badge variant="secondary">New</Badge>
```

### Magic UI Components
```tsx
import { BorderBeam, MorphingText, Ripple } from '../magicui';

// Animated border
<div className="relative">
  <Card>Content</Card>
  <BorderBeam size={250} duration={12} />
</div>

// Text morphing animation
<MorphingText texts={["Hello", "World", "My App"]} />

// Ripple background effect
<div className="relative">
  <Ripple />
  <YourContent />
</div>
```

### Layout Components
```tsx
import { AppLayout } from '../layout/app-layout/app-layout';
import { TitleBar } from '../layout/title-bar/title-bar';

// Full app layout with sidebar
<AppLayout>
  <YourPageContent />
</AppLayout>

// Custom title bar
<TitleBar title="My App" />
```

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build and package the app for distribution |
| `pnpm start` | Start production build preview |
| `pnpm lint` | Run Biome linter |
| `pnpm lint:fix` | Fix linting issues automatically |
| `pnpm clean:dev` | Clear development cache |

## 🎯 Build & Distribution

### Development Build
```bash
pnpm compile:app    # Compile without packaging
pnpm dev           # Start development with hot reload
```

### Production Build
```bash
pnpm build         # Build and package app
```

### Customize Build
Edit `electron-builder.ts` to customize:
- App metadata (name, description, author)
- Package formats (Windows, macOS, Linux)
- Code signing certificates
- Auto-updater configuration

## 🔧 Advanced Configuration

### Custom IPC Handlers
```typescript
// src/main/index.ts
ipcMain.handle('my-custom-action', async (event, data) => {
  // Your custom logic here
  return { success: true, result: data };
});

// src/preload/index.ts
contextBridge.exposeInMainWorld('myAPI', {
  performAction: (data: any) => ipcRenderer.invoke('my-custom-action', data),
});
```

### Adding Dependencies
```bash
pnpm add your-package

# For main process dependencies
# Import in src/main/index.ts

# For renderer dependencies  
# Import in your React components
```

### State Management
```tsx
// Create a new Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyStore {
  data: string[];
  addData: (item: string) => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      data: [],
      addData: (item) => set((state) => ({ 
        data: [...state.data, item] 
      })),
    }),
    { name: 'my-storage' }
  )
);
```

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Build fails with module not found** | `pnpm install && pnpm run clean:dev` |
| **Hot reload not working** | `pnpm run clean:dev && pnpm dev` |
| **UI components not displaying** | Check Tailwind CSS imports in `globals.css` |
| **TypeScript errors** | Ensure all imports have proper types |
| **Electron app won't start** | Verify main process builds correctly |

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Try clearing the development cache
4. Check if your Node.js version is 18+

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/electron-app-template.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes & Test**
   ```bash
   pnpm dev  # Test your changes
   pnpm lint # Ensure code quality
   ```

4. **Submit Pull Request**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🌟 Show Your Support

If this template helped you, please consider:
- ⭐ **Star this repository**
- 🐛 **Report bugs**
- 💡 **Request features** 
- 🤝 **Contribute improvements**

## 🙏 Credits

This template builds upon amazing open-source projects:

- **[Electron](https://electronjs.org/)** - Build cross-platform desktop apps
- **[React 19](https://react.dev/)** - Modern UI library
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Framer Motion](https://framer.com/motion/)** - Smooth animations
- **[Zustand](https://zustand.surge.sh/)** - Lightweight state management
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter

---

<div align="center">

**🚀 Ready to build something amazing?**

[Use This Template](https://github.com/yourusername/electron-app-template/generate) · 
[Report Bug](https://github.com/yourusername/electron-app-template/issues) · 
[Request Feature](https://github.com/yourusername/electron-app-template/issues)

**Happy Coding! 💻✨**

</div>