
precision highp float;

instancedattribute vec3 positions;
instancedattribute vec3 normals;
attribute vec2 vertexIDs;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float normalLength;


import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'


/* VS Outputs */
varying float v_weight;

void main(void) {
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  if (vertexIDs.x == 0.0) {
    gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);
    v_weight = 1.0;
  }
  else {
    gl_Position = modelViewProjectionMatrix * vec4(positions+(normals*normalLength), 1.0);
    v_weight = 0.0;
  }
}
