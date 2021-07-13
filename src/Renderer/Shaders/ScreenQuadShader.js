/* eslint-disable require-jsdoc */
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import frag from './ScreenQuad.frag.glsl'
import vert from './ScreenQuad.vert.glsl'

class ScreenQuadShader extends GLShader {
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

export { ScreenQuadShader }
