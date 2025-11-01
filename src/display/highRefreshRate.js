/**
 * high refresh rate display support 🖥️
 * experimental support for displays with refresh rates > 60 FPS
 */

/**
 * Detect display refresh rate
 * @returns {number} detected refresh rate in Hz (60, 90, 120, 144, 165, 240, etc.)
 */
export function detectDisplayRefreshRate() {
  // Try to detect via screen.refreshRate (not all browsers support this)
  if (
    typeof screen !== 'undefined' &&
    screen.refreshRate &&
    screen.refreshRate > 0
  ) {
    return Math.round(screen.refreshRate);
  }

  // Fallback: measure frame timing using requestAnimationFrame
  return measureFrameRate();
}

/**
 * Measure actual frame rate using requestAnimationFrame
 * @returns {number} measured frame rate
 */
function measureFrameRate() {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = performance.now();
    const sampleDuration = 500; // Sample for 500ms

    const measureFrame = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed < sampleDuration) {
        requestAnimationFrame(measureFrame);
      } else {
        const measuredFPS = Math.round((frameCount * 1000) / elapsed);
        resolve(Math.min(measuredFPS, 240)); // Cap at 240 FPS
      }
    };

    requestAnimationFrame(measureFrame);
  });
}

/**
 * Creates a high refresh rate manager
 * @param {Object} config - configuration
 * @param {number} config.targetFPS - target FPS (null = use display default)
 * @param {boolean} config.enableHighRefreshRate - enable high refresh rate detection
 * @param {boolean} config.debug - enable debug logging
 * @returns {Object} high refresh rate manager
 */
export function createHighRefreshRateManager({
  targetFPS = null,
  enableHighRefreshRate = false,
  debug = false,
} = {}) {
  const manager = {
    displayRefreshRate: 60,
    targetFPS: targetFPS || 60,
    frameTime: 1000 / 60, // milliseconds per frame
    enabled: enableHighRefreshRate || targetFPS !== null,
    debug,
    lastFrameTime: performance.now(),
    frameCount: 0,
    averageFPS: 60,

    /**
     * Initialize the manager and detect refresh rates
     */
    async init() {
      if (this.enabled) {
        this.displayRefreshRate = await detectDisplayRefreshRate();

        if (this.debug) {
          console.log(
            `[HighFPS] Display refresh rate: ${this.displayRefreshRate} Hz`
          );
        }
      }

      if (this.targetFPS && this.targetFPS !== 60) {
        this.frameTime = 1000 / this.targetFPS;

        if (this.debug || this.enabled) {
          console.log(
            `[HighFPS] Target FPS: ${this.targetFPS} (${this.frameTime.toFixed(2)}ms per frame)`
          );
        }
      }
    },

    /**
     * Get the physics timestep based on target FPS
     * @returns {number} physics timestep in seconds
     */
    getPhysicsTimestep() {
      // Physics simulation at 60 Hz is generally stable
      // For higher render FPS, we use adaptive timesteps
      const basePhysicsHz = 60;

      if (this.targetFPS <= 60) {
        return 1 / basePhysicsHz;
      }

      // For higher FPS, calculate timestep based on ratio
      // This keeps physics stable while rendering more frequently
      const ratio = this.targetFPS / basePhysicsHz;
      const adaptiveTimestep = (1 / basePhysicsHz) / Math.min(ratio, 4);

      return adaptiveTimestep;
    },

    /**
     * Get the number of physics steps per frame
     * @returns {number} number of substeps
     */
    getPhysicsSubsteps() {
      if (this.targetFPS <= 60) {
        return 3; // Default substeps
      }

      const ratio = this.targetFPS / 60;
      return Math.max(3, Math.ceil(3 * ratio));
    },

    /**
     * Check if frame should be rendered (for frame rate limiting)
     * @returns {boolean} true if frame should render
     */
    shouldRenderFrame() {
      if (this.targetFPS >= this.displayRefreshRate) {
        // Can't render faster than display refresh rate
        return true;
      }

      const now = performance.now();
      const timeSinceLastFrame = now - this.lastFrameTime;

      if (timeSinceLastFrame >= this.frameTime * 0.9) {
        this.lastFrameTime = now;
        return true;
      }

      return false;
    },

    /**
     * Update FPS statistics
     */
    updateStats() {
      this.frameCount++;

      if (this.frameCount % 60 === 0) {
        // Update every 60 frames
        const now = performance.now();
        const timeDelta = now - this.lastFrameTime;
        this.averageFPS = Math.round((60 * 1000) / timeDelta);

        if (this.debug) {
          console.log(
            `[HighFPS] Average FPS: ${this.averageFPS} (Target: ${this.targetFPS})`
          );
        }
      }
    },

    /**
     * Get current info string
     * @returns {string} info about current FPS settings
     */
    getInfoString() {
      return (
        `Display: ${this.displayRefreshRate}Hz | ` +
        `Target: ${this.targetFPS}FPS | ` +
        `Current: ${this.averageFPS}FPS`
      );
    },
  };

  return manager;
}
