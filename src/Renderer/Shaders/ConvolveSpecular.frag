precision highp float;

import 'GLSLUtils.glsl'
import 'ImportanceSampleGGX.glsl'
import 'convolve-helpers.glsl'
import 'Hammersley.glsl'
  
  
uniform float roughness;
uniform int faceId;
varying vec2 v_texCoord;

out vec4 fragColor;
void main(void) {

  vec3 N = cubeFaceUvToDir(v_texCoord.x, v_texCoord.y, faceId);   

  vec3 R = N;
  vec3 V = R;

  float totalWeight = 0.0;   
  vec3 prefilteredColor = vec3(0.0);     
  for(uint i = 0u; i < SAMPLE_COUNT; ++i)
  {
    vec2 Xi = Hammersley(i, SAMPLE_COUNT);
    vec3 H  = ImportanceSampleGGX(Xi, N, roughness);
    vec3 L  = normalize(2.0 * dot(V, H) * H - V);

    float NdotL = max(dot(N, L), 0.0);
    if (NdotL > 0.0)
    {
      prefilteredColor += sampleEnvMap(L).rgb * NdotL;
      totalWeight      += NdotL;
    }
  }
  prefilteredColor = prefilteredColor / totalWeight;

  fragColor = vec4(prefilteredColor, 1.0);
}
