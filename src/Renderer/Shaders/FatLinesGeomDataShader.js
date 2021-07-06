import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
// import { shaderLibrary } from '../ShaderLibrary.js'
// import { GLShader } from '../GLShader.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

import vert from './GLSLFiles/FatLinesGeomData.vert.glsl'
import frag from './GLSLFiles/FatLinesGeomData.frag.glsl'

import { FatLinesShader } from './FatLinesShader.js'
/** Shader for drawing Fat lines
 * @extends GLShader
 * @private
 */
class FatLinesGeomDataShader extends FatLinesShader {
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

  bind(renderstate) {
    if (super.bind(renderstate)) {
      renderstate.supportsInstancing = false
      return true
    }
    return false
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'BaseColor',
      defaultValue: new Color(1.0, 1.0, 0.5),
    })
    paramDescs.push({ name: 'Opacity', defaultValue: 1.0 })
    paramDescs.push({ name: 'LineThickness', defaultValue: 1.0 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0 })
    return paramDescs
  }
}

Registry.register('FatLinesGeomDataShader', FatLinesGeomDataShader)
export { FatLinesGeomDataShader }
