// import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/pragmatic-pbr/exposure.js'
import './GLSL/pragmatic-pbr/tonemap-filmic.js'
import './GLSL/mattdesl/fxaa.js'
import './GLSL/utils/quadVertexFromID.js'
import './GLSL/stack-gl/gamma.js'

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
    this.finalize()
  }
}

export { PostProcessing }
