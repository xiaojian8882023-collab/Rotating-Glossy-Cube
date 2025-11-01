/**
 * physics world setup using cannon-es 🌍
 * handles gravity, collisions, and all that physics stuff
 */

import * as CANNON from 'cannon-es';

/**
 * create a new physics world with gravity
 * @returns {CANNON.World} the physics world
 */
export function createPhysicsWorld() {
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0); // Earth gravity, pointing down
  world.defaultContactMaterial.friction = 0.3;
  return world;
}

/**
 * creates a ground box for cubes to fall on
 * @param {CANNON.World} world - the physics world
 * @returns {CANNON.Body} the ground body
 */
export function createGround(world) {
  // Create a thin box that acts as the floor (50x1x50, half-extents: 25, 0.5, 25)
  const groundShape = new CANNON.Box(new CANNON.Vec3(25, 0.5, 25));
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.position.y = -5;
  world.addBody(groundBody);
  return groundBody;
}

/**
 * steps the physics simulation forward
 * @param {CANNON.World} world - the physics world
 * @param {number} deltaTime - time step in seconds
 */
export function stepPhysics(world, deltaTime = 1 / 60) {
  world.step(1 / 60, deltaTime, 3);
}

/**
 * attaches a static physics body to an existing mesh (won't fall or move)
 * @param {THREE.Mesh} mesh - the THREE.js mesh
 * @param {CANNON.World} world - the physics world
 * @param {number} mass - mass of the body (0 = static/immovable)
 * @returns {CANNON.Body} the physics body
 */
export function attachPhysicsBody(mesh, world, mass = 0) {
  const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const body = new CANNON.Body({ mass: mass });
  body.addShape(shape);
  body.position.copy(
    new CANNON.Vec3(mesh.position.x, mesh.position.y, mesh.position.z)
  );
  world.addBody(body);
  mesh.userData.physicsBody = body;
  return body;
}
