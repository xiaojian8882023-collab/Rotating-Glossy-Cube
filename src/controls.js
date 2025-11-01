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

// Keys that should prevent default browser behavior
const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft'];

window.addEventListener('keydown', (event) => {
  // Only set keyState if not in an input field
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
    keyStates[event.code] = true;

    // Prevent default for movement keys to avoid browser shortcuts
    if (movementKeys.includes(event.code)) {
      event.preventDefault();
    }
  }
});

window.addEventListener('keyup', (event) => {
  if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
    keyStates[event.code] = false;
  }
});
