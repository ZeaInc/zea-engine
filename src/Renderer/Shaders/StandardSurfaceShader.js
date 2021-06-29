import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import './GLSL/constants.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/materialparams.js'
import './GLSL/PBRSurface.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/debugColors.js'
import './GLSL/ImagePyramid.js'
import './GLSL/cutaways.js'
import './GLSL/computeViewNormal.js'

/** A standard shader handling Opaque and transparent items and PBR rendering.
 * @extends GLShader
 * @private
 */
class StandardSurfaceShader extends GLShader {
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
attribute vec3 normals;
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;
/* VS Outputs */


void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData = getInstanceData(drawItemId);

  vec4 pos = vec4(positions, 1.);
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  vec4 viewPos    = modelViewMatrix * pos;
  gl_Position     = projectionMatrix * viewPos;

  mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
  v_viewPos       = -viewPos.xyz;
  v_viewNormal    = normalMatrix * normals;

#ifdef ENABLE_TEXTURES
  v_textureCoord  = texCoords;
#endif

  v_worldPos      = (modelMatrix * pos).xyz;
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;
#ifdef ENABLE_MULTI_DRAW
// #define DEBUG_GEOM_ID
#endif

<%include file="GLSLUtils.glsl"/>
<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>

<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

#ifdef DEBUG_GEOM_ID
<%include file="debugColors.glsl"/>
#endif

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;
/* VS Outputs */


uniform color cutColor;

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

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

uniform mat4 cameraMatrix;

#ifndef ENABLE_MULTI_DRAW

uniform color BaseColor;
uniform float AmbientOcclusion;
uniform float Roughness;
uniform float Metallic;
uniform float Reflectance;
uniform float EmissiveStrength;
uniform float Opacity;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;

uniform sampler2D AmbientOcclusionTex;
uniform int AmbientOcclusionTexType;

#ifdef ENABLE_PBR
uniform sampler2D RoughnessTex;
uniform int RoughnessTexType;

uniform sampler2D MetallicTex;
uniform int MetallicTexType;

uniform sampler2D ReflectanceTex;
uniform int ReflectanceTexType;

uniform sampler2D NormalTex;
uniform int NormalTexType;
#endif // ENABLE_PBR

uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;

#endif // ENABLE_TEXTURES
#endif // ENABLE_MULTI_DRAW

<%include file="PBRSurfaceRadiance.glsl"/>

#ifdef ENABLE_PBR
mat3 cotangentFrame( in vec3 normal, in vec3 pos, in vec2 texCoord ) {
  // https://stackoverflow.com/questions/5255806/how-to-calculate-tangent-and-binormal
  vec3 n = normal;
  // derivations of the fragment position
  vec3 pos_dx = dFdx( pos );
  vec3 pos_dy = dFdy( pos );
  // derivations of the texture coordinate
  vec2 texC_dx = dFdx( texCoord );
  vec2 texC_dy = dFdy( texCoord );
  // tangent vector and binormal vector
  vec3 t = -(texC_dy.y * pos_dx - texC_dx.y * pos_dy);
  vec3 b = -(texC_dx.x * pos_dy - texC_dy.x * pos_dx);

  t = t - n * dot( t, n ); // orthonormalization ot the tangent vectors
  b = b - n * dot( b, n ); // orthonormalization of the binormal vectors to the normal vector
  b = b - t * dot( b, t ); // orthonormalization of the binormal vectors to the tangent vector
  mat3 tbn = mat3( normalize(t), normalize(b), n );

  return tbn;
}
#endif

<%include file="computeViewNormal.glsl"/>


#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {
    int drawItemId = int(v_drawItemId + 0.5);

    int flags = int(v_geomItemData.r + 0.5);
    // Cutaways
    if(testFlag(flags, GEOMITEM_FLAG_CUTAWAY)) {
        vec4 cutAwayData   = getCutaway(drawItemId);
        vec3 planeNormal = cutAwayData.xyz;
        float planeDist = cutAwayData.w;
        if(cutaway(v_worldPos, planeNormal, planeDist)){
            discard;
            return;
        }
        else if(!gl_FrontFacing){
#ifdef ENABLE_ES3
            fragColor = cutColor;
#else
            gl_FragColor = cutColor;
#endif
            return;
        }
    }

    //////////////////////////////////////////////
    // Normals
    vec3 viewNormal;
    if (length(v_viewNormal) < 0.1) {
      viewNormal = computeViewNormal(v_viewPos);
    } else {
      viewNormal = normalize(v_viewNormal);
    }
    vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);
    vec3 viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
    if(dot(normal, viewVector) < 0.0){
        normal = -normal;
        // Note: this line can be used to debug inverted meshes.
        //material.baseColor = vec3(1.0, 0.0, 0.0);
    }

    //////////////////////////////////////////////
    // Material

    MaterialParams material;

#ifdef ENABLE_MULTI_DRAW
    vec2 materialCoords = v_geomItemData.zw;
    vec4 matValue0      = getMaterialValue(materialCoords, 0);
    vec4 matValue1      = getMaterialValue(materialCoords, 1);
    vec4 matValue2      = getMaterialValue(materialCoords, 2);

    material.baseColor     = toLinear(matValue0.rgb);
    material.ambientOcclusion      = matValue1.r;
    material.metallic      = matValue1.g;
    material.roughness     = matValue1.b;
    material.reflectance   = matValue1.a;

    material.emission         = matValue2.r;
    material.opacity          = matValue2.g * matValue0.a;

#else // ENABLE_MULTI_DRAW

#ifndef ENABLE_TEXTURES
    material.baseColor     = toLinear(BaseColor.rgb);
    material.emission      = EmissiveStrength;

#ifdef ENABLE_PBR
    material.roughness     = Roughness;
    material.metallic      = Metallic;
    material.reflectance   = Reflectance;
#endif

#else
    // Planar YZ projection for texturing, repeating every meter.
    // vec2 texCoord       = v_worldPos.xz * 0.2;
    vec2 texCoord          = v_textureCoord;

    vec4 baseColor         = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord);
    material.ambientOcclusion = getLuminanceParamValue(AmbientOcclusion, AmbientOcclusionTex, AmbientOcclusionTexType, texCoord);
    material.baseColor     = baseColor.rgb;
    
#ifdef ENABLE_PBR

    material.metallic      = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexType, texCoord);
    material.roughness     = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexType, texCoord);

    // TODO: Communicate that this tex contains the roughness as well.
    if (MetallicTexType != 0) {
      vec4 metallicRoughness = vec4(Metallic, Roughness, 0.0, 1.0);
      metallicRoughness     = texture2D(MetallicTex, texCoord);
      material.roughness     = metallicRoughness.g;
      material.metallic     = metallicRoughness.b;
    }

    material.reflectance   = getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexType, texCoord);
#endif // ENABLE_PBR
    material.emission         = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, texCoord);
#endif // ENABLE_TEXTURES
    material.opacity       = Opacity * baseColor.a;

#ifdef ENABLE_TEXTURES
#ifdef ENABLE_PBR
    if(NormalTexType != 0) {
        mat3 tbn = cotangentFrame(normal, viewVector, texCoord);
        normal = normalize(tbn * (texture2D(NormalTex, texCoord).rgb * 2.0 - 1.0));
    }
#endif // ENABLE_PBR
#endif // ENABLE_TEXTURES
#endif // ENABLE_MULTI_DRAW

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    fragColor = pbrSurfaceRadiance(material, normal, viewVector);
    // fragColor = vec4(texture2D(NormalTex, texCoord).rgb, 1.0);
    // fragColor = metallicRoughness;
    // fragColor = vec4(material.baseColor, 1.0);;
    // fragColor = vec4(vec3(material.metallic), 1.0);;
    // fragColor = vec4(vec3(material.roughness), 1.0);;
    // fragColor = vec4(vec3(material.ambientOcclusion), 1.0);
    
#ifdef DEBUG_GEOM_ID
    // ///////////////////////
    // Debug Draw ID (this correlates to GeomID within a GLGeomSet)
    float geomId = v_geomItemData.w;
    fragColor.rgb = getDebugColor(geomId);
    // ///////////////////////
#endif


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

  /**
   * Returns the parameters that this shader expects to be provided by the material.
   * Note: the Material method setShaderName will retrieve these parameter declarations
   * to initialize and configure the parameters for the Material instance.
   * @return {array} - an array of param declarations that the shader expects the material tp provide.
   */
  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'AmbientOcclusion', defaultValue: 1, range: [0, 1] })
    paramDescs.push({ name: 'Metallic', defaultValue: 0.05, range: [0, 1] })
    paramDescs.push({ name: 'Roughness', defaultValue: 0.5, range: [0, 1] })
    paramDescs.push({ name: 'Reflectance', defaultValue: 0.5, range: [0, 1] })
    paramDescs.push({ name: 'Normal', defaultValue: new Color(0.5, 0.5, 0.5) })
    paramDescs.push({
      name: 'EmissiveStrength',
      defaultValue: 0.0,
      range: [0, 1],
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0, range: [0, 1] })
    return paramDescs
  }

  /**
   * The bind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @param {string} key - The key value.
   * @return {any} - The return value.
   */
  bind(renderstate, key) {
    super.bind(renderstate, key)

    const gl = this.__gl
    if (renderstate.envMap) {
      renderstate.envMap.bind(renderstate)
    }

    const { exposure } = renderstate.unifs
    if (exposure) {
      gl.uniform1f(exposure.location, renderstate.exposure)
    }
    return true
  }

  // /////////////////////////////
  // Parameters

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

    matData[4] = material.getParameter('AmbientOcclusion').getValue()
    matData[5] = material.getParameter('Metallic').getValue()
    matData[6] = material.getParameter('Roughness').getValue()
    matData[7] = material.getParameter('Reflectance').getValue()

    matData[8] = material.getParameter('EmissiveStrength').getValue()
    matData[9] = material.getParameter('Opacity').getValue()
    return matData
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }
}

Registry.register('StandardSurfaceShader', StandardSurfaceShader)
Registry.register('TransparentSurfaceShader', StandardSurfaceShader)
export { StandardSurfaceShader }
