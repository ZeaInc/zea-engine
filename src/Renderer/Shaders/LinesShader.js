import { Color } from '../../Math/Color'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class LinesShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl, 'LinesShader')
    this.setShaderStage(
      'VERTEX_SHADER',
      `
precision highp float;

attribute vec3 positions;
attribute vec3 positionsNext;

<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

#ifdef ENABLE_MULTI_DRAW
<%include file="materialparams.glsl"/>
#else
uniform float Overlay;
#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_worldPos;
varying vec3 v_nextVertexDist;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
  vec4 viewPosNext = modelViewMatrix * vec4(positionsNext, 1.0);

#ifdef ENABLE_ES3
  float nextVertexDist = length(viewPosNext.xyz - viewPos.xyz);
  if (imod(gl_VertexID, 2) == 0) {
    v_nextVertexDist.x = nextVertexDist;
    v_nextVertexDist.y = 0.0;
  } else {
    v_nextVertexDist.x = 0.0;
    v_nextVertexDist.y = nextVertexDist;
  }
  v_nextVertexDist.z = float(gl_VertexID);
#endif

  v_viewPos = viewPos.xyz;
  gl_Position = projectionMatrix * viewPos;
    

  //////////////////////////////////////////////
  // Overlay

#ifdef ENABLE_MULTI_DRAW
  vec2 materialCoords = v_geomItemData.zw;
  vec4 materialValue1 = getMaterialValue(materialCoords, 1);
  int maintainScreenSize = int(materialValue1.x + 0.5);
  float overlay = materialValue1.y;
#else
  float overlay = Overlay;
#endif

#if defined(DRAW_GEOMDATA)
  gl_Position.z = mix(gl_Position.z, -gl_Position.w, mix(overlay, 1.0, 0.0001));
#else
  gl_Position.z = mix(gl_Position.z, -gl_Position.w, overlay);
#endif

  //////////////////////////////////////////////
  
  
  vec4 pos = vec4(positions, 1.);
  v_worldPos      = (modelMatrix * pos).xyz;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

<%include file="GLSLUtils.glsl"/>
<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>


uniform int occluded;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float Opacity;

uniform float StippleScale;
uniform float StippleValue;
uniform float OccludedStippleValue;

#endif // ENABLE_MULTI_DRAW

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


#ifdef ENABLE_FLOAT_TEXTURES
vec4 getCutaway(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}

#else

uniform vec4 cutawayData;

vec4 getCutaway(int id) {
    return cutawayData;
}

#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_worldPos;
varying vec3 v_nextVertexDist;

#ifdef ENABLE_ES3
  out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  int drawItemId = int(v_drawItemId + 0.5);
  int flags = int(v_geomItemData.r + 0.5);

  // Cutaways
  if(testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) 
  {
      vec4 cutAwayData   = getCutaway(drawItemId);
      vec3 planeNormal = cutAwayData.xyz;
      float planeDist = cutAwayData.w;
      if(cutaway(v_worldPos, planeNormal, planeDist)){
          discard;
          return;
      }
  }

  //////////////////////////////////////////////
  // Material

#ifdef ENABLE_MULTI_DRAW

  vec2 materialCoords = v_geomItemData.zw;
  vec4 BaseColor = getMaterialValue(materialCoords, 0);
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  vec4 matValue2 = getMaterialValue(materialCoords, 2);
  float Opacity  = matValue1.r;

  float StippleScale = matValue1.b;
  float StippleValue = matValue1.a;
  float OccludedStippleValue = matValue2.r;
#endif // ENABLE_MULTI_DRAW

  ///////////////////
  // Stippling
  float stippleValue = occluded == 0 ? StippleValue : OccludedStippleValue;
#ifdef ENABLE_ES3 // No stippling < es3 
  if (stippleValue > 0.0) {
    // Note: a value of 0.0, means no stippling (solid). A value of 1.0 means invisible
    float dist = -v_viewPos.z * StippleScale;
    float nextVertexDist = imod(int(floor(v_nextVertexDist.z)), 2) == 0 ? v_nextVertexDist.x : v_nextVertexDist.y;
    if (mod(nextVertexDist / dist, 1.0) < stippleValue) {
      discard;
      return;
    }
  }
#endif

  //////////////////////////////////////////////
  // Color
#if defined(DRAW_COLOR)

  fragColor = BaseColor;
  fragColor.a *= Opacity;

  
#ifndef ENABLE_ES3
  if (occluded == 1) fragColor.a *= 1.0 - stippleValue;
#endif

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

  if(testFlag(flags, GEOMITEM_INVISIBLE_IN_GEOMDATA)) {
    discard;
    return;
  }
  
  float viewDist = length(v_viewPos);

  if(floatGeomBuffer != 0) {
    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemId);
    fragColor.b = 0.0;// TODO: store poly-id or something.
    fragColor.a = viewDist;
  } else {
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
  
  fragColor = getHighlightColor(drawItemId);

#endif // DRAW_HIGHLIGHT


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
    paramDescs.push({ name: 'BaseColor', defaultValue: new Color(1.0, 1.0, 0.5) })
    paramDescs.push({ name: 'Opacity', defaultValue: 0.7 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.000001 }) // Provide a slight overlay so lines draw over meshes.
    paramDescs.push({ name: 'StippleScale', defaultValue: 0.01 })

    // Note: a value of 0.0, means no stippling (solid). A value of 1.0 means invisible.
    // Any value in between determines how much of the solid line is removed.
    paramDescs.push({ name: 'StippleValue', defaultValue: 0, range: [0, 1] })
    paramDescs.push({ name: 'OccludedStippleValue', defaultValue: 1.0, range: [0, 1] })
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
    // Note: By avoiding calling this value 'Opacity', the lines will not be considered 'Transparent'
    // Lines do not need to be depth sorted....
    matData[4] = material.getParameter('Opacity').getValue()
    matData[5] = material.getParameter('Overlay').getValue()
    matData[6] = material.getParameter('StippleScale').getValue()
    matData[7] = material.getParameter('StippleValue').getValue()

    matData[8] = material.getParameter('OccludedStippleValue').getValue()
    return matData
  }
}

Registry.register('LinesShader', LinesShader)
export { LinesShader }
