/* eslint-disable require-jsdoc */
import { GLShader } from '../GLShader.js'

import frag from './Highlights.frag'
import vert from './Highlights.vert'
class HighlightsShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
  }
}

export { HighlightsShader }
