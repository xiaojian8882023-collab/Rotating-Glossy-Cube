/**
 * @file Glossy cube mesh object module
 * @description Creates a 3D cube with custom glossy shader material
 */

import * as THREE from 'three';
import { createGlossyMaterial } from '../shaders/glossyShader.js';

/**
 * Box geometry for the cube
 * @type {THREE.BoxGeometry}
 * @description 1x1x1 unit cube geometry
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);

/**
 * Glossy shader material for the cube
 * @type {THREE.ShaderMaterial}
 * @description Configured with:
 * - Cyan base color (0x00d4ff)
 * - Low roughness (0.15) for high glossiness
 * - No metalness (0.0) for dielectric material
 * - High specular intensity (1.5) for pronounced highlights
 * - Fresnel power (3.0) for edge reflections
 */
const glossyMaterial = createGlossyMaterial({
  color: 0x00d4ff,      // Cyan color matching original
  roughness: 0.15,      // Very smooth surface for high gloss
  metalness: 0.0,       // Non-metallic for clear reflections
  specularIntensity: 1.5, // Strong specular highlights
  fresnelPower: 3.0,    // Moderate fresnel effect
});

/**
 * The glossy cube mesh combining geometry and shader material
 * @type {THREE.Mesh}
 * @description A 3D cube object with glossy shader material
 */
const glossyCube = new THREE.Mesh(geometry, glossyMaterial);

// Export both the cube and its material for uniform updates
export { glossyCube as default, glossyMaterial };