import * as THREE from 'three';

/**
 * @file Cube mesh object module
 * @description Creates a 3D cube with Phong material for realistic lighting
 */

/**
 * Box geometry for the cube
 * @type {THREE.BoxGeometry}
 * @description 1x1x1 unit cube geometry
 */
const geometry = new THREE.BoxGeometry(1, 1, 1);

/**
 * Phong material for the cube with realistic lighting and reflections
 * @type {THREE.MeshPhongMaterial}
 * @description Configured with:
 * - Cyan color (0x00d4ff)
 * - High shininess (100) for glossy appearance
 */
const material = new THREE.MeshPhongMaterial({
  color: 0x00d4ff,
  shininess: 100
});

/**
 * The cube mesh combining geometry and material
 * @type {THREE.Mesh}
 * @description A 3D cube object ready to be added to the scene
 * @property {THREE.BoxGeometry} geometry - The cube's geometry
 * @property {THREE.MeshPhongMaterial} material - The cube's material
 * @property {THREE.Euler} rotation - Rotation angles (x, y, z)
 */
const cube = new THREE.Mesh(geometry, material);

export default cube;
