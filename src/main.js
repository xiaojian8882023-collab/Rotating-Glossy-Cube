/**
 * glossy cube 3d demo 🚀
 * main orchestration file - sets up scene, physics, UI, and animation
 * experimental support for high refresh rate displays (90, 120, 240 FPS)
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

// High refresh rate support
import { parseURLParams, getURLParamUsage } from './config/urlParams.js';
import { createHighRefreshRateManager } from './display/highRefreshRate.js';

/**
 * Initialize the entire application
 */
function initializeApp() {
  // === URL PARAMETERS & HIGH FPS ===
  const urlParams = parseURLParams();

  if (urlParams.targetFPS || urlParams.enableHighRefreshRate) {
    console.log('🚀 [HighFPS] Experimental high refresh rate support enabled!');
    console.log(getURLParamUsage());
  }

  if (urlParams.debug) {
    console.log('🐛 [Debug] Debug mode enabled');
    console.log('URL Params:', urlParams);
  }
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

  // === HIGH REFRESH RATE SETUP ===
  let fpsManager = null;
  if (urlParams.targetFPS || urlParams.enableHighRefreshRate) {
    fpsManager = createHighRefreshRateManager({
      targetFPS: urlParams.targetFPS,
      enableHighRefreshRate: urlParams.enableHighRefreshRate,
      debug: urlParams.debug,
    });

    // Initialize async refresh rate detection
    fpsManager.init().then(() => {
      if (urlParams.debug || urlParams.targetFPS) {
        console.log(`[HighFPS] Initialized: ${fpsManager.getInfoString()}`);
      }
    });
  }

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
    fpsManager,
  });
}

// Start the app
initializeApp();
