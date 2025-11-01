// fog.frag

// Uniforms for fog configuration
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float fogDensity;
uniform float heightFalloff;

// Varying received from the vertex shader
varying float vFogDepth;
varying float vWorldY;

void main() {
    // Exponential squared fog - more realistic atmospheric scattering
    float fogDistance = max(vFogDepth - fogNear, 0.0);
    float fogRange = fogFar - fogNear;
    float normalizedDistance = fogDistance / fogRange;

    // Exponential squared falloff for natural fog density
    float distanceFog = 1.0 - exp(-fogDensity * normalizedDistance * normalizedDistance);

    // Height-based fog - fog accumulates closer to ground
    // heightFalloff controls how quickly fog dissipates with height
    float heightFactor = exp(-max(vWorldY, 0.0) * heightFalloff);

    // Combine distance and height fog
    float fogFactor = clamp(distanceFog * (0.5 + 0.5 * heightFactor), 0.0, 1.0);

    // Base color (white for demo - in real use, sample from texture)
    vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);

    // Apply atmospheric color shift based on distance
    // Far objects get slightly more blue/desaturated (Rayleigh scattering)
    vec3 atmosphericColor = mix(fogColor, fogColor * 0.9 + vec3(0.05, 0.08, 0.12), normalizedDistance * 0.3);

    // Mix base color with atmospheric fog
    gl_FragColor = mix(baseColor, vec4(atmosphericColor, 1.0), fogFactor);
}
