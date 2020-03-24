import { Color, Vec3 } from '../../Math/index'
import { sgFactory } from '../../SceneTree/index'
import { GLShader } from '../GLShader.js'
import { shaderLibrary } from '../ShaderLibrary.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/envmap-equirect.js'
import './GLSL/envmap-octahedral.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class BaseShadowCatcherShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'FlatShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;
attribute vec2 lightmapCoords;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 ProjectionCenter;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

attribute float clusterIDs;
uniform vec2 lightmapSize;

/* VS Outputs */
// varying vec2 v_lightmapCoord;
varying vec3 v_worldDir;

void main(void) {
    int drawItemId = getDrawItemId();

    vec4 geomItemData = getInstanceData(drawItemId);

    vec4 pos = vec4(positions, 1.);
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
    gl_Position     = modelViewProjectionMatrix * pos;

    vec4 worldPos = modelMatrix * pos;
    v_worldDir = worldPos.xyz - ProjectionCenter;

    v_lightmapCoord = (lightmapCoords + geomItemData.zw) / lightmapSize;
}
`
    )
  }
}

class ShadowCatcherShader extends BaseShadowCatcherShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'ShadowCatcherShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
#endif

/* VS Outputs */
varying vec2 v_lightmapCoord;
varying vec3 v_worldDir;

uniform sampler2D lightmap;
uniform float ShadowMultiplier;

uniform color envMap;
uniform sampler2D envMapTex;
uniform int envMapTexType;

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

float luminanceFromRGB(vec3 rgb) {
    return 0.2126*rgb.r + 0.7152*rgb.g + 0.0722*rgb.b;
}


#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

    vec4 env = envMap;
    if(envMapTexType != 0) {
        vec2 texCoord = dirToSphOctUv(normalize(v_worldDir));
        env = texture2D(envMapTex, texCoord);
    }

    vec3 irradiance = texture2D(lightmap, v_lightmapCoord).rgb * ShadowMultiplier;
    float irradianceLum = clamp(luminanceFromRGB(irradiance), 0.0, 1.0);

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    fragColor = vec4(env.rgb/env.a, 1.0);
    fragColor.rgb = mix(fragColor.rgb * irradiance, fragColor.rgb, irradianceLum);

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

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'ProjectionCenter',
      defaultValue: new Vec3(0.0, 0.0, 1.7),
    })
    paramDescs.push({ name: 'ShadowMultiplier', defaultValue: 1.0 })
    return paramDescs
  }

  static isTransparent() {
    return true
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

sgFactory.registerClass('ShadowCatcherShader', ShadowCatcherShader)

class FloatingShadowCatcherShader extends BaseShadowCatcherShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FloatingShadowCatcherShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>
<%include file="pragmatic-pbr/envmap-octahedral.glsl"/>

/* VS Outputs */
varying vec2 v_lightmapCoord;
varying vec3 v_worldDir;

uniform sampler2D lightmap;

uniform float ShadowMultiplier;

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif


#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif
    
    float shadow = luminanceFromRGB(texture2D(lightmap, v_lightmapCoord).rgb) * ShadowMultiplier;

    // This material works by multiplying the image buffer values by the luminance in the lightmap.
    fragColor.rgb = vec3(pow(shadow, 1.0/ShadowMultiplier));
    fragColor.a = 1.0;

#ifdef ENABLE_INLINE_GAMMACORRECTION
    fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`
    )
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'MULTIPLY') return false
    return super.bind(renderstate, key)
  }

  static isTransparent() {
    return true
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({ name: 'ShadowMultiplier', defaultValue: 1.0 })
    return paramDescs
  }
}

sgFactory.registerClass(
  'FloatingShadowCatcherShader',
  FloatingShadowCatcherShader
)
