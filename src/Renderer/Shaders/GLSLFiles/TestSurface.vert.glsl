// VERTEX SHADER
precision highp float;

attribute vec3 positions;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

import 'GLSLUtils.glsl'
import 'stack-gl/transpose.glsl'
import 'drawItemId.glsl'
import 'drawItemTexture.glsl'
import 'modelMatrix.glsl'

/* VS Outputs */
varying float v_drawItemId;
varying vec4 v_geomItemData;
varying vec3 v_viewPos;

void main(void) {
  int drawItemId = getDrawItemId();
  v_drawItemId = float(drawItemId);
  v_geomItemData  = getInstanceData(drawItemId);

  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewMatrix = viewMatrix * modelMatrix;
  vec4 viewPos = (modelViewMatrix * vec4(positions, 1.0));
  gl_Position = projectionMatrix * viewPos;
  v_viewPos = viewPos.xyz;
}
