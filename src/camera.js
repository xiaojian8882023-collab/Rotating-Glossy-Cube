import * as THREE from 'three';

/**
 * @file Camera configuration module
 * @description Creates and configures the perspective camera with resize handling
 */

/**
 * The main perspective camera for the 3D scene
 * @type {THREE.PerspectiveCamera}
 * @description Configured with 75° FOV, positioned at z=5
 * @property {number} fov - Field of view in degrees (75)
 * @property {number} aspect - Aspect ratio based on window dimensions
 * @property {number} near - Near clipping plane (0.1)
 * @property {number} far - Far clipping plane (1000)
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

/**
 * Sets up automatic camera and renderer resizing when the window dimensions change
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer to resize along with the camera
 * @returns {void}
 * @description Adds a window resize event listener that:
 * - Updates camera aspect ratio to match new window dimensions
 * - Recalculates camera projection matrix
 * - Resizes renderer to fill the new window size
 * @example
 * setupCameraResize(renderer);
 */
export function setupCameraResize(renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

export default camera;
