import { Color, Vec3 } from '../../Math/index'
import { Registry } from '../../Registry'
import { GLShader } from '../GLShader.js'
import { shaderLibrary } from '../ShaderLibrary.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/envmap-equirect.js'
import './GLSL/envmap-octahedral.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class EnvProjectionShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'EnvProjectionShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;    //(location = 0)

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 projectionCenter;

<%include file="stack-gl/inverse.glsl"/>
<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying vec3 v_worldDir;
 
void main()
{
  int drawItemId = getDrawItemId();
  vec4 pos = vec4(positions, 1.);
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;

  gl_Position = modelViewProjectionMatrix * pos;

  vec4 worldPos = modelMatrix * pos;
  v_worldDir = worldPos.xyz - projectionCenter;
}

`
    )

    this.finalize()
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'projectionCenter',
      defaultValue: new Vec3(0.0, 0.0, 1.7),
    })
    return paramDescs
  }
}

class OctahedralEnvProjectionShader extends EnvProjectionShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'OctahedralEnvProjectionShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>


uniform color envMap;
uniform sampler2D envMapTex;
uniform int envMapTexType;


uniform float exposure;

/* VS Outputs */
varying vec3 v_worldDir;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 texCoord = dirToSphOctUv(normalize(v_worldDir));
  vec4 env = getColorParamValue(envMap, envMapTex, envMapTexType, texCoord);

  fragColor = vec4(env.rgb/env.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
    this.finalize()
  }
}

Registry.register('OctahedralEnvProjectionShader', OctahedralEnvProjectionShader)

class LatLongEnvProjectionShader extends EnvProjectionShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LatLongEnvProjectionShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-equirect.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

uniform color envMap;
uniform sampler2D envMapTex;
uniform int envMapTexType;

uniform float exposure;

/* VS Outputs */
varying vec3 v_worldDir;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  vec2 texCoord = latLongUVsFromDir(normalize(v_worldDir));
  vec4 env = getColorParamValue(envMap, envMapTex, envMapTexType, texCoord);
  fragColor = vec4(env.rgb/env.a, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
    this.finalize()
  }
}

Registry.register('LatLongEnvProjectionShader', LatLongEnvProjectionShader)
export { EnvProjectionShader, OctahedralEnvProjectionShader, LatLongEnvProjectionShader }
