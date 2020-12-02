import { shaderLibrary } from '../../ShaderLibrary.js'

shaderLibrary.setShaderModule(
  'PBRSurfaceRadiance.glsl',
  `

const int ENVMAP_FLAG_HEADLIGHT =  1; // 1<<0;
  
struct MaterialParams {
    vec3 baseColor;
    float metallic;
    float roughness;
    float reflectance;
};

vec4 pbrSpecularReflectance(in MaterialParams materialParams, vec3 normal, in vec3 viewVector) {

    float NdotV = dot(normal, viewVector);
    
    // -------------------------- Specular Reflectance --------------------------
    // vec3 ks = vec3(0.0);
    // vec3 specular = GGX_Specular_PrefilteredEnv(normal, viewVector, materialParams.roughness, F0, ks );
    // vec3 kd = (vec3(1.0) - ks) * vec3(1.0 - metallic);    

    float schlickFresnel = materialParams.reflectance + pow((1.0-materialParams.reflectance)*(1.0-NdotV), 5.0);

    vec3 specularReflectance = GGX_Specular_PrefilteredEnv(normal, viewVector, materialParams.roughness, schlickFresnel);


    // -------------------------- Specular Occlusion --------------------------
    // Fast and quick way of reducing specular reflection in areas that are less exposed to the environment
    // A better approch is to try screen space specular occlusion but need to check performance and feasibility in webGL
    //float specularOcclusion = clamp(length(irradiance), 0.01, 1.0);    
    //specularReflectance = (specularReflectance * specularOcclusion); 

    return vec4(specularReflectance, schlickFresnel);
}


vec3 pbrSurfaceRadiance(in MaterialParams materialParams, vec3 irradiance, vec3 normal, in vec3 viewVector) {

    float NdotV = dot(normal, viewVector);
    vec3 specularReflectance;

    // -------------------------- Diffuse Reflectance --------------------------

    vec3 diffuseReflectance = materialParams.baseColor * irradiance;

    // From the Disney dielectric BRDF    
    // Need to check if this is useful for us but the implementation works based on their paper
    //diffuseReflectance = (diffuseReflectance / PI); // << [PT 18-08-2018] What did this line do??? (makes everything 3.1x darker.)
    // diffuseReflectance = vec3(mix(diffuseReflectance, diffuseReflectance * mix(0.5, 2.5, materialParams.roughness), pow(1.0 - NdotV, 5.0)));
    diffuseReflectance = vec3(mix(diffuseReflectance, diffuseReflectance * mix(0.5, 1.0, materialParams.roughness), pow(1.0 - NdotV, 5.0)));


    // -------------------------- Color at normal incidence --------------------------
    
    // Need to use 'Reflectance' here instead of 'ior'
    //vec3 F0 = vec3(abs((1.0 - ior) / (1.0 + ior)));    
    //F0 = F0 * F0;
    //F0 = mix(F0, materialParams.baseColor, materialParams.metallic);      


    // -------------------------- Specular Reflectance --------------------------
    // vec3 ks = vec3(0.0);
    // vec3 specular = GGX_Specular_PrefilteredEnv(normal, viewVector, materialParams.roughness, F0, ks );
    // vec3 kd = (vec3(1.0) - ks) * vec3(1.0 - metallic);    

    float schlickFresnel = materialParams.reflectance + pow((1.0-materialParams.reflectance)*(1.0-NdotV), 5.0);

    specularReflectance = GGX_Specular_PrefilteredEnv(normal, viewVector, materialParams.roughness, schlickFresnel);


    // -------------------------- Specular Occlusion --------------------------
    // Fast and quick way of reducing specular reflection in areas that are less exposed to the environment
    // A better approch is to try screen space specular occlusion but need to check performance and feasibility in webGL
    //float specularOcclusion = clamp(length(irradiance), 0.01, 1.0);    
    //specularReflectance = (specularReflectance * specularOcclusion);  
      

    // -------------------------- Metallic --------------------------
    // We need to do few things given a higher > 0 metallic value
    //      1. tint specular reflectance by the albedo color (not at grazing angles)
    //      2. almost elliminate all diffuse reflectance (in reality metals have some diffuse due to layering (i.e. dust, prints, etc.))
    //      3. set "specular" artistic value to metallic range (0.6 - 0.85)

    specularReflectance = mix(specularReflectance, specularReflectance * materialParams.baseColor, materialParams.metallic);
    diffuseReflectance = mix(diffuseReflectance, vec3(0.0,0.0,0.0), materialParams.metallic); // Leaveing at pure black for now but always need some %3 diffuse left for imperfection of pulished pure metal
    // Would be best to compute reflectace internally and set here to 0.6-0.85 for metals
    

    // -------------------------- Final color --------------------------
    // Energy conservation already taken into account in both the diffuse and specular reflectance
    vec3 radiance = diffuseReflectance + specularReflectance;

    // radiance = vec4( kd * diffuse + /*ks */ specular, 1);
    return radiance;
}
`
)
