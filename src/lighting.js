import * as THREE from 'three';

/**
 * @file Lighting configuration module
 * @description Sets up ambient and point lighting for the 3D scene
 */

/**
 * Sets up the lighting system for the scene
 * @param {THREE.Scene} scene - The THREE.js scene to add lights to
 * @returns {void}
 * @description Creates and adds two types of lights:
 * - Ambient light: Provides even, non-directional illumination across all objects
 *   - Color: White (0xffffff)
 *   - Intensity: 0.5 (50% brightness)
 * - Point light: Emits light from a single point in all directions
 *   - Color: White (0xffffff)
 *   - Intensity: 1.0 (100% brightness)
 *   - Position: (5, 5, 5) in 3D space
 * @example
 * import scene from './scene.js';
 * import { setupLighting } from './lighting.js';
 * setupLighting(scene);
 */
export function setupLighting(scene) {
  // Create ambient light for base illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Create point light for directional highlights and shadows
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
}
