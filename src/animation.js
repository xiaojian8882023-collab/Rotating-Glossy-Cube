/**
 * @file Animation loop module
 * @description Creates and manages the main animation loop for the 3D scene
 */

/**
 * Creates an animation loop function that continuously updates and renders the scene
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer to use for rendering
 * @param {THREE.Scene} scene - The scene containing all 3D objects
 * @param {THREE.Camera} camera - The camera viewing the scene
 * @param {Array<THREE.Object3D>} objects - Array of objects to animate
 * @param {OrbitControls} controls - OrbitControls instance for camera interaction
 * @returns {Function} The animation function to be called to start the loop
 * @description Creates a recursive animation loop using requestAnimationFrame that:
 * - Updates OrbitControls for camera interaction
 * - Rotates all provided objects by 0.01 radians per frame on x and y axes
 * - Renders the scene from the camera's perspective
 * - Runs at approximately 60 FPS (browser-dependent)
 * @example
 * import { createAnimationLoop } from './animation.js';
 * import renderer from './renderer.js';
 * import scene from './scene.js';
 * import camera from './camera.js';
 * import cube from './objects/cube.js';
 * import { setupControls } from './controls.js';
 *
 * const controls = setupControls(camera, renderer);
 * const animate = createAnimationLoop(renderer, scene, camera, [cube], controls);
 * animate(); // Start the animation loop
 */
export function createAnimationLoop(renderer, scene, camera, objects, controls) {
  /**
   * The main animation function called recursively each frame
   * @inner
   * @returns {void}
   */
  function animate() {
    requestAnimationFrame(animate);

    // Update OrbitControls
    if (controls) {
      controls.update();
    }

    // Rotate all animatable objects
    objects.forEach((obj) => {
      if (obj.rotation) {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
      }
    });

    renderer.render(scene, camera);
  }

  return animate;
}
