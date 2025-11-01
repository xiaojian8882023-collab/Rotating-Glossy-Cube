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

// Fog uniforms
uniform bool enableFog;           // Whether fog is enabled
uniform vec3 fogColor;            // Fog color
uniform float fogNear;            // Fog start distance
uniform float fogFar;             // Fog end distance
uniform float fogDensity;         // Fog density for exponential falloff
uniform float heightFalloff;      // Height-based fog falloff

// Varyings from vertex shader
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vViewPosition;
varying vec2 vUv;
varying float vFogDepth;
varying float vWorldY;

// Constants for physically-based calculations
const float PI = 3.14159265359;
const float TAU = 6.28318530718; // 2 * PI
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

  // Apply fog if enabled (using realistic atmospheric fog from fog shader)
  if (enableFog) {
    // Exponential squared fog - realistic atmospheric scattering
    float fogDistance = max(vFogDepth - fogNear, 0.0);
    float fogRange = fogFar - fogNear;
    float normalizedDistance = fogDistance / fogRange;

    // Exponential squared falloff for natural fog density
    float distanceFog = 1.0 - exp(-fogDensity * normalizedDistance * normalizedDistance);

    // Height-based fog - fog accumulates closer to ground
    float heightFactor = exp(-max(vWorldY, 0.0) * heightFalloff);

    // Combine distance and height fog
    float fogFactor = clamp(distanceFog * (0.5 + 0.5 * heightFactor), 0.0, 1.0);

    // Apply atmospheric color shift based on distance (Rayleigh scattering)
    vec3 atmosphericColor = mix(fogColor, fogColor * 0.9 + vec3(0.05, 0.08, 0.12), normalizedDistance * 0.3);

    // Mix rendered color with atmospheric fog
    color = mix(color, atmosphericColor, fogFactor);
  }

  // Output final color with full opacity
  gl_FragColor = vec4(color, 1.0);
}
