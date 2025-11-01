/**
 * glossy cube 3d demo 🚀
 * main orchestration file - sets up scene, physics, UI, and animation
 */

import * as THREE from 'three';
import scene from './scene.js';
import camera, { setupCameraResize } from './camera.js';
import renderer, { mountRenderer } from './renderer.js';
import { updateGlossyMaterialUniforms } from './shaders/glossyShader.js';
import { setupLighting } from './lighting.js';
import { setupSky } from './objects/sky.js';
import { setupControls } from './controls.js';
import {
  createPhysicsWorld,
  createGround,
  attachPhysicsBody,
} from './physics.js';
import { createFloor } from './objects/floor.js';

// New refactored modules
import { initializeGlossyCube } from './objects/glossyCubeSetup.js';
import { createCubeSpawner } from './cubeSpawner.js';
import { setupUI } from './ui/setupUI.js';
import { setupKeyboardShortcuts, setupDoubleClickSpawn } from './input/keyboardShortcuts.js';
import { startAnimationLoop } from './animation/animationLoop.js';

/**
 * Initialize the entire application
 */
function initializeApp() {
  // === RENDERER & DOM ===
  mountRenderer();
  setupCameraResize(renderer);

  // === SCENE SETUP ===
  setupLighting(scene);
  setupSky(scene);

  // === PHYSICS ===
  const physicsWorld = createPhysicsWorld();
  createGround(physicsWorld);

  // === OBJECTS ===
  const glossyData = initializeGlossyCube(scene, physicsWorld);
  const floor = createFloor();
  scene.add(floor);

  // === CONTROLS ===
  const controls = setupControls(camera, renderer);

  // === CUBE SPAWNER ===
  const cubeSpawner = createCubeSpawner(scene, physicsWorld);

  // === STATE ===
  const pauseState = { isPaused: false };
  const originalCameraPos = camera.position.clone();

  // === UI ===
  const colorPicker = document.getElementById('color-picker');
  const uiElements = setupUI({
    cubeSpawner,
    pauseState,
    camera,
    controls,
    originalCameraPos,
    colorPickerColor: colorPicker?.value || '#00d4ff',
    onColorChange: (color) => {
      glossyData.material.uniforms.baseColor.value = new THREE.Color(color);
      glossyData.material.needsUpdate = true;
    },
  });

  // === KEYBOARD INPUT ===
  setupKeyboardShortcuts({
    cubeSpawner,
    pauseState,
    camera,
    controls,
    originalCameraPos,
    shortcutsPanel: uiElements.shortcutsPanel,
    pauseButton: uiElements.pauseButton,
  });

  setupDoubleClickSpawn(() => {
    const color = colorPicker?.value || '#00d4ff';
    cubeSpawner.spawn(color);
  });

  // === ANIMATION LOOP ===
  startAnimationLoop({
    renderer,
    scene,
    camera,
    glossyCube: glossyData.cube,
    glossyMaterial: glossyData.material,
    floor,
    physicsWorld,
    cubeSpawner,
    pauseState,
    controls,
    statsPanel: uiElements.statsPanel,
  });
}

// Start the app
initializeApp();
