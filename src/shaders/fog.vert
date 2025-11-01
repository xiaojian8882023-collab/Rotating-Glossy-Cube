// fog.vert

// Varying to pass data to the fragment shader
varying float vFogDepth;
varying float vWorldY;

void main() {
    // Calculate the vertex position in view space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Calculate world position for height-based fog
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldY = worldPosition.y;

    // The distance from the camera (depth for fog calculation)
    vFogDepth = -mvPosition.z;

    // Standard projection
    gl_Position = projectionMatrix * mvPosition;
}
