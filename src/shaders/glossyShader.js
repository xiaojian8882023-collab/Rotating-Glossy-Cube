/**
 * glossy shader stuff for THREE.js ✨
 * makes things look super shiny and lit, like, for real real
 */

import * as THREE from 'three';
import glossyVertexShader from './glossyShader.vert?raw';
import glossyFragmentShader from './glossyShader.frag?raw';

export { glossyVertexShader, glossyFragmentShader };

/**
 * yo, this makes a glossy shader material for THREE.js
 * @param {Object} options - settings for your shiny material
 * @param {THREE.Color|number|string} options.color - base color, make it pop!
 * @param {number} options.roughness - how rough it is (0.0-1.0, default: 0.2)
 * @param {number} options.metalness - how metallic it is (0.0-1.0, default: 0.0)
 * @param {number} options.specularIntensity - how bright the shiny bits are (default: 1.0)
 * @param {number} options.fresnelPower - fresnel effect power (default: 3.0)
 * @returns {THREE.ShaderMaterial} your new super glossy material!
 */
export function createGlossyMaterial(options = {}) {
  const defaults = {
    color: 0x00d4ff,
    roughness: 0.08,
    metalness: 0.0,
    specularIntensity: 2.5,
    fresnelPower: 4.5,
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
 * updates the shader's uniforms with light info from the scene
 * @param {THREE.ShaderMaterial} material - the glossy shader material
 * @param {THREE.Scene} scene - the THREE.js scene with all the lights
 * @param {THREE.Camera} camera - the camera that's currently active
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