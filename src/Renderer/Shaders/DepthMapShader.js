import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import frag from './DepthMapShader.frag.glsl'
import vert from './DepthMapShader.vert.glsl'

class DepthMapShader extends GLShader {
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

export { DepthMapShader }
