# 🎵 MuseCraft - AI MIDI Generation Studio

<div align="center">

![MuseCraft Logo](src/resources/icon.png)

**Professional AI-Powered MIDI Generation Desktop Application**

🎹 **Create beautiful MIDI compositions with AI assistance**

[![License](https://img.shields.io/badge/license-PVT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-37.3.1-blue.svg)](https://electronjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)

**📋 For complete technical documentation, development guide, and architecture details, see [`docs/technical.md`](docs/technical.md)**

</div>

## 🎯 What is MuseCraft?

MuseCraft is a professional desktop application built with **Electron, React 19, and TypeScript** that combines the power of AI with intuitive MIDI composition tools. It provides a seamless workflow from AI model management to professional MIDI editing, all connected through real-time WebSocket communication with the MuseCraftEngine backend.

### 🏗️ Core Architecture
- **Frontend**: React 19 + TypeScript with Zustand state management  
- **Desktop Platform**: Electron with secure IPC communication
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **Backend Integration**: REST API + WebSocket for real-time AI model communication
- **Audio Engine**: Tone.js for MIDI playback and preview

## ✨ Key Features

### 🤖 AI Model Management
- **Dynamic Model Loading**: Load and unload AI models on demand via AI Setup page
- **Real-time Status Monitoring**: Live WebSocket updates for model status and system health
- **Backend Connection Testing**: Verify connectivity to MuseCraftEngine before generation
- **Multiple Model Support**: Manage different AI models for various musical styles

### 🎹 Professional Piano Roll Editor  
- **Canvas-based Rendering**: Hardware-accelerated grid visualization for performance
- **Integrated AI Toolbar**: Generate notes directly within the editing interface
- **Velocity Lane Editing**: Fine-tune note dynamics with visual velocity controls
- **Real-time Playback**: Instant MIDI preview with Tone.js audio engine
- **MIDI File Support**: Drag & drop MIDI files for editing and enhancement

### 🔄 Advanced Workflow
- **Synchronized Scrolling**: Timeline, keyboard, and grid areas scroll in perfect sync
- **AI Parameter Control**: Adjust creativity, note count, and musical style in real-time
- **WebSocket Integration**: Live generation progress and completion notifications
- **State Management**: Zustand-powered state for reliable data flow across components

## 📸 App Preview

### 🌟 Landing Page
Experience MuseCraft's beautiful welcome interface with smooth animations and modern design.

![Landing Page](preview/landing-page.png)

### 📊 Dashboard
Your creative hub with quick access to all features and project management.

![Dashboard](preview/dashboard.png)

### 🤖 AI Setup
Easy AI model management with real-time status monitoring and intuitive controls.

![AI Setup](preview/aisetup.png)

### 🎼 Piano Roll Studio
Professional MIDI editor where the magic happens - create, edit, and generate music.

![Musical Configuration](preview/musicalconfig.png)

### 🎚️ Advanced Controls
Fine-tune your compositions with velocity lanes and detailed note editing.

![Velocity & Notes](preview/velocity&notes.png)

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and **pnpm** (recommended) or npm
- **MuseCraftEngine Backend** running on `http://localhost:8899`
- **Git** for cloning the repository

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/WebChatAppAi/MuseCraft-Studio.git
cd MuseCraft-Studio

# 2. Install dependencies  
pnpm install
# or: npm install --legacy-peer-deps

# 3. Start the application
pnpm dev
```

### First-Time Application Setup

#### Step 1: Launch MuseCraft
The application opens to the **Quantum Landing** page with a beautiful animated welcome interface.

#### Step 2: Navigate to AI Setup  
Click "AI Setup" in the sidebar to access the model management hub:
- **Test Backend Connection**: Verify MuseCraftEngine is running on localhost:8899
- **Discover Models**: Automatically scan for available AI models
- **Load Model**: Select and load your preferred model into memory  
- **Monitor Status**: Real-time WebSocket updates show model loading progress

#### Step 3: Access the Piano Roll Studio
Navigate to "Piano Roll" to enter the main composition workspace:
- **Grid Area**: Visual MIDI note representation with canvas-based rendering
- **Piano Keyboard**: Left sidebar with note names and octave navigation
- **Timeline**: Top ruler showing measures, beats, and time positions
- **AI Toolbar**: Right panel with generation controls and parameters
- **Velocity Lane**: Bottom area for editing note dynamics

#### Step 4: Generate Your First Composition
1. **Configure AI Parameters**: Set creativity level, note count, and musical style
2. **Click "Generate"**: AI creates notes based on your parameters
3. **Real-time Updates**: Watch generation progress via WebSocket notifications
4. **Edit Results**: Refine generated notes using the professional editor tools

## 🎵 How to Create Music

### Complete AI Generation Workflow
```
AI Setup Page → Load Model → Piano Roll → Generate → Edit → Export
```

### 1. **AI Model Preparation**
   - **Model Discovery**: Application automatically scans for available AI models
   - **Backend Verification**: Test connection to MuseCraftEngine on port 8899
   - **Model Loading**: Select and load models with real-time status updates via WebSocket
   - **Health Monitoring**: Continuous system status monitoring with error handling

### 2. **Professional MIDI Creation**
   - **AI Generation**: Configure parameters (creativity, note density, musical style)
   - **Real-time Feedback**: WebSocket notifications for generation progress
   - **Note Conversion**: Automatic backend ↔ frontend note format conversion
   - **Integration**: Generated notes seamlessly appear in the piano roll editor

### 3. **Advanced Editing & Refinement**
   - **Canvas-based Editor**: Hardware-accelerated rendering for smooth performance
   - **Synchronized Views**: Timeline, keyboard, and grid scroll together perfectly
   - **Velocity Control**: Visual velocity lane for dynamic expression editing
   - **MIDI I/O**: Drag & drop MIDI files, export compositions

### Technical Implementation Details
- **State Management**: Zustand stores manage AI generation, piano roll, and UI state
- **WebSocket Service**: Persistent connection for real-time model status and generation events
- **Note Synchronization**: Advanced scrolling and view synchronization across all UI components
- **Audio Engine**: Tone.js provides real-time MIDI playback and preview capabilities

## 🎨 Interface Guide

### Application Structure
- **Quantum Landing**: Animated welcome page with feature introduction
- **Main Dashboard**: System overview with metrics, activity feed, and status cards  
- **AI Setup**: Model management hub with connection testing and WebSocket monitoring
- **Piano Roll**: Professional MIDI editor with integrated AI generation

### Piano Roll Components (Main Workspace)
- **Grid Area** (Center): Canvas-based MIDI note visualization with hardware acceleration
- **Piano Keyboard** (Left): Visual key reference with note names and octave indicators
- **Timeline** (Top): Measure markers, beat divisions, and time position tracking
- **AI Toolbar** (Right): Generation controls with real-time parameter adjustment
- **Velocity Lane** (Bottom): Visual velocity editing with synchronized note selection
- **Unified Player Head**: Synchronized playback indicator across all timeline components

### AI Setup Interface
- **Connection Status**: Real-time backend connectivity with WebSocket indicators
- **System Status Card**: Live system health monitoring and performance metrics
- **Models Grid**: Available AI models with load/unload controls and status badges
- **Settings Dialog**: Backend configuration and connection parameters

### Navigation & Layout
- **Sidebar Navigation**: Quick access to all major application sections
- **Title Bar**: Custom Electron title bar with window controls
- **Status Indicators**: Connection status, model status, and generation progress
- **Responsive Design**: Adaptive layout with consistent theming across all components

## 🎭 Use Cases

### 🎼 Composers
- Generate initial musical ideas and themes
- Explore new harmonic progressions
- Break through creative blocks

### 🎵 Producers
- Create backing tracks and accompaniments
- Generate rhythm patterns and bass lines
- Develop melodic hooks and riffs

### 🎹 Musicians
- Practice with AI-generated exercises
- Explore different musical styles
- Learn from AI-created patterns

### 🎓 Students
- Study music theory through AI examples
- Analyze generated compositions
- Experiment with different musical concepts

## 🏆 Why Choose MuseCraft?

### Technical Excellence
- **🚀 Modern Architecture**: Built with React 19, TypeScript, and Electron for reliability
- **⚡ High Performance**: Canvas-based rendering and hardware acceleration for smooth editing
- **🔄 Real-time Communication**: WebSocket integration for live updates and status monitoring
- **🎯 Professional Tools**: Industry-standard MIDI editing with advanced features

### AI Integration
- **🤖 Local AI Models**: Direct integration with MuseCraftEngine for secure, local processing
- **📊 Live Feedback**: Real-time generation progress and model status updates
- **🎵 Seamless Workflow**: AI generation integrated directly into the professional editor
- **🔧 Flexible Parameters**: Fine-tune creativity, style, and note density for perfect results

### User Experience  
- **🎨 Beautiful Interface**: shadcn/ui components with consistent design language
- **🌙 Professional Theme**: Dark theme optimized for long creative sessions
- **🖱️ Enhanced Interactions**: Mouse wheel controls, keyboard shortcuts, drag & drop
- **📱 Responsive Design**: Adaptive layout that works across different screen sizes

### Developer-Friendly
- **🔍 Type Safety**: Full TypeScript implementation with strict type checking
- **🧪 Modern Tooling**: Vite build system, Biome linting, and hot reload development
- **📚 Comprehensive Docs**: Detailed technical documentation and architecture guides
- **🔌 Extensible**: Modular component architecture for easy customization and extension

## 🎉 Ready to Create?

Download MuseCraft and start your musical journey today. Whether you're a seasoned professional or just starting out, MuseCraft provides the tools and AI assistance you need to create amazing music.

---

<div align="center">

### 📚 Documentation & Resources

**📋 [Technical Documentation](docs/technical.md)** - Complete development guide, architecture details, and API reference

**🛠️ [Contributing Guide](docs/technical.md#🤝-contributing)** - How to contribute to MuseCraft development

**🔧 [Project Structure](docs/technical.md#📁-project-structure)** - Detailed codebase organization and component hierarchy

---

**🎵 Start creating beautiful music with AI assistance! 🎹✨**

</div>