import * as THREE from 'three';

/**
 * scene setup module 🏞️
 * makes and sets up the main THREE.js scene with a background color
 */

/**
 * this is the main THREE.js scene object, where all your 3D stuff, lights, and cameras live
 * @type {THREE.Scene}
 * it's got a dark background color (0x0a0a0a) by default, pretty moody 🌑
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

export default scene;
