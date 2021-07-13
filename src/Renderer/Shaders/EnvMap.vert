
precision highp float;

import 'quadVertexFromID.glsl'

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

import 'inverse.glsl'
import 'transpose.glsl'

/* VS Outputs */
varying vec3 v_worldDir;
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID() * 2.0;
  v_texCoord = position * 0.5 + 0.5;

  mat4 inverseProjection = inverse(projectionMatrix);
  mat3 inverseModelview = transpose(mat3(viewMatrix));

  // transform from the normalized device coordinates back to the view space
  vec3 unprojected = (inverseProjection * vec4(position, 0, 1)).xyz;

  // transfrom from the view space back to the world space
  // and use it as a sampling vector
  v_worldDir = inverseModelview * unprojected;

  gl_Position = vec4(position, 0, 1);
}
