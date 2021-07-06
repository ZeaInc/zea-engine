import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'
import './GLSL/utils/quadVertexFromID.js'

import frag from './GLSLFiles/PreComputeBRDF.frag.glsl'
import vert from './GLSLFiles/PreComputeBRDF.vert.glsl'

/** Shader for convolving Environment maps.
 * @extends GLShader
 * @private
 */
class PreComputeBRDFShader extends GLShader {
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

export { PreComputeBRDFShader }
