# Rotating Glossy Cube - Project Context

## Project Overview

This is a THREE.js project featuring a rotating glossy cube with realistic reflections and lighting effects. The project showcases a custom physically-based rendering (PBR) shader implementation using WebGL/GLSL and the THREE.js library.

### Key Features
- Physically-Based Rendering with custom GLSL shader using GGX/Trowbridge-Reitz distribution
- Realistic reflections with Fresnel effect for edge highlights
- Energy conservation between diffuse and specular components
- Interactive camera controls via OrbitControls
- Atmospheric sky background shader
- Responsive design with proper resize handling

### Core Technologies
- [THREE.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool and development server
- WebGL/GLSL - Custom shader implementation
- JavaScript ES6+ modules

## Project Structure

```
├── src/
│   ├── main.js              # Application entry point
│   ├── scene.js             # Scene configuration
│   ├── camera.js            # Camera setup
│   ├── renderer.js          # WebGL renderer
│   ├── lighting.js          # Lighting configuration
│   ├── animation.js         # Animation loop
│   ├── controls.js          # OrbitControls setup
│   ├── glossyDemo.js        # Demo with multiple glossiness levels
│   ├── objects/
│   │   ├── glossyCube.js    # Glossy cube object
│   │   ├── cube.js          # Original Phong cube (not currently used)
│   │   └── sky.js           # Sky shader setup
│   └── shaders/
│       └── glossyShader.js  # Custom glossy shader
├── public/
│   ├── style.css            # Global styles
│   └── background.svg       # Background assets
├── index.html               # HTML entry point
└── package.json             # Dependencies and scripts
```

## Building and Running

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173` to see the rotating glossy cube.

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Custom Glossy Shader Details

The glossy shader implements:
- **GGX normal distribution** for realistic roughness
- **Schlick's Fresnel approximation** for edge reflections
- **Smith geometry function** for specular occlusion
- **Reinhard tone mapping** for HDR to LDR conversion
- **Gamma correction** for sRGB output

### Shader Parameters
- **baseColor**: RGB color of the material
- **roughness**: 0.0-1.0 range (0.0 = mirror, 1.0 = matte)
- **metalness**: 0.0-1.0 range (0.0 = dielectric, 1.0 = metal)
- **specularIntensity**: Strength of specular highlights
- **fresnelPower**: Controls edge reflection falloff

### Material Creation
```javascript
import { createGlossyMaterial } from './shaders/glossyShader.js';

const customMaterial = createGlossyMaterial({
  color: 0x00d4ff,       // Base color
  roughness: 0.15,       // 0.0 = mirror, 1.0 = matte
  metalness: 0.0,        // 0.0 = dielectric, 1.0 = metal
  specularIntensity: 1.5,// Strength of highlights
  fresnelPower: 3.0      // Edge reflection falloff
});
```

### Important Notes
- Always call `updateGlossyMaterialUniforms()` in the animation loop to update camera position and lighting data
- The shader automatically detects the first AmbientLight and PointLight in the scene
- Each object with the glossy shader needs its own material instance

## Development Conventions

- ES6+ modules for code organization
- JSDoc comments for exported functions and modules
- Responsive design with resize handling
- Component-based architecture with separate modules for scene, camera, renderer, etc.
- Consistent naming conventions following JavaScript standards
- Performance optimization with proper disposal of objects when needed

## Demo Variations

The project includes both a single glossy cube (`main.js`) and a demo showing multiple cubes with different glossiness settings (`glossyDemo.js`) that can be used by changing the script tag in `index.html`.

## File Organization

- Shader source files are located in `src/shaders/`
- 3D objects/meshes are in `src/objects/`
- Main application orchestration in `src/main.js`
- Public assets (HTML, CSS, images) in `public/`