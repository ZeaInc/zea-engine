import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'

class PointsShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage(
      'VERTEX_SHADER',
      `
precision highp float;

attribute vec3 positions;

<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

#ifdef ENABLE_MULTI_DRAW
<%include file="materialparams.glsl"/>
#else
uniform float PointSize;
uniform float Overlay;
#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.);
  gl_Position = projectionMatrix * viewPos;
  

  //////////////////////////////////////////////
  // Material
#ifdef ENABLE_MULTI_DRAW
  vec2 materialCoords = v_geomItemData.zw;
  vec4 materialValue1 = getMaterialValue(materialCoords, 1);
  int maintainScreenSize = int(materialValue1.x + 0.5);
  float pointSize = materialValue1.x;
  float overlay = materialValue1.y;
#else
  float pointSize = PointSize;
  float overlay = Overlay;
#endif
  //////////////////////////////////////////////

  // Note: as of 22/01/2021 gl_PointSize has stopped working again...
  gl_PointSize = pointSize;

#if defined(DRAW_GEOMDATA)
  // Make the geom data point size at least 8 pixels across, else its impossible to hit.
  gl_PointSize = max(8.0, pointSize);
#endif
  gl_Position.z = mix(gl_Position.z, -gl_Position.w, overlay);

  
  v_viewPos = -viewPos.xyz;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;

#endif

<%include file="GLSLUtils.glsl"/>
<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

#if defined(DRAW_GEOMDATA)

uniform int floatGeomBuffer;
uniform int passId;

<%include file="GLSLBits.glsl"/>

#elif defined(DRAW_HIGHLIGHT)

#ifdef ENABLE_FLOAT_TEXTURES
vec4 getHighlightColor(int id) {
  return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 4);
}
#else // ENABLE_FLOAT_TEXTURES

uniform vec4 highlightColor;

vec4 getHighlightColor() {
    return highlightColor;
}

#endif // ENABLE_FLOAT_TEXTURES

#endif // DRAW_HIGHLIGHT

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
/* VS Outputs */

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  //////////////////////////////////////////////
  // Color
#if defined(DRAW_COLOR)

#ifdef ENABLE_MULTI_DRAW

  vec2 materialCoords = v_geomItemData.zw;
  vec4 baseColor = getMaterialValue(materialCoords, 0);
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  float pointSize       = baseColor.a * matValue1.r;
  float overlay      = matValue1.g;

#else // ENABLE_MULTI_DRAW

  vec4 baseColor = BaseColor;

#endif // ENABLE_MULTI_DRAW

  fragColor = baseColor;

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

  float viewDist = length(v_viewPos);

  if(floatGeomBuffer != 0) {
    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemId);
    fragColor.b = 0.0;// TODO: store poly-id or something.
    fragColor.a = viewDist;
  }
  else {
      ///////////////////////////////////
      // UInt8 buffer
      fragColor.r = mod(v_drawItemId, 256.) / 256.;
      fragColor.g = (floor(v_drawItemId / 256.) + (float(passId) * 64.)) / 256.;


      // encode the dist as a 16 bit float
      vec2 float16bits = encode16BitFloatInto2xUInt8(viewDist);
      fragColor.b = float16bits.x;
      fragColor.a = float16bits.y;
  }

  //////////////////////////////////////////////
  // Highlight
#elif defined(DRAW_HIGHLIGHT)
  
  int drawItemId = int(v_drawItemId + 0.5);
  fragColor = getHighlightColor(drawItemId);

#endif // DRAW_HIGHLIGHT


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'PointSize', defaultValue: 2.0 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.00002 })
    return paramDescs
  }

  /**
   * The getPackedMaterialData method.
   * @param {any} material - The material param.
   * @return {any} - The return value.
   */
  static getPackedMaterialData(material) {
    const matData = new Float32Array(12)
    const baseColor = material.getParameter('BaseColor').getValue()
    matData[0] = baseColor.r
    matData[1] = baseColor.g
    matData[2] = baseColor.b
    matData[3] = baseColor.a
    matData[4] = material.getParameter('PointSize').getValue()
    matData[5] = material.getParameter('Overlay').getValue()
    return matData
  }
}

Registry.register('PointsShader', PointsShader)

export { PointsShader }
