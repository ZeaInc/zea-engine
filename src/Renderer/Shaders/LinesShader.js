import { Color } from '../../Math/index'
import { sgFactory } from '../../SceneTree/index'
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

class LinesShader extends GLShader {
  constructor(gl) {
    super(gl)
    this.__shaderStages['VERTEX_SHADER'] = shaderLibrary.parseShader(
      'LinesShader.vertexShader',
      `
precision highp float;

attribute vec3 positions;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

<%include file="stack-gl/transpose.glsl"/>
<%include file="drawItemId.glsl"/>
<%include file="drawItemTexture.glsl"/>
<%include file="modelMatrix.glsl"/>

/* VS Outputs */

void main(void) {
    int drawItemId = getDrawItemId();
    mat4 modelMatrix = getModelMatrix(drawItemId);
    mat4 modelViewProjectionMatrix = projectionMatrix * viewMatrix * modelMatrix;
    gl_Position = modelViewProjectionMatrix * vec4(positions, 1.0);
}
`
    )

    this.__shaderStages['FRAGMENT_SHADER'] = shaderLibrary.parseShader(
      'LinesShader.fragmentShader',
      `
precision highp float;

uniform color Color;
uniform float Opacity;

#ifdef ENABLE_ES3
    out vec4 fragColor;
#endif
void main(void) {
#ifndef ENABLE_ES3
    vec4 fragColor;
#endif
    fragColor = Color;
    fragColor.a *= Opacity;
    
#ifndef ENABLE_ES3
    gl_FragColor = fragColor;
#endif
}
`
    )
    this.finalize()
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({ name: 'Color', defaultValue: new Color(1.0, 1.0, 0.5) })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0 })
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'StandardSurfaceGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'StandardSurfaceSelectedGeomsShader'
  }

  static isTransparent() {
    return true
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

sgFactory.registerClass('LinesShader', LinesShader)
export { LinesShader }
