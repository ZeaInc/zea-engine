import { Color } from '../../Math/index'
import { FileImage, sgFactory } from '../../SceneTree/index'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/constants.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/GGX_Specular.js'
import './GLSL/PBRSurface.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/debugColors.js'
import './GLSL/ImagePyramid.js'

class LayeredCarPaintShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'LayeredCarPaintShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;
attribute vec3 normals;
#ifdef ENABLE_TEXTURES
attribute vec2 texCoords;
#endif
attribute vec2 lightmapCoords;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

attribute float clusterIDs;
uniform vec2 lightmapSize;

/* VS Outputs */
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
// varying vec2 v_lightmapCoord;
// #ifdef ENABLE_DEBUGGING_LIGHTMAPS
// varying float v_clusterID;
// #endif
varying vec3 v_worldPos;
/* VS Outputs */

void main(void) {
    int drawItemId = getDrawItemId();

    v_geomItemData = getInstanceData(drawItemId);

    vec4 pos = vec4(positions, 1.);
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos    = modelViewMatrix * pos;
    gl_Position     = projectionMatrix * viewPos;


#ifdef ENABLE_TEXTURES
    v_textureCoord  = texCoords;
#endif
    // v_lightmapCoord = (lightmapCoords + geomItemData.zw) / lightmapSize;

    // mat4 mvp = projectionMatrix * viewMatrix * modelMatrix;
    // gl_Position = mvp * vec4((lightmapCoords + geomItemData.xy), 0., 1.);
// #ifdef ENABLE_DEBUGGING_LIGHTMAPS
//     v_clusterID = clusterIDs;
// #endif

    v_worldPos      = (modelMatrix * pos).xyz;
    mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
    v_viewPos       = -viewPos.xyz;
    v_viewNormal    = normalMatrix * normals;
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LayeredCarPaintShader.fragmentShader',
      `
#ifndef ENABLE_ES3
    #extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="GGX_Specular.glsl"/>
<%include file="PBRSurfaceRadiance.glsl"/>
#ifdef ENABLE_INLINE_GAMMACORRECTION
<%include file="stack-gl/gamma.glsl"/>
#endif
<%include file="materialparams.glsl"/>

/* VS Outputs */
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
// varying vec2 v_lightmapCoord;
// #ifdef ENABLE_DEBUGGING_LIGHTMAPS
// varying float v_clusterID;
// #endif
varying vec3 v_worldPos;
/* VS Outputs */


uniform sampler2D lightmap;
uniform vec2 lightmapSize;
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
<%include file="debugColors.glsl"/>
uniform bool debugLightmapTexelSize;
#endif

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

uniform mat4 cameraMatrix;

uniform color BaseColor;
uniform color MidColorTint;
uniform float MidColorTintReflectance;

uniform float MicroflakePerturbation;
uniform sampler2D FlakesNormalTex;
uniform float FlakesScale;

#ifdef ENABLE_SPECULAR

uniform float BaseRoughness;
uniform float BaseMetallic;
uniform float BaseReflectance;
uniform float GlossRoughness;
uniform float GlossMetallic;
uniform float GlossReflectance;

#endif

#ifdef ENABLE_TEXTURES

uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;

#endif

// Followup: Normal Mapping Without Precomputed Tangents
// http://www.thetenthplanet.de/archives/1180
mat3 cotangent_frame( vec3 normal, vec3 position, vec2 uv )
{
    // get edge vectors of the pixel triangle
    vec3 dp1 = dFdx( position );
    vec3 dp2 = dFdy( position );
    vec2 duv1 = dFdx( uv );
    vec2 duv2 = dFdy( uv );
 
    // solve the linear system
    vec3 dp2perp = cross( dp2, normal );
    vec3 dp1perp = cross( normal, dp1 );
    vec3 tangent = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 bitangent = dp2perp * duv1.y + dp1perp * duv2.y;
 
    // construct a scale-invariant frame 
    float invmax = inversesqrt( max( dot(tangent,tangent), dot(bitangent,bitangent) ) );
    return mat3( tangent * invmax, bitangent * invmax, normal );
}

#define WITH_NORMALMAP_UNSIGNED 1

vec3 sampleNormalMap( sampler2D normalMap, vec2 texcoord )
{
    // assume normal, the interpolated vertex normal and 
    // viewVec, the view vector (vertex to eye)
    vec3 map = texture2D( normalMap, texcoord ).xyz;
#ifdef WITH_NORMALMAP_UNSIGNED
    map = map * 255./127. - 128./127.;
#endif
#ifdef WITH_NORMALMAP_2CHANNEL
    map.z = sqrt( 1. - dot( map.xy, map.xy ) );
#endif
#ifdef WITH_NORMALMAP_GREEN_UP
    map.y = -map.y;
#endif
    return map;
}


#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif

void main(void) {

    MaterialParams material;

#ifndef ENABLE_TEXTURES
    material.baseColor      = BaseColor.rgb;
#else
    vec2 texCoord           = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    material.baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord).rgb;
#endif

#ifdef ENABLE_SPECULAR
    material.roughness      = BaseRoughness;
    material.metallic       = BaseMetallic;
    material.reflectance    = BaseReflectance;
#endif

    vec3 irradiance = texture2D(lightmap, v_lightmapCoord).rgb;
 
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
    if(debugLightmapTexelSize)
    {
        vec2 coord_texelSpace = (v_lightmapCoord * lightmapSize) - v_geomItemData.zw;
        //vec2 coord_texelSpace = (v_textureCoord * lightmapSize);
        float total = floor(coord_texelSpace.x) +
                      floor(coord_texelSpace.y);
                      
        vec3 clustercolor = getDebugColor(v_clusterID);

        if(mod(total,2.0)==0.0){
            material.baseColor = clustercolor;
            irradiance = vec3(1.0);
        }
        else{
            material.baseColor = material.baseColor * 1.5;
        }
    }
#endif

    vec3 viewNormal = normalize(v_viewNormal);
    vec3 surfacePos = -v_viewPos;

    // The vector from the camera to the surface point.
    vec3 viewVector = mat3(cameraMatrix) * normalize(v_viewPos);
    vec3 viewDir = normalize(viewVector);
    vec3 normal = normalize(mat3(cameraMatrix) * viewNormal);

    float NdotV = dot(normal, viewDir);
    if(NdotV < 0.0){
        normal = -normal;
        NdotV = dot(normal, viewDir);
    }

#ifndef ENABLE_SPECULAR
    vec3 radiance = material.baseColor * irradiance;
#else
    
    // Mix the base color to give a multi-layered paint look.
    material.baseColor      = mix(material.baseColor, material.baseColor * MidColorTint.rgb, (1.0-NdotV));

    mat3 TBN = cotangent_frame( normal, surfacePos, v_lightmapCoord );
    vec3 flakesNormal = TBN * -sampleNormalMap( FlakesNormalTex, (v_lightmapCoord * lightmapSize) / FlakesScale );
    flakesNormal = normalize(mix(normal, flakesNormal, MicroflakePerturbation));

    vec3 baseRadiance = pbrSurfaceRadiance(material, irradiance, flakesNormal, viewVector);

    material.roughness      = GlossRoughness;
    material.reflectance    = GlossReflectance;
    vec4 gloss = pbrSpecularReflectance(material, normal, viewVector);
    vec3 radiance = mix(baseRadiance, gloss.rgb, gloss.a);
    //vec3 radiance = baseRadiance;

#endif

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    fragColor = vec4(radiance, 1.0);

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

    // F0 = reflectance and is a physical property of materials
    // It also has direct relation to IOR so we need to dial one or the other
    // For simplicity sake, we don't need to touch this value as metalic can dictate it
    // such that non metallic is mostly around (0.01-0.025) and metallic around (0.7-0.85)

    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 0.0, 0.0),
    })
    paramDescs.push({ name: 'BaseMetallic', defaultValue: 0.0 })
    paramDescs.push({ name: 'BaseRoughness', defaultValue: 0.35 })
    paramDescs.push({ name: 'BaseReflectance', defaultValue: 0.03 })
    paramDescs.push({
      name: 'MidColorTint',
      defaultValue: new Color(1.0, 1.0, 1.0),
    })
    paramDescs.push({ name: 'MidColorTintReflectance', defaultValue: 0.03 })
    paramDescs.push({ name: 'GlossMetallic', defaultValue: 0.0 })
    paramDescs.push({ name: 'GlossRoughness', defaultValue: 0.35 })
    paramDescs.push({ name: 'GlossReflectance', defaultValue: 0.03 })

    const flakesNormal = new FileImage(
      'flakes',
      'ZeaEngine/FlakesNormalMap.png'
    )
    flakesNormal.wrap = 'REPEAT'
    flakesNormal.mipMapped = true
    paramDescs.push({ name: 'FlakesNormal', defaultValue: flakesNormal })
    paramDescs.push({ name: 'FlakesScale', defaultValue: 0.1 })
    paramDescs.push({ name: 'MicroflakePerturbation', defaultValue: 0.1 })

    return paramDescs
  }
  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }
}

sgFactory.registerClass('LayeredCarPaintShader', LayeredCarPaintShader)
export { LayeredCarPaintShader }
