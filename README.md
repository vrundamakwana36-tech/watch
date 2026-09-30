# GC Chrono Réserve 44 — Haute Horlogerie 3D Scroll Experience

A luxury Apple-style interactive 3D scroll animation web application showcasing the deconstruction and reassembly of the **GC Swiss Chronographe** across 40 high-definition frames.

![Watch Preview](frames/ezgif-frame-001.jpg)

## ✨ Features

- **Fluid Canvas Frame Engine**: High-DPI canvas rendering (`window.devicePixelRatio`) with linear interpolation (`lerp`) for 60fps/120fps motion.
- **Story-Driven Narrative Chapters**:
  - **Phase 1**: Frontal Architecture & Titanium Bezel (Frames 1–14)
  - **Phase 2**: Exploded Calibre Movement & Mechanism (Frames 15–26)
  - **Phase 3**: Harmonic Convergence & Alignment (Frames 27–35)
  - **Phase 4**: Assembled Masterpiece & Technical Dossier (Frames 36–40)
- **Interactive Calibre Hotspots**: Clickable glowing nodes pinpointing:
  1. Sapphire Crystal & Bezel
  2. Sunburst Guilloché Dial & Tangerine Hands
  3. Calibre Escapement & Gilded Gears
  4. Monobloc Titanium Case & Pushers
- **Luxury Scrubber Dock**: Milestone track, draggable thumb, previous/next frame steppers, and fullscreen mode.
- **Auto-Play 360° View**: Hands-free automatic animation loop.
- **Web Audio Haptic Ticks**: Synthesized mechanical escapement clicks on frame scrub.
- **Zero-Dependency Native Server**: Built-in PowerShell HTTP static server (`server.ps1`).

## 🚀 Running Locally

### Option 1: Using PowerShell (Built-in)
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Any Static Web Server
You can open `index.html` with VS Code Live Server, Python (`python -m http.server 3000`), or npx `serve`:
```bash
npx serve .
```

## 📁 Repository Structure
```
watch/
├── frames/              # 40 high-definition watch animation frames
│   ├── ezgif-frame-001.jpg
│   └── ...
├── index.html           # Main markup with HUD overlay and chapters
├── styles.css           # Luxury dark mode, glassmorphism, responsive styling
├── app.js               # Canvas renderer, lerp controller, Web Audio API
├── server.ps1           # Zero-dependency local web server
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## 📜 License
MIT License.
