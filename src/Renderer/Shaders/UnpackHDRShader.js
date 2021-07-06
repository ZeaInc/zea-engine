/* eslint-disable require-jsdoc */
import { shaderLibrary } from '../ShaderLibrary.js'
import { GLShader } from '../GLShader.js'

import './GLSL/utils/quadVertexFromID.js'
import './GLSL/utils/unpackHDR.js'

import frag from './GLSLFiles/UnpackHDR.frag.glsl'
import vert from './GLSLFiles/UnpackHDR.vert.glsl'

/** Shader for unpacking HDR images using Boost HDR algorithm.
 * @extends GLShader
 * @private
 */
class UnpackHDRShader extends GLShader {
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

export { UnpackHDRShader }
