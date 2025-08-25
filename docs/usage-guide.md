# 🎵 MuseCraft Studio - Complete Usage Guide

## 🎯 Overview

MuseCraft Studio is your creative hub for AI-powered MIDI composition. This guide covers everything from your first launch to advanced music creation techniques.

## 🚀 First Launch Workflow

### 1. Welcome to Quantum Landing
When you first open MuseCraft Studio, you'll see the beautiful **Quantum Landing** page with animated particles and modern design.

**What you'll see:**
- Animated welcome interface
- Navigation sidebar on the left
- Quick access to main features

### 2. Navigate to AI Setup (CRITICAL FIRST STEP)

**⚠️ You MUST setup AI models before creating music!**

Click **"AI Setup"** in the sidebar to access the AI management hub.

## 🤖 AI Setup Page - Model Management

### Backend Connection Test
**Before anything else, test your backend connection:**

1. **Connection Status Indicator**: Look for the status at the top
   - 🟢 **Green**: MuseCraftEngine connected (good!)
   - 🔴 **Red**: Engine not running (fix required)
   
2. **Test Connection Button**: Click to verify connectivity
   - Success: Shows engine info and available models
   - Failure: Check that MuseCraftEngine is running on localhost:8899

### Model Discovery and Loading

**Available Models Section:**
- Shows all AI models discovered by the engine
- Models found in `MuseCraftEngine/data/models/` folder
- Each model shows: name, size, status (loaded/unloaded)

**Loading a Model:**
1. **Select Model**: Click on the model you want to use
2. **Click "Load"**: Model loading begins
3. **Real-time Progress**: Watch the loading progress via WebSocket
4. **Status Updates**: Model status changes from "Available" → "Loading" → "Loaded"

**Model Status Indicators:**
- 🔵 **Available**: Model file found, ready to load
- 🟡 **Loading**: Model is being loaded into memory
- 🟢 **Loaded**: Model ready for generation
- 🔴 **Error**: Problem loading model

### System Status Monitoring

**System Status Card** shows real-time information:
- **CPU Usage**: Current processor utilization
- **Memory Usage**: System RAM consumption
- **GPU Status**: Graphics card information (if available)
- **Engine Status**: Backend health and responsiveness

## 🎹 Piano Roll Studio - Main Creative Workspace

Once you have a model loaded, navigate to **"Piano Roll"** for music creation.

### Interface Layout

#### Grid Area (Center)
- **Visual MIDI Notes**: Notes displayed as rectangles
- **Canvas-based Rendering**: Smooth, hardware-accelerated display
- **Time Signature**: Shows measures and beats
- **Note Editing**: Click and drag to create/modify notes

#### Piano Keyboard (Left Sidebar)
- **Visual Key Reference**: Piano keys with note names
- **Octave Navigation**: Scroll to see different octaves
- **Key Highlighting**: Shows which keys have notes
- **Click to Play**: Preview individual notes (if audio enabled)

#### Timeline (Top)
- **Measure Markers**: Shows bars and beats
- **Time Position**: Current playback position
- **Unified Player Head**: Synchronized across all components
- **Tempo Display**: Shows BPM (beats per minute)

#### AI Toolbar (Right Sidebar)
**This is where the magic happens!**

**Generation Controls:**
- **Model Status**: Shows which model is loaded
- **Creativity Slider**: Controls randomness (0.1 = conservative, 1.0 = wild)
- **Note Count**: How many notes to generate (10-200)
- **Temperature**: AI "temperature" for generation style
- **Generate Button**: Start AI music generation

**Generation Parameters:**
- **Low Creativity (0.1-0.3)**: Predictable, structured melodies
- **Medium Creativity (0.4-0.7)**: Balanced, musical results
- **High Creativity (0.8-1.0)**: Experimental, unique patterns

#### Velocity Lane (Bottom)
- **Velocity Editing**: Control note loudness/intensity
- **Visual Velocity Bars**: Height shows velocity value
- **Synchronized Selection**: Matches notes in main grid
- **Drag to Adjust**: Change velocity values directly

### Creating Your First Composition

#### Step 1: Set Up Generation Parameters
1. **Check Model Status**: Ensure a model is loaded (green indicator)
2. **Set Creativity**: Start with 0.6 for balanced results
3. **Choose Note Count**: Begin with 30-50 notes
4. **Set Temperature**: 0.8 is a good starting point

#### Step 2: Generate AI Music
1. **Click "Generate"**: AI generation begins
2. **Real-time Progress**: Watch progress updates
3. **WebSocket Updates**: Live status from the engine
4. **Completion**: Notes appear in the piano roll

#### Step 3: Review and Edit Results
1. **Playback**: Use play controls to hear the result
2. **Note Editing**: Click notes to select/modify
3. **Velocity Adjustment**: Use velocity lane for dynamics
4. **Manual Editing**: Add, remove, or move notes as needed

### Advanced Editing Features

#### Note Manipulation
- **Select Notes**: Click to select individual notes
- **Multi-select**: Drag to select multiple notes
- **Move Notes**: Drag selected notes to new positions
- **Resize Notes**: Drag note edges to change duration
- **Delete Notes**: Select and press Delete key

#### Velocity Editing
- **Individual Control**: Click velocity bars to adjust
- **Smooth Curves**: Create velocity curves for expression
- **Batch Editing**: Select multiple notes, adjust together
- **Velocity Ranges**: 1-127 MIDI velocity range

#### Timeline Navigation
- **Zoom Controls**: Scroll to zoom in/out
- **Pan View**: Drag to move timeline view
- **Synchronized Scrolling**: All components scroll together
- **Playback Head**: Shows current position during playback

## 📊 Main Dashboard - Project Overview

The **Main Dashboard** provides an overview of your creative activity:

### Activity Feed
- Recent generation activity
- Model loading events
- System status updates
- Error notifications

### System Metrics
- Performance statistics
- Model usage history
- Generation success rates
- System resource utilization

### Quick Actions
- Jump to AI Setup
- Access Piano Roll
- View recent projects
- System diagnostics

## 🎨 Creative Workflows

### Workflow 1: Quick Melody Generation
1. **Load Model** → MuseCraft-v1 (general purpose)
2. **Set Parameters** → Creativity: 0.6, Notes: 40
3. **Generate** → Review result
4. **Refine** → Adjust notes manually
5. **Export** → Save as MIDI file

### Workflow 2: Piano Composition
1. **Load Model** → MuseCraft-Piano (if available)
2. **Set Parameters** → Creativity: 0.5, Notes: 60
3. **Generate** → Piano-focused result
4. **Edit Velocity** → Add expression and dynamics
5. **Layer Generation** → Generate additional parts

### Workflow 3: Experimental Music
1. **Load Model** → Any available model
2. **Set Parameters** → Creativity: 0.9, Notes: 100
3. **Generate** → Unique, experimental results
4. **Multiple Generations** → Try different seeds
5. **Combine Results** → Mix the best parts

### Workflow 4: Structured Composition
1. **Plan Structure** → Decide on sections (verse, chorus, etc.)
2. **Generate Base** → Low creativity for foundation
3. **Add Variation** → Higher creativity for fills
4. **Manual Arrangement** → Organize sections
5. **Polish** → Fine-tune timing and dynamics

## 🔄 Real-time Features

### WebSocket Integration
MuseCraft Studio uses WebSocket for real-time communication:

**Live Updates You'll See:**
- Model loading progress bars
- Generation progress indicators
- System status changes
- Error notifications
- Backend connectivity status

### State Management
- **Auto-save**: Compositions auto-saved locally
- **Undo/Redo**: Full editing history
- **State Persistence**: Settings remembered between sessions
- **Multi-tab Sync**: Changes sync across application views

## 🎵 Audio and MIDI Features

### MIDI Playback
- **Tone.js Integration**: Built-in audio engine
- **Real-time Preview**: Hear notes as you edit
- **Playback Controls**: Play, pause, stop, loop
- **Tempo Control**: Adjust playback speed

### MIDI Export
- **Standard MIDI**: Export to .mid format
- **DAW Compatible**: Works with all major music software
- **Full Velocity**: Preserves velocity information
- **Timing Precision**: Accurate note timing

### MIDI Import
- **Drag & Drop**: Drop MIDI files onto the interface
- **Automatic Loading**: Files load into piano roll
- **Edit Imported**: Modify imported compositions
- **AI Enhancement**: Use AI to extend imported music

## 🎭 Use Cases and Examples

### For Composers
**Idea Generation:**
- Generate melodic themes for development
- Create harmonic progressions
- Break through creative blocks
- Explore new musical directions

**Example Workflow:**
1. Generate short 16-note melody (Creativity: 0.4)
2. Use as main theme
3. Generate variations (Creativity: 0.7)
4. Develop into full composition

### For Producers
**Track Building:**
- Create basslines and chord progressions
- Generate rhythmic patterns
- Layer multiple AI generations
- Build complete arrangements

**Example Workflow:**
1. Generate bass pattern (low notes, Creativity: 0.3)
2. Generate chord progression (mid notes, Creativity: 0.5)
3. Generate melody line (high notes, Creativity: 0.8)
4. Combine and arrange in DAW

### For Musicians
**Practice and Learning:**
- Generate scales and exercises
- Create backing tracks for practice
- Study AI-generated patterns
- Learn new musical styles

**Example Workflow:**
1. Generate scale patterns (Creativity: 0.2)
2. Practice techniques
3. Generate chord progressions for improvisation
4. Use as learning material

### for Students
**Music Theory Study:**
- Analyze AI-generated harmony
- Study melody construction
- Experiment with different parameters
- Compare results across creativity levels

**Example Workflow:**
1. Generate at different creativity levels
2. Compare and analyze results
3. Study chord progressions and voice leading
4. Create exercises based on patterns

## 📱 User Interface Tips

### Keyboard Shortcuts
- **Spacebar**: Play/Pause
- **Delete**: Remove selected notes
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+A**: Select all notes
- **Arrow Keys**: Navigate timeline

### Mouse Controls
- **Click**: Select notes
- **Drag**: Move notes or create selections
- **Scroll**: Zoom in/out
- **Right-click**: Context menu (if available)
- **Double-click**: Edit note properties

### Touch Support (if available)
- **Tap**: Select notes
- **Pinch**: Zoom
- **Pan**: Navigate timeline
- **Long press**: Context actions

## 🎨 Theme and Customization

### Dark Theme
MuseCraft Studio uses a professional dark theme optimized for:
- **Long Sessions**: Reduced eye strain
- **Focus**: Minimal distractions
- **Professional Look**: Studio-quality appearance
- **Consistency**: Uniform design language

### Visual Elements
- **Smooth Animations**: Polished user experience
- **Real-time Updates**: Live visual feedback
- **Status Indicators**: Clear system status
- **Progress Bars**: Visual progress indication

## 🚨 Common Usage Issues

### Model Not Loading
**Symptoms**: Model shows "Loading" but never completes
**Solutions**: 
- Check MuseCraftEngine logs
- Verify model file integrity
- Check available system memory
- Try a smaller model first

### Generation Takes Too Long
**Symptoms**: AI generation hangs or times out
**Solutions**:
- Check engine performance settings
- Reduce note count
- Verify GPU is being used (if available)
- Check system resources

### No Sound During Playback
**Symptoms**: Visual playback works but no audio
**Solutions**:
- Check system audio settings
- Verify browser audio permissions
- Check if other audio is working
- Try refreshing the application

### Studio Won't Connect to Engine
**Symptoms**: Red connection indicator, no models visible
**Solutions**:
- Verify MuseCraftEngine is running (localhost:8899)
- Check firewall settings
- Test engine directly in browser (localhost:8899/docs)
- Restart both applications

Remember: MuseCraft Studio is designed to be intuitive, but AI music generation is a powerful tool that benefits from experimentation. Don't hesitate to try different settings and approaches to find what works best for your creative process!