/**
 * main animation loop 🎬
 * handles frame updates, physics, rendering, and UI updates
 * supports variable timesteps for high refresh rate displays
 */

import { stepPhysics } from '../physics.js';
import { updateGlossyMaterialUniforms } from '../shaders/glossyShader.js';
import { updateCubeFromPhysics } from '../objects/physicsCubeSpawner.js';
import { keyStates } from '../controls.js';

const MOVEMENT_SPEED = 0.1;
const CUBE_ROTATION_SPEED = 0.01;

/**
 * Creates and starts the main animation loop
 * @param {Object} config - configuration object
 * @param {THREE.Renderer} config.renderer - the WebGL renderer
 * @param {THREE.Scene} config.scene - the THREE.js scene
 * @param {THREE.Camera} config.camera - the camera
 * @param {THREE.Mesh} config.glossyCube - the main glossy cube
 * @param {THREE.Material} config.glossyMaterial - the glossy material
 * @param {THREE.Mesh} config.floor - the floor mesh
 * @param {CANNON.World} config.physicsWorld - the physics world
 * @param {Object} config.cubeSpawner - cube spawner manager
 * @param {Object} config.pauseState - object with isPaused property
 * @param {Object} config.controls - orbit controls
 * @param {Object} config.statsPanel - stats panel UI
 * @param {Object} config.fpsManager - (optional) high refresh rate FPS manager
 */
export function startAnimationLoop({
  renderer,
  scene,
  camera,
  glossyCube,
  glossyMaterial,
  floor,
  physicsWorld,
  cubeSpawner,
  pauseState,
  controls,
  statsPanel,
  fpsManager = null,
}) {
  let lastFrameTime = performance.now();

  const animate = () => {
    requestAnimationFrame(animate);

    // Skip frame if we're limiting FPS and it's too soon
    if (fpsManager && !fpsManager.shouldRenderFrame()) {
      return;
    }

    const now = performance.now();
    const deltaTime = (now - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = now;

    // Get adaptive physics timestep for high FPS support
    const physicsTimestep = fpsManager
      ? fpsManager.getPhysicsTimestep()
      : 1 / 60;
    const physicsSubsteps = fpsManager ? fpsManager.getPhysicsSubsteps() : 3;

    // Step physics world (only if not paused)
    if (!pauseState.isPaused) {
      stepPhysics(physicsWorld, physicsTimestep, physicsSubsteps);
    }

    // Rotate the glossy cube
    glossyCube.rotation.x += CUBE_ROTATION_SPEED;
    glossyCube.rotation.y += CUBE_ROTATION_SPEED;

    // Update the physics body rotation to match the cube
    const glossyPhysicsBody = glossyCube.userData.physicsBody;
    if (glossyPhysicsBody) {
      glossyPhysicsBody.quaternion.set(
        glossyCube.quaternion.x,
        glossyCube.quaternion.y,
        glossyCube.quaternion.z,
        glossyCube.quaternion.w
      );
    }

    // Update glossy material uniforms (camera position, lights)
    updateGlossyMaterialUniforms(glossyMaterial, scene, camera);

    // Update floor lighting uniforms
    updateGlossyMaterialUniforms(floor.material, scene, camera);

    // Update all spawned cubes from physics
    cubeSpawner.cubes.forEach((cubeData) => {
      updateCubeFromPhysics(cubeData.mesh);
      updateGlossyMaterialUniforms(cubeData.material, scene, camera);
    });

    // Update camera position based on key states
    updateCameraPosition(camera);

    // Update controls
    controls.update();

    // Update stats panel
    statsPanel.update(cubeSpawner.getCount(), pauseState.isPaused);

    // Update FPS statistics if using high refresh rate
    if (fpsManager) {
      fpsManager.updateStats();
    }

    // Render the scene
    renderer.render(scene, camera);
  };

  animate();
}

/**
 * Updates camera position based on keyboard input
 * @param {THREE.Camera} camera - the camera to update
 */
function updateCameraPosition(camera) {
  if (keyStates['KeyW']) {
    camera.position.z -= MOVEMENT_SPEED;
  }
  if (keyStates['KeyS']) {
    camera.position.z += MOVEMENT_SPEED;
  }
  if (keyStates['KeyA']) {
    camera.position.x -= MOVEMENT_SPEED;
  }
  if (keyStates['KeyD']) {
    camera.position.x += MOVEMENT_SPEED;
  }
  if (keyStates['Space']) {
    camera.position.y += MOVEMENT_SPEED;
  }
  if (keyStates['ShiftLeft']) {
    camera.position.y -= MOVEMENT_SPEED;
  }
}
