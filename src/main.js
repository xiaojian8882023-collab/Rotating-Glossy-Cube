/**
 * yo this is the main file 🚀
 * it gets the THREE.js app going by hooking up all the modules (scene, camera, renderer, objects, lights, animation stuff)
 */

// Import all modules
import * as THREE from 'three';
import scene from './scene.js';
import camera, { setupCameraResize } from './camera.js';
import renderer, { mountRenderer } from './renderer.js';
// import cube from './objects/cube.js'; // Original cube with Phong material
import glossyCube, { glossyMaterial } from './objects/glossyCube.js'; // New glossy cube
import { updateGlossyMaterialUniforms } from './shaders/glossyShader.js';
// import fogCube, { fogMaterial } from './objects/fogCube.js';
import { setupLighting } from './lighting.js';
import { createAnimationLoop } from './animation.js';
import { setupSky } from './objects/sky.js';
import { setupControls, updateControls, keyStates } from './controls.js';

const speed = 0.1;

/**
 * ok so this function kicks off the THREE.js app ✨
 * basically it:
 * 1. slaps the renderer canvas onto the page
 * 2. throws some cool 3D stuff into the scene
 * 3. sets up the lights (ambient + a point light, fancy!)
 * 4. makes sure the camera resizes nicely
 * 5. starts the animation loop, so things actually move lol
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

  // Rotate the glossy cube
  glossyCube.rotation.x += 0.01;
  glossyCube.rotation.y += 0.01;

  // Update glossy material uniforms (camera position, time)
  updateGlossyMaterialUniforms(glossyMaterial, camera);

  // Update camera position based on key states
  if (keyStates['KeyW']) {
    camera.position.z -= speed;
  }
  if (keyStates['KeyS']) {
    camera.position.z += speed;
  }
  if (keyStates['KeyA']) {
    camera.position.x -= speed;
  }
  if (keyStates['KeyD']) {
    camera.position.x += speed;
  }
  if (keyStates['Space']) {
    camera.position.y += speed;
  }
  if (keyStates['ShiftLeft']) {
    camera.position.y -= speed;
  }

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
};

// Start animation loop
animate();

// Handle color change
const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('input', (event) => {
  glossyMaterial.uniforms.color.value = new THREE.Color(event.target.value);
});
