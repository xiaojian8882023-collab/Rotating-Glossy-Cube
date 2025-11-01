/**
 * floor object with glossy shader 🏢
 * provides a physical floor for cubes to land on
 */

import * as THREE from 'three';
import { createGlossyMaterial } from '../shaders/glossyShader.js';

/**
 * creates a floor plane with glossy shader material
 * @returns {THREE.Mesh} the floor mesh
 */
export function createFloor() {
  const geometry = new THREE.PlaneGeometry(50, 50);
  const material = createGlossyMaterial({
    color: 0x1a1a2e,
    roughness: 0.3,
    metalness: 0.0,
    specularIntensity: 0.8,
    fresnelPower: 2.0,
  });

  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  floor.position.y = -5;
  floor.receiveShadow = true;

  return floor;
}
