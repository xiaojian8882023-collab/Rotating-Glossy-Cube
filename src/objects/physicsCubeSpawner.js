/**
 * physics cube spawner 🎲
 * spawns cubes with gravity using the glossy shader material
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { createGlossyMaterial } from '../shaders/glossyShader.js';

/**
 * spawns a new glossy cube with physics at a given position
 * @param {THREE.Scene} scene - the THREE.js scene
 * @param {CANNON.World} world - the physics world
 * @param {THREE.Vector3} position - spawn position
 * @param {THREE.Color|number} color - cube color (default: cyan)
 * @returns {Object} object with mesh and physicsBody
 */
export function spawnPhysicsCube(
  scene,
  world,
  position = new THREE.Vector3(0, 5, 0),
  color = 0x00d4ff
) {
  // Create THREE.js mesh with glossy material
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = createGlossyMaterial({
    color: color,
    roughness: 0.15,
    metalness: 0.0,
    specularIntensity: 1.5,
    fresnelPower: 3.0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  scene.add(mesh);

  // Create physics body
  const shape = new CANNON.Box(
    new CANNON.Vec3(0.5, 0.5, 0.5)
  );
  const physicsBody = new CANNON.Body({
    mass: 1,
    shape: shape,
  });
  physicsBody.position.copy(
    new CANNON.Vec3(position.x, position.y, position.z)
  );
  world.addBody(physicsBody);

  // Store physics body reference on mesh for easy updating
  mesh.userData.physicsBody = physicsBody;

  return {
    mesh,
    physicsBody,
    material,
  };
}

/**
 * updates a mesh position/rotation based on its physics body
 * @param {THREE.Mesh} mesh - the THREE.js mesh
 */
export function updateCubeFromPhysics(mesh) {
  const body = mesh.userData.physicsBody;
  if (!body) return;

  // Update position
  mesh.position.set(body.position.x, body.position.y, body.position.z);

  // Update rotation
  const quaternion = new THREE.Quaternion(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
  mesh.quaternion.copy(quaternion);
}

/**
 * removes a cube from scene and physics world
 * @param {THREE.Mesh} mesh - the mesh to remove
 * @param {THREE.Scene} scene - the scene
 * @param {CANNON.World} world - the physics world
 */
export function removeCube(mesh, scene, world) {
  const body = mesh.userData.physicsBody;
  if (body) {
    world.removeBody(body);
  }
  scene.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
}
