
precision highp float;

import 'GLSLUtils.glsl'
import 'gamma.glsl'
import 'constants.glsl'

uniform float focus;
uniform float exposure;

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;


#define ENABLE_INLINE_GAMMACORRECTION

#define ENV_MAP_LATLONG 0
#define ENV_MAP_OCT 1
#define ENV_MAP_CUBE 2
#define ENV_MAP_irradianceMap 8
#define ENV_MAP_prefilterMap 3
#define ENV_MAP_STEREO_LATLONG 4
#define ENV_MAP_DUALFISHEYE 5
#define ENV_MAP_SH 6
#define ENV_MAP_BRDF_LUT 7

#define ENV_MAPTYPE ENV_MAP_OCT

#if (ENV_MAPTYPE == ENV_MAP_LATLONG)  

import 'envmap-equirect.glsl'

uniform sampler2D backgroundImage;

vec4 sampleEnvMap(vec3 dir) {
  vec2 uv = latLongUVsFromDir(normalize(dir));
  vec4 texel = texture2D(backgroundImage, uv) * exposure;
  return vec4(texel.rgb/texel.a, 1.0);
}

#elif (ENV_MAPTYPE == ENV_MAP_OCT)  

import 'envmap-octahedral.glsl'

uniform sampler2D   envMap;

vec4 sampleEnvMap(vec3 dir) {
  vec2 uv = dirToSphOctUv(normalize(dir));
  if (false) {
    vec4 texel = texture2D(envMap, uv);
    return vec4(texel.rgb/texel.a, 1.0);
  }
  else {
    return texture2D(envMap, uv) * exposure;
  }
}

#elif (ENV_MAPTYPE == ENV_MAP_CUBE)

uniform samplerCube cubeMap;

vec4 sampleEnvMap(vec3 dir) {
  return texture(cubeMap, dir, 0.0);// * exposure;
  // return textureLod(cubeMap, dir, exposure);
}

#elif (ENV_MAPTYPE == ENV_MAP_irradianceMap)

uniform samplerCube irradianceMap;

vec4 sampleEnvMap(vec3 dir) {
  return textureLod(irradianceMap, dir, exposure);
}

#elif (ENV_MAPTYPE == ENV_MAP_prefilterMap)

uniform samplerCube prefilterMap;

vec4 sampleEnvMap(vec3 dir) {
  return textureLod(prefilterMap, dir, exposure);
}

#elif (ENV_MAPTYPE == ENV_MAP_STEREO_LATLONG)  

import 'envmap-equirect.glsl'
uniform int eye;// L = 0, R = 1;
uniform sampler2D backgroundImage;

vec4 sampleEnvMap(vec3 dir) {
  vec2 uv = latLongUVsFromDir(normalize(v_worldDir));
  uv.y *= 0.5;
  if (eye == 1) {
    uv.y += 0.5;
  }
  vec4 texel = texture2D(backgroundImage, uv) * exposure;
  fragColor = vec4(texel.rgb/texel.a, 1.0);
}

#elif (ENV_MAPTYPE == ENV_MAP_DUALFISHEYE)

import 'envmap-dualfisheye.glsl'

vec4 sampleEnvMap(vec3 dir) {
  vec2 uv = dualfisheyeUVsFromDir(dir);
  return texture2D(backgroundImage, uv) * exposure;
}

#elif (ENV_MAPTYPE == ENV_MAP_SH)

import 'SHCoeffs.glsl'

vec4 sampleEnvMap(vec3 dir) {
	return vec4(sampleSHCoeffs(dir) * exposure, 1.0);
}

#elif (ENV_MAPTYPE == ENV_MAP_BRDF_LUT)

uniform sampler2D brdfLUT;

vec4 sampleEnvMap(vec3 dir) {
  return texture2D(brdfLUT, v_texCoord);
}
#endif

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = sampleEnvMap(normalize(v_worldDir));

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
