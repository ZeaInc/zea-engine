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
varying vec3 v_worldPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);
    

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

gl_Position.z = mix(gl_Position.z, -gl_Position.w, overlay);

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

<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>


#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float Opacity;

#endif // ENABLE_MULTI_DRAW


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
varying vec3 v_worldPos;

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
  vec4 baseColor = getMaterialValue(materialCoords, 0);
  vec4 matValue1 = getMaterialValue(materialCoords, 1);
  float opacity  = matValue1.r;

#else // ENABLE_MULTI_DRAW

  vec4 baseColor = BaseColor;
  float opacity = Opacity;

#endif // ENABLE_MULTI_DRAW
  //////////////////////////////////////////////
  
  fragColor = baseColor;
  fragColor.a *= opacity;

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
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0001 }) // Provide a slight overlay so lines draw over meshes.
    return paramDescs
  }

  /**
   * The getPackedMaterialData method.
   * @param {any} material - The material param.
   * @return {any} - The return value.
   */
  static getPackedMaterialData(material) {
    const matData = new Float32Array(8)
    const baseColor = material.getParameter('BaseColor').getValue()
    matData[0] = baseColor.r
    matData[1] = baseColor.g
    matData[2] = baseColor.b
    matData[3] = baseColor.a
    // Note: By avoiding calling this value 'Opacity', the lines will not be considered 'Transparent'
    // Lines do not need to be depth sorted....
    matData[4] = material.getParameter('Opacity').getValue()
    matData[5] = material.getParameter('Overlay').getValue()
    return matData
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }

  bind(renderstate, key) {
    const res = super.bind(renderstate, key)
    const gl = this.__gl
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    return res
  }

  /**
   * The unbind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @return {any} - The return value.
   */
  unbind(renderstate) {
    const res = super.unbind(renderstate)
    const gl = this.__gl
    gl.disable(gl.BLEND)
    return res
  }
}

Registry.register('LinesShader', LinesShader)
export { LinesShader }
