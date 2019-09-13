import { Color } from '../../Math';
import { sgFactory } from '../../SceneTree';
import { shaderLibrary } from '../ShaderLibrary';
import { GLShader } from '../GLShader.js';

import './GLSL/stack-gl/inverse.js';
import './GLSL/stack-gl/transpose.js';

class PointsShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'PointsShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */

void main(void) {
  mat4 modelMatrix = getModelMatrix();
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = modelViewProjectionMatrix * vec4(positions, 1.);
}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'PointsShader.fragmentShader',
      `
precision highp float;

uniform color BaseColor;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = BaseColor;

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations();
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    });
    return paramDescs;
  }
}

class FatPointsShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShader.vertexShader',
      `
precision highp float;

instancedattribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="modelMatrix.glsl"/>
<%include file="utils/quadVertexFromID.glsl"/>

uniform float PointSize;

/* VS Outputs */
varying vec2 v_texCoord;

void main(void) {
  vec2 quadPointPos = getQuadVertexPositionFromID();
  v_texCoord = quadPointPos + 0.5;

  mat4 modelMatrix = getModelMatrix();
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
  viewPos += vec4(vec3(quadPointPos, 0.0) * PointSize, 0.);
  gl_Position = projectionMatrix * viewPos;
}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>

uniform color BaseColor;
uniform float Rounded;
uniform float BorderWidth;

/* VS Outputs */
varying vec2 v_texCoord;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if(dist > 0.5)
    discard;
  if(dist > 0.5 - (BorderWidth * 0.5))
    fragColor = vec4(0.,0.,0.,1.);
  else {
    // Modulate the lighting using the texture coord so the point looks round.
    float NdotV = cos(dist * PI);

    fragColor = BaseColor * mix(1.0, NdotV, Rounded);
  }

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
  }

  bind(renderstate) {
    if (super.bind(renderstate)) {
      renderstate.supportsInstancing = false;
      return true;
    }
    return false;
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations();
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    });
    paramDescs.push({ name: 'PointSize', defaultValue: 0.05 });
    paramDescs.push({ name: 'Rounded', defaultValue: 1.0 });
    paramDescs.push({ name: 'BorderWidth', defaultValue: 0.2 });
    return paramDescs;
  }

  static getGeomDataShaderName() {
    return 'FatPointsShaderGeomDataShader';
  }

  // static getSelectedShaderName(){
  //     return 'FatPointsShaderSelectedGeomsShader';
  // }
}

class FatPointsShaderGeomDataShader extends GLShader {
  constructor(gl) {
    console.log('FatPointsShaderGeomDataShader');
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShaderGeomDataShader.vertexShader',
      `
precision highp float;

instancedattribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="modelMatrix.glsl"/>
<%include file="utils/quadVertexFromID.glsl"/>

uniform float PointSize;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemID;

void main(void) {
  vec2 quadPointPos = getQuadVertexPositionFromID();

  mat4 modelMatrix = getModelMatrix();
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  
  vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
  viewPos += vec4(vec3(quadPointPos, 0.0) * PointSize, 0.);
  gl_Position = projectionMatrix * viewPos;


  v_texCoord = quadPointPos + 0.5;
  v_viewPos = -viewPos.xyz;
  v_drawItemID = float(getId());
}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'FatPointsShaderGeomDataShader.fragmentShader',
      `
precision highp float;

<%include file="math/constants.glsl"/>

uniform int passId;

/* VS Outputs */
varying vec2 v_texCoord;
varying vec3 v_viewPos;
varying float v_drawItemID;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  float dist = length(v_texCoord - 0.5);
  if(dist > 0.5)
    discard;


    float viewDist = length(v_viewPos);

    fragColor.r = float(passId); 
    fragColor.g = float(v_drawItemID);
    fragColor.b = 0.0;// TODO: store poly-id or something.
    fragColor.a = viewDist;


#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    );
  }

  bind(renderstate) {
    if (super.bind(renderstate)) {
      renderstate.supportsInstancing = false;
      return true;
    }
    return false;
  }
}

sgFactory.registerClass('PointsShader', PointsShader);
sgFactory.registerClass('FatPointsShader', FatPointsShader);
sgFactory.registerClass(
  'FatPointsShaderGeomDataShader',
  FatPointsShaderGeomDataShader
);
// sgFactory.registerClass('FatPointsShaderSelectedGeomsShader', FatPointsShaderSelectedGeomsShader);
export { PointsShader, FatPointsShader };
