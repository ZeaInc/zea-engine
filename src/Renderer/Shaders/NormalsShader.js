import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'

class NormalsShader extends GLShader {
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

instancedattribute vec3 positions;
instancedattribute vec3 normals;
attribute vec2 vertexIDs;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float normalLength;

<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>


/* VS Outputs */
varying float v_weight;

void main(void) {
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  if(vertexIDs.x == 0.0){
    gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);
    v_weight = 1.0;
  }
  else{
    gl_Position = modelViewProjectionMatrix * vec4(positions+(normals*normalLength), 1.0);
    v_weight = 0.0;
  }
}
`
    )

    this.setShaderStage(
      'FRAGMENT_SHADER',
      `
precision highp float;

uniform color normalColor;

/* VS Outputs */
varying float v_weight;


void main(void) {
  gl_FragColor = normalColor;
  gl_FragColor.a = v_weight;
}
`
    )
  }
}

export { NormalsShader }
