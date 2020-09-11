import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/transpose.js'
import './GLSL/stack-gl/gamma.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/materialparams.js'

class SimpleSurfaceShader extends GLShader {
  constructor(name) {
    super(name)

    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'SimpleSurfaceShader.vertexShader',
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

void main(void) {
    int drawItemId = getDrawItemId();
    v_drawItemId = float(drawItemId);
    v_geomItemData  = getInstanceData(drawItemId);

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
    // v_textureCoord.y = 1.0 - v_textureCoord.y;// Flip y
#endif

    v_worldPos      = (modelMatrix * pos).xyz;
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'SimpleSurfaceShader.fragmentShader',
      `
precision highp float;

<%include file="drawItemTexture.glsl"/>
<%include file="cutaways.glsl"/>
<%include file="stack-gl/gamma.glsl"/>
<%include file="materialparams.glsl"/>

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;
varying vec3 v_viewNormal;
#ifdef ENABLE_TEXTURES
varying vec2 v_textureCoord;
#endif
varying vec3 v_worldPos;

uniform mat4 cameraMatrix;

uniform color BaseColor;
uniform float Opacity;

#ifdef ENABLE_TEXTURES

uniform sampler2D BaseColorTex;
uniform int BaseColorTexType;
uniform sampler2D OpacityTex;
uniform int OpacityTexType;

uniform color cutColor;
vec4 getCutaway(int id) {
    return fetchTexel(instancesTexture, instancesTextureSize, (id * pixelsPerItem) + 5);
}

#endif

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif

void main(void) {
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
    vec4 baseColor      = getColorParamValue(BaseColor, BaseColorTex, BaseColorTexType, v_textureCoord);
    float opacity       = baseColor.a * getLuminanceParamValue(Opacity, OpacityTex, OpacityTexType, v_textureCoord);
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

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif
    fragColor = vec4(ndotv * baseColor.rgb, opacity);

#ifdef ENABLE_INLINE_GAMMACORRECTION
    fragColor.rgb = toGamma(fragColor.rgb);
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
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }
}

Registry.register('SimpleSurfaceShader', SimpleSurfaceShader)
export { SimpleSurfaceShader }
