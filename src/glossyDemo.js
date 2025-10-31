/**
 * @file Glossy shader demonstration
 * @description Shows multiple cubes with different glossiness settings
 * to demonstrate the shader's versatility
 */

import * as THREE from 'three';
import scene from './scene.js';
import camera, { setupCameraResize } from './camera.js';
import renderer, { mountRenderer } from './renderer.js';
import { setupLighting } from './lighting.js';
import { setupSky } from './objects/sky.js';
import { setupControls } from './controls.js';
import {
  createGlossyMaterial,
  updateGlossyMaterialUniforms,
} from './shaders/glossyShader.js';

// Mount renderer to DOM
mountRenderer();

// Setup lighting
setupLighting(scene);

// Setup sky shader
setupSky(scene);

// Setup camera resize handling
setupCameraResize(renderer);

// Setup OrbitControls
const controls = setupControls(camera, renderer);

// Create multiple cubes with different glossiness settings
const cubes = [];

// Configuration for different material types
const configurations = [
  {
    name: 'Mirror Polish',
    color: 0x00d4ff,
    roughness: 0.05,
    metalness: 0.0,
    specularIntensity: 2.0,
    fresnelPower: 2.0,
    position: [-3, 0, 0],
  },
  {
    name: 'High Gloss',
    color: 0x00d4ff,
    roughness: 0.15,
    metalness: 0.0,
    specularIntensity: 1.5,
    fresnelPower: 3.0,
    position: [-1, 0, 0],
  },
  {
    name: 'Semi Gloss',
    color: 0x00d4ff,
    roughness: 0.3,
    metalness: 0.0,
    specularIntensity: 1.0,
    fresnelPower: 4.0,
    position: [1, 0, 0],
  },
  {
    name: 'Metallic',
    color: 0x00d4ff,
    roughness: 0.1,
    metalness: 0.8,
    specularIntensity: 1.5,
    fresnelPower: 2.5,
    position: [3, 0, 0],
  },
];

// Create cubes with different materials
configurations.forEach((config) => {
  const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const material = createGlossyMaterial({
    color: config.color,
    roughness: config.roughness,
    metalness: config.metalness,
    specularIntensity: config.specularIntensity,
    fresnelPower: config.fresnelPower,
  });

  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(...config.position);
  cube.userData = { config, material };

  scene.add(cube);
  cubes.push(cube);
});

// Position camera for better view
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);

  // Update all shader uniforms
  cubes.forEach((cube) => {
    updateGlossyMaterialUniforms(cube.userData.material, scene, camera);

    // Rotate cubes at slightly different speeds
    cube.rotation.x += 0.008;
    cube.rotation.y += 0.01;
  });

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);
};

// Start animation
animate();

// Log material configurations
console.log('Glossy Shader Demonstration');
console.log('============================');
configurations.forEach((config, index) => {
  console.log(`Cube ${index + 1}: ${config.name}`);
  console.log(`  Roughness: ${config.roughness}`);
  console.log(`  Metalness: ${config.metalness}`);
  console.log(`  Specular: ${config.specularIntensity}`);
  console.log(`  Fresnel: ${config.fresnelPower}`);
  console.log('');
});