/**
 * cube spawner logic 🎲
 * handles spawning, managing, and removing physics cubes
 */

import * as THREE from 'three';
import {
  spawnPhysicsCube,
  removeCube,
} from './objects/physicsCubeSpawner.js';

const MAX_CUBES = 50;

/**
 * Creates a cube spawner manager
 * @param {THREE.Scene} scene - the THREE.js scene
 * @param {CANNON.World} physicsWorld - the physics world
 * @returns {Object} cube spawner manager with methods
 */
export function createCubeSpawner(scene, physicsWorld) {
  const spawnedCubes = [];

  return {
    cubes: spawnedCubes,

    /**
     * Spawn a new cube at a random position
     * @param {string} color - hex color code
     */
    spawn(color = '#00d4ff') {
      const x = (Math.random() - 0.5) * 10;
      const y = 8;
      const z = (Math.random() - 0.5) * 10;
      const position = new THREE.Vector3(x, y, z);

      const cubeData = spawnPhysicsCube(
        scene,
        physicsWorld,
        position,
        color
      );
      spawnedCubes.push(cubeData);

      // Clean up old cubes if there are too many
      if (spawnedCubes.length > MAX_CUBES) {
        const oldCube = spawnedCubes.shift();
        removeCube(oldCube.mesh, scene, physicsWorld);
      }
    },

    /**
     * Clear all cubes from the scene
     */
    clearAll() {
      spawnedCubes.forEach((cubeData) => {
        removeCube(cubeData.mesh, scene, physicsWorld);
      });
      spawnedCubes.length = 0;
    },

    /**
     * Get current cube count
     * @returns {number} number of spawned cubes
     */
    getCount() {
      return spawnedCubes.length;
    },
  };
}
