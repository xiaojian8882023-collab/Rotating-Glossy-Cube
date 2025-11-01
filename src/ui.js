/**
 * UI/UX quality of life features 🎨
 * stats display, controls, shortcuts, and more
 */

/**
 * creates a stats panel to display game info
 * @returns {Object} object with panel element and update function
 */
export function createStatsPanel() {
  const panel = document.createElement('div');
  panel.id = 'stats-panel';
  panel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #00d4ff;
    border-radius: 12px;
    padding: 16px;
    font-family: 'Monaco', 'Courier New', monospace;
    color: #00d4ff;
    font-size: 13px;
    line-height: 1.6;
    z-index: 100;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    max-width: 250px;
  `;

  const content = document.createElement('div');
  panel.appendChild(content);
  document.body.appendChild(panel);

  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  return {
    panel,
    update(cubeCount, isPaused) {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= 1000) {
        fps = Math.round(frameCount * 1000 / deltaTime);
        frameCount = 0;
        lastTime = currentTime;
      }

      content.innerHTML = `
        <div style="margin-bottom: 8px; border-bottom: 1px solid rgba(0, 212, 255, 0.3); padding-bottom: 8px;">
          <strong>📊 Stats</strong>
        </div>
        <div>FPS: <span style="color: ${fps > 50 ? '#00ff00' : fps > 30 ? '#ffff00' : '#ff0000'}">${fps}</span></div>
        <div>Cubes: <span style="color: #ffff00">${cubeCount}</span>/50</div>
        <div>Status: <span style="color: ${isPaused ? '#ff6600' : '#00ff00'}">${isPaused ? '⏸ PAUSED' : '▶ RUNNING'}</span></div>
      `;
    },
  };
}

/**
 * creates a keyboard shortcuts display
 * @returns {HTMLElement} the shortcuts panel
 */
export function createShortcutsPanel() {
  const panel = document.createElement('div');
  panel.id = 'shortcuts-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #00d4ff;
    border-radius: 12px;
    padding: 16px;
    font-family: 'Monaco', 'Courier New', monospace;
    color: #00d4ff;
    font-size: 12px;
    line-height: 1.8;
    z-index: 100;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    max-width: 280px;
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 10px; border-bottom: 1px solid rgba(0, 212, 255, 0.3); padding-bottom: 8px;">
      <strong>⌨️ Shortcuts</strong>
    </div>
    <div><strong>Click</strong> - Spawn Cube</div>
    <div><strong>Double Click</strong> - Spawn Cube</div>
    <div><strong>P</strong> - Pause/Resume</div>
    <div><strong>C</strong> - Clear All Cubes</div>
    <div><strong>R</strong> - Reset Camera</div>
    <div><strong>?</strong> - Toggle This Panel</div>
  `;

  document.body.appendChild(panel);
  return panel;
}

/**
 * creates action buttons container
 * @returns {HTMLElement} buttons container
 */
export function createActionButtons() {
  const container = document.createElement('div');
  container.id = 'action-buttons';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  `;

  return container;
}

/**
 * creates a styled button
 * @param {string} text - button text
 * @param {Function} onClick - click handler
 * @param {string} color - accent color (default: #00d4ff)
 * @returns {HTMLElement} the button
 */
export function createButton(text, onClick, color = '#00d4ff') {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = `
    padding: 10px 16px;
    background: linear-gradient(135deg, ${color}, ${adjustBrightness(color, -20)});
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s ease;
    font-family: inherit;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = `0 0 15px ${color}80`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = 'none';
  });

  button.addEventListener('click', onClick);
  return button;
}

/**
 * adjusts hex color brightness
 * @param {string} hex - hex color code
 * @param {number} amount - brightness adjustment (-100 to 100)
 * @returns {string} adjusted hex color
 */
function adjustBrightness(hex, amount) {
  const usePound = hex[0] === '#';
  const col = usePound ? hex.slice(1) : hex;
  const num = parseInt(col, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return (usePound ? '#' : '') + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}
