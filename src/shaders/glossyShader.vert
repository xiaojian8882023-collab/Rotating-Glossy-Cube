// Precision qualifier for WebGL compatibility
precision highp float;

// Varyings - data passed to fragment shader (interpolated)
varying vec3 vWorldPosition;     // Position in world space
varying vec3 vWorldNormal;       // Normal in world space
varying vec3 vViewPosition;      // Position in view space
varying vec2 vUv;               // Texture coordinates
varying float vFogDepth;         // Fog depth for atmospheric effects
varying float vWorldY;           // World Y position for height-based fog

void main() {
  // Transform position to world space for lighting calculations
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldY = worldPosition.y;

  // Transform normal to world space (accounting for non-uniform scaling)
  vWorldNormal = normalize(normalMatrix * normal);

  // Transform position to view space for specular calculations
  vec4 viewPosition = viewMatrix * worldPosition;
  vViewPosition = viewPosition.xyz;

  // Calculate fog depth (distance from camera in view space)
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mvPosition.z;

  // Pass through texture coordinates
  vUv = uv;

  // Final vertex position in clip space
  gl_Position = projectionMatrix * viewPosition;
}
