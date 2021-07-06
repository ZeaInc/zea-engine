import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'

import frag from './GLSLFiles/Normals.frag.glsl'
import vert from './GLSLFiles/Normals.vert.glsl'

class NormalsShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
    // this.finalize() TODO: should a finalize() be here?
  }
}

export { NormalsShader }
