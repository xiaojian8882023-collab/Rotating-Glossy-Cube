// Skybox Fragment Shader - Enhanced Physically-based atmospheric scattering
// Optimized for real-time rendering with advanced visual features
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
uniform float time;               // Animated time for effects

// Moon uniforms
uniform vec3 moonDirection;       // Normalized moon direction
uniform float moonIntensity;      // Moon brightness multiplier

// Performance uniforms
uniform bool enableStars;         // Toggle star rendering
uniform bool enableClouds;        // Toggle cloud rendering
uniform bool enableMoon;          // Toggle moon rendering
uniform bool enableSunDisc;       // Toggle visible sun disc
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
 * Hash function for procedural generation
 */
float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

/**
 * Enhanced procedural stars with twinkling and varying sizes
 */
vec3 renderStars(vec3 rayDir, float intensity) {
  vec3 totalStars = vec3(0.0);

  // Multiple layers of stars with different densities
  for(int layer = 0; layer < 3; layer++) {
    float layerScale = 500.0 + float(layer) * 300.0;
    vec3 p = rayDir * layerScale;
    vec3 cellId = floor(p);
    vec3 cellPos = fract(p);

    // Check neighboring cells for stars
    for(int x = -1; x <= 1; x++) {
      for(int y = -1; y <= 1; y++) {
        for(int z = -1; z <= 1; z++) {
          vec3 neighbor = cellId + vec3(float(x), float(y), float(z));
          float h = hash(neighbor);

          // Star density threshold - fewer stars in layer 0
          float threshold = 0.95 + float(layer) * 0.015;
          if(h > threshold) {
            // Generate star position within cell
            vec3 starPos = neighbor + vec3(
              hash(neighbor * 1.1),
              hash(neighbor * 1.3),
              hash(neighbor * 1.7)
            );

            // Calculate distance to star
            vec3 toStar = normalize(starPos / layerScale - rayDir);
            float dist = length(toStar);

            // Star size varies by layer and hash
            float size = (0.002 + hash(neighbor * 2.0) * 0.003) / (1.0 + float(layer));
            float star = 1.0 - smoothstep(0.0, size, dist);

            // Twinkling effect using time
            float twinkle = sin(time * (2.0 + hash(neighbor * 3.0) * 3.0) + h * TWO_PI) * 0.3 + 0.7;
            star *= twinkle;

            // Vary brightness per star
            float brightness = 0.5 + hash(neighbor * 4.0) * 0.5;
            star *= brightness;

            // Star color variation (some are slightly blue/red)
            vec3 starColor = vec3(1.0);
            float colorVar = hash(neighbor * 5.0);
            if(colorVar > 0.7) {
              starColor = mix(vec3(1.0), vec3(0.8, 0.9, 1.0), (colorVar - 0.7) * 3.0); // Blue stars
            } else if(colorVar < 0.3) {
              starColor = mix(vec3(1.0), vec3(1.0, 0.9, 0.8), (0.3 - colorVar) * 3.0); // Red stars
            }

            totalStars += starColor * star;
          }
        }
      }
    }
  }

  // Only show stars when looking up and during night
  float visibilityFactor = smoothstep(-0.1, 0.3, rayDir.y);
  totalStars *= visibilityFactor * intensity;

  return totalStars;
}

/**
 * 2D Noise function for clouds
 */
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // Smoothstep

  float a = hash(vec3(i, 0.0));
  float b = hash(vec3(i + vec2(1.0, 0.0), 0.0));
  float c = hash(vec3(i + vec2(0.0, 1.0), 0.0));
  float d = hash(vec3(i + vec2(1.0, 1.0), 0.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/**
 * Fractal Brownian Motion for cloud detail
 */
float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < 8; i++) {
    if(i >= octaves) break;
    value += amplitude * noise2D(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

/**
 * Enhanced procedural clouds with FBM
 */
float renderClouds(vec3 rayDir, float coverage) {
  // Only render clouds above horizon
  if (rayDir.y < 0.1) return 0.0;

  // Project ray onto cloud plane
  vec2 cloudCoords = rayDir.xz / max(0.1, rayDir.y);

  // Animate clouds slowly
  cloudCoords += time * 0.02;

  // Use FBM for cloud detail - adjust octaves based on quality
  int octaves = qualityLevel == 0 ? 3 : (qualityLevel == 1 ? 4 : 5);
  float cloudNoise = fbm(cloudCoords * 0.5, octaves);

  // Add second layer of detail for wispy clouds
  float detailNoise = fbm(cloudCoords * 2.0 + vec2(time * 0.03), 3) * 0.3;
  cloudNoise += detailNoise;

  // Normalize noise to 0-1 range (FBM can produce values outside this)
  cloudNoise = cloudNoise * 0.5 + 0.5;

  // Apply coverage threshold with better scaling
  // Lower threshold = more clouds visible
  float threshold = 1.0 - coverage;
  float cloud = smoothstep(threshold, threshold + 0.1, cloudNoise);

  // Add cloud density variation for more natural look
  float density = smoothstep(threshold - 0.1, threshold + 0.2, cloudNoise);
  cloud *= density;

  // Fade clouds near horizon
  cloud *= smoothstep(0.0, 0.3, rayDir.y);

  return cloud;
}

/**
 * Render visible sun disc with corona and atmospheric halo
 */
vec3 renderSunDisc(vec3 rayDir, vec3 sunDir, float intensity) {
  float sunDot = dot(rayDir, sunDir);

  // Sun disc
  float sunDisc = smoothstep(0.9998, 0.9999, sunDot); // Sharp sun edge
  vec3 sunColor = vec3(1.0, 0.98, 0.95) * intensity * 20.0;

  // Sun corona (inner glow)
  float corona = pow(max(0.0, sunDot), 200.0);
  vec3 coronaColor = vec3(1.0, 0.95, 0.85) * intensity * 3.0;

  // Sun halo (outer glow with atmospheric scattering)
  float halo = pow(max(0.0, sunDot), 12.0);
  vec3 haloColor = vec3(1.0, 0.9, 0.7) * intensity * 0.8;

  // Atmospheric limb darkening for realism
  float limbDarkening = 1.0 - smoothstep(0.9998, 0.99995, sunDot) * 0.3;

  // Combine sun elements
  vec3 sun = sunDisc * sunColor * limbDarkening + corona * coronaColor + halo * haloColor;

  // Sun should only be visible when above horizon
  float sunVisibility = smoothstep(-0.1, 0.0, sunDir.y);
  sun *= sunVisibility;

  return sun;
}

/**
 * Render moon with phases and atmospheric glow
 */
vec3 renderMoon(vec3 rayDir, vec3 moonDir, vec3 sunDir, float intensity) {
  float moonDot = dot(rayDir, moonDir);

  // Moon disc
  float moonDisc = smoothstep(0.9996, 0.9998, moonDot); // Slightly larger than sun

  // Calculate moon phase based on sun-moon angle
  float sunMoonDot = dot(moonDir, sunDir);
  float phase = (sunMoonDot + 1.0) * 0.5; // 0 = new moon, 1 = full moon

  // Moon surface brightness varies with phase
  float moonBrightness = phase * 0.8 + 0.2; // Always some visibility

  // Moon color (slightly warm grey)
  vec3 moonColor = vec3(0.95, 0.95, 0.9) * moonBrightness * intensity * 2.0;

  // Add subtle moon glow
  float moonGlow = pow(max(0.0, moonDot), 100.0);
  vec3 glowColor = vec3(0.9, 0.9, 1.0) * intensity * 0.5;

  // Combine moon elements
  vec3 moon = moonDisc * moonColor + moonGlow * glowColor;

  // Moon should only be visible when above horizon
  float moonVisibility = smoothstep(-0.1, 0.0, moonDir.y);
  moon *= moonVisibility;

  return moon;
}

/**
 * Dithering function to reduce color banding
 */
float dither(vec2 screenPos) {
  // Bayer matrix 4x4
  float bayerMatrix[16];
  bayerMatrix[0] = 0.0; bayerMatrix[1] = 8.0; bayerMatrix[2] = 2.0; bayerMatrix[3] = 10.0;
  bayerMatrix[4] = 12.0; bayerMatrix[5] = 4.0; bayerMatrix[6] = 14.0; bayerMatrix[7] = 6.0;
  bayerMatrix[8] = 3.0; bayerMatrix[9] = 11.0; bayerMatrix[10] = 1.0; bayerMatrix[11] = 9.0;
  bayerMatrix[12] = 15.0; bayerMatrix[13] = 7.0; bayerMatrix[14] = 13.0; bayerMatrix[15] = 5.0;

  vec2 coord = mod(gl_FragCoord.xy, 4.0);
  int index = int(coord.x) + int(coord.y) * 4;

  return (bayerMatrix[index] / 16.0 - 0.5) / 255.0;
}

/**
 * ACES tone mapping for better HDR handling
 */
vec3 acesToneMapping(vec3 color) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
}

void main() {
  // Normalize ray direction
  vec3 rayDir = normalize(vWorldDirection);
  vec3 sunDir = normalize(sunDirection);
  vec3 moonDir = normalize(moonDirection);

  vec3 finalColor = vec3(0.0);

  // === BASE SKY ===
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

  // === SUN DISC ===
  if (enableSunDisc) {
    vec3 sun = renderSunDisc(rayDir, sunDir, sunIntensity);
    finalColor += sun;
  }

  // === STARS ===
  // Add stars at night (when sun is below horizon)
  if (enableStars && sunDir.y < 0.1) {
    float nightFactor = smoothstep(0.1, -0.1, sunDir.y);
    vec3 stars = renderStars(rayDir, starIntensity * nightFactor);
    finalColor += stars;
  }

  // === MOON ===
  if (enableMoon && moonIntensity > 0.01) {
    vec3 moon = renderMoon(rayDir, moonDir, sunDir, moonIntensity);
    finalColor += moon;
  }

  // === CLOUDS ===
  // Add clouds if enabled (render after celestial bodies but blend with sky)
  if (enableClouds && cloudCoverage > 0.01) {
    float cloudAlpha = renderClouds(rayDir, cloudCoverage);

    // Cloud color depends on sun and moon lighting
    vec3 cloudSunColor = vec3(1.0) * max(0.3, sunDir.y + 0.5);
    vec3 cloudMoonColor = vec3(0.7, 0.75, 0.85) * moonIntensity * max(0.0, moonDir.y);
    vec3 cloudColor = cloudSunColor + cloudMoonColor;

    // Blend clouds with sky
    finalColor = mix(finalColor, cloudColor, cloudAlpha * 0.7);
  }

  // === TONE MAPPING & COLOR GRADING ===
  // Apply exposure based on time of day
  float exposure = mix(0.5, 1.5, smoothstep(-0.2, 0.5, sunDir.y));
  finalColor *= exposure;

  // Use ACES tone mapping for better HDR handling
  finalColor = acesToneMapping(finalColor);

  // Gamma correction (sRGB)
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

  // === DITHERING ===
  // Add subtle dithering to reduce color banding
  float ditherValue = dither(gl_FragCoord.xy);
  finalColor += vec3(ditherValue);

  // Ensure we don't get completely black sky
  finalColor = max(finalColor, vec3(0.01, 0.01, 0.02));

  gl_FragColor = vec4(finalColor, 1.0);
}