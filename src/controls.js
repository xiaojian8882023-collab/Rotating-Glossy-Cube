/**
 * @file OrbitControls setup
 * @description Initializes and configures OrbitControls for interactive camera manipulation
 */

import {
  OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Initialize OrbitControls for the camera
 * @param {THREE.Camera} camera - The THREE.js camera
 * @param {THREE.WebGLRenderer} renderer - The THREE.js renderer
 * @returns {OrbitControls} The configured OrbitControls instance
 */
export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  // Configure controls
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2;

  return controls;
}

/**
 * Update controls during animation loop
 * @param {OrbitControls} controls - The OrbitControls instance
 */
export function updateControls(controls) {
  controls.update();
}
