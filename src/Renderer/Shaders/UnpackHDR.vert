
precision highp float;

import 'quadVertexFromID.glsl'

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
    vec2 position = getQuadVertexPositionFromID();
    v_texCoord = position+0.5;
    gl_Position = vec4(position*2.0, 0.0, 1.0);
}
