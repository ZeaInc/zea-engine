import { shaderLibrary } from '../ShaderLibrary';
import { GLShader } from '../GLShader.js';

import './GLSL/stack-gl/inverse.js';
import './GLSL/stack-gl/transpose.js';
import './GLSL/envmap-octahedral.js';
import './GLSL/envmap-equirect.js';
import './GLSL/envmap-dualfisheye.js';
import './GLSL/utils/quadVertexFromID.js';

class EnvMapShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'EnvMapShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

<%include file="stack-gl/inverse.glsl"/>
<%include file="stack-gl/transpose.glsl"/>

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID() * 2.0;
  v_texCoord = position * 0.5 + 0.5;

  mat4 inverseProjection = inverse(projectionMatrix);
  mat3 inverseModelview = transpose(mat3(viewMatrix));

  // transform from the normalized device coordinates back to the view space
  vec3 unprojected = (inverseProjection * vec4(position, 0, 1)).xyz;

  // transfrom from the view space back to the world space
  // and use it as a sampling vector
  v_worldDir = inverseModelview * unprojected;

  gl_Position = vec4(position, 0, 1);
}

`
    );
  }
}

class BackgroundImageShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LatLongEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-equirect.glsl"/>

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
uniform float exposure;
#endif

uniform sampler2D backgroundImage;


/* VS Outputs */
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec4 texel = texture2D(backgroundImage, v_texCoord);
  fragColor = vec4(texel.rgb/texel.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  //fragColor.rgb = toGamma(fragColor.rgb * exposure);

  // Assuming a simple RGB image in gamma space for now.
  fragColor.rgb = fragColor.rgb * exposure;
#endif


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
}

class OctahedralEnvMapShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'OctahedralEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>
<%include file="utils/imagePyramid.glsl"/>
<%include file="stack-gl/gamma.glsl"/>

uniform float focus;

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

// uniform ImageAtlas envMap;
uniform sampler2D   envMapPyramid;
uniform sampler2D   envMapPyramid_layout;
uniform vec4        envMapPyramid_desc;


/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 uv = dirToSphOctUv(normalize(v_worldDir));
  if(false){
    // Use these lines to debug the src GL image.
    vec4 texel = texture2D(envMapPyramid, uv);
    fragColor = vec4(texel.rgb/texel.a, 1.0);
  }
  else{
    fragColor = vec4(sampleImagePyramid(uv, focus, envMapPyramid_layout, envMapPyramid, envMapPyramid_desc).rgb, 1.0);
  }

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
}

class LatLongEnvMapShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LatLongEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-equirect.glsl"/>

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
uniform float exposure;
#endif

uniform sampler2D backgroundImage;


/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 uv = latLongUVsFromDir(normalize(v_worldDir));

  vec4 texel = texture2D(backgroundImage, uv);
  fragColor = vec4(texel.rgb/texel.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif
#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations();
    return paramDescs;
  }
}

class SterioLatLongEnvMapShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'SterioLatLongEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-equirect.glsl"/>

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
uniform float exposure;
#endif

uniform int eye;// L = 0, R = 1;

uniform sampler2D backgroundImage;

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 uv = latLongUVsFromDir(normalize(v_worldDir));
  uv.y *= 0.5;
  if(eye == 1){
    uv.y += 0.5;
  }

  vec4 texel = texture2D(backgroundImage, uv);
  fragColor = vec4(texel.rgb/texel.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  //fragColor.rgb = toGamma(fragColor.rgb * exposure);

  // Assuming a simple RGB image in gamma space for now.
  fragColor.rgb = fragColor.rgb * exposure;
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
}

class DualFishEyeEnvMapShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'DualFishEyeEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-dualfisheye.glsl"/>

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
uniform float exposure;
#endif

uniform sampler2D backgroundImage;

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 uv = dualfisheyeUVsFromDir(normalize(v_worldDir));

  vec4 texel = texture2D(backgroundImage, uv);
  fragColor = vec4(texel.rgb/texel.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  //fragColor.rgb = toGamma(fragColor.rgb * exposure);

  // Assuming a simple RGB image in gamma space for now.
  fragColor.rgb = fragColor.rgb * exposure;
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
}

class DualFishEyeToLatLongBackgroundShader extends EnvMapShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'DualFishEyeEnvMapShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-equirect.glsl"/>
<%include file="pragmatic-pbr/envmap-dualfisheye.glsl"/>

#define ENABLE_INLINE_GAMMACORRECTION
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
uniform float exposure;
#endif

uniform sampler2D backgroundImage;

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 uv = dualfisheyeUVsFromDir(dirFromLatLongUVs(v_texCoord.x, v_texCoord.y));
  vec4 texel = texture2D(backgroundImage, uv);
  fragColor = vec4(texel.rgb/texel.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  //fragColor.rgb = toGamma(fragColor.rgb * exposure);

  // Assuming a simple RGB image in gamma space for now.
  // fragColor.rgb = fragColor.rgb * exposure;
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
    this.finalize();
  }
}

export {
  EnvMapShader,
  BackgroundImageShader,
  OctahedralEnvMapShader,
  LatLongEnvMapShader,
  SterioLatLongEnvMapShader,
  DualFishEyeEnvMapShader,
  DualFishEyeToLatLongBackgroundShader,
};
