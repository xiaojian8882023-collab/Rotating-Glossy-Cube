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
import {
  createPhysicsWorld,
  createGround,
  stepPhysics,
  attachPhysicsBody,
} from './physics.js';
import {
  spawnPhysicsCube,
  updateCubeFromPhysics,
  removeCube,
} from './objects/physicsCubeSpawner.js';
import { createFloor } from './objects/floor.js';
import {
  createStatsPanel,
  createShortcutsPanel,
  createActionButtons,
  createButton,
} from './ui.js';

const speed = 0.1;

// Track physics pause state
let isPhysicsPaused = false;

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

// Add floor
const floor = createFloor();
scene.add(floor);

// Setup lighting
setupLighting(scene);

// Setup sky shader
setupSky(scene);

// Setup physics world
const physicsWorld = createPhysicsWorld();
createGround(physicsWorld);

// Attach static physics body to the initial glossy cube (collideable but won't fall)
attachPhysicsBody(glossyCube, physicsWorld, 0);

// Track spawned cubes
const spawnedCubes = [];

// 5% chance to enable atmospheric fog on page load using our custom fog shader
if (Math.random() < 0.05) {
  // Enable fog in the glossy material with realistic atmospheric parameters
  glossyMaterial.uniforms.enableFog.value = true;
  glossyMaterial.uniforms.fogColor.value = new THREE.Color(0x87ceeb); // Sky blue
  glossyMaterial.uniforms.fogNear.value = 1.0;
  glossyMaterial.uniforms.fogFar.value = 50.0;
  glossyMaterial.uniforms.fogDensity.value = 2.5;  // Natural fog density
  glossyMaterial.uniforms.heightFalloff.value = 0.1; // Fog near ground
  console.log('🌫️ fog mode activated! rare vibes fr (using custom fog shader)');
}

// Setup camera resize handling
setupCameraResize(renderer);

// Setup OrbitControls
const controls = setupControls(camera, renderer);

// Setup UI panels and buttons
const statsPanel = createStatsPanel();
const shortcutsPanel = createShortcutsPanel();

// Store original camera position for reset
const originalCameraPos = camera.position.clone();

// Create custom animation loop with shader uniform updates
const animate = () => {
  requestAnimationFrame(animate);

  // Step physics world (only if not paused)
  if (!isPhysicsPaused) {
    stepPhysics(physicsWorld);
  }

  // Rotate the glossy cube
  glossyCube.rotation.x += 0.01;
  glossyCube.rotation.y += 0.01;

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
  spawnedCubes.forEach(cubeData => {
    updateCubeFromPhysics(cubeData.mesh);
    updateGlossyMaterialUniforms(cubeData.material, scene, camera);
  });

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

  // Update stats panel
  statsPanel.update(spawnedCubes.length, isPhysicsPaused);

  // Render the scene
  renderer.render(scene, camera);
};

// Start animation loop
animate();

// Handle color change
const colorPicker = document.getElementById('color-picker');
if (colorPicker) {
  colorPicker.addEventListener('input', (event) => {
    glossyMaterial.uniforms.baseColor.value = new THREE.Color(event.target.value);
    glossyMaterial.needsUpdate = true;
  });
} else {
  console.warn('Color picker element not found');
}

// Spawn cube function
const spawnCube = () => {
  const x = (Math.random() - 0.5) * 10;
  const y = 8;
  const z = (Math.random() - 0.5) * 10;
  const position = new THREE.Vector3(x, y, z);
  const color = colorPicker.value;

  const cubeData = spawnPhysicsCube(scene, physicsWorld, position, color);
  spawnedCubes.push(cubeData);

  // Clean up old cubes if there are too many (performance)
  if (spawnedCubes.length > 50) {
    const oldCube = spawnedCubes.shift();
    removeCube(oldCube.mesh, scene, physicsWorld);
  }
};

// Create spawn button using UI helper
const spawnButton = createButton('🎲 Spawn Cube', spawnCube);

// Create action buttons
const actionButtons = createActionButtons();

// Clear all cubes button
const clearButton = createButton('🗑️ Clear All', () => {
  spawnedCubes.forEach(cubeData => {
    removeCube(cubeData.mesh, scene, physicsWorld);
  });
  spawnedCubes.length = 0;
}, '#ff6600');

// Pause/Resume button
const pauseButton = createButton('⏸ Pause', () => {
  isPhysicsPaused = !isPhysicsPaused;
  pauseButton.textContent = isPhysicsPaused ? '▶ Resume' : '⏸ Pause';
}, '#ffff00');

// Reset camera button
const resetCameraButton = createButton('🎥 Reset Camera', () => {
  camera.position.copy(originalCameraPos);
  controls.reset();
}, '#00ff00');

actionButtons.appendChild(clearButton);
actionButtons.appendChild(pauseButton);
actionButtons.appendChild(resetCameraButton);

// Insert buttons into controls panel
const controlsPanel = document.querySelector('.controls-panel');
const controlGroup = document.querySelector('.control-group');
if (controlsPanel && controlGroup) {
  controlsPanel.insertBefore(spawnButton, controlGroup.nextElementSibling);
  controlsPanel.insertBefore(actionButtons, controlGroup.nextElementSibling);
} else {
  console.warn('Controls panel elements not found. UI buttons will not be mounted.');
}

// Keyboard shortcuts
const keyboardShortcuts = {
  'p': () => {
    isPhysicsPaused = !isPhysicsPaused;
    pauseButton.textContent = isPhysicsPaused ? '▶ Resume' : '⏸ Pause';
  },
  'c': () => {
    spawnedCubes.forEach(cubeData => {
      removeCube(cubeData.mesh, scene, physicsWorld);
    });
    spawnedCubes.length = 0;
  },
  'r': () => {
    camera.position.copy(originalCameraPos);
    controls.reset();
  },
  '?': () => {
    shortcutsPanel.style.display =
      shortcutsPanel.style.display === 'none' ? 'block' : 'none';
  },
};

document.addEventListener('keydown', (event) => {
  // Don't trigger shortcuts if typing in an input field
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  const key = event.key.toLowerCase();
  if (keyboardShortcuts[key]) {
    event.preventDefault(); // Prevent default browser behavior
    keyboardShortcuts[key]();
  }
});

// Spawn cube on double-click
document.addEventListener('dblclick', spawnCube);
