# 🎵 MuseCraft V2 - AI-Powered MIDI Generation Studio

<div align="center">

![MuseCraft Logo](src/resources/public/illustration.svg)

**Professional Desktop Application for AI-Powered MIDI Composition**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)  
[![Electron](https://img.shields.io/badge/electron-37.2.5-blue.svg)](https://electronjs.org/)  
[![TypeScript](https://img.shields.io/badge/typescript-5.1.6-blue.svg)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)

🎹 **Create beautiful MIDI compositions with AI assistance**

</div>

## 🎯 What is MuseCraft?

MuseCraft is a professional desktop application that combines the power of AI with intuitive MIDI composition tools. Built with modern web technologies and packaged as an Electron app, it provides musicians, producers, and composers with a seamless experience for generating, editing, and refining MIDI compositions using AI models.

### ✨ **Key Features**
- 🤖 **AI-Powered MIDI Generation**: Generate musical notes using local AI models
- 🎹 **Professional Piano Roll Editor**: Full-featured MIDI editor with note editing, velocity control, and timing precision
- 🔄 **Real-time Model Management**: Load, unload, and manage multiple AI models with live status monitoring
- 📊 **Live Generation Feedback**: Real-time progress updates via WebSocket integration
- 🎨 **Modern UI/UX**: Beautiful, responsive interface built with shadcn/ui and Tailwind CSS
- 🖱️ **Enhanced Interactions**: Mouse wheel slider control, keyboard shortcuts, drag & drop MIDI files
- 🌙 **Dark Theme**: Professional dark theme optimized for long working sessions

---

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: React 19 + TypeScript + Zustand state management
- **Desktop Platform**: Electron 37 with secure IPC communication
- **UI Framework**: shadcn/ui components + Tailwind CSS 4.0
- **Animations**: Framer Motion + Magic UI effects
- **Audio**: Tone.js for MIDI playback and preview
- **Backend Integration**: REST API + WebSocket communication with MuseCraftEngine

### **Multi-Process Architecture**
```
┌─ Main Process ────────────────────────────────────────┐
│ • App lifecycle management                            │
│ • Window creation and management                      │
│ • IPC handlers (minimize, maximize, close)           │
└────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─ Preload Script ──────────────────────────────────────┐
│ • Secure bridge between main and renderer            │
│ • Context isolation for security                     │
│ • Exposed APIs (electronAPI)                         │
└────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─ Renderer Process ────────────────────────────────────┐
│ • React application (src/renderer/)                  │
│ • UI components and business logic                   │
│ • State management with Zustand                      │
└────────────────────────────────────────────────────────┘
```

---

## 📁 **Project Structure & Components**

### **Root Level Structure**
```
MuseCraft-V1/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # IPC bridge
│   ├── renderer/       # React frontend application
│   ├── shared/         # Cross-process utilities
│   └── resources/      # Static assets
├── engine-test/        # Backend testing scripts
├── scripts/           # Build and utility scripts
└── [config files]     # TypeScript, Electron, build configs
```

### **Main Process (`src/main/`)**
- **`index.ts`**: Entry point, app lifecycle management
- **`windows/main.ts`**: Main window configuration
- **IPC Handlers**: Window controls (minimize, maximize, close)

### **Renderer Process (`src/renderer/`)**

#### **🎯 Core Application Files**
- **`index.tsx`**: React root, audio system initialization
- **`routes.tsx`**: Application routing with electron-router-dom
- **`globals.css`**: Global styles, CSS variables, theme definitions

#### **🎹 Pages & Features**

##### **AI Setup Page** (`src/renderer/components/pages/ai-setup/`)
**Purpose**: Manage AI models and backend connectivity

**Components:**
- **`page.tsx`**: Main AI setup interface with connection testing
- **`components/`**:
  - `connection-status.tsx` - Backend connection indicator with BorderBeam
  - `model-card.tsx` - Individual model display with load/unload actions
  - `models-grid.tsx` - Grid layout for available models
  - `system-status-card.tsx` - Hardware and system information display
  - `settings-dialog.tsx` - Backend configuration modal

**Logic & State:**
- **`logic/ai-setup-state.ts`**: Zustand store for AI model management
  - Model loading/unloading with optimistic UI updates
  - Connection testing and error handling
  - WebSocket connection management

**Services:**
- **`services/ai-models.api.ts`**: REST API calls for model operations
- **`services/websocket.service.ts`**: Real-time updates and notifications
  - Model status changes
  - Generation event handling
  - Piano roll integration callbacks

##### **Piano Roll Page** (`src/renderer/components/pages/piano-roll/`)**
**Purpose**: Professional MIDI editor with AI generation capabilities

**Main Components:**

**`page.tsx`** - Main coordinator component that:
- Manages note state and playback
- Coordinates scroll synchronization between areas
- Handles MIDI file drag & drop
- Integrates AI generation with piano roll

**Core UI Components:**
- **`components/toolbar-area.tsx`** - Integrated main toolbar with:
  - Tool selection (Select, Draw)
  - Playback controls (Play, Stop)
  - BPM slider with mouse wheel support
  - Lane visibility toggles
  - **AI Model indicator** (when loaded)
  - **AI Generate button** with emerald glow effect
  - **AI Parameters dropdown** with advanced settings

- **`components/grid-area.tsx`** - Hardware-accelerated piano roll grid:
  - Canvas-based rendering for performance
  - Note visualization and editing
  - Zebra pattern for piano keys
  - Dynamic grid sizing based on content

- **`components/keyboard-area.tsx`** - Piano keyboard sidebar:
  - Visual piano keys with proper labeling
  - Key press preview functionality
  - Vertical scroll synchronization

- **`components/timeline-area.tsx`** - Timeline ruler:
  - Measure and beat markers
  - Horizontal scroll synchronization
  - Mouse wheel support for scrolling

- **`components/velocity-area.tsx`** - Velocity editing lane:
  - Note velocity visualization
  - Interactive velocity adjustment
  - Synchronized with main grid

- **`components/player-head.tsx`** - Playback position indicator:
  - Real-time position tracking
  - Visual playback feedback

**Business Logic:**
- **`logic/ai-generation-state.ts`** - AI generation management:
  - Generation parameters (temperature, max notes, duration, velocity)
  - Model selection and validation
  - Generation progress tracking
  - Note format conversion (backend ↔ frontend)
  - Generation history

- **`logic/playback-controls.ts`** - Audio playback system:
  - Tone.js integration
  - Play/pause/stop functionality
  - BPM control and timing

- **`logic/note-editing.ts`** - Note manipulation logic:
  - Note creation, editing, deletion
  - Selection management
  - Resize and move operations

**Services:**
- **`services/ai-generation.api.ts`** - AI generation API calls:
  - Generation requests to MuseCraftEngine
  - Job status polling
  - Result retrieval and processing

**Types:**
- **`types/midi.types.ts`** - TypeScript definitions for MIDI data structures

##### **Other Pages**
- **`main-dashboard/`**: Application dashboard and overview
- **`quantum-landing/`**: Welcome page with WebGL effects

#### **🎨 UI Components (`src/renderer/components/ui/`)**
**shadcn/ui Base Components** - Professional UI primitives:

**Core Components:**
- **`button.tsx`** - Versatile button with variants and states
- **`slider.tsx`** - **Enhanced with mouse wheel support**:
  - Smooth value changes with `parseFloat()`
  - Mouse wheel scroll to adjust values
  - Non-passive event listeners for proper `preventDefault()`
  - Theme-aware styling with CSS variables
- **`dropdown-menu.tsx`** - **Fixed for dark theme**:
  - Wrapped in dark context for proper theming
  - Portal rendering with theme inheritance
  - Event handling for complex interactions
- **`switch.tsx`** - Toggle component for boolean settings
- **`card.tsx`** - Container component with proper styling
- **`input.tsx`** - Form input with consistent theming
- **`label.tsx`** - Accessible form labels

**Additional UI:**
- **`custom-scroll-area.tsx`** - Advanced scrolling with synchronization
- **`toast.tsx`** - Notification system

#### **✨ Magic UI Components (`src/renderer/components/magicui/`)**
**Animated Effects Library:**
- **`border-beam.tsx`** - Animated border effects with configurable paths
- **`morphing-text.tsx`** - Text transformation animations
- **`ripple.tsx`** - Click ripple effects
- **`animated-list.tsx`** - List animations with stagger

#### **🏗️ Layout Components (`src/renderer/components/layout/`)**
- **`app-layout/`** - Main application layout with sidebar integration
- **`sidebar/`** - Navigation sidebar with collapsible functionality
- **`title-bar/`** - Custom window title bar with controls

#### **🔧 Shared Components (`src/renderer/components/shared/`)**
- **`toast-listener/`** - Global toast notification handler
- **`route-tracker/`** - Navigation tracking
- **`background-effects/`** - Visual effects and animations

---

## 🔄 **Data Flow Architecture**

### **AI Model Management Flow**
```
AI Setup Page → WebSocket Connection → Model Status Updates
     ↓                    ↓                      ↓
Load/Unload Models → Backend API → Piano Roll Integration
     ↓                    ↓                      ↓
Optimistic UI → Real Status Sync → Generate Button State
```

### **AI Generation Workflow**
```
1. Piano Roll → Configure Parameters → Validate Model
              ↓
2. Generate Request → MuseCraftEngine Backend → Job Creation
              ↓
3. WebSocket Events → Progress Updates → Real-time UI
              ↓
4. REST API Polling → Completion Check → Result Retrieval
              ↓
5. Note Conversion → Frontend Format → Piano Roll Display
```

### **Note Format Conversion**

**Backend Format (MuseCraftEngine):**
```json
{
  "pitch": 60,        // MIDI note number (0-127)
  "velocity": 90,     // Note dynamics (0-127)
  "start": 0.0,       // Start time in seconds
  "end": 0.32,        // End time in seconds
  "channel": 0        // MIDI channel
}
```

**Frontend Format (Piano Roll):**
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

---

## 🔧 **Development Setup**

### **Prerequisites**
- **Node.js 18+**
- **pnpm** (recommended) or npm
- **MuseCraftEngine Backend** running on `localhost:8899`

### **Installation & Setup**
```bash
# Clone repository
git clone https://github.com/yourusername/MuseCraft-V1.git
cd MuseCraft-V1

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### **Available Scripts**
```bash
# Development
pnpm dev              # Start with hot reload
pnpm start            # Production preview

# Building
pnpm compile:app      # Compile without packaging
pnpm build            # Build and package with Electron Builder

# Code Quality
pnpm lint             # Run Biome linter
pnpm lint:fix         # Auto-fix linting issues

# Utilities
pnpm clean:dev        # Clear development cache
```

---

## 🎛️ **Key Features Implementation**

### **1. Enhanced Slider Component**
**Location**: `src/renderer/components/ui/slider.tsx`

**Features:**
- **Mouse wheel support**: Hover and scroll to change values
- **Smooth value handling**: Uses `parseFloat()` for precision
- **Non-passive events**: Proper `preventDefault()` for wheel events
- **Theme-aware styling**: CSS variables for light/dark themes

**Usage:**
```tsx
<Slider
  value={[temperature]}
  onValueChange={([value]) => setTemperature(value)}
  min={0.1}
  max={2.0}
  step={0.1}
/>
```

### **2. Dark Theme Dropdown Fix**
**Location**: `src/renderer/components/ui/dropdown-menu.tsx`

**Problem Solved**: Portal-rendered dropdowns not inheriting dark theme

**Solution:**
```tsx
<DropdownMenuPrimitive.Portal>
  <div className="dark">  {/* Force dark context */}
    <DropdownMenuContent>
      {/* Content properly themed */}
    </DropdownMenuContent>
  </div>
</DropdownMenuPrimitive.Portal>
```

### **3. Integrated AI Toolbar**
**Location**: `src/renderer/components/pages/piano-roll/components/toolbar-area.tsx`

**Features:**
- **Conditional rendering**: Only shows when AI model is loaded
- **Generate button**: Clean design with emerald glow effect
- **Parameters dropdown**: Advanced AI settings with working toggles
- **Model status indicator**: Shows loaded model with status badge

### **4. WebSocket Integration**
**Location**: `src/renderer/components/pages/ai-setup/services/websocket.service.ts`

**Features:**
- **Real-time model status updates**
- **Generation progress tracking**
- **Cross-component communication** via global callbacks
- **Automatic reconnection** with exponential backoff
- **Piano roll integration** for generation events

---

## 🔌 **Backend Integration**

### **REST API Endpoints**
```typescript
// Model Management
GET    /api/ai/models/local        // Get available models
GET    /api/ai/status              // Get system status
POST   /api/ai/models/:id/load     // Load model
POST   /api/ai/models/:id/unload   // Unload model

// AI Generation
POST   /api/ai/generate/local      // Start generation
GET    /api/ai/generation/:id      // Check generation status
POST   /api/ai/generation/:id/cancel  // Cancel generation

// System Information
GET    /api/settings/system        // Get system info
```

### **WebSocket Events**
```typescript
// Subscription
{ type: 'subscribe', subscriptions: ['model_status', 'generation'] }

// Model Events
{ type: 'model_status', event: 'loaded|unloaded', data: {...} }

// Generation Events
{ type: 'generation', event: 'started|progress|completed|failed', data: {...} }
```

---

## 🎨 **Styling System**

### **Design Tokens**
**Location**: `src/renderer/globals.css`

**CSS Variables:**
```css
.dark {
  --background: oklch(0.1 0 0);      /* Main background */
  --foreground: oklch(0.98 0 0);     /* Text color */
  --card: oklch(0.15 0 0);           /* Card backgrounds */
  --popover: oklch(0.15 0 0);        /* Dropdown backgrounds */
  --primary: oklch(0.6 0.15 180);    /* Cyan accent */
  --border: oklch(0.25 0 0);         /* Border color */
  --muted: oklch(0.25 0 0);          /* Muted backgrounds */
}
```

### **Component Styling Patterns**
```tsx
// Status Indicator (Connection/Generate Button)
className="px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 
          rounded-md dark:border-emerald-800 dark:text-emerald-400 
          dark:bg-emerald-950"

// Error State
className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-200 
          text-red-700 dark:border-red-800 dark:text-red-400"

// Glow Effect
className="shadow-emerald-500/20 shadow-lg hover:shadow-emerald-500/30 
          hover:shadow-xl transition-all"
```

---

## 🤝 **Contributing Guidelines**

### **Project Structure Conventions**
1. **Components**: One component per file, PascalCase naming
2. **Hooks**: Prefix with `use`, camelCase naming
3. **Types**: Suffix with `.types.ts`, descriptive interfaces
4. **Services**: Suffix with `.service.ts` or `.api.ts`
5. **Styles**: Use Tailwind utility classes, CSS variables for theming

### **Adding New Features**

#### **1. New UI Component**
```bash
# Location: src/renderer/components/ui/
# Pattern: component-name.tsx
# Include: TypeScript interface, forwardRef if needed
# Styling: Tailwind + CSS variables
```

#### **2. New Page**
```bash
# Location: src/renderer/components/pages/feature-name/
# Include: page.tsx, components/, logic/, services/, types/
# Add route to: src/renderer/routes.tsx
# Add navigation: src/renderer/components/layout/sidebar/
```

#### **3. New AI Feature**
```bash
# Backend API: Add to services/*.api.ts
# State Management: Create Zustand store in logic/
# WebSocket: Update websocket.service.ts
# UI Integration: Add to relevant page components
```

### **Code Quality Standards**
- **TypeScript**: Strict mode, no `any` types
- **Linting**: Biome for formatting and linting
- **Components**: Proper props interfaces and documentation
- **State**: Zustand for complex state, React state for UI-only
- **Styling**: Consistent with existing patterns

### **Testing Integration**
```bash
# Backend Testing
cd engine-test/
python simple_test.py  # Test AI generation API

# Frontend Testing (Manual)
pnpm dev               # Start development server
# Test AI Setup → Model Loading → Piano Roll → Generation
```

---

## 🚀 **Deployment & Building**

### **Development Build**
```bash
pnpm dev              # Hot reload development
```

### **Production Build**
```bash
pnpm prebuild         # Clean, compile, prepare release
pnpm build            # Package with Electron Builder
```

### **Release Management**
```bash
pnpm make:release     # Generate release with custom script
pnpm release          # Build and publish
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

**1. Backend Connection Failed**
- Ensure MuseCraftEngine is running on `localhost:8899`
- Check firewall/antivirus blocking connections
- Verify backend settings in AI Setup page

**2. Dropdown Not Themed**
- Check if `dark` class is applied to main app wrapper
- Verify CSS variables are loaded in `globals.css`

**3. Slider Mouse Wheel Not Working**
- Check browser console for passive event listener errors
- Ensure slider component has proper event handling

**4. AI Generation Stuck**
- Check WebSocket connection status
- Monitor backend logs for model loading issues
- Verify model compatibility with generation parameters

### **Debug Tools**
```javascript
// WebSocket Debug
window.wsService.isConnected()    // Check connection status
window.wsService.ping()           // Test connection

// AI Store Debug  
window.aiGenerationStore.getState()  // Check generation state
```

---

## 📋 **Roadmap & Future Features**

### **Planned Enhancements**
- 🎵 **MIDI Export/Import**: Full MIDI file support
- 🎛️ **Advanced Audio Effects**: Real-time audio processing
- 🔄 **Undo/Redo System**: Complete action history
- 🎹 **Virtual Instruments**: Built-in synthesizers
- 🤖 **More AI Models**: Support for additional model architectures
- 👥 **Collaboration Features**: Real-time collaborative editing
- ☁️ **Cloud Integration**: Remote model hosting and sharing

### **Technical Improvements**
- ⚡ **Performance Optimization**: Canvas rendering improvements
- 🧪 **Testing Suite**: Automated testing framework
- 📱 **Responsive Design**: Better scaling for different screen sizes
- 🔒 **Enhanced Security**: Improved IPC security
- 📊 **Analytics**: User behavior insights and optimization

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 **Contributors**

**Core Team:**
- **Lead Developer**: [Your Name]
- **AI Integration**: [Contributor Name]
- **UI/UX Design**: [Contributor Name]

**Contributing**: We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

---

<div align="center">

**Built with ❤️ using React, Electron, and AI**

[Website](https://your-website.com) • [Documentation](https://docs.your-website.com) • [Discord](https://discord.gg/your-server)

</div>