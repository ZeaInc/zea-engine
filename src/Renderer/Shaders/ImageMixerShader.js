import { shaderLibrary } from '../ShaderLibrary.js';
import { GLShader } from '../GLShader.js';

import './GLSL/utils/quadVertexFromID.js';

class ImageMixerShader extends GLShader {
  constructor(gl) {
    super(gl);
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'ImageMixerShader.vertexShader',
      `
precision highp float;

<%include file="utils/quadVertexFromID.glsl"/>

/* VS Outputs */
varying vec2 v_texCoord;
 
void main()
{
    vec2 position = getQuadVertexPositionFromID();
    v_texCoord = position+0.5;
    gl_Position = vec4(position*2.0, 0.0, 1.0);
}
`
    );
    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'ImageMixerShader.fragmentShader',
      `
precision highp float;

varying vec2 v_texCoord;

uniform sampler2D sampler0;
uniform float weight0;

uniform sampler2D sampler1;
uniform float weight1;

#ifdef UNPACK_SRC2
uniform sampler2D sampler2;
uniform float weight2;
#endif

<%include file="utils/unpackHDR.glsl"/>

void main(void) {
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(sampler0, v_texCoord) * weight0;
    gl_FragColor += texture2D(sampler1, v_texCoord) * weight1;

#ifdef UNPACK_SRC2
    gl_FragColor += texture2D(sampler2, v_texCoord) * weight2;
#endif
}

`
    );
  }
}

export { ImageMixerShader };
