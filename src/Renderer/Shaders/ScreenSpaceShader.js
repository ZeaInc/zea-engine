import { Color } from '../../Math/Color'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class ScreenSpaceShader extends GLShader {
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
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif

<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif


void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);

  gl_Position = (modelMatrix * vec4(positions, 1.0));

  v_textureCoord = texCoords;
  v_textureCoord.y = 1.0 - v_textureCoord.y;// Flip y
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

#ifdef ENABLE_MULTI_DRAW
<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
#endif // ENABLE_MULTI_DRAW

<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>


#if defined(DRAW_COLOR)

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
#endif

#endif // ENABLE_MULTI_DRAW
#endif // DRAW_COLOR


/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif


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

#else // ENABLE_MULTI_DRAW

#ifndef ENABLE_TEXTURES
  vec4 baseColor = BaseColor;
#else
  vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, v_textureCoord);
#endif

#endif // ENABLE_MULTI_DRAW

  fragColor = baseColor;

#ifdef ENABLE_INLINE_GAMMACORRECTION
  fragColor.rgb = toGamma(fragColor.rgb);
#endif

  //////////////////////////////////////////////
  // GeomData
#elif defined(DRAW_GEOMDATA)

  if(true) {
    discard;
    return;
  }

  fragColor = vec4(-1, -1, -1, 0);

#endif // DRAW_GEOMDATA

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )

    this.finalize()
  }

  static isOverlay() {
    return true
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
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
    return matData
  }
}

Registry.register('ScreenSpaceShader', ScreenSpaceShader)
export { ScreenSpaceShader }
