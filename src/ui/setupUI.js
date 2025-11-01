/**
 * UI setup and initialization 🎨
 * creates and mounts all UI elements and buttons
 */

import {
  createStatsPanel,
  createShortcutsPanel,
  createActionButtons,
  createButton,
} from '../ui.js';

/**
 * Sets up all UI elements and buttons
 * @param {Object} config - configuration object
 * @param {Object} config.cubeSpawner - cube spawner manager
 * @param {Object} config.pauseState - object with isPaused property
 * @param {THREE.Camera} config.camera - the camera
 * @param {Object} config.controls - orbit controls
 * @param {THREE.Vector3} config.originalCameraPos - original camera position
 * @param {string} config.colorPickerColor - initial color picker value
 * @param {Function} config.onColorChange - callback for color changes
 * @returns {Object} UI elements and state
 */
export function setupUI({
  cubeSpawner,
  pauseState,
  camera,
  controls,
  originalCameraPos,
  colorPickerColor,
  onColorChange,
}) {
  // Create UI panels
  const statsPanel = createStatsPanel();
  const shortcutsPanel = createShortcutsPanel();

  // Create buttons
  const spawnButton = createButton('🎲 Spawn Cube', () => {
    cubeSpawner.spawn(colorPickerColor);
  });

  const actionButtons = createActionButtons();

  const clearButton = createButton(
    '🗑️ Clear All',
    () => {
      cubeSpawner.clearAll();
    },
    '#ff6600'
  );

  const pauseButton = createButton(
    '⏸ Pause',
    () => {
      pauseState.isPaused = !pauseState.isPaused;
      pauseButton.textContent = pauseState.isPaused
        ? '▶ Resume'
        : '⏸ Pause';
    },
    '#ffff00'
  );

  const resetCameraButton = createButton(
    '🎥 Reset Camera',
    () => {
      camera.position.copy(originalCameraPos);
      controls.reset();
    },
    '#00ff00'
  );

  actionButtons.appendChild(clearButton);
  actionButtons.appendChild(pauseButton);
  actionButtons.appendChild(resetCameraButton);

  // Mount buttons into controls panel
  const controlsPanel = document.querySelector('.controls-panel');
  const controlGroup = document.querySelector('.control-group');
  if (controlsPanel && controlGroup) {
    controlsPanel.insertBefore(
      spawnButton,
      controlGroup.nextElementSibling
    );
    controlsPanel.insertBefore(
      actionButtons,
      controlGroup.nextElementSibling
    );
  } else {
    console.warn(
      'Controls panel elements not found. UI buttons will not be mounted.'
    );
  }

  // Setup color picker
  const colorPicker = document.getElementById('color-picker');
  if (colorPicker) {
    colorPicker.addEventListener('input', (event) => {
      onColorChange(event.target.value);
    });
  } else {
    console.warn('Color picker element not found');
  }

  return {
    statsPanel,
    shortcutsPanel,
    pauseButton,
    colorPicker,
  };
}
