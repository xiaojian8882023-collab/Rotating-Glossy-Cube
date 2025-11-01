/**
 * keyboard shortcuts management 🎮
 * handles all keyboard input and game shortcuts
 */

/**
 * Sets up keyboard shortcuts for the game
 * @param {Object} config - configuration object
 * @param {Object} config.cubeSpawner - cube spawner manager
 * @param {Object} config.pauseState - object with isPaused property
 * @param {THREE.Camera} config.camera - the camera
 * @param {Object} config.controls - orbit controls
 * @param {THREE.Vector3} config.originalCameraPos - original camera position
 * @param {HTMLElement} config.shortcutsPanel - the shortcuts panel element
 * @param {HTMLElement} config.pauseButton - the pause button element
 */
export function setupKeyboardShortcuts({
  cubeSpawner,
  pauseState,
  camera,
  controls,
  originalCameraPos,
  shortcutsPanel,
  pauseButton,
}) {
  const shortcuts = {
    'p': () => {
      pauseState.isPaused = !pauseState.isPaused;
      pauseButton.textContent = pauseState.isPaused
        ? '▶ Resume'
        : '⏸ Pause';
    },
    'c': () => {
      cubeSpawner.clearAll();
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
    if (shortcuts[key]) {
      event.preventDefault();
      shortcuts[key]();
    }
  });

  return shortcuts;
}

/**
 * Add double-click handler to spawn cubes
 * @param {Function} spawnCallback - function to call on double-click
 */
export function setupDoubleClickSpawn(spawnCallback) {
  document.addEventListener('dblclick', spawnCallback);
}
