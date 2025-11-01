import * as THREE from 'three';

/**
 * webgl renderer setup module 🖼️
 * makes and sets up the THREE.js webgl renderer with some sweet settings
 */

/**
 * this is the main webgl renderer for drawing the 3D scene
 * @type {THREE.WebGLRenderer}
 * it's pre-configured with:
 * - antialiasing for smooth edges, no jaggies!
 * - full window size, cuz why not?
 * - pixel ratio matching your device for super sharp visuals on fancy screens
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/**
 * slaps the renderer's canvas onto the webpage
 * @returns {void} nothing, just adds it to the DOM
 * basically, it adds the renderer's canvas to the element with id 'app'
 * throws an error if '#app' isn't found, so make sure it's there!
 */
export function mountRenderer() {
  document.getElementById('app').appendChild(renderer.domElement);
}

export default renderer;
