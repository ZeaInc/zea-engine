/* eslint-disable require-jsdoc */
import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/envmap-octahedral.js'
import './GLSL/envmap-equirect.js'
import './GLSL/envmap-dualfisheye.js'
import './GLSL/utils/quadVertexFromID.js'

import frag from './EnvMap.frag.glsl'
import vert from './EnvMap.vert.glsl'
class EnvMapShader extends GLShader {
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

export { EnvMapShader }
