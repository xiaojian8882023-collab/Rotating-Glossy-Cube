// Skybox Fragment Shader - Physically-based atmospheric scattering
// Optimized for real-time rendering with simplified Rayleigh and Mie scattering
precision highp float;

// Inputs from vertex shader
varying vec3 vWorldDirection;
varying vec3 vScreenPos;

// Sun and atmosphere uniforms
uniform vec3 sunDirection;        // Normalized sun direction
uniform float sunIntensity;       // Sun intensity multiplier
uniform float turbidity;          // Atmospheric turbidity (haziness)
uniform float rayleighCoeff;     // Rayleigh scattering coefficient
uniform float mieCoeff;           // Mie scattering coefficient
uniform float mieDirectionalG;    // Mie directional factor (-1 to 1)

// Time and environment uniforms
uniform float timeOfDay;          // 0-1 (0=midnight, 0.5=noon)
uniform float cloudCoverage;      // 0-1 cloud coverage
uniform float starIntensity;      // Star brightness multiplier

// Performance uniforms
uniform bool enableStars;         // Toggle star rendering
uniform bool enableClouds;        // Toggle cloud rendering
uniform int qualityLevel;         // 0=low, 1=medium, 2=high

// Constants for atmospheric scattering
const float PI = 3.141592653589793;
const float TWO_PI = 6.283185307179586;
const float HALF_PI = 1.5707963267948966;

// Wavelengths of light (in micrometers) for RGB
const vec3 WAVELENGTHS = vec3(0.680, 0.550, 0.440);

// Earth atmosphere parameters
const float EARTH_RADIUS = 6371000.0;
const float ATMOSPHERE_HEIGHT = 8000.0;
const float RAYLEIGH_SCALE_HEIGHT = 7994.0;
const float MIE_SCALE_HEIGHT = 1200.0;

// Performance constants
const int MAX_SCATTER_SAMPLES = 8;
const float HORIZON_FADE = 0.02;

/**
 * Fast approximation of exp() for negative values
 * Uses Taylor series truncation for performance
 */
float fastExp(float x) {
  // Clamp to prevent overflow
  x = max(-10.0, x);
  // Second-order Taylor approximation
  return 1.0 + x + 0.5 * x * x;
}

/**
 * Optimized Rayleigh phase function
 * Describes angular distribution of Rayleigh scattering
 */
float rayleighPhase(float cosTheta) {
  // Simplified calculation avoiding division
  return 0.75 * (1.0 + cosTheta * cosTheta);
}

/**
 * Optimized Mie phase function (Henyey-Greenstein)
 * Models scattering from larger particles
 */
float miePhase(float cosTheta, float g) {
  float g2 = g * g;
  float nom = 1.0 - g2;
  float denom = pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5);
  return nom / (4.0 * PI * denom);
}

/**
 * Calculate atmospheric scattering colors
 * Simplified single-scattering model for performance
 */
vec3 atmosphericScattering(vec3 rayDir, vec3 sunDir, float sunInt) {
  // Early out for below horizon (optimization)
  float horizonFactor = smoothstep(-HORIZON_FADE, HORIZON_FADE, rayDir.y);
  if (horizonFactor <= 0.0) {
    return vec3(0.0);
  }

  // Calculate scattering angles
  float cosTheta = dot(rayDir, sunDir);
  float rayHeight = rayDir.y;

  // Simplified optical depth calculation
  // Uses analytical approximation instead of integration
  float opticalDepthR = exp(-rayHeight * 4.0) * rayleighCoeff;
  float opticalDepthM = exp(-rayHeight * 2.0) * mieCoeff;

  // Calculate phase functions
  float phaseR = rayleighPhase(cosTheta);
  float phaseM = miePhase(cosTheta, mieDirectionalG);

  // Wavelength-dependent Rayleigh scattering
  vec3 wavelengthFactors = pow(WAVELENGTHS, vec3(-4.0));
  vec3 rayleigh = wavelengthFactors * phaseR * opticalDepthR;

  // Mie scattering (wavelength independent)
  vec3 mie = vec3(phaseM * opticalDepthM);

  // Combine scattering components
  vec3 scattering = (rayleigh + mie) * sunInt;

  // Apply horizon fading for smooth transition
  return scattering * horizonFactor;
}

/**
 * Generate procedural sky gradient
 * Fast fallback for low-quality mode
 */
vec3 skyGradient(vec3 rayDir, vec3 sunDir) {
  float sunHeight = sunDir.y;
  float rayHeight = rayDir.y;

  // Base sky colors based on time of day
  vec3 zenithColor = mix(
    vec3(0.05, 0.05, 0.15),  // Night zenith
    vec3(0.35, 0.5, 0.85),    // Day zenith
    smoothstep(-0.1, 0.3, sunHeight)
  );

  vec3 horizonColor = mix(
    vec3(0.1, 0.1, 0.2),      // Night horizon
    vec3(0.85, 0.75, 0.6),    // Day horizon
    smoothstep(-0.1, 0.3, sunHeight)
  );

  // Sunset/sunrise colors
  float sunsetFactor = 1.0 - abs(sunHeight);
  sunsetFactor = pow(sunsetFactor, 2.0);
  horizonColor = mix(horizonColor, vec3(1.0, 0.5, 0.3), sunsetFactor * 0.5);

  // Blend between horizon and zenith
  float gradientFactor = pow(max(0.0, rayHeight), 0.4);
  vec3 skyColor = mix(horizonColor, zenithColor, gradientFactor);

  // Add sun glow
  float sunDot = dot(rayDir, sunDir);
  float sunGlow = pow(max(0.0, sunDot), 32.0);
  skyColor += vec3(1.0, 0.9, 0.7) * sunGlow * max(0.0, sunHeight);

  return skyColor;
}

/**
 * Procedural stars using hash function
 * Only calculated at night for performance
 */
vec3 renderStars(vec3 rayDir, float intensity) {
  // Quick hash for star field
  vec3 p = rayDir * 1000.0;
  float hash = fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);

  // Star threshold based on density
  float starThreshold = 0.998;
  float star = smoothstep(starThreshold, 1.0, hash);

  // Vary star brightness
  star *= fract(hash * 100.0) * 0.5 + 0.5;

  // Only show stars when looking up
  star *= smoothstep(-0.1, 0.3, rayDir.y);

  return vec3(star * intensity);
}

/**
 * Simple procedural clouds
 * Uses noise-like function for cloud shapes
 */
float renderClouds(vec3 rayDir, float coverage) {
  // Only render clouds above horizon
  if (rayDir.y < 0.1) return 0.0;

  // Simple noise pattern for clouds
  vec2 cloudCoords = rayDir.xz / max(0.1, rayDir.y) * 2.0;
  float noise = sin(cloudCoords.x * 3.0) * cos(cloudCoords.y * 3.0);
  noise += sin(cloudCoords.x * 7.0) * cos(cloudCoords.y * 5.0) * 0.5;
  noise = noise * 0.5 + 0.5;

  // Apply coverage threshold
  float cloud = smoothstep(1.0 - coverage, 1.0, noise);
  cloud *= smoothstep(0.0, 0.3, rayDir.y); // Fade near horizon

  return cloud;
}

void main() {
  // Normalize ray direction
  vec3 rayDir = normalize(vWorldDirection);
  vec3 sunDir = normalize(sunDirection);

  vec3 finalColor = vec3(0.0);

  // Choose rendering path based on quality level
  if (qualityLevel >= 1) {
    // Medium/High quality: Physical atmospheric scattering
    finalColor = atmosphericScattering(rayDir, sunDir, sunIntensity);

    // Add base sky gradient for areas with low scattering
    vec3 gradient = skyGradient(rayDir, sunDir);
    finalColor = mix(gradient, finalColor, min(1.0, length(finalColor)));
  } else {
    // Low quality: Simple gradient only
    finalColor = skyGradient(rayDir, sunDir);
  }

  // Add stars at night (when sun is below horizon)
  if (enableStars && sunDir.y < 0.1) {
    float nightFactor = smoothstep(0.1, -0.1, sunDir.y);
    vec3 stars = renderStars(rayDir, starIntensity * nightFactor);
    finalColor += stars;
  }

  // Add clouds if enabled
  if (enableClouds && cloudCoverage > 0.01) {
    float cloudAlpha = renderClouds(rayDir, cloudCoverage);
    vec3 cloudColor = vec3(1.0) * max(0.3, sunDir.y + 0.5);
    finalColor = mix(finalColor, cloudColor, cloudAlpha * 0.7);
  }

  // Apply exposure and tone mapping
  float exposure = mix(0.5, 1.5, smoothstep(-0.2, 0.5, sunDir.y));
  finalColor *= exposure;

  // Simple Reinhard tone mapping
  finalColor = finalColor / (1.0 + finalColor);

  // Gamma correction
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

  // Ensure we don't get completely black sky
  finalColor = max(finalColor, vec3(0.01, 0.01, 0.02));

  gl_FragColor = vec4(finalColor, 1.0);
}