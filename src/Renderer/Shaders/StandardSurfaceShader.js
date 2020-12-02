import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import './GLSL/constants.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/materialparams.js'
import './GLSL/GGX_Specular.js'
import './GLSL/PBRSurface.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/debugColors.js'
import './GLSL/ImagePyramid.js'
import './GLSL/cutaways.js'

class StandardSurfaceShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;
attribute vec3 normals;
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

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

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>


<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

<%include file="GGX_Specular.glsl"/>
<%include file="PBRSurfaceRadiance.glsl"/>

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

uniform color BaseColor;
uniform float Roughness;
uniform float Metallic;
uniform float Reflectance;
uniform float EmissiveStrength;
uniform float Opacity;

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;

#ifdef ENABLE_PBR
uniform sampler2D RoughnessTex;
uniform int RoughnessTexType;

uniform sampler2D MetallicTex;
uniform int MetallicTexType;

uniform sampler2D ReflectanceTex;
uniform int ReflectanceTexType;

uniform sampler2D NormalTex;
uniform int NormalTexType;
// uniform float NormalScale;
#endif

uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;


#endif

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


    MaterialParams material;

#ifndef ENABLE_TEXTURES
    material.BaseColor     = BaseColor.rgb;
    float emission         = EmissiveStrength;

#ifdef ENABLE_PBR
    material.roughness     = Roughness;
    material.metallic      = Metallic;
    material.reflectance   = Reflectance;
#endif

#else
    // Planar YZ projection for texturing, repeating every meter.
    // vec2 texCoord       = v_worldPos.xz * 0.2;
    vec2 texCoord          = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    material.baseColor     = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord).rgb;

#ifdef ENABLE_PBR
    material.roughness     = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexType, texCoord);
    material.metallic      = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexType, texCoord);
    material.reflectance   = getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexType, texCoord);
#endif
    float emission         = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, texCoord);
#endif

    vec3 viewNormal = normalize(v_viewNormal);
    //vec3 surfacePos = -v_viewPos;

#ifdef ENABLE_TEXTURES
#ifdef ENABLE_PBR
    if(NormalTexType != 0){
        vec3 textureNormal_tangentspace = normalize(texture2D(NormalTex, texCoord).rgb * 2.0 - 1.0);
        viewNormal = normalize(mix(viewNormal, textureNormal_tangentspace, 0.3));
    }
#endif
#endif

    vec3 viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
    vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);
    if(dot(normal, viewVector) < 0.0){
        normal = -normal;
        // Note: this line can be used to debug inverted meshes.
        //material.baseColor = vec3(1.0, 0.0, 0.0);
    }

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

#ifdef ENABLE_PBR
    int envMapFlags = int(envMapPyramid_desc.w);
    bool headLightMode = testFlag(envMapFlags, ENVMAP_FLAG_HEADLIGHT);
#endif

    float opacity = Opacity * BaseColor.a;
    if (opacity < 1.0) {
        vec3 radiance;
#ifdef ENABLE_PBR
        if (envMapPyramid_desc.x > 0.0) {
            // Note: not sure how to make specular reflections work in headlight mode.
            vec4 specularReflectance = pbrSpecularReflectance(material, normal, viewVector);
            fragColor = vec4(specularReflectance.rgb, mix(opacity, 1.0, specularReflectance.a));
        } else {
#endif
            // Simple diffuse lighting.
            vec3 irradiance = vec3(dot(normal, viewVector));
            radiance = irradiance * material.baseColor;
            fragColor = vec4(radiance + (emission * material.baseColor), opacity);
#ifdef ENABLE_PBR
        }
#endif
    }
    else {
        vec3 radiance;
#ifdef ENABLE_PBR
        if (envMapPyramid_desc.x > 0.0) {
            vec3 irradiance;
            if (headLightMode) {
                irradiance = sampleEnvMap(viewNormal, 1.0);
            } else {
                irradiance = sampleEnvMap(normal, 1.0);
            }
            radiance = pbrSurfaceRadiance(material, irradiance, normal, viewVector);
        } else {
#endif
            vec3 irradiance = vec3(dot(normal, viewVector));
            radiance = material.baseColor * irradiance;
#ifdef ENABLE_PBR
        }
#endif
        // fragColor = vec4(material.baseColor, 1.0);
        // fragColor = vec4(material.baseColor * irradiance, 1.0);
        fragColor = vec4(radiance + (emission * material.baseColor), 1.0);
    }

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
    paramDescs.push({ name: 'Metallic', defaultValue: 0.0, range: [0, 1] })
    paramDescs.push({ name: 'Roughness', defaultValue: 0.85, range: [0, 1] })
    // F0 = reflectance and is a physical property of materials
    // It also has direct relation to IOR so we need to dial one or the other
    // For simplicity sake, we don't need to touch this value as metalic can dictate it
    // such that non metallic is mostly around (0.01-0.025) and metallic around (0.7-0.85)
    paramDescs.push({ name: 'Reflectance', defaultValue: 0.1, range: [0, 1] })
    paramDescs.push({
      name: 'EmissiveStrength',
      defaultValue: 0.0,
      range: [0, 1],
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0, range: [0, 1] })

    // paramDescs.push({ name: 'TexCoordScale', defaultValue: 1.0, texturable: false });
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }
}

Registry.register('StandardSurfaceShader', StandardSurfaceShader)
export { StandardSurfaceShader }
