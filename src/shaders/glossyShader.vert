// Precision qualifier for WebGL compatibility
precision highp float;

// Varyings - data passed to fragment shader (interpolated)
varying vec3 vWorldPosition;     // Position in world space
varying vec3 vWorldNormal;       // Normal in world space
varying vec3 vViewPosition;      // Position in view space
varying vec2 vUv;               // Texture coordinates

void main() {
  // Transform position to world space for lighting calculations
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // Transform normal to world space (accounting for non-uniform scaling)
  vWorldNormal = normalize(normalMatrix * normal);

  // Transform position to view space for specular calculations
  vec4 viewPosition = viewMatrix * worldPosition;
  vViewPosition = viewPosition.xyz;

  // Pass through texture coordinates
  vUv = uv;

  // Final vertex position in clip space
  gl_Position = projectionMatrix * viewPosition;
}
