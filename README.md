<div align="center">

# 🎵 MuseCraft Studio - AI MIDI Generation Desktop App

![MuseCraft Logo](src/resources/icon.png)

**🎹 Professional AI-Powered MIDI Generation Desktop Application**

[![License](https://img.shields.io/badge/license-Non--Commercial-red?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-37.3.1-blue.svg?style=for-the-badge&logo=electron)](https://electronjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19.0.0-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)

**Create beautiful MIDI compositions with AI assistance**

</div>

---

<div align="center">

## 🎯 What is MuseCraft Studio?

**🎼 The Next Generation of AI Music Creation**

MuseCraft Studio is a professional desktop application built with **Electron, React 19, and TypeScript** that combines AI music generation with intuitive MIDI editing. It provides a seamless workflow from AI model management to professional MIDI composition.

</div>

---

<div align="center">

## ✨ Key Features

🎹 **Modern Piano Roll Editor** with canvas-based rendering and smooth interactions

🤖 **AI-Powered Generation** with real-time WebSocket updates and progress tracking

🎛️ **Professional Parameter Controls** for fine-tuned musical expression

⚡ **Real-Time Playback** synced perfectly with MIDI timeline

📤 **High-Quality MIDI Export** with embedded velocity and pitch data

🌐 **Cross-Platform Support** for Windows, Linux, and macOS

🔧 **Model Management Hub** with automatic discovery and loading

🎨 **Beautiful UI/UX** with animated interfaces and modern design

</div>

---

<div align="center">

## 🚀 Quick Installation Guide

</div>

<div align="center">

### 🪟 Direct Windows Download (Portable)

**🎯 No Installation Required - Just Download & Run!**

<a href="https://github.com/WebChatAppAi/MuseCraft-Studio/releases/download/v1.0.0/musecraft-app-v1.0.0-win.exe">
<img src="https://img.shields.io/badge/-DOWNLOAD%20WINDOWS%20EXE-blue?style=for-the-badge&logo=windows&logoColor=white" alt="Download Windows"/>
</a>

<a href="https://github.com/WebChatAppAi/MuseCraft-Studio/releases/latest">
<img src="https://img.shields.io/badge/-VIEW%20ALL%20RELEASES-green?style=for-the-badge&logo=github&logoColor=white" alt="All Releases"/>
</a>

**Note**: The desktop app runs without installation, but AI features require the MuseCraftEngine backend running locally.

</div>

---

<div align="center">

### ⚠️ IMPORTANT: Setup MuseCraftEngine First

**🚨 Critical Requirement for AI Features**

Before using MuseCraft Studio's AI features, you **MUST** set up and run the MuseCraftEngine backend

<a href="https://github.com/WebChatAppAi/MuseCraftEngine">
<img src="https://img.shields.io/badge/-GET%20MUSECRAFTENGINE-purple?style=for-the-badge&logo=github&logoColor=white" alt="MuseCraftEngine Repository"/>
</a>

</div>

#### Quick Engine Setup:
```bash
# 1. Clone the engine
git clone https://github.com/WebChatAppAi/MuseCraftEngine.git
cd MuseCraftEngine

# 2. Install PyTorch for your system (CUDA/CPU/MPS)
# NVIDIA GPU: pip install torch --index-url https://download.pytorch.org/whl/cu118
# Apple Silicon: pip install torch
# CPU Only: pip install torch --index-url https://download.pytorch.org/whl/cpu

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download AI models from HuggingFace
# Visit: https://huggingface.co/projectlosangeles/MuseCraft/tree/main
# Download .pth files and place them in: ./data/models/

# 5. Start the engine
python main.py
```

<div align="center">

**✅ Verify engine is running**: Visit [http://localhost:8899/docs](http://localhost:8899/docs)

</div>

---

<div align="center">

### 💻 Studio Installation

</div>

**Prerequisites**
- **Node.js 18+** and **pnpm** (recommended) or npm
- **MuseCraftEngine Backend** running on `http://localhost:8899` ⬆️
- **Git** for cloning the repository

**Install and Run Studio**

```bash
# 1. Clone the repository
git clone https://github.com/WebChatAppAi/MuseCraft-Studio.git
cd MuseCraft-Studio

# 2. Install dependencies  
pnpm install
# or: npm install --legacy-peer-deps

# 3. Start the application (ensure engine is running on localhost:8899)
pnpm dev
```

---

<div align="center">

## 🎼 Piano Roll Studio Preview

<img src="preview/musicalconfig.png" alt="Piano Roll Studio" width="85%" style="border-radius:12px;box-shadow:0 4px 24px #0002;"/>

*The main creative workspace where AI meets professional MIDI editing*

</div>

---

<div align="center">

## 🎵 First-Time Setup Guide

</div>

<div align="center">

### 🚨 Step 0: CRITICAL - Ensure Backend is Ready

**Before launching MuseCraft Studio, you MUST have:**

</div>

1. ✅ **MuseCraftEngine running** on http://localhost:8899
2. ✅ **AI models downloaded** from [HuggingFace](https://huggingface.co/projectlosangeles/MuseCraft/tree/main)
3. ✅ **Models placed** in `MuseCraftEngine/data/models/` directory

<div align="center">

**⚠️ Without the engine, AI features will not work!**

</div>

### 🌟 Step 1: Launch MuseCraft Studio
The application opens to the **Quantum Landing** page with a beautiful animated welcome interface.

### 🤖 Step 2: Navigate to AI Setup
Click "AI Setup" in the sidebar to access the model management hub:
- **Test Backend Connection**: Verify MuseCraftEngine is running on localhost:8899
- **Discover Models**: Automatically scan for available AI models from your engine
- **Load Model**: Select and load your preferred model into memory  
- **Monitor Status**: Real-time WebSocket updates show model loading progress

### 🎹 Step 3: Access the Piano Roll Studio
Navigate to "Piano Roll" to enter the main composition workspace:
- **Grid Area**: Visual MIDI note representation with canvas-based rendering
- **Piano Keyboard**: Left sidebar with note names and octave navigation
- **Timeline**: Top ruler showing measures, beats, and time positions
- **AI Toolbar**: Right panel with generation controls and parameters
- **Velocity Lane**: Bottom area for editing note dynamics

### 🎼 Step 4: Generate Your First Composition
1. **Configure AI Parameters**: Set creativity level, note count, and musical style
2. **Click "Generate"**: AI creates notes based on your parameters
3. **Real-time Updates**: Watch generation progress via WebSocket notifications
4. **Edit Results**: Refine generated notes using the professional editor tools

---

<div align="center">

## 🎭 Use Cases

### 🎼 For Composers
- Generate initial musical ideas and themes
- Explore new harmonic progressions  
- Break through creative blocks

### 🎵 For Producers
- Create backing tracks and accompaniments
- Generate rhythm patterns and bass lines
- Develop melodic hooks and riffs

### 🎹 For Musicians
- Practice with AI-generated exercises
- Explore different musical styles
- Learn from AI-created patterns

### 🎓 For Students
- Study music theory through AI examples
- Analyze generated compositions
- Experiment with different musical concepts

</div>

---

<div align="center">

## 📚 Documentation

</div>

<div align="center">

### 🔗 Required Components

</div>

- **🚀 [MuseCraftEngine](https://github.com/WebChatAppAi/MuseCraftEngine)** - AI backend server (REQUIRED for AI features)
- **🤖 [AI Models](https://huggingface.co/projectlosangeles/MuseCraft/tree/main)** - Pre-trained models from HuggingFace

<div align="center">

### 📖 Documentation Links

</div>

- **📘 [Complete Usage Guide](docs/usage-guide.md)** - Detailed interface guide and creative workflows
- **📋 [Technical Documentation](docs/technical.md)** - Architecture details and API reference
- **🛠️ [Contributing Guide](docs/technical.md#🤝-contributing)** - How to contribute to MuseCraft development

<div align="center">

### ⚠️ Setup Reminder

**Remember: MuseCraft Studio is the frontend interface**

**For AI music generation, you need:**

</div>

1. 🔧 **MuseCraftEngine** running on localhost:8899
2. 📥 **AI models** downloaded and placed in engine's data/models/ folder
3. ✅ **Connection verified** through Studio's AI Setup page

---

<div align="center">

## 🌟 Community & Support

**🎹 Join the MuseCraft Community**

Share your creations with `#MuseCraftStudio` on social media!

Featured compositions get highlighted in our [🌟 Showcase Wiki](https://github.com/WebChatAppAi/MuseCraft-Studio/wiki/Showcase)

<a href="https://github.com/WebChatAppAi/MuseCraft-Studio/discussions">
<img alt="GitHub Discussions" src="https://img.shields.io/github/discussions/WebChatAppAi/MuseCraft-Studio?style=for-the-badge&logo=github-discussions&logoColor=white&label=Discussions&color=purple"/>
</a>

</div>

---

<div align="center">

## 🧠 Want to Contribute?

**🚀 Help Shape the Future of AI Music Creation**

</div>

- 📖 Read the technical guide: [docs/technical.md](docs/technical.md)  
- 🔧 Explore the modern TypeScript architecture and React 19 components  
- 🍴 Fork → 🛠️ Build features → 📬 Open a Pull Request  
- 🎨 Design new UI components or enhance existing workflows
- 🤖 Contribute to AI model integrations and generation algorithms

---

<div align="center">

## 📄 License

**Non-Commercial Software License © [Jonas](https://github.com/WebChatAppAi)**

This project is licensed under a custom Non-Commercial Software License. See the [LICENSE](LICENSE) file in the root directory for complete license details.

### Key License Terms:

</div>

- ✅ **Personal Use**: You may use and modify this software for personal and non-commercial purposes
- ❌ **Commercial Restriction**: Commercial use is strictly prohibited without explicit permission from Jonas
- 📧 **Distribution Notice**: You must notify the copyright holder of any distribution or modification
- 🔄 **Related Projects**: This license also applies to the MuseCraftEngine backend and related components

<div align="center">

*🏛️ **Note:** This software inherits the same licensing terms as the original MIDI Gen project*

</div>

---

<div align="center">

## 🎵 Start Your AI Music Journey Today!

**🎹✨ MuseCraft Studio - Where AI meets professional music production**

<a href="https://github.com/WebChatAppAi/MuseCraft-Studio/releases">
<img src="https://img.shields.io/badge/-DOWNLOAD%20NOW-success?style=for-the-badge&logo=download&logoColor=white" alt="Download Now"/>
</a>

*Made with ❤️ for the AI music community*

</div>
```
7. **Improved Readability**: Better structure makes it easier to scan and read

The README now has consistent alignment, professional structure, and attractive visual presentation throughout!
