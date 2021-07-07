
precision highp float;

attribute vec3 positions;    //(location = 0)

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 projectionCenter;

import 'stack-gl/inverse'
import 'stack-gl/transpose'
import 'drawItemTexture'
import 'modelMatrix'

/* VS Outputs */
varying vec3 v_worldDir;
 
void main()
{
  int drawItemId = getDrawItemId();
  vec4 pos = vec4(positions, 1.);
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;

  gl_Position = modelViewProjectionMatrix * pos;

  vec4 worldPos = modelMatrix * pos;
  v_worldDir = worldPos.xyz - projectionCenter;
}

