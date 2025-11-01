/**
 * glossy cube module 💎
 * makes a 3D cube using our custom glossy shader material, so shiny!
 */

import * as THREE from 'three';
import { createGlossyMaterial } from '../shaders/glossyShader.js';

/**
 * just the box geometry for the cube, standard 1x1x1 unit size
 * @type {THREE.BoxGeometry}
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);

/**
 * the super glossy shader material for the cube ✨
 * @type {THREE.ShaderMaterial}
 * configured with:
 * - cyan color (0x00d4ff)
 * - low roughness (0.15) for that extra shine
 * - no metalness (0.0) cuz it's not metal lol
 * - high specular intensity (1.5) for bright highlights
 * - fresnel power (3.0) for cool edge reflections
 */
const glossyMaterial = createGlossyMaterial({
  color: 0x00d4ff,      // Cyan color matching original
  roughness: 0.15,      // Very smooth surface for high gloss
  metalness: 0.0,       // Non-metallic for clear reflections
  specularIntensity: 1.5, // Strong specular highlights
  fresnelPower: 3.0,    // Moderate fresnel effect
});

/**
 * this is the glossy cube mesh, combining the geometry and the fancy shader material
 * @type {THREE.Mesh}
 * just a 3D cube with our glossy shader, ready to shine in the scene!
 */
const glossyCube = new THREE.Mesh(geometry, glossyMaterial);

// Export both the cube and its material for uniform updates
export { glossyCube as default, glossyMaterial };