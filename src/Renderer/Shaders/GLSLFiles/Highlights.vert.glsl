
precision highp float;

attribute vec3 positions;    //(location = 0)

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
    v_texCoord = positions.xy+0.5;
    gl_Position = vec4(positions.xy*2.0, 0.0, 1.0);
}

