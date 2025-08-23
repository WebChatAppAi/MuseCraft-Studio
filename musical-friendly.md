# 🎵 Musical-Friendly MIDI Generation

**Build Musical UIs with Prime Token System**

MuseCraftEngine supports **Prime Token Generation** - a system where you specify a root note that influences the entire melody generation, creating musically coherent results.

## 🎯 Prime Token System

**Problem:** Random MIDI generation sounds chaotic  
**Solution:** Start generation with a "prime note" that guides the AI

**How it works:**
1. User selects scale in UI (e.g., "A Minor")
2. Backend maps to MIDI number (`A = 69`)
3. Engine uses prime token `[384, 0, 128+duration, 256+pitch]`
4. AI generates melody influenced by the root note

---

## 🚀 API Usage

### Basic Prime Token Generation
```http
POST /api/ai/generate/local
Content-Type: application/json

{
  "model_id": "alex_melody",
  "parameters": {
    "mode": "prime_note",
    "prime_pitch": 69,        // A note (A minor)
    "prime_duration": 10,     // Prime note duration
    "temperature": 0.8,       // Creativity level
    "max_notes": 32,
    "seed": 12345            // Reproducible results
  }
}
```

### Scale to MIDI Mapping
```javascript
const scaleToMidi = {
  "C": 60, "C#": 61, "D": 62, "D#": 63, "E": 64, "F": 65,
  "F#": 66, "G": 67, "G#": 68, "A": 69, "A#": 70, "B": 71
};
```

---

## 🎹 UI Integration Examples

### React Scale Selector
```jsx
const ScaleGenerator = () => {
  const [scale, setScale] = useState('A');
  const [scaleType, setScaleType] = useState('Minor');
  const [creativity, setCreativity] = useState(70);
  
  const generateMelody = async () => {
    const scaleToMidi = {"A": 69, "C": 60, "D": 62}; // etc.
    
    const params = {
      mode: "prime_note",
      prime_pitch: scaleToMidi[scale],
      prime_duration: scaleType === "Minor" ? 12 : 8,
      temperature: 0.5 + (creativity / 100.0) * 1.0,
      max_notes: 32
    };
    
    const response = await fetch('/api/ai/generate/local', {
      method: 'POST',
      body: JSON.stringify({
        model_id: 'alex_melody',
        parameters: params
      })
    });
  };
  
  return (
    <div>
      <select value={scale} onChange={(e) => setScale(e.target.value)}>
        <option value="A">A</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
      
      <select value={scaleType} onChange={(e) => setScaleType(e.target.value)}>
        <option value="Major">Major</option>
        <option value="Minor">Minor</option>
      </select>
      
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={creativity}
        onChange={(e) => setCreativity(e.target.value)}
      />
      
      <button onClick={generateMelody}>
        Generate {scale} {scaleType}
      </button>
    </div>
  );
};
```

### Python Client
```python
class ScaleMelodyGenerator:
    def generate_scale(self, scale_root, scale_type, creativity):
        scale_to_midi = {"A": 69, "C": 60, "D": 62, "G": 67}
        
        params = {
            "mode": "prime_note",
            "prime_pitch": scale_to_midi[scale_root],
            "prime_duration": 12 if scale_type == "Minor" else 8,
            "temperature": 0.5 + (creativity / 100.0) * 1.0,
            "max_notes": 32,
            "seed": random.randint(1000, 9999)
        }
        
        # Generate with prime token
        response = requests.post('/api/ai/generate/local', json={
            "model_id": "alex_melody",
            "parameters": params
        })
        
        return response.json()

# Usage
generator = ScaleMelodyGenerator()
result = generator.generate_scale("A", "Minor", 70)  # A minor, 70% creativity
```

---

## 🎼 Quick Examples

### A Minor Melody
```json
{
  "mode": "prime_note",
  "prime_pitch": 69,
  "prime_duration": 12,
  "temperature": 0.7
}
```

### C Major Melody  
```json
{
  "mode": "prime_note",
  "prime_pitch": 60,
  "prime_duration": 8,
  "temperature": 0.8
}
```

### F# Minor Melody
```json
{
  "mode": "prime_note", 
  "prime_pitch": 66,
  "prime_duration": 15,
  "temperature": 0.6
}
```

---

## 🎯 UI Mapping Guide

**Frontend Selection → Backend Parameters**

| UI Element | Backend Parameter | Example |
|------------|-------------------|---------|
| Scale Dropdown (`"A"`) | `prime_pitch: 69` | A = MIDI 69 |
| Major/Minor Toggle | `prime_duration` | Minor = 12, Major = 8 |
| Creativity Slider (0-100%) | `temperature` | 70% = 0.7 temp |
| Seed Input | `seed: 12345` | Reproducible results |

**Complete Mapping:**
```javascript
// User selects: A Minor, 70% creativity
const uiSelection = {scale: "A", type: "Minor", creativity: 70};

// Maps to API parameters:
const apiParams = {
  mode: "prime_note",
  prime_pitch: 69,                              // A note
  prime_duration: 12,                           // Minor = longer
  temperature: 0.5 + (70 / 100.0) * 1.0,      // = 1.2
  max_notes: 32
};
```

---

## ✨ Benefits

✅ **Musically Coherent:** Generated melodies actually sound like the selected scale  
✅ **Simple Integration:** Just map scale names to MIDI numbers  
✅ **User-Friendly:** Standard music UI elements (dropdowns, sliders)  
✅ **Reproducible:** Seeds allow consistent results  
✅ **Professional:** Same system used in piano roll applications  

**Perfect for building musical applications, learning tools, and creative software!** 🎹