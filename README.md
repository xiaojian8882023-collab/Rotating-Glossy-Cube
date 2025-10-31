# Rotating Glossy Cube

A THREE.js project featuring a rotating glossy cube with realistic reflections and lighting effects.

## Features

- **Physically-Based Rendering**: Custom GLSL shader with GGX/Trowbridge-Reitz distribution
- **Realistic Reflections**: Fresnel effect for edge reflections
- **Energy Conservation**: Proper balance between diffuse and specular components
- **Interactive Controls**: OrbitControls for camera manipulation
- **Sky Shader**: Atmospheric sky background

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
│   │   ├── cube.js          # Original Phong cube
│   │   └── sky.js           # Sky shader setup
│   └── shaders/
│       └── glossyShader.js  # Custom glossy shader
├── public/
│   ├── style.css            # Global styles
│   └── fonts/               # Web fonts
├── index.html               # HTML entry point
└── package.json             # Dependencies and scripts
```

## Shader Details

The glossy shader implements:
- **GGX normal distribution** for realistic roughness
- **Schlick's Fresnel approximation** for edge reflections
- **Smith geometry function** for specular occlusion
- **Reinhard tone mapping** for HDR to LDR conversion
- **Gamma correction** for sRGB output

For more details, see [GLOSSY_SHADER_README.md](./GLOSSY_SHADER_README.md)

## Technologies

- [THREE.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool and dev server
- WebGL/GLSL - Custom shaders

## License

MIT
