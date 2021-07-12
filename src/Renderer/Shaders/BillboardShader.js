// import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import frag from './Billboard.frag.glsl'
import vert from './Billboard.vert.glsl'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/materialparams.js'

class BillboardShader extends GLShader {
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

export { BillboardShader }
