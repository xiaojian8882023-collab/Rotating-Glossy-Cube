/**
 * @file Main application entry point
 * @description Orchestrates the initialization and startup of the THREE.js application
 * by importing and coordinating all modules (scene, camera, renderer, objects, lighting, animation)
 */

// Import all modules
import scene from './scene.js';
import camera, { setupCameraResize } from './camera.js';
import renderer, { mountRenderer } from './renderer.js';
// import cube from './objects/cube.js'; // Original cube with Phong material
import glossyCube, { glossyMaterial } from './objects/glossyCube.js'; // New glossy cube
import { updateGlossyMaterialUniforms } from './shaders/glossyShader.js';
import { setupLighting } from './lighting.js';
import { createAnimationLoop } from './animation.js';
import { setupSky } from './objects/sky.js';
import { setupControls, updateControls } from './controls.js';

/**
 * Initialize and start the THREE.js application
 * @description Performs the following initialization steps in order:
 * 1. Mounts the WebGL renderer canvas to the DOM
 * 2. Adds 3D objects to the scene
 * 3. Configures lighting (ambient + point light)
 * 4. Sets up responsive camera resize handling
 * 5. Creates and starts the animation loop
 */

// Mount renderer to DOM
mountRenderer();

// Add objects to scene
scene.add(glossyCube);

// Setup lighting
setupLighting(scene);

// Setup sky shader
setupSky(scene);

// Setup camera resize handling
setupCameraResize(renderer);

// Setup OrbitControls
const controls = setupControls(camera, renderer);

// Create custom animation loop with shader uniform updates
const animate = () => {
  requestAnimationFrame(animate);

  // Update shader uniforms with current scene data
  updateGlossyMaterialUniforms(glossyMaterial, scene, camera);

  // Rotate the glossy cube
  glossyCube.rotation.x += 0.01;
  glossyCube.rotation.y += 0.01;

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
};

// Start animation loop
animate();
