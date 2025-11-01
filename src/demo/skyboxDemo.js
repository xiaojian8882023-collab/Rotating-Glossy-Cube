/**
 * Demo showcasing the custom skybox shader system
 * Demonstrates different presets, quality levels, and animations
 */

import * as THREE from 'three';
import { setupSky, SkyPresets } from '../objects/sky.js';

/**
 * Initialize skybox with interactive controls
 * @param {THREE.Scene} scene - THREE.js scene
 * @returns {Object} Sky controller and demo functions
 */
export function initSkyboxDemo(scene) {
  // Initialize with default settings
  const skyController = setupSky(scene, {
    preset: 'CLEAR_DAY',
    qualityLevel: 1, // Start with medium quality
  });

  // Demo state
  let animating = false;
  let currentPresetIndex = 0;
  const presetNames = Object.keys(SkyPresets);

  // Clock for animations
  const clock = new THREE.Clock();

  return {
    skyController,

    /**
     * Toggle day/night cycle animation
     */
    toggleAnimation() {
      animating = !animating;
      console.log(`Sky animation: ${animating ? 'ON' : 'OFF'}`);
      return animating;
    },

    /**
     * Update animation (call in render loop)
     */
    update() {
      if (animating) {
        const elapsed = clock.getElapsedTime();
        skyController.animate(elapsed, 0.2); // Faster cycle for demo
      }
    },

    /**
     * Cycle through presets
     */
    nextPreset() {
      currentPresetIndex = (currentPresetIndex + 1) % presetNames.length;
      const presetName = presetNames[currentPresetIndex];
      skyController.applyPreset(presetName);
      console.log(`Applied preset: ${presetName}`);
      return presetName;
    },

    /**
     * Set specific time of day
     * @param {number} hour - Hour of day (0-24)
     */
    setTimeOfDay(hour) {
      // Convert hour to sun elevation angle
      const normalizedTime = hour / 24;
      const sunAngle = normalizedTime * Math.PI * 2 - Math.PI / 2;
      const elevation = Math.sin(sunAngle) * 90; // -90 to 90 degrees

      skyController.setSunPosition(elevation, 180);
      console.log(
        `Set time to ${hour}:00 (elevation: ${elevation.toFixed(1)}°)`,
      );
    },

    /**
     * Demo different quality levels
     */
    cycleQuality() {
      const current = skyController.material.uniforms.qualityLevel.value;
      const next = (current + 1) % 3;
      skyController.setQuality(next);

      const qualityNames = ['LOW', 'MEDIUM', 'HIGH'];
      console.log(`Quality: ${qualityNames[next]}`);
      return qualityNames[next];
    },

    /**
     * Randomize weather conditions
     */
    randomWeather() {
      const cloudCoverage = Math.random();
      const turbidity = 1 + Math.random() * 9;

      skyController.setCloudCoverage(cloudCoverage);
      skyController.material.uniforms.turbidity.value = turbidity;

      console.log(
        `Random weather: clouds=${cloudCoverage.toFixed(
          2,
        )}, turbidity=${turbidity.toFixed(2)}`,
      );
    },

    /**
     * Performance test - rapidly update sun position
     */
    performanceTest() {
      let angle = 0;
      const testDuration = 5000; // 5 seconds
      const startTime = performance.now();
      let frameCount = 0;

      const testUpdate = () => {
        const elapsed = performance.now() - startTime;
        if (elapsed < testDuration) {
          angle += 0.1;
          const elevation = Math.sin(angle) * 90;
          const azimuth = (angle * 57.3) % 360;
          skyController.setSunPosition(elevation, azimuth);
          frameCount++;
          requestAnimationFrame(testUpdate);
        } else {
          const avgFPS = (frameCount / testDuration) * 1000;
          console.log(
            `Performance test complete: ${frameCount} frames, avg ${avgFPS.toFixed(
              1,
            )} FPS`,
          );
        }
      };

      console.log('Starting performance test...');
      testUpdate();
    },

    /**
     * Get current sky configuration
     */
    getStatus() {
      const config = skyController.getConfig();
      const status = {
        sunElevation: Math.asin(config.sunDirection.y) * (180 / Math.PI),
        quality: config.qualityLevel,
        clouds: config.cloudCoverage,
        stars: config.enableStars,
        turbidity: config.turbidity,
      };
      console.log('Sky status:', status);
      return status;
    },
  };
}

/**
 * Add keyboard controls for the demo
 * @param {Object} demo - Demo controller from initSkyboxDemo
 */
export function addSkyboxKeyboardControls(demo) {
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case ' ':
        demo.toggleAnimation();
        break;
      case 'p':
        demo.nextPreset();
        break;
      case 'q':
        demo.cycleQuality();
        break;
      case 'w':
        demo.randomWeather();
        break;
      case 't':
        demo.performanceTest();
        break;
      case 's':
        demo.getStatus();
        break;
      case '1':
        demo.setTimeOfDay(0); // Midnight
        break;
      case '2':
        demo.setTimeOfDay(6); // Dawn
        break;
      case '3':
        demo.setTimeOfDay(12); // Noon
        break;
      case '4':
        demo.setTimeOfDay(18); // Dusk
        break;
      case 'h':
        console.log(`
Skybox Demo Controls:
  Space - Toggle day/night animation
  P - Cycle through presets
  Q - Cycle quality levels
  W - Random weather
  T - Run performance test
  S - Show current status
  1 - Midnight
  2 - Dawn
  3 - Noon
  4 - Dusk
  H - Show this help
        `);
        break;
    }
  });

  console.log('Skybox demo ready! Press H for controls.');
}
