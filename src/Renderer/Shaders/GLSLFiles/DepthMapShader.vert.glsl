
precision highp float;

attribute vec3 positions;    //(location = 0)

uniform mat4 modelMatrix;
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;

/* VS Outputs */
varying vec3 v_viewPos;

void main(void) {
  mat4 modelViewMatrix = lightViewMatrix * modelMatrix;
  v_viewPos = modelViewMatrix * vec4(positions, 1.0);
  gl_Position = lightProjectionMatrix * v_viewPos;
}
