import { shaderLibrary } from '../ShaderLibrary';
import { GLShader } from '../GLShader.js';
import './GLSL/utils/quadVertexFromID.js';

class ConvolverShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'ConvolverShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID();
  v_texCoord = position+0.5;
  gl_Position = vec4(position*2.0, 0.0, 1.0);
}
`
    );
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'ConvolverShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="utils/imagePyramid.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>

uniform float roughness;
varying vec2 v_texCoord;

uniform sampler2D hammersleyMap;
vec2 Hammersley(int i, int N) {
  vec4 rgba =  texture2D(hammersleyMap, vec2((float(i) + 0.5)/float(N)), 0.5);
  return rgba.rg;
}

mat3 matrixFromVector(vec3 n) { // frisvad
  float a = 1.0 / (1.0 + n.z);
  float b = -n.x * n.y * a;
  vec3 b1 = vec3(1.0 - n.x * n.x * a, b, -n.x);
  vec3 b2 = vec3(b, 1.0 - n.y * n.y * a, -n.y);
  return mat3(b1, b2, n);
}

vec3 ImportanceSampleGGX(vec2 Xi, float a) {
  float phi = 2.0 * PI * Xi.x;
  float cos_theta = sqrt((1.0 - Xi.y)/(1.0 + (a*a - 1.0) * Xi.y));
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  // float phi = Xi.y * 2.0 * PI;
  // float cos_theta = sqrt(1.0 - Xi.x);
  // float sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  vec3 H;
  H.x = sin_theta * cos(phi);
  H.y = sin_theta * sin(phi);
  H.z = cos_theta;
  return H;
}

// TODO: use tobias's code. The guy clearly knows what he's doing...
// https://github.com/thefranke/dirtchamber/blob/master/shader/importance.hlsl
// Compute a LOD level for filtered importance sampling.
// From GPU Gems 3: GPU-Based Importance Sampling.


#define M_PI       3.14159265358979323846   // pi
#define M_HALF_PI  1.57079632679489661923   // pi/2
float sqr(float val){ return val*val; }
float saturate(float val) { return clamp(val, 0.0, 1.0); }
vec3 saturate(vec3 val) { return clamp(val, 0.0, 1.0); }

// Microfacet Models for Refraction through Rough Surfaces
// Walter et al.
// http://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.html
// aka Towbridge-Reitz
float D_ggx(in float alpha, in float NoH)
{
  float a2 = alpha*alpha;
  float cos2 = NoH*NoH;

  return (1.0/M_PI) * sqr(alpha/(cos2 * (a2 - 1.0) + 1.0));

  /*
  // version from the paper, eq 33
  float CosSquared = NoH*NoH;
  float TanSquared = (1.0 - CosSquared)/CosSquared;
  return (1.0/M_PI) * sqr(alpha/(CosSquared * (alpha*alpha + TanSquared)));
  */
}
float compute_lod(in vec3 H, in float pdf, in int num_samples, in int ww, in int hh)
{
  return max(0.0, 0.5*log2(float(ww*hh)/float(num_samples)) - 0.5*log2(pdf));
}

uniform sampler2D   envMapPyramid;
uniform sampler2D   envMapPyramid_layout;
uniform vec4        envMapPyramid_desc;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec3 N = sphOctUvToDir(v_texCoord);

  if(false){
    vec2 uv = dirToSphOctUv(N);
    // fragColor = vec4(uv.x, uv.y, 0.0, 1.0);
    fragColor = sampleImagePyramid(uv, 0.5, envMapPyramid_layout, envMapPyramid, envMapPyramid_desc);
    // fragColor = sampleSubImage(uv, 0, envMapPyramid_layout, envMapPyramid, envMapPyramid_desc);
    // fragColor = texture2D(envMapPyramid, uv);
  }
  else{
    const int numSamples = NUM_SAMPLES;
    int w = int(floor(envMapPyramid_desc.x + 0.5));
    int h = int(floor(envMapPyramid_desc.y + 0.5));

    vec4 color = vec4(0.0,0.0,0.0,0.0);
    float weight = 0.0;
    mat3 vecSpace = matrixFromVector(N);
    float a = roughness*roughness;
    for(int i=0; i<numSamples; i++) {
      vec2 Xi = Hammersley(i, numSamples);
      vec3 H = ImportanceSampleGGX(Xi, a);
      vec3 V = normalize(vecSpace * H);
      float VdotN = dot(V, N);
      float NoH = saturate( dot( N, H ) );
      float VoH = saturate( dot( V, H ) );

      vec2 uv = dirToSphOctUv(V);
      // float pdf = D_ggx(a, NoH) * NoH / (4.0 * VoH);
      // float lod = compute_lod(H, pdf, numSamples, w, h);

      color += sampleImagePyramid(uv, a, envMapPyramid_layout, envMapPyramid, envMapPyramid_desc) * VdotN;
      weight += VdotN;
    }
    color /= float(weight);
    fragColor = vec4(color.rgb, 1.0);
  }
  
#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}

`
    );
  }
}

export { ConvolverShader };
