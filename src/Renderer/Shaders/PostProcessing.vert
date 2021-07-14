
precision highp float;

import 'quadVertexFromID.glsl'
import 'fxaa-texcoords.glsl'

uniform vec2 textureSize;

/* VS Outputs */
varying vec2 v_texCoord;

//texcoords computed in vertex step
//to avoid dependent texture reads
varying vec2 v_rgbNW;
varying vec2 v_rgbNE;
varying vec2 v_rgbSW;
varying vec2 v_rgbSE;
varying vec2 v_rgbM;

 
void main()
{
    vec2 position = getQuadVertexPositionFromID();
    v_texCoord = position+0.5;
    gl_Position = vec4(position*2.0, 0.0, 1.0);

    vec2 fragCoord = v_texCoord * textureSize;
    texcoords(fragCoord, textureSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}

