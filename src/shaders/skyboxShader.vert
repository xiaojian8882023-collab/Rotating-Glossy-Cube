// Skybox Vertex Shader - Optimized for performance
// Uses inverted cube for skybox rendering with BackSide culling
precision highp float;

// Output to fragment shader
varying vec3 vWorldDirection;  // Ray direction in world space
varying vec3 vScreenPos;        // Screen position for optimization

void main() {
  // For a skybox, we use the vertex position as the view direction
  // This works because we render a cube around the camera
  vWorldDirection = position;

  // Store screen position for potential early-out optimizations
  vScreenPos = position;

  // Transform vertex position
  // We set w=0 in projection to keep the skybox at infinity
  vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  // Keep skybox at maximum depth to render behind everything
  // This ensures proper depth testing with scene objects
  gl_Position = clipPos.xyww;
}