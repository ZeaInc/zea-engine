import {
    Color
} from '../../Math';
import {
    sgFactory
} from '../../SceneTree';
import {
    shaderLibrary
} from '../ShaderLibrary.js';
import {
    GLShader
} from '../GLShader.js';

import './GLSL/constants.js';
import './GLSL/stack-gl/transpose.js';
import './GLSL/stack-gl/gamma.js';
import './GLSL/materialparams.js';
import './GLSL/GGX_Specular.js';
import './GLSL/PBRSurface.js';
import './GLSL/modelMatrix.js';
import './GLSL/debugColors.js';
import './GLSL/ImagePyramid.js';

class StandardSurfaceShader extends GLShader {
    constructor(gl) {
        super(gl);
        this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader('StandardSurfaceShader.vertexShader', `
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

    vec4 pos = vec4(positions, 1.);
    mat4 modelMatrix = getModelMatrix();
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos    = modelViewMatrix * pos;
    gl_Position     = projectionMatrix * viewPos;

    mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
    v_viewPos       = -viewPos.xyz;
    v_viewNormal    = normalMatrix * normals;

#ifdef ENABLE_TEXTURES
    v_textureCoord  = texCoords;
#endif

    vec4 geomItemData = getInstanceData();
    v_lightmapCoord = (lightmapCoords + geomItemData.xy) / lightmapSize;

    // mat4 mvp = projectionMatrix * viewMatrix * modelMatrix;
    // gl_Position = mvp * vec4((lightmapCoords + geomItemData.xy), 0., 1.);
#ifdef ENABLE_DEBUGGING_LIGHTMAPS
    v_clusterID = clusterIDs;
    v_geomItemData = geomItemData;
#endif

    v_worldPos      = (modelMatrix * pos).xyz;

}
`);

        this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader('StandardSurfaceShader.fragmentShader', `
precision highp float;

<%include file="math/constants.glsl"/>
<%include file="GLSLUtils.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

<%include file="GGX_Specular.glsl"/>
<%include file="PBRSurfaceRadiance.glsl"/>

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
uniform bool BaseColorTexConnected;

#ifdef ENABLE_SPECULAR
uniform sampler2D RoughnessTex;
uniform bool RoughnessTexConnected;

uniform sampler2D MetallicTex;
uniform bool MetallicTexConnected;

uniform sampler2D ReflectanceTex;
uniform bool ReflectanceTexConnected;

uniform sampler2D NormalTex;
uniform bool NormalTexConnected;
// uniform float NormalScale;
#endif

uniform sampler2D EmissiveStrengthTex;
uniform bool EmissiveStrengthTexConnected;


#endif

#ifdef ENABLE_ES3
out vec4 fragColor;

#endif

void main(void) {

    MaterialParams material;

#ifndef ENABLE_TEXTURES
    material.BaseColor      = BaseColor.rgb;
    float emission          = EmissiveStrength;

#ifdef ENABLE_SPECULAR
    material.roughness     = Roughness;
    material.metallic      = Metallic;
    material.reflectance   = Reflectance;
#endif

#else
    // Planar YZ projection for texturing, repeating every meter.
    // vec2 texCoord      = v_worldPos.xz * 0.2;
    vec2 texCoord       = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    material.baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexConnected, texCoord).rgb;

#ifdef ENABLE_SPECULAR
    material.roughness     = getLuminanceParamValue(Roughness, RoughnessTex, RoughnessTexConnected, texCoord);
    material.metallic      = getLuminanceParamValue(Metallic, MetallicTex, MetallicTexConnected, texCoord);
    material.reflectance   = getLuminanceParamValue(Reflectance, ReflectanceTex, ReflectanceTexConnected, texCoord);
#endif
    float emission      = getLuminanceParamValue(EmissiveStrength, EmissiveStrengthTex, EmissiveStrengthTexConnected, texCoord);
#endif

    vec3 viewNormal = normalize(v_viewNormal);
    //vec3 surfacePos = -v_viewPos;

#ifdef ENABLE_TEXTURES
#ifdef ENABLE_SPECULAR
    if(NormalTexConnected){
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
        vec2 coord_texelSpace = (v_lightmapCoord * lightmapSize) - v_geomItemData.xy;
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

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif
    // fragColor = vec4(material.baseColor, 1.0);
    // fragColor = vec4(material.baseColor * irradiance, 1.0);
    fragColor = vec4(radiance + (emission * material.baseColor), 1.0);

#ifdef ENABLE_INLINE_GAMMACORRECTION
    fragColor.rgb = toGamma(fragColor.rgb * exposure);
#endif

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`);

        this.finalize();
    }

    static getParamDeclarations() {
        const paramDescs = super.getParamDeclarations();
        paramDescs.push({ name: 'BaseColor', defaultValue: new Color(1.0, 1.0, 0.5) });
        paramDescs.push({ name: 'EmissiveStrength', defaultValue: 0.0 });
        paramDescs.push({ name: 'Metallic', defaultValue: 0.0 });
        paramDescs.push({ name: 'Roughness', defaultValue: 0.85 });
        paramDescs.push({ name: 'Normal', defaultValue: new Color(0.0, 0.0, 0.0) });
        paramDescs.push({ name: 'TexCoordScale', defaultValue: 1.0, texturable: false });
        // F0 = reflectance and is a physical property of materials
        // It also has direct relation to IOR so we need to dial one or the other
        // For simplicity sake, we don't need to touch this value as metalic can dictate it
        // such that non metallic is mostly around (0.01-0.025) and metallic around (0.7-0.85)
        paramDescs.push({ name: 'Reflectance', defaultValue: 0.1 } );
        return paramDescs;
    }
};

sgFactory.registerClass('StandardSurfaceShader', StandardSurfaceShader);
export {
    StandardSurfaceShader
};