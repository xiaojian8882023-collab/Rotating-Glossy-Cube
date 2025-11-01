# 💎 Rotating Glossy Cube

A high-performance THREE.js project featuring a rotating glossy cube with realistic reflections, physics simulation, and experimental high refresh rate support.

## ✨ Features

- **Physically-Based Rendering**: Custom GLSL shader with GGX/Trowbridge-Reitz distribution
- **Realistic Reflections**: Fresnel effect for edge reflections
- **Energy Conservation**: Proper balance between diffuse and specular components
- **Interactive Controls**: OrbitControls for camera manipulation
- **Physics Simulation**: Cannon-ES for realistic cube gravity and collisions
- **Atmospheric Sky**: Dynamic sky shader with clouds and stars
- **Rare Fog Mode**: 5% chance of atmospheric fog on page load 🌫️
- **Cube Spawning**: Spawn physics-enabled cubes with double-click
- **⚡ Experimental High FPS**: Support for 90/120/240 FPS displays (opt-in via URL params)
- **Responsive UI**: Real-time stats panel, keyboard shortcuts, and interactive buttons

## Demo

The project showcases a rotating cube with high-gloss material properties:
- Low roughness (0.15) for mirror-like finish
- Cook-Torrance BRDF for physically accurate reflections
- Tone mapping and gamma correction for proper color reproduction

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:5173` to see the rotating glossy cube.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── main.js                      # Application orchestrator
├── scene.js                     # Scene configuration
├── camera.js                    # Camera setup & resize handling
├── renderer.js                  # WebGL renderer setup
├── lighting.js                  # Lighting (ambient + point lights)
├── controls.js                  # OrbitControls & keyboard input
├── physics.js                   # Cannon-ES physics simulation
├── cubeSpawner.js               # Cube spawning & management logic
│
├── animation/
│   └── animationLoop.js         # Frame loop with high FPS support
│
├── objects/
│   ├── glossyCube.js            # Main glossy cube mesh
│   ├── glossyCubeSetup.js       # Cube initialization & fog mode
│   ├── floor.js                 # Physics floor mesh
│   ├── physicsCubeSpawner.js    # Spawned cube factory
│   └── sky.js                   # Atmospheric sky shader
│
├── shaders/
│   ├── glossyShader.js          # Custom PBR glossy shader
│   ├── skyboxShader.js          # Sky shader with atmospherics
│   └── fogShader.js             # Atmospheric fog shader
│
├── input/
│   └── keyboardShortcuts.js     # Keyboard input & game shortcuts
│
├── ui/
│   └── setupUI.js               # UI panels & button creation
│
├── display/
│   └── highRefreshRate.js       # High FPS display detection & management
│
├── config/
│   └── urlParams.js             # URL parameter parsing
│
└── demo/
    ├── glossyDemo.js            # Multi-material glossiness demo
    └── skyboxDemo.js            # Sky shader demo
```

## Shader Details

The glossy shader implements:
- **GGX normal distribution** for realistic roughness
- **Schlick's Fresnel approximation** for edge reflections
- **Smith geometry function** for specular occlusion
- **Reinhard tone mapping** for HDR to LDR conversion
- **Gamma correction** for sRGB output

For more details, see [GLOSSY_SHADER_README.md](./GLOSSY_SHADER_README.md)

## Controls & Shortcuts

### Camera Controls
- **Mouse**: OrbitControls for camera rotation
- **WASD**: Move camera forward/back/left/right
- **Space**: Move camera up
- **Shift**: Move camera down

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `P` | Pause/Resume physics |
| `C` | Clear all cubes |
| `R` | Reset camera position |
| `?` | Toggle shortcuts panel |
| `Double Click` | Spawn new physics cube |

### UI Features
- **Color Picker**: Change cube color
- **Spawn Button**: Create new physics-enabled cubes
- **Clear Button**: Remove all spawned cubes
- **Pause Button**: Freeze physics simulation
- **Stats Panel**: Real-time FPS and cube counter

## 🚀 High Refresh Rate Support (Experimental)

Enable experimental high FPS rendering via URL parameters:

```html
<!-- Enable 90 FPS -->
?targetFPS=90

<!-- Enable 120 FPS -->
?targetFPS=120

<!-- Enable 240 FPS -->
?targetFPS=240

<!-- Enable debug logging -->
?debug

<!-- Combine parameters -->
?targetFPS=120&debug
```

**Examples:**
```
https://example.com?targetFPS=120
https://example.com?targetFPS=240&debug
https://example.com?highFPS&debug
```

⚠️ **Note**: Only works on displays capable of 90+ Hz refresh rate. See [HIGH_FPS.md](./HIGH_FPS.md) for full documentation.

## 🎮 Physics Features

- **Gravity**: Realistic gravity simulation (9.82 m/s²)
- **Collisions**: Dynamic cube-to-cube and cube-to-floor collisions
- **Dynamic Spawning**: Create cubes that fall and collide
- **Performance Optimization**: Automatic cleanup of old cubes (max 50)
- **Adaptive Physics**: Timesteps scale with rendering frame rate

## 📚 Documentation

- [HIGH_FPS.md](./HIGH_FPS.md) - High refresh rate display support guide
- [GLOSSY_SHADER_README.md](./GLOSSY_SHADER_README.md) - Shader implementation details
- [CLAUDE.md](./CLAUDE.md) - Development guidelines

## Technologies

- [THREE.js](https://threejs.org/) - 3D graphics library
- [Cannon-ES](https://www.npmjs.com/package/cannon-es) - Physics engine
- [Vite](https://vitejs.dev/) - Build tool and dev server
- WebGL/GLSL - Custom shaders (PBR, atmosphere, fog)

## Recent Updates

### The Bugbath 🛁🐛 (Latest)
- Fixed keyboard event conflicts with browser shortcuts
- Fixed shortcuts panel documentation
- Added proper DOM element validation with error messages
- Fixed physics timestep calculation
- Improved input handling in UI elements

### Main.js Refactoring
- Extracted cube spawning logic → `cubeSpawner.js`
- Extracted UI setup → `ui/setupUI.js`
- Extracted keyboard input → `input/keyboardShortcuts.js`
- Extracted animation loop → `animation/animationLoop.js`
- Extracted glossy cube setup → `objects/glossyCubeSetup.js`

### High Refresh Rate Support
- Experimental 90/120/240 FPS rendering (opt-in)
- Display refresh rate detection
- Adaptive physics substeps for stability
- Frame rate limiting to prevent GPU overload

## License

MIT
