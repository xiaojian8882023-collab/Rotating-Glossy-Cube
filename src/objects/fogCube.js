/**
 * a foggy cube object for the scene 🌫️
 */

import * as THREE from 'three';
import { createFogMaterial } from '../shaders/fogShader.js';

// Create the fog material
export const fogMaterial = createFogMaterial({
  fogColor: 0x222222,
  fogNear: 1,
  fogFar: 15,
});

// Create a cube with the fog material
const geometry = new THREE.BoxGeometry(1, 1, 1);
const fogCube = new THREE.Mesh(geometry, fogMaterial);

// Set initial position
fogCube.position.set(0, 0, 0);

export default fogCube;
