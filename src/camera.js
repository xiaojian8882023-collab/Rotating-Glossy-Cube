import * as THREE from 'three';

/**
 * camera setup module 📸
 * makes and sets up the camera, also handles resizing it
 */

/**
 * this is the main camera for the 3D scene, lol
 * @type {THREE.PerspectiveCamera}
 * it's got a 75° FOV and chillin' at z=5
 */
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

/**
 * sets up the camera and renderer to resize automatically when you change the window size
 * @param {THREE.WebGLRenderer} renderer - the renderer that needs to resize too
 * @returns {void} nothing, just sets up the listener
 * basically, it adds a window resize listener that:
 * - updates the camera's aspect ratio
 * - recalculates the camera's projection matrix
 * - resizes the renderer to fit the new window size
 */
export function setupCameraResize(renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

export default camera;
