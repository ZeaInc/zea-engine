import { GLShader } from '../GLShader.js'

import './GLSL/index'
import frag from './BoundingBox.frag.glsl'
import vert from './BoundingBox.vert.glsl'

class BoundingBoxShader extends GLShader {
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

export { BoundingBoxShader }
