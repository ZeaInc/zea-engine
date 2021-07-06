import { GLShader } from '../GLShader.js'
import './GLSL/utils/quadVertexFromID.js'
import './GLSL/convolve-helpers.js'

import frag from './GLSLFiles/ConvolveIrradiance.frag.glsl'
import vert from './GLSLFiles/ConvolveIrradiance.vert.glsl'

/** Shader for convolving Environment maps.
 * @extends GLShader
 * @private
 */
class ConvolveIrradianceShader extends GLShader {
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

export { ConvolveIrradianceShader }
