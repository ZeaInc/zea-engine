/* eslint-disable require-jsdoc */
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import vert from './ConvolveSpecular.vert'
import frag from './ConvolveSpecular.frag'

/** Shader for convolving Environment maps.
 * @extends GLShader
 * @private
 */
class ConvolveSpecularShader extends GLShader {
  /**
   * Create a GL renderer.
   * @param {WebGLRenderingContext} gl - The options value.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
  }
}

export { ConvolveSpecularShader }
