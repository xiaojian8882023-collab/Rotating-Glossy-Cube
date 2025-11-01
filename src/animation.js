/**
 * animation loop stuff 🔄
 * keeps the 3D scene moving and grooving
 */

/**
 * makes the main animation loop that updates and renders everything constantly
 * @param {THREE.WebGLRenderer} renderer - the renderer, duh
 * @param {THREE.Scene} scene - the scene with all your cool 3D stuff
 * @param {THREE.Camera} camera - the camera looking at the scene
 * @param {Array<THREE.Object3D>} objects - array of objects to make spin
 * @param {OrbitControls} controls - orbitcontrols for moving the camera around
 * @returns {Function} the function to call to start the loop!
 * basically, it uses requestAnimationFrame to:
 * - update the camera controls
 * - spin all the objects a bit (0.01 radians on x and y)
 * - draw the scene
 * - tries to hit 60 FPS, browser permitting 🤞
 */
export function createAnimationLoop(renderer, scene, camera, objects, controls) {
  /**
   * this is the actual animation function that runs every frame lol
   * @returns {void} nothing, just does its thing
   */  function animate() {
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
