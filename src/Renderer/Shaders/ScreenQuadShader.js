import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/utils/quadVertexFromID.js'

class ScreenQuadShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'ScreenQuadShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

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
`
    )
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'ScreenQuadShader.fragmentShader',
      `
precision highp float;

uniform sampler2D image;

varying vec2 v_texCoord;


#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
    vec4 fragColor;
#endif
    fragColor = texture2D(image, v_texCoord);
    fragColor = vec4(fragColor.rgb/fragColor.a, 1.0);

#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`
    )
    this.finalize()
  }
}

export { ScreenQuadShader }
