import { Color } from '../../Math/index'
import { sgFactory } from '../../SceneTree/index'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/GGX_Specular.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/debugColors.js'

class TransparentSurfaceShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'TransparentSurfaceShader.vertexShader',
      `
precision highp float;


attribute vec3 positions;
attribute vec3 normals;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;

varying vec3 v_worldPos;
/* VS Outputs */

void main(void) {
    int drawItemId = getDrawItemId();

    vec4 geomItemData = getInstanceData(drawItemId);

    vec4 pos = vec4(positions, 1.);
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos    = modelViewMatrix * pos;
    gl_Position     = projectionMatrix * viewPos;

    // mat4 mvp = projectionMatrix * viewMatrix * modelMatrix;
    // gl_Position = mvp * vec4((lightmapCoords + geomItemData.xy), 0., 1.);

    v_worldPos      = (modelMatrix * pos).xyz;

    mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
    v_viewPos       = -viewPos.xyz;
    v_viewNormal    = normalMatrix * normals;
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'TransparentSurfaceShader.fragmentShader',
      `
precision highp float;

#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
#endif
<%include file="GLSLUtils.glsl"/>

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;

varying vec3 v_worldPos;
/* VS Outputs */


#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

uniform mat4 cameraMatrix;
uniform float planeDist;
uniform float planeAngle;

uniform color BaseColor;
uniform float Opacity;

#ifdef ENABLE_SPECULAR
<%include file="math/constants.glsl"/>
<%include file="GGX_Specular.glsl"/>
<%include file="PBRSurfaceRadiance.glsl"/>
uniform float Roughness;
uniform float Metallic;
uniform float Reflectance;
#endif

#ifdef __ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform bool BaseColorTexType;

uniform sampler2D OpacityTex;
uniform bool OpacityTexType;

uniform sampler2D RoughnessTex;
uniform bool RoughnessTexType;

uniform sampler2D ReflectanceTex;
uniform bool ReflectanceTexType;

uniform sampler2D NormalTex;
uniform bool NormalTexType;
uniform float NormalScale;


#endif

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

    MaterialParams material;

#ifndef __ENABLE_TEXTURES
    material.baseColor      = BaseColor.rgb;
    float opacity           = Opacity;

#ifdef ENABLE_SPECULAR
    material.roughness      = Roughness;
    material.metallic       = Metallic;
    material.reflectance    = Reflectance;
#endif

#else
    // Planar YZ projection for texturing, repeating every meter.
    // vec2 texCoord        = v_worldPos.xz * 0.2;
    vec2 texCoord           = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    material.baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord).rgb;
    material.roughness      = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexType, texCoord);
    material.metallic       = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexType, texCoord);
    material.reflectance    = Reflectance;//getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexType, texCoord);

    float opacity           = getLuminanceParamValue(Opacity, OpacityTex, OpacityTexType, texCoords);
#endif

#ifndef ENABLE_SPECULAR
    gl_FragColor = vec4(material.baseColor.rgb, opacity);
#else

    vec3 viewNormal = normalize(v_viewNormal);
    //vec3 surfacePos = -v_viewPos;

#ifdef __ENABLE_TEXTURES
    if(NormalTexType != 0){
        vec3 textureNormal_tangentspace = normalize(texture2D(NormalTex, texCoord).rgb * 2.0 - 1.0);
        viewNormal = normalize(mix(viewNormal, textureNormal_tangentspace, 0.3));
    }
#endif

    vec3 viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
    vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);
    if(dot(normal, viewVector) < 0.0){
        normal = -normal;
        // Note: this line can be used to debug inverted meshes.
        //material.baseColor = vec3(1.0, 0.0, 0.0);
    }

    vec4 specularReflectance = pbrSpecularReflectance(material, normal, viewVector);

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    fragColor = vec4(specularReflectance.rgb, mix(opacity, 1.0, specularReflectance.a));

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

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0, range: [0, 1] })
    paramDescs.push({ name: 'Roughness', defaultValue: 0.85 })
    // F0 = reflectance and is a physical property of materials
    // It also has direct relation to IOR so we need to dial one or the other
    // For simplicity sake, we don't need to touch this value as metalic can dictate it
    // such that non metallic is mostly around (0.01-0.025) and metallic around (0.7-0.85)
    paramDescs.push({ name: 'Reflectance', defaultValue: 0.0001 })

    // paramDescs.push({ name: 'TexCoordScale', defaultValue: 1.0, texturable: false });
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }

  static isTransparent() {
    return true
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

sgFactory.registerClass('TransparentSurfaceShader', TransparentSurfaceShader)
export { TransparentSurfaceShader }
