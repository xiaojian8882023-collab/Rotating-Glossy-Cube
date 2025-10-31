# Glossy Shader Documentation

## Overview

This is a high-quality, physically-based glossy shader implementation for THREE.js that provides professional-grade specular highlights and reflections. The shader uses advanced rendering techniques including:

- **Blinn-Phong specular model** with GGX/Trowbridge-Reitz distribution
- **Fresnel effect** for realistic edge reflections
- **Energy conservation** between diffuse and specular components
- **Physically-based roughness and metalness parameters**
- **Tone mapping and gamma correction** for accurate color reproduction

## Files Created

```
/src/shaders/glossyShader.js     - Main shader implementation
/src/objects/glossyCube.js       - Glossy cube object using the shader
/src/glossyDemo.js               - Demo showing different glossiness levels
```

## Quick Start

### Basic Usage

```javascript
import glossyCube, { glossyMaterial } from './objects/glossyCube.js';
import { updateGlossyMaterialUniforms } from './shaders/glossyShader.js';

// Add to scene
scene.add(glossyCube);

// In animation loop - IMPORTANT!
updateGlossyMaterialUniforms(glossyMaterial, scene, camera);
```

### Custom Material Creation

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

## Shader Parameters

### Material Properties

| Parameter | Range | Description | Visual Effect |
|-----------|-------|-------------|---------------|
| **baseColor** | RGB | Base color of material | Overall object color |
| **roughness** | 0.0-1.0 | Surface micro-roughness | Lower = more glossy, sharper reflections |
| **metalness** | 0.0-1.0 | Metallic vs dielectric | Metals have colored reflections, no diffuse |
| **specularIntensity** | 0.0-3.0 | Specular highlight strength | Higher = brighter highlights |
| **fresnelPower** | 1.0-5.0 | Fresnel effect strength | Controls edge glow intensity |

### Recommended Presets

#### Mirror Polish (Ultra Glossy)
```javascript
{
  roughness: 0.05,
  metalness: 0.0,
  specularIntensity: 2.0,
  fresnelPower: 2.0
}
```

#### High Gloss Plastic
```javascript
{
  roughness: 0.15,
  metalness: 0.0,
  specularIntensity: 1.5,
  fresnelPower: 3.0
}
```

#### Brushed Metal
```javascript
{
  roughness: 0.3,
  metalness: 0.8,
  specularIntensity: 1.0,
  fresnelPower: 2.5
}
```

#### Satin Finish
```javascript
{
  roughness: 0.4,
  metalness: 0.0,
  specularIntensity: 0.8,
  fresnelPower: 4.0
}
```

## Technical Details

### Vertex Shader

The vertex shader performs:
1. **World space transformation** for lighting calculations
2. **Normal matrix transformation** to handle non-uniform scaling
3. **View space transformation** for specular calculations
4. **Data interpolation** to fragment shader via varyings

### Fragment Shader

The fragment shader implements:
1. **Cook-Torrance BRDF** for physically accurate reflections
2. **GGX microfacet distribution** for realistic roughness
3. **Schlick's approximation** for Fresnel reflections
4. **Smith geometry function** for specular occlusion
5. **Energy conservation** between diffuse and specular
6. **Reinhard tone mapping** for HDR to LDR conversion
7. **Gamma correction** for proper sRGB output

### Performance Considerations

- **Optimized for GPU**: Uses efficient approximations where appropriate
- **Precision control**: Uses `highp` precision for quality, can be reduced for mobile
- **Single light source**: Currently optimized for one point light + ambient
- **No texture lookups**: Pure mathematical calculations for maximum performance

### Integration Notes

1. **Always update uniforms** in the animation loop:
   ```javascript
   updateGlossyMaterialUniforms(material, scene, camera);
   ```

2. **Light compatibility**: The shader automatically detects:
   - First `AmbientLight` in scene
   - First `PointLight` in scene

3. **Multiple objects**: Each object needs its own material instance:
   ```javascript
   const material1 = createGlossyMaterial({ roughness: 0.1 });
   const material2 = createGlossyMaterial({ roughness: 0.5 });
   ```

## Running the Demo

To see different glossiness levels in action:

```javascript
// In your index.html, change the script src:
<script type="module" src="/src/glossyDemo.js"></script>
```

This will display 4 cubes with different material properties:
- Mirror Polish (ultra glossy)
- High Gloss (standard glossy)
- Semi Gloss (subtle highlights)
- Metallic (metal-like reflections)

## Extending the Shader

### Adding Multiple Lights

To support multiple point lights, modify the fragment shader:

```glsl
// Add uniform arrays
uniform vec3 pointLightPositions[MAX_LIGHTS];
uniform vec3 pointLightColors[MAX_LIGHTS];
uniform float pointLightIntensities[MAX_LIGHTS];

// Loop through lights in main()
for(int i = 0; i < MAX_LIGHTS; i++) {
  // Calculate contribution from each light
}
```

### Adding Texture Support

To add texture mapping:

```glsl
// Add uniform
uniform sampler2D baseTexture;

// Sample in fragment shader
vec3 textureColor = texture2D(baseTexture, vUv).rgb;
baseColor *= textureColor;
```

### Environment Mapping

For reflections:

```glsl
// Add uniform
uniform samplerCube envMap;

// Calculate reflection vector
vec3 R = reflect(-V, N);
vec3 envColor = textureCube(envMap, R).rgb;

// Mix with final color based on metalness/roughness
```

## Troubleshooting

### Shader not updating with camera movement
- Ensure `updateGlossyMaterialUniforms()` is called every frame

### Too bright/dark
- Adjust `ambientIntensity` and `pointLightIntensity`
- Modify tone mapping curve in fragment shader

### No specular highlights
- Check that `specularIntensity` > 0
- Ensure light is positioned correctly
- Verify roughness is not too high (< 0.5 for visible highlights)

### Performance issues
- Reduce precision to `mediump` for mobile
- Simplify BRDF calculations
- Use approximations for pow() operations

## Advanced Optimizations

For maximum performance:

1. **Precompute constants** in JavaScript and pass as uniforms
2. **Use texture LUTs** for complex functions
3. **Implement LOD system** with simpler shaders for distant objects
4. **Batch objects** with same material properties
5. **Consider deferred rendering** for many lights

This glossy shader provides a solid foundation for high-quality rendering in THREE.js applications. The physically-based approach ensures realistic results across different lighting conditions and material properties.