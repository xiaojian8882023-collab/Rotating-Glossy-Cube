/**
 * sets up orbitcontrols 🎮
 * so you can move the camera around and stuff
 */

import {
  OrbitControls,
} from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * makes the orbitcontrols for the camera
 * @param {THREE.Camera} camera - the camera, obvs
 * @param {THREE.WebGLRenderer} renderer - the renderer, duh
 * @returns {OrbitControls} the configured controls, have fun!
 */
export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  // Configure controls
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0;

  return controls;
}

/**
 * updates the controls in the animation loop
 * @param {OrbitControls} controls - the controls to update, lol
 */
export function updateControls(controls) {
  controls.update();
}

export const keyStates = {};

window.addEventListener('keydown', (event) => {
  keyStates[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keyStates[event.code] = false;
});
