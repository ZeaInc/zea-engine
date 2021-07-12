import { GLShader } from './GLShader.js'

import './GLSLSnippets/snippets.js'
import vert from './Shaders/AtlasLayout.vertex.glsl'
import frag from './Shaders/AtlasLayout.frag.glsl'
// eslint-disable-next-line require-jsdoc
class AtlasLayoutShader extends GLShader {
  /**
   * Create an atlas layout shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
  }
}
export { AtlasLayoutShader }
