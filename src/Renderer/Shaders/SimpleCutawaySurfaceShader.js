import { Vec3, Color } from '../../Math';
import { sgFactory } from '../../SceneTree';
import { shaderLibrary } from '../ShaderLibrary.js';
import { GLShader } from '../GLShader.js';

import './GLSL/stack-gl/transpose.js';
import './GLSL/stack-gl/gamma.js';
import './GLSL/modelMatrix.js';
import './GLSL/materialparams.js';
import './GLSL/cutaways.js';

class SimpleCutawaySurfaceShader extends GLShader {
  constructor(name) {
    super(name);

    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'SimpleCutawaySurfaceShader.vertexShader',
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
<%include file="modelMatrix.glsl"/>

/* VS Outputs */
varying vec3 v_worldPos;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif

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

    // Cutaway code.
    v_worldPos      = (modelMatrix * pos).xyz;

    if(dot(v_viewNormal, v_viewPos) > 0.0) {

        // Move backfaces towards the camera to fix issues with zfighting of backfaces and frontfaces.
        gl_Position.z += 0.000003 / gl_Position.w;
    }

}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'SimpleCutawaySurfaceShader.fragmentShader',
      `
#ifdef GL_EXT_frag_depth
#extension GL_EXT_frag_depth : enable
#endif
precision highp float;


/* VS Outputs */
varying vec3 v_worldPos;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif


uniform mat4 cameraMatrix;


uniform color BaseColor;
uniform float Opacity;

#ifdef ENABLE_TEXTURES

uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
uniform sampler2D OpacityTex;
uniform int OpacityTexType;

#endif


<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>
<%include file="cutaways.glsl"/>

uniform int cutawayEnabled;
uniform vec3 planeNormal;
uniform float planeDist;
uniform color cutColor;

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif

void main(void) {
#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    // Cutaways
    if(cutawayEnabled != 0){
        if(cutaway(v_worldPos, planeNormal, planeDist)){
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

#ifndef ENABLE_TEXTURES
    vec4 baseColor      = BaseColor;
    float opacity       = baseColor.a * Opacity;
#else
    vec2 texCoord       = vec2(v_textureCoord.x, 1.0 - v_textureCoord.y);
    vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, texCoord);
    float opacity       = baseColor.a * getLuminanceParamValue(Opacity, OpacityTex, OpacityTexType, texCoord);
#endif

    // Hacky simple irradiance. 
    vec3 viewVector = normalize(mat3(cameraMatrix) * normalize(v_viewPos));
    vec3 normal = normalize(mat3(cameraMatrix) * v_viewNormal);
    float ndotv = dot(normal, viewVector);
    if(ndotv < 0.0){
        normal = -normal;
        ndotv = dot(normal, viewVector);

        // Note: these 2 lines can be used to debug inverted meshes.
        //baseColor = vec4(1.0, 0.0, 0.0, 1.0);
        //ndotv = 1.0;
    }

    fragColor = vec4(ndotv * baseColor.rgb, opacity);

#ifdef ENABLE_INLINE_GAMMACORRECTION
    fragColor.rgb = toGamma(fragColor.rgb);
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
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0 });

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
      defaultValue: new Vec3(1, 0, 0),
      texturable: false,
    });
    paramDescs.push({
      name: 'planeDist',
      defaultValue: 0.0,
      texturable: false,
    });
    return paramDescs;
  }
}

sgFactory.registerClass(
  'SimpleCutawaySurfaceShader',
  SimpleCutawaySurfaceShader
);
export { SimpleCutawaySurfaceShader };
