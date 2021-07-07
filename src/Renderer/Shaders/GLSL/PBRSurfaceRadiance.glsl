
const int ENVMAP_FLAG_HEADLIGHT =  1; // 1<<0;

struct MaterialParams {
  vec3 baseColor;
  float ambientOcclusion;
  float metallic;
  float roughness;
  float reflectance;
  float opacity;
  float emission;
};

#ifndef ENABLE_PBR

vec4 pbrSurfaceRadiance(in MaterialParams material, vec3 normal, in vec3 viewVector) {
  vec3 irradiance = vec3(dot(normal, viewVector));
  float ao = material.ambientOcclusion; 
  return vec4(material.baseColor * ao * irradiance + (material.emission * material.baseColor), material.opacity);

  // return vec4(material.baseColor * ao * irradiance , material.opacity);
}

#else

uniform int envMapFlags;
uniform samplerCube irradianceMap;
uniform samplerCube prefilterMap;
uniform sampler2D brdfLUT;

vec3 sampleIrradiance(vec3 dir) {
  return texture(irradianceMap, dir).rgb;
}


vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(max(1.0 - cosTheta, 0.0), 5.0);
}

float luminance(vec3 color) {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

vec4 pbrSurfaceRadiance(in MaterialParams material, vec3 normal, in vec3 viewVector) {

    vec3 N = normal;
    vec3 V = viewVector;
    vec3 R = reflect(-V, N);
    float roughness = material.roughness * material.roughness;
    vec3 diffuseColor = (1.0 - material.metallic) * material.baseColor;

    // Note: The specular reflectance of metallic surfaces is chromatic
    // https://google.github.io/filament/Filament.html#listing_fnormal
    vec3 F0 = 0.16 * material.reflectance * material.reflectance * (1.0 - material.metallic) + material.baseColor * material.metallic;

    float NdotV = dot(N, V);

    vec3 F = fresnelSchlickRoughness(max(NdotV, 0.0), F0, roughness);

    vec3 kS = F;
    vec3 kD = 1.0 - kS;
    kD *= 1.0 - material.metallic;
    float ao = material.ambientOcclusion; 
    
    vec3 irradiance;
    vec3 irradianceSampleDir = normal;
    
    bool headLightMode = testFlag(envMapFlags, ENVMAP_FLAG_HEADLIGHT);
    if (headLightMode) {
      irradianceSampleDir = viewVector;
    }
    irradiance = sampleIrradiance(irradianceSampleDir);
   // vec3 irradiance = shGetIrradianceAt(shCoefficients, N);
    vec3 diffuse    = irradiance * diffuseColor;
    
    const float MAX_REFLECTION_LOD = 4.0;
    vec3 prefilteredColor = textureLod(prefilterMap, R,  roughness * MAX_REFLECTION_LOD).rgb;   
    vec2 envBRDF  = texture(brdfLUT, vec2(max(NdotV, 0.0), roughness)).rg;
    vec3 specular = prefilteredColor * (F * envBRDF.x + envBRDF.y);
    
    vec3 radiance = (kD * diffuse + specular) * ao;
    
    // Now handle semi-transparent objects. We need to be able to linearly interpolate
    // opacity to make objects disappear, so we need a continuous change.
    float opacity = material.opacity;
    vec4 transparent = vec4((radiance * opacity) + specular, opacity + luminance(specular) + luminance(F));
    vec4 result = mix(transparent, vec4(radiance, 1.0), opacity);

    // Add emission on as the final component.
    // Note: emission allows a material to blend off its specular component, 
    // which can also be used to make an object completely disappear if also transparent.
    return mix(result, vec4(material.baseColor, opacity), material.emission);
}


#endif // ENABLE_PBR
