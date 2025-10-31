/**
 * @file Glossy shader module for THREE.js
 * @description High-quality glossy shader with physically-based specular highlights
 * and proper lighting calculations for professional appearance
 */

import * as THREE from 'three';

/**
 * Vertex shader for glossy material
 * @description Transforms vertex positions and passes data to fragment shader
 * - Transforms vertices to world and view space
 * - Computes world position and normal for lighting calculations
 * - Passes varying data for fragment shader interpolation
 */
export const glossyVertexShader = `
  // Precision qualifier for WebGL compatibility
  precision highp float;

  // Varyings - data passed to fragment shader (interpolated)
  varying vec3 vWorldPosition;     // Position in world space
  varying vec3 vWorldNormal;       // Normal in world space
  varying vec3 vViewPosition;      // Position in view space
  varying vec2 vUv;               // Texture coordinates

  void main() {
    // Transform position to world space for lighting calculations
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    // Transform normal to world space (accounting for non-uniform scaling)
    vWorldNormal = normalize(normalMatrix * normal);

    // Transform position to view space for specular calculations
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = viewPosition.xyz;

    // Pass through texture coordinates
    vUv = uv;

    // Final vertex position in clip space
    gl_Position = projectionMatrix * viewPosition;
  }
`;

/**
 * Fragment shader for glossy material
 * @description Implements physically-based rendering with:
 * - Blinn-Phong specular model for realistic highlights
 * - Fresnel effect for edge reflections
 * - Multiple light support with proper attenuation
 * - Configurable roughness and metalness
 */
export const glossyFragmentShader = `
  // Precision qualifier for consistent results
  precision highp float;

  // Material uniforms - control appearance
  uniform vec3 baseColor;           // Base color of the material
  uniform float roughness;          // Surface roughness (0.0 = mirror, 1.0 = matte)
  uniform float metalness;          // Metallic property (0.0 = dielectric, 1.0 = metal)
  uniform float specularIntensity;  // Intensity of specular highlights
  uniform float fresnelPower;       // Controls edge reflection falloff
  uniform vec3 ambientColor;        // Ambient light color
  uniform float ambientIntensity;   // Ambient light intensity

  // Lighting uniforms - scene lighting data
  uniform vec3 pointLightPosition;  // Position of point light in world space
  uniform vec3 pointLightColor;     // Color of point light
  uniform float pointLightIntensity;// Intensity of point light

  // Camera uniforms (using THREE.js built-in)
  uniform vec3 customCameraPosition; // Camera position in world space

  // Environment uniforms (optional)
  uniform vec3 envMapIntensity;     // Environment reflection intensity

  // Varyings from vertex shader
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  // Constants for physically-based calculations
  const float PI = 3.14159265359;
  const float EPSILON = 0.00001;

  /**
   * Fresnel-Schlick approximation
   * Calculates reflection intensity based on viewing angle
   */
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, fresnelPower);
  }

  /**
   * GGX/Trowbridge-Reitz normal distribution
   * Models microfacet distribution for roughness
   */
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / max(denom, EPSILON);
  }

  /**
   * Smith's geometry function for specular occlusion
   */
  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / max(denom, EPSILON);
  }

  /**
   * Smith geometry function combining view and light occlusion
   */
  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
  }

  void main() {
    // Normalize interpolated normal
    vec3 N = normalize(vWorldNormal);

    // View direction (from surface to camera)
    vec3 V = normalize(customCameraPosition - vWorldPosition);

    // Initialize color accumulator
    vec3 color = vec3(0.0);

    // Base reflectance at normal incidence (F0)
    // For dielectrics, use 0.04 (4% reflectance)
    // For metals, use the base color
    vec3 F0 = mix(vec3(0.04), baseColor, metalness);

    // --- Point Light Calculation ---
    // Light direction (from surface to light)
    vec3 L = normalize(pointLightPosition - vWorldPosition);

    // Half vector (bisector between view and light)
    vec3 H = normalize(V + L);

    // Calculate distance and attenuation
    float distance = length(pointLightPosition - vWorldPosition);
    float attenuation = pointLightIntensity / (distance * distance);

    // Radiance (incoming light energy)
    vec3 radiance = pointLightColor * attenuation;

    // Cook-Torrance BRDF components
    float NDF = distributionGGX(N, H, roughness);
    float G = geometrySmith(N, V, L, roughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    // Calculate specular component
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
    vec3 specular = numerator / max(denominator, EPSILON);

    // kS is equal to Fresnel (energy conservation)
    vec3 kS = F;

    // For energy conservation, diffuse and specular light can't exceed 1.0
    vec3 kD = vec3(1.0) - kS;

    // Metals have no diffuse component
    kD *= 1.0 - metalness;

    // Scale diffuse by base color
    vec3 diffuse = kD * baseColor / PI;

    // Combine diffuse and specular with radiance
    float NdotL = max(dot(N, L), 0.0);
    color += (diffuse + specular * specularIntensity) * radiance * NdotL;

    // --- Ambient Light Calculation ---
    vec3 ambient = ambientColor * ambientIntensity * baseColor;

    // Add Fresnel effect for additional glossiness at grazing angles
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), fresnelPower);
    vec3 fresnelColor = F0 * fresnel * 0.5;

    // Combine all lighting components
    color += ambient + fresnelColor;

    // Apply tone mapping for HDR to LDR conversion
    // Using Reinhard tone mapping for balanced results
    color = color / (color + vec3(1.0));

    // Apply gamma correction (sRGB output)
    color = pow(color, vec3(1.0/2.2));

    // Output final color with full opacity
    gl_FragColor = vec4(color, 1.0);
  }
`;

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