/**
 * High-performance skybox shader for THREE.js 🌅
 * Implements physically-based atmospheric scattering with real-time optimizations
 *
 * Features:
 * - Rayleigh and Mie scattering for realistic atmosphere
 * - Dynamic sun position and time of day
 * - Procedural stars and clouds
 * - Three quality levels for performance scaling
 * - Smooth day/night transitions
 */

import * as THREE from 'three';
import skyboxVertexShader from './skyboxShader.vert?raw';
import skyboxFragmentShader from './skyboxShader.frag?raw';

export { skyboxVertexShader, skyboxFragmentShader };

/**
 * Creates a skybox material with atmospheric scattering
 * @param {Object} options - Configuration options
 * @param {number} options.turbidity - Atmospheric haziness (1-20, default: 2)
 * @param {number} options.rayleigh - Rayleigh scattering coefficient (0-4, default: 1)
 * @param {number} options.mieCoefficient - Mie scattering amount (0-0.1, default: 0.005)
 * @param {number} options.mieDirectionalG - Mie directional factor (0-1, default: 0.8)
 * @param {number} options.sunIntensity - Sun brightness (0-10, default: 1)
 * @param {number} options.cloudCoverage - Cloud coverage amount (0-1, default: 0.3)
 * @param {number} options.starIntensity - Star brightness (0-1, default: 0.5)
 * @param {number} options.moonIntensity - Moon brightness (0-2, default: 1)
 * @param {boolean} options.enableStars - Render stars at night (default: true)
 * @param {boolean} options.enableClouds - Render procedural clouds (default: true)
 * @param {boolean} options.enableMoon - Render moon (default: true)
 * @param {boolean} options.enableSunDisc - Render visible sun disc (default: true)
 * @param {number} options.qualityLevel - Render quality (0=low, 1=medium, 2=high, default: 1)
 * @returns {THREE.ShaderMaterial} Skybox shader material
 */
export function createSkyboxMaterial(options = {}) {
  const defaults = {
    turbidity: 2.0,
    rayleigh: 1.0,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    sunIntensity: 1.0,
    cloudCoverage: 0.4, // Increased from 0.3 for better visibility
    starIntensity: 0.5,
    moonIntensity: 1.0,
    enableStars: true,
    enableClouds: true,
    enableMoon: true,
    enableSunDisc: true,
    qualityLevel: 1,
  };

  const settings = { ...defaults, ...options };

  // Create shader material
  const material = new THREE.ShaderMaterial({
    vertexShader: skyboxVertexShader,
    fragmentShader: skyboxFragmentShader,
    uniforms: {
      // Sun parameters
      sunDirection: { value: new THREE.Vector3(0, 1, 0) },
      sunIntensity: { value: settings.sunIntensity },

      // Moon parameters
      moonDirection: { value: new THREE.Vector3(0, -0.5, 1).normalize() },
      moonIntensity: { value: settings.moonIntensity },

      // Atmospheric scattering parameters
      turbidity: { value: settings.turbidity },
      rayleighCoeff: { value: settings.rayleigh },
      mieCoeff: { value: settings.mieCoefficient },
      mieDirectionalG: { value: settings.mieDirectionalG },

      // Environment parameters
      timeOfDay: { value: 0.5 }, // Noon by default
      cloudCoverage: { value: settings.cloudCoverage },
      starIntensity: { value: settings.starIntensity },
      time: { value: 0.0 }, // Animated time for effects

      // Performance toggles
      enableStars: { value: settings.enableStars },
      enableClouds: { value: settings.enableClouds },
      enableMoon: { value: settings.enableMoon },
      enableSunDisc: { value: settings.enableSunDisc },
      qualityLevel: { value: settings.qualityLevel },
    },
    side: THREE.BackSide, // Render inside of cube
    depthWrite: false, // Sky should not write to depth buffer
  });

  return material;
}

/**
 * Creates a skybox mesh (cube geometry with shader material)
 * @param {Object} options - Material options (passed to createSkyboxMaterial)
 * @returns {THREE.Mesh} Complete skybox mesh ready to add to scene
 */
export function createSkybox(options = {}) {
  // Create large cube geometry for skybox
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Create material
  const material = createSkyboxMaterial(options);

  // Create and return mesh
  const skybox = new THREE.Mesh(geometry, material);
  skybox.name = 'Skybox';

  return skybox;
}

/**
 * Updates sun position based on time of day and direction angles
 * @param {THREE.ShaderMaterial} material - Skybox material to update
 * @param {number} azimuth - Sun azimuth angle in radians (0-2π)
 * @param {number} elevation - Sun elevation angle in radians (-π/2 to π/2)
 * @param {number} intensity - Sun intensity multiplier (optional)
 */
export function updateSunPosition(
  material,
  azimuth,
  elevation,
  intensity = null,
) {
  const sunDirection = new THREE.Vector3();

  // Convert spherical coordinates to Cartesian
  sunDirection.x = Math.cos(elevation) * Math.sin(azimuth);
  sunDirection.y = Math.sin(elevation);
  sunDirection.z = Math.cos(elevation) * Math.cos(azimuth);

  // Update uniforms
  material.uniforms.sunDirection.value.copy(sunDirection);

  if (intensity !== null) {
    material.uniforms.sunIntensity.value = intensity;
  }

  // Update time of day based on sun elevation
  // Map elevation to 0-1 where 0 is midnight, 0.5 is noon
  const timeOfDay = (Math.sin(elevation) + 1.0) * 0.5;
  material.uniforms.timeOfDay.value = timeOfDay;
}

/**
 * Updates sun position from spherical coordinates
 * @param {THREE.ShaderMaterial} material - Skybox material to update
 * @param {number} radius - Distance (typically 1.0)
 * @param {number} phi - Polar angle in radians (0-π)
 * @param {number} theta - Azimuthal angle in radians (0-2π)
 */
export function updateSunFromSpherical(material, radius, phi, theta) {
  const sunPosition = new THREE.Vector3();
  sunPosition.setFromSphericalCoords(radius, phi, theta);

  // Normalize to get direction
  sunPosition.normalize();

  // Update uniforms
  material.uniforms.sunDirection.value.copy(sunPosition);

  // Update time of day based on sun height
  const timeOfDay = (sunPosition.y + 1.0) * 0.5;
  material.uniforms.timeOfDay.value = timeOfDay;
}

/**
 * Updates moon position based on time of day and direction angles
 * @param {THREE.ShaderMaterial} material - Skybox material to update
 * @param {number} azimuth - Moon azimuth angle in radians (0-2π)
 * @param {number} elevation - Moon elevation angle in radians (-π/2 to π/2)
 * @param {number} intensity - Moon intensity multiplier (optional)
 */
export function updateMoonPosition(
  material,
  azimuth,
  elevation,
  intensity = null,
) {
  const moonDirection = new THREE.Vector3();

  // Convert spherical coordinates to Cartesian
  moonDirection.x = Math.cos(elevation) * Math.sin(azimuth);
  moonDirection.y = Math.sin(elevation);
  moonDirection.z = Math.cos(elevation) * Math.cos(azimuth);

  // Update uniforms
  material.uniforms.moonDirection.value.copy(moonDirection);

  if (intensity !== null) {
    material.uniforms.moonIntensity.value = intensity;
  }
}

/**
 * Animates the sky through a day/night cycle
 * @param {THREE.ShaderMaterial} material - Skybox material to update
 * @param {number} time - Time value (use clock.getElapsedTime() or similar)
 * @param {number} speed - Speed of day/night cycle (default: 0.1)
 */
export function animateDayNightCycle(material, time, speed = 0.1) {
  const angle = time * speed;

  // Update shader time uniform for animated effects (stars, clouds)
  material.uniforms.time.value = time;

  // Calculate sun position for circular path
  const elevation = Math.sin(angle) * Math.PI * 0.4; // Max elevation 72 degrees
  const azimuth = angle;

  updateSunPosition(material, azimuth, elevation);

  // Position moon opposite to sun (roughly)
  const moonElevation = -elevation;
  const moonAzimuth = azimuth + Math.PI; // 180 degrees offset
  updateMoonPosition(material, moonAzimuth, moonElevation);

  // Adjust moon intensity based on sun position (brighter at night)
  const nightFactor = Math.max(0, -Math.sin(elevation));
  material.uniforms.moonIntensity.value = nightFactor * 1.5;

  // Adjust cloud coverage based on time of day
  // Fewer clouds at noon, more at dawn/dusk
  const baseCoverage = material.uniforms.cloudCoverage.value;
  const timeOfDay = (Math.sin(angle) + 1.0) * 0.5;
  const coverageVariation = Math.sin(timeOfDay * Math.PI) * 0.2;
  material.uniforms.cloudCoverage.value = Math.max(
    0,
    baseCoverage - coverageVariation,
  );
}

/**
 * Performance utility: Adjusts quality based on FPS
 * @param {THREE.ShaderMaterial} material - Skybox material to update
 * @param {number} currentFPS - Current frames per second
 * @param {number} targetFPS - Target FPS (default: 60)
 */
export function autoAdjustQuality(material, currentFPS, targetFPS = 60) {
  const currentQuality = material.uniforms.qualityLevel.value;

  if (currentFPS < targetFPS * 0.8) {
    // Performance is poor, reduce quality
    if (currentQuality > 0) {
      material.uniforms.qualityLevel.value = currentQuality - 1;
      console.log(`Skybox: Reduced quality to ${currentQuality - 1}`);
    }
  } else if (currentFPS > targetFPS * 0.95) {
    // Performance is good, can increase quality
    if (currentQuality < 2) {
      material.uniforms.qualityLevel.value = currentQuality + 1;
      console.log(`Skybox: Increased quality to ${currentQuality + 1}`);
    }
  }
}

/**
 * Presets for common sky configurations
 */
export const SkyPresets = {
  // Clear sunny day
  CLEAR_DAY: {
    turbidity: 2.0,
    rayleigh: 1.0,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    sunIntensity: 1.0,
    cloudCoverage: 0.35, // Increased for better visibility
    starIntensity: 0.5,
    moonIntensity: 0.2,
    enableStars: true,
    enableClouds: true,
    enableMoon: true,
    enableSunDisc: true,
  },

  // Overcast day
  OVERCAST: {
    turbidity: 10.0,
    rayleigh: 2.0,
    mieCoefficient: 0.02,
    mieDirectionalG: 0.5,
    sunIntensity: 0.5,
    cloudCoverage: 0.8,
    starIntensity: 0.0,
    moonIntensity: 0.0,
    enableStars: false,
    enableClouds: true,
    enableMoon: false,
    enableSunDisc: false, // Sun hidden by clouds
  },

  // Clear sunset
  SUNSET: {
    turbidity: 4.0,
    rayleigh: 2.0,
    mieCoefficient: 0.01,
    mieDirectionalG: 0.9,
    sunIntensity: 1.5,
    cloudCoverage: 0.3,
    starIntensity: 0.3,
    moonIntensity: 0.8,
    enableStars: true,
    enableClouds: true,
    enableMoon: true,
    enableSunDisc: true,
  },

  // Clear night
  NIGHT: {
    turbidity: 1.0,
    rayleigh: 0.5,
    mieCoefficient: 0.002,
    mieDirectionalG: 0.8,
    sunIntensity: 0.1,
    cloudCoverage: 0.0,
    starIntensity: 1.0,
    moonIntensity: 1.5,
    enableStars: true,
    enableClouds: false,
    enableMoon: true,
    enableSunDisc: false, // Sun is below horizon
  },

  // Hazy summer day
  HAZY_SUMMER: {
    turbidity: 6.0,
    rayleigh: 1.5,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.7,
    sunIntensity: 1.2,
    cloudCoverage: 0.2,
    starIntensity: 0.2,
    moonIntensity: 0.3,
    enableStars: true,
    enableClouds: true,
    enableMoon: true,
    enableSunDisc: true,
  },
};
