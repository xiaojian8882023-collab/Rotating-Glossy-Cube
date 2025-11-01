import * as THREE from 'three';

/**
 * cube object module 🧊
 * makes a 3D cube with phong material for that realistic light stuff
 */

/**
 * the box geometry for our cube, it's a 1x1x1 unit cube, pretty standard
 * @type {THREE.BoxGeometry}
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);

/**
 * phong material for the cube, makes it look shiny and reflect light nicely
 * @type {THREE.MeshPhongMaterial}
 * it's cyan (0x00d4ff) and super shiny (100) for that glossy look ✨
 */
const material = new THREE.MeshPhongMaterial({
  color: 0x00d4ff,
  shininess: 100
});

/**
 * this is the actual cube mesh, combining the geometry and material
 * @type {THREE.Mesh}
 * just a 3D cube ready to be added to the scene, ez pz
 */
const cube = new THREE.Mesh(geometry, material);

export default cube;
