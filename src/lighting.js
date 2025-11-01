import * as THREE from 'three';

/**
 * lighting setup module 💡
 * adds some cool ambient and point lights to the 3D scene
 */

/**
 * sets up the lights for the scene, makes it look good!
 * @param {THREE.Scene} scene - the THREE.js scene where the lights go
 * @returns {void} nothing, just adds lights
 * basically, it adds two kinds of lights:
 * - ambient light: for general brightness, white, 50% intensity
 * - point light: shines from one spot, white, 100% intensity, at (5, 5, 5)
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
