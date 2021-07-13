/* eslint-disable require-jsdoc */
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import frag from './PostProcessing.frag.glsl'
import vert from './PostProcessing.vert.glsl'
class PostProcessing extends GLShader {
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

export { PostProcessing }
