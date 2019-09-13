import { Vec3, Color } from '../../Math';
import { sgFactory } from '../../SceneTree';
import { shaderLibrary } from '../ShaderLibrary.js';
import { GLShader } from '../GLShader.js';

import './GLSL/constants.js';
import './GLSL/stack-gl/transpose.js';
import './GLSL/stack-gl/gamma.js';
import './GLSL/materialparams.js';
import './GLSL/GGX_Specular.js';
import './GLSL/PBRSurface.js';
import './GLSL/modelMatrix.js';
import './GLSL/debugColors.js';
import './GLSL/ImagePyramid.js';
import './GLSL/cutaways.js';

class StandardCutawaySurfaceShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'StandardCutawaySurfaceShader.vertexShader',
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
<%include file="modelMatrix.glsl"/>

attribute float clusterIDs;
uniform vec2 lightmapSize;

uniform float _cutawaySurfaceOffset;

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec2 v_lightmapCoord;
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
varying float v_clusterID;
varying vec4 v_geomItemData;
#endif
varying vec3 v_worldPos;
/* VS Outputs */

void main(void) {

    vec4 geomItemData = getInstanceData();

    vec4 pos = vec4(positions, 1.);
    mat4 modelMatrix = getModelMatrix();
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos    = modelViewMatrix * pos;
    gl_Position     = projectionMatrix * viewPos;

#ifdef ENABLE_TEXTURES
    v_textureCoord  = texCoords;
#endif
    v_lightmapCoord = (lightmapCoords + geomItemData.zw) / lightmapSize;

    // mat4 mvp = projectionMatrix * viewMatrix * modelMatrix;
    // gl_Position = mvp * vec4((lightmapCoords + geomItemData.zw), 0., 1.);
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
    v_clusterID = clusterIDs;
    v_geomItemData = geomItemData;
#endif

    v_worldPos      = (modelMatrix * pos).xyz;

    mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
    v_viewPos       = -viewPos.xyz;
    v_viewNormal    = normalMatrix * normals;


    if(dot(v_viewNormal, v_viewPos) > 0.0) {
        // Move backfaces towards the camera to fix issues with zfighting of backfaces and frontfaces.
        gl_Position.z += _cutawaySurfaceOffset / gl_Position.w;
    }

}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'StandardCutawaySurfaceShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

<%include file="GGX_Specular.glsl"/>
<%include file="PBRSurfaceRadiance.glsl"/>
<%include file="cutaways.glsl"/>

/* VS Outputs */
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec2 v_lightmapCoord;
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
varying float v_clusterID;
varying vec4 v_geomItemData;
#endif
varying vec3 v_worldPos;
/* VS Outputs */


uniform sampler2D lightmap;
uniform bool lightmapConnected;
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
<%include file="debugColors.glsl"/>
uniform vec2 lightmapSize;
uniform bool debugLightmapTexelSize;
#endif

#ifdef ENABLE_INLINE_GAMMACORRECTION
uniform float exposure;
#endif

uniform mat4 cameraMatrix;

uniform color BaseColor;
uniform float EmissiveStrength;


#ifdef ENABLE_SPECULAR
uniform float Roughness;
uniform float Metallic;
uniform float Reflectance;
#endif

#ifdef ENABLE_TEXTURES
uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;

#ifdef ENABLE_SPECULAR
uniform sampler2D RoughnessTex;
uniform int RoughnessTexType;

uniform sampler2D MetallicTex;
uniform int MetallicTexType;

uniform sampler2D ReflectanceTex;
uniform int ReflectanceTexType;

uniform sampler2D NormalTex;
uniform int NormalTexType;
uniform float NormalScale;
#endif

uniform sampler2D EmissiveStrengthTex;
uniform int EmissiveStrengthTexType;

#endif

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif


uniform int cutawayEnabled;
uniform vec3 planeNormal;
uniform float planeDist;
uniform color cutColor;


void main(void) {
#ifndef ENABLE_ES3
    vec4 fragColor;
#endif


    // Cutaways
    if(cutawayEnabled != 0){
        if(cutaway(v_worldPos, planeNormal, planeDist)){
            discard;
            return;
        }
        else if(!gl_FrontFacing){
            fragColor = cutColor;
#ifndef ENABLE_ES3
        gl_FragColor = fragColor;
#endif
            return;
        }
    }

    MaterialParams material;

#ifndef ENABLE_TEXTURES
    material.baseColor     = BaseColor.rgb;
    float emission         = EmissiveStrength;

#ifdef ENABLE_SPECULAR
    material.roughness     = Roughness;
    material.metallic      = Metallic;
    material.reflectance   = Reflectance;
#endif

#else
    // Planar YZ projection for texturing, repeating every meter.
    // vec2 texCoord       = v_worldPos.xz * 0.2;
    vec2 texCoord          = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    material.baseColor     = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord).rgb;

#ifdef ENABLE_SPECULAR
    material.roughness     = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexType, texCoord);
    material.metallic      = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexType, texCoord);
    material.reflectance   = getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexType, texCoord);
#endif
    float emission         = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexType, texCoord);
#endif

    vec3 viewNormal = normalize(v_viewNormal);
    //vec3 surfacePos = -v_viewPos;

#ifdef ENABLE_TEXTURES
#ifdef ENABLE_SPECULAR
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

    vec3 irradiance;
    if(lightmapConnected){
        irradiance = texture2D(lightmap, v_lightmapCoord).rgb;
    }
    else{
#ifndef ENABLE_SPECULAR
        irradiance = sampleEnvMap(normal, 1.0);
#else
        irradiance = vec3(dot(normal, viewVector));
#endif
        
    }

#ifdef ENABLE_DEBUGGING_LIGHTMAPS
    if(debugLightmapTexelSize)
    {
        vec2 coord_texelSpace = (v_lightmapCoord * lightmapSize) - v_geomItemData.zw;
        //vec2 coord_texelSpace = (v_textureCoord * lightmapSize);
        float total = floor(coord_texelSpace.x) +
                      floor(coord_texelSpace.y);
                      
        vec3 clustercolor = getDebugColor(v_clusterID);

        material.metallic = 0.0;
        material.reflectance = 0.0;
        if(mod(total,2.0)==0.0){
            material.baseColor = clustercolor;
            irradiance = vec3(1.0);
        }
        else{
            material.baseColor = material.baseColor * 1.5;
        }
    }
#endif


#ifndef ENABLE_SPECULAR
    vec3 radiance = material.baseColor * irradiance;
#else
    vec3 radiance = pbrSurfaceRadiance(material, irradiance, normal, viewVector);
#endif

    fragColor = vec4(radiance + (emission * material.baseColor), 1.0);
    //fragColor = vec4(material.baseColor * irradiance, 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
    fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`
    );

    this.finalize();
  }
  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations();
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    });
    paramDescs.push({ name: 'Metallic', defaultValue: 0.0 });
    paramDescs.push({ name: 'Roughness', defaultValue: 0.85 });
    paramDescs.push({ name: 'Reflectance', defaultValue: 0.0001 });
    paramDescs.push({ name: 'EmissiveStrength', defaultValue: 0.0 });
    // paramDescs.push({ name: 'TexCoordScale', defaultValue: 1.0, texturable: false });

    // cutaway params
    paramDescs.push({
      name: 'cutawayEnabled',
      defaultValue: true,
      texturable: false,
    });
    paramDescs.push({
      name: 'cutColor',
      defaultValue: new Color(0.7, 0.2, 0.2),
      texturable: false,
    });
    paramDescs.push({
      name: 'planeNormal',
      defaultValue: new Vec3(1.0, 0.0, 0.0),
      texturable: false,
    });
    paramDescs.push({
      name: 'planeDist',
      defaultValue: 0.0,
      texturable: false,
    });
    paramDescs.push({
      name: 'cutawaySurfaceOffset',
      defaultValue: 0.000003,
      texturable: false,
    });
    return paramDescs;
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader';
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader';
  }
}

sgFactory.registerClass(
  'StandardCutawaySurfaceShader',
  StandardCutawaySurfaceShader
);
export { StandardCutawaySurfaceShader };
