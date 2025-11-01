import * as THREE from 'three';
import {
  createSkybox,
  updateSunFromSpherical,
  animateDayNightCycle,
  SkyPresets,
} from '../shaders/skyboxShader.js';

/**
 * Sets up the custom high-performance skybox for the scene ☁️
 * Uses optimized atmospheric scattering shader
 * @param {THREE.Scene} scene - the scene to add the sky to
 * @param {Object} options - configuration options
 * @returns {Object} Sky controller object with update methods
 */
export function setupSky(scene, options = {}) {
  // Use preset or custom configuration
  const config = options.preset
    ? { ...SkyPresets[options.preset], ...options }
    : { ...SkyPresets.CLEAR_DAY, ...options };

  // Create skybox with specified configuration
  const skybox = createSkybox(config);

  // Scale skybox to be large enough to contain the scene
  // Using a more reasonable scale than the original 450000
  skybox.scale.setScalar(10000);

  // Set initial sun position (noon by default)
  const phi = THREE.MathUtils.degToRad(options.sunElevation || 60); // 60 degrees up
  const theta = THREE.MathUtils.degToRad(options.sunAzimuth || 180); // South

  // Update sun position in the shader
  updateSunFromSpherical(skybox.material, 1, phi, theta);

  // Add skybox to scene
  scene.add(skybox);

  // Return controller object for runtime updates
  return {
    mesh: skybox,
    material: skybox.material,

    /**
     * Update sun position
     * @param {number} elevation - Sun elevation in degrees
     * @param {number} azimuth - Sun azimuth in degrees
     */
    setSunPosition(elevation, azimuth) {
      const phi = THREE.MathUtils.degToRad(90 - elevation);
      const theta = THREE.MathUtils.degToRad(azimuth);
      updateSunFromSpherical(skybox.material, 1, phi, theta);
    },

    /**
     * Animate day/night cycle
     * @param {number} time - Time value (e.g., from clock.getElapsedTime())
     * @param {number} speed - Animation speed
     */
    animate(time, speed = 0.1) {
      animateDayNightCycle(skybox.material, time, speed);
    },

    /**
     * Update shader time (for animated effects like stars and clouds)
     * @param {number} time - Current time value
     */
    updateTime(time) {
      skybox.material.uniforms.time.value = time;
    },

    /**
     * Update quality level
     * @param {number} level - Quality level (0=low, 1=medium, 2=high)
     */
    setQuality(level) {
      skybox.material.uniforms.qualityLevel.value = Math.max(
        0,
        Math.min(2, level),
      );
    },

    /**
     * Update cloud coverage
     * @param {number} coverage - Cloud coverage (0-1)
     */
    setCloudCoverage(coverage) {
      skybox.material.uniforms.cloudCoverage.value = Math.max(
        0,
        Math.min(1, coverage),
      );
    },

    /**
     * Toggle stars
     * @param {boolean} enabled - Enable/disable stars
     */
    setStarsEnabled(enabled) {
      skybox.material.uniforms.enableStars.value = enabled;
    },

    /**
     * Toggle clouds
     * @param {boolean} enabled - Enable/disable clouds
     */
    setCloudsEnabled(enabled) {
      skybox.material.uniforms.enableClouds.value = enabled;
    },

    /**
     * Toggle moon
     * @param {boolean} enabled - Enable/disable moon
     */
    setMoonEnabled(enabled) {
      skybox.material.uniforms.enableMoon.value = enabled;
    },

    /**
     * Toggle sun disc
     * @param {boolean} enabled - Enable/disable visible sun disc
     */
    setSunDiscEnabled(enabled) {
      skybox.material.uniforms.enableSunDisc.value = enabled;
    },

    /**
     * Update moon intensity
     * @param {number} intensity - Moon brightness (0-2)
     */
    setMoonIntensity(intensity) {
      skybox.material.uniforms.moonIntensity.value = Math.max(
        0,
        Math.min(2, intensity),
      );
    },

    /**
     * Apply a preset configuration
     * @param {string} presetName - Name of preset from SkyPresets
     */
    applyPreset(presetName) {
      const preset = SkyPresets[presetName];
      if (preset) {
        Object.keys(preset).forEach((key) => {
          if (skybox.material.uniforms[key]) {
            skybox.material.uniforms[key].value = preset[key];
          }
        });
      }
    },

    /**
     * Get current configuration
     * @returns {Object} Current uniform values
     */
    getConfig() {
      const uniforms = skybox.material.uniforms;
      return {
        sunDirection: uniforms.sunDirection.value.clone(),
        sunIntensity: uniforms.sunIntensity.value,
        moonDirection: uniforms.moonDirection.value.clone(),
        moonIntensity: uniforms.moonIntensity.value,
        turbidity: uniforms.turbidity.value,
        rayleighCoeff: uniforms.rayleighCoeff.value,
        mieCoeff: uniforms.mieCoeff.value,
        mieDirectionalG: uniforms.mieDirectionalG.value,
        cloudCoverage: uniforms.cloudCoverage.value,
        starIntensity: uniforms.starIntensity.value,
        time: uniforms.time.value,
        enableStars: uniforms.enableStars.value,
        enableClouds: uniforms.enableClouds.value,
        enableMoon: uniforms.enableMoon.value,
        enableSunDisc: uniforms.enableSunDisc.value,
        qualityLevel: uniforms.qualityLevel.value,
      };
    },
  };
}

// Export presets for convenience
export { SkyPresets } from '../shaders/skyboxShader.js';
