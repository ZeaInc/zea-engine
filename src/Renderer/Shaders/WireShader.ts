import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'

class WireShader extends GLShader {
  constructor(gl: any) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'WireShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;    //(location = 0)

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

/* VS Outputs */

void main(void) {
    mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
    gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);

    // Apply the perspective transform, and then move the vertices
    //  towards the camera by a tiny little bit...
    gl_Position.z -= 0.001 / gl_Position.w;
    //gl_Position.z *= 0.999;
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'WireShader.fragmentShader',
      `
precision highp float;

uniform color wireColor;

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {
#ifdef ENABLE_ES3
    gl_FragColor = color;
#else
    fragColor = color;
#endif  
}
`
    )
  }
}

export { WireShader }
