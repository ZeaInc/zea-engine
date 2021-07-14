

precision highp float;

import 'quadVertexFromID.glsl'

uniform vec2 pos;
uniform vec2 size;
uniform vec2 srctextureDim;
const int border = 2;

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
  vec2 position = getQuadVertexPositionFromID();
  v_texCoord = position+0.5;
  gl_Position = vec4(vec2(-1.0, -1.0) + (pos * 2.0) + (v_texCoord * size * 2.0), 0.0, 1.0);

  vec2 borderVec2 = vec2(float(border), float(border));
  v_texCoord *= (srctextureDim + (borderVec2 * 2.0)) / srctextureDim;
  v_texCoord -= borderVec2 / srctextureDim;
}

