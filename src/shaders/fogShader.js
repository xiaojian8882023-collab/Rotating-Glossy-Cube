/**
 * fog shader stuff for THREE.js 🌫️
 * makes things look foggy
 */

import * as THREE from 'three';
import fogVertexShader from './fog.vert?raw';
import fogFragmentShader from './fog.frag?raw';

export { fogVertexShader, fogFragmentShader };

/**
 * yo, this makes a fog shader material for THREE.js
 * @param {Object} options - settings for your foggy material
 * @param {THREE.Color|number|string} options.fogColor - fog color
 * @param {number} options.fogNear - how close the fog starts
 * @param {number} options.fogFar - how far the fog is at max
 * @param {number} options.fogDensity - fog density (default 2.5 for natural look)
 * @param {number} options.heightFalloff - how fast fog fades with height (default 0.1)
 * @returns {THREE.ShaderMaterial} your new super foggy material!
 */
export function createFogMaterial(options = {}) {
  const defaults = {
    fogColor: 0xaaaaaa,
    fogNear: 1,
    fogFar: 10,
    fogDensity: 2.5,
    heightFalloff: 0.1,
  };

  const settings = { ...defaults, ...options };

  // Convert color to THREE.Color if needed
  const fogColor = new THREE.Color(settings.fogColor);

  // Create shader material with uniforms
  const material = new THREE.ShaderMaterial({
    vertexShader: fogVertexShader,
    fragmentShader: fogFragmentShader,
    uniforms: {
      // Fog properties
      fogColor: { value: fogColor },
      fogNear: { value: settings.fogNear },
      fogFar: { value: settings.fogFar },
      fogDensity: { value: settings.fogDensity },
      heightFalloff: { value: settings.heightFalloff },
    },
    // Enable proper depth testing
    depthTest: true,
    depthWrite: true,
  });

  return material;
}
