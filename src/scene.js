import * as THREE from 'three';

/**
 * @file Scene configuration module
 * @description Creates and configures the main THREE.js scene with background color
 */

/**
 * The main THREE.js scene object that contains all 3D objects, lights, and cameras
 * @type {THREE.Scene}
 * @description Pre-configured with a dark background color (0x0a0a0a)
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

export default scene;
