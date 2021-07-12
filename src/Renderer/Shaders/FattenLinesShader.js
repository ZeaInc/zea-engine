import { GLShader } from '../GLShader.js'

import './GLSL/utils/quadVertexFromID.js'

import vert from './FattenLines.vert.glsl'
import frag from './FattenLines.frag.glsl'

class FattenLinesShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
    this.finalize()
  }
}

export { FattenLinesShader }
