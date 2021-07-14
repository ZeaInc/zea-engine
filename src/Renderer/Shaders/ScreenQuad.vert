
precision highp float;

import 'quadVertexFromID.glsl'

uniform vec2 pos;
uniform vec2 size;

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
    vec2 position = getQuadVertexPositionFromID();
    v_texCoord = position+0.5;
    gl_Position = vec4(vec2(-1.0, -1.0) + (pos * 2.0) + (v_texCoord * abs(size) * 2.0), 0.0, 1.0);
    if(size.x < 0.0)
        v_texCoord.x = 1.0 - v_texCoord.x;
    if(size.y < 0.0)
        v_texCoord.y = 1.0 - v_texCoord.y;
}
