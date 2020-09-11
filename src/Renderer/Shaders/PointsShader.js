import { Color } from '../../Math/index'
import Registry from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'

class PointsShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'PointsShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float PointSize;
uniform float Overlay;

<%include file="stack-gl/transpose.glsl"/>
<%include file="stack-gl/inverse.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */

void main(void) {
  int drawItemId = getDrawItemId();
  mat4 modelMatrix = getModelMatrix(drawItemId);
  mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
  gl_Position = modelViewProjectionMatrix * vec4(positions, 1.);
  
  gl_PointSize = PointSize;
  
  if(Overlay > 0.0){
    gl_Position.z = mix(gl_Position.z, -1.0, Overlay);
  }
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'PointsShader.fragmentShader',
      `
precision highp float;

uniform color BaseColor;

#ifdef ENABLE_ES3
out vec4 fragColor;
#endif

void main(void) {

#ifndef ENABLE_ES3
  vec4 fragColor;
#endif

  fragColor = BaseColor;

#ifndef ENABLE_ES3
  gl_FragColor = fragColor;
#endif
}
`
    )
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'PointSize', defaultValue: 2.0 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0 })
    return paramDescs
  }
}

Registry.register('PointsShader', PointsShader)

export { PointsShader }
