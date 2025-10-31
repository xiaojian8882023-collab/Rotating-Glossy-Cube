import * as THREE from 'three';

/**
 * @file WebGL Renderer configuration module
 * @description Creates and configures the THREE.js WebGL renderer with optimal settings
 */

/**
 * The main WebGL renderer for rendering the 3D scene
 * @type {THREE.WebGLRenderer}
 * @description Pre-configured with:
 * - Antialiasing enabled for smooth edges
 * - Size set to full window dimensions
 * - Pixel ratio matching device for sharp rendering on high-DPI displays
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * Mounts the renderer's canvas element to the DOM
 * @returns {void}
 * @description Appends the renderer's canvas (domElement) to the element with id 'app'
 * @throws {Error} If the #app element is not found in the DOM
 * @example
 * mountRenderer(); // Adds canvas to <div id="app"></div>
 */
export function mountRenderer() {
  document.getElementById('app').appendChild(renderer.domElement);
}

export default renderer;
