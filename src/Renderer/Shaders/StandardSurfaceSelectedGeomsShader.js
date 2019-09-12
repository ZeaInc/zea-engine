import { shaderLibrary } from '../ShaderLibrary';
import { GLShader } from '../GLShader.js';
import { sgFactory } from '../../SceneTree';

import './GLSL/stack-gl/inverse.js';
import './GLSL/stack-gl/transpose.js';
import './GLSL/modelMatrix.js';

class StandardSurfaceSelectedGeomsShader extends GLShader {
  constructor(gl, floatGeomBuffer) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceSelectedGeomsShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="modelMatrix.glsl"/>

varying vec4 v_highlightColor;

void main(void) {
    mat4 modelMatrix = getModelMatrix();
    mat4 modelViewMatrix = viewMatrix * modelMatrix;
    vec4 viewPos = modelViewMatrix * vec4(positions, 1.0);
    gl_Position = projectionMatrix * viewPos;

    v_highlightColor = getHighlightColor();
}
`
    );

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'StandardSurfaceSelectedGeomsShader.fragmentShader',
      `
precision highp float;

varying vec4 v_highlightColor;

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {

#ifndef ENABLE_ES3
    vec4 fragColor;
#endif

    fragColor = v_highlightColor;

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`
    );
  }
}

sgFactory.registerClass(
  'StandardSurfaceSelectedGeomsShader',
  StandardSurfaceSelectedGeomsShader
);
export { StandardSurfaceSelectedGeomsShader };
