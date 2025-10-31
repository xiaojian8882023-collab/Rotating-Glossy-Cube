/**
 * @file Glossy shader module for THREE.js
 * @description High-quality glossy shader with physically-based specular highlights
 * and proper lighting calculations for professional appearance
 */

import * as THREE from 'three';
import glossyVertexShader from './glossyShader.vert?raw';
import glossyFragmentShader from './glossyShader.frag?raw';

export { glossyVertexShader, glossyFragmentShader };

/**
 * Creates a glossy shader material for THREE.js
 * @param {Object} options - Configuration options for the glossy material
 * @param {THREE.Color|number|string} options.color - Base color of the material
 * @param {number} options.roughness - Surface roughness (0.0-1.0, default: 0.2)
 * @param {number} options.metalness - Metallic property (0.0-1.0, default: 0.0)
 * @param {number} options.specularIntensity - Specular highlight intensity (default: 1.0)
 * @param {number} options.fresnelPower - Fresnel effect power (default: 3.0)
 * @returns {THREE.ShaderMaterial} Configured shader material
 */
export function createGlossyMaterial(options = {}) {
  const defaults = {
    color: 0x00d4ff,
    roughness: 0.2,
    metalness: 0.0,
    specularIntensity: 1.0,
    fresnelPower: 3.0,
  };

  const settings = { ...defaults, ...options };

  // Convert color to THREE.Color if needed
  const baseColor = new THREE.Color(settings.color);

  // Create shader material with uniforms
  const material = new THREE.ShaderMaterial({
    vertexShader: glossyVertexShader,
    fragmentShader: glossyFragmentShader,
    uniforms: {
      // Material properties
      baseColor: { value: baseColor },
      roughness: { value: settings.roughness },
      metalness: { value: settings.metalness },
      specularIntensity: { value: settings.specularIntensity },
      fresnelPower: { value: settings.fresnelPower },

      // Ambient light (will be updated from scene)
      ambientColor: { value: new THREE.Color(0xffffff) },
      ambientIntensity: { value: 0.5 },

      // Point light (will be updated from scene)
      pointLightPosition: { value: new THREE.Vector3(5, 5, 5) },
      pointLightColor: { value: new THREE.Color(0xffffff) },
      pointLightIntensity: { value: 1.0 },

      // Camera position (will be updated each frame)
      customCameraPosition: { value: new THREE.Vector3() },

      // Environment map intensity
      envMapIntensity: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    },
    // Enable proper depth testing
    depthTest: true,
    depthWrite: true,
  });

  return material;
}

/**
 * Updates shader uniforms with scene lighting data
 * @param {THREE.ShaderMaterial} material - The glossy shader material
 * @param {THREE.Scene} scene - The THREE.js scene containing lights
 * @param {THREE.Camera} camera - The active camera
 */
export function updateGlossyMaterialUniforms(material, scene, camera) {
  // Update camera position
  material.uniforms.customCameraPosition.value.copy(camera.position);

  // Find and update ambient light
  const ambientLight = scene.children.find(
    child => child instanceof THREE.AmbientLight
  );
  if (ambientLight) {
    material.uniforms.ambientColor.value.copy(ambientLight.color);
    material.uniforms.ambientIntensity.value = ambientLight.intensity;
  }

  // Find and update point light
  const pointLight = scene.children.find(
    child => child instanceof THREE.PointLight
  );
  if (pointLight) {
    material.uniforms.pointLightPosition.value.copy(pointLight.position);
    material.uniforms.pointLightColor.value.copy(pointLight.color);
    material.uniforms.pointLightIntensity.value = pointLight.intensity;
  }
}