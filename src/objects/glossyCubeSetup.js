/**
 * glossy cube setup and initialization 💎
 * handles initial glossy cube configuration and rare fog mode
 */

import * as THREE from 'three';
import glossyCube, { glossyMaterial } from './glossyCube.js';
import { attachPhysicsBody } from '../physics.js';

const FOG_CHANCE = 0.05; // 5% chance for fog on load

/**
 * Initialize the glossy cube with physics
 * @param {THREE.Scene} scene - the scene to add cube to
 * @param {CANNON.World} physicsWorld - the physics world
 * @returns {Object} object with cube and material
 */
export function initializeGlossyCube(scene, physicsWorld) {
  // Add cube to scene
  scene.add(glossyCube);

  // Attach static physics body (won't fall)
  attachPhysicsBody(glossyCube, physicsWorld, 0);

  // 5% chance to enable atmospheric fog
  if (Math.random() < FOG_CHANCE) {
    enableFogMode();
  }

  return {
    cube: glossyCube,
    material: glossyMaterial,
  };
}

/**
 * Enable rare fog mode on the glossy cube
 */
function enableFogMode() {
  glossyMaterial.uniforms.enableFog.value = true;
  glossyMaterial.uniforms.fogColor.value = new THREE.Color(0x87ceeb);
  glossyMaterial.uniforms.fogNear.value = 1.0;
  glossyMaterial.uniforms.fogFar.value = 50.0;
  glossyMaterial.uniforms.fogDensity.value = 2.5;
  glossyMaterial.uniforms.heightFalloff.value = 0.1;
  console.log(
    '🌫️ fog mode activated! rare vibes fr (using custom fog shader)'
  );
}
