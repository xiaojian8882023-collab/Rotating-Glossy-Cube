/**
 * URL parameters parser 🔗
 * reads and parses URL query parameters for app configuration
 */

/**
 * Parse URL parameters
 * @returns {Object} parsed URL parameters
 */
export function parseURLParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    targetFPS: parseTargetFPS(params.get('targetFPS')),
    enableHighRefreshRate: params.has('highFPS'),
    debug: params.has('debug'),
  };
}

/**
 * Parse and validate target FPS parameter
 * @param {string|null} value - the targetFPS parameter value
 * @returns {number|null} valid FPS value or null if invalid
 */
function parseTargetFPS(value) {
  if (!value) return null;

  const fps = parseInt(value, 10);
  const validFPS = [60, 90, 120, 144, 165, 240];

  if (validFPS.includes(fps)) {
    return fps;
  }

  console.warn(
    `Invalid target FPS: ${fps}. Valid options: ${validFPS.join(', ')}`
  );
  return null;
}

/**
 * Get usage instructions for URL parameters
 * @returns {string} formatted usage string
 */
export function getURLParamUsage() {
  return `
URL Parameters (append to URL):
  ?targetFPS=60   - Set target FPS (default, no higher refresh rate support)
  ?targetFPS=90   - Experimental 90 FPS support
  ?targetFPS=120  - Experimental 120 FPS support
  ?targetFPS=240  - Experimental 240 FPS support
  ?highFPS        - Enable high refresh rate detection
  ?debug          - Enable debug logging

Examples:
  glossy-cube.html?targetFPS=120
  glossy-cube.html?targetFPS=240&debug
  glossy-cube.html?highFPS
  `;
}
