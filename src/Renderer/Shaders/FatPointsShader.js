import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

import vert from './FatPoints.vert.glsl'
import frag from './FatPoints.frag.glsl'
import GeomDataFrag from './FatPointsGeomData.frag.glsl'
import SelectedFrag from './FatPointsSelected.frag.glsl'
class FatPointsShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
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
    paramDescs.push({ name: 'PointSize', defaultValue: 0.05 })
    paramDescs.push({ name: 'Rounded', defaultValue: 1.0 })
    paramDescs.push({ name: 'BorderWidth', defaultValue: 0.2 })
    paramDescs.push({ name: 'Overlay', defaultValue: 0.0 })
    return paramDescs
  }

  static getGeomDataShaderName() {
    return 'FatPointsGeomDataShader'
  }

  static getSelectedShaderName() {
    return 'FatPointsSelectedShader'
  }

  /**
   * The supportsInstancing method.
   * @return {boolean} - return false for shaders that cannot be rendered in instanced mode.
   */
  static supportsInstancing() {
    return false
  }
}

class FatPointsGeomDataShader extends FatPointsShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)

    this.setShaderStage('FRAGMENT_SHADER', GeomDataFrag)
  }
}

class FatPointsSelectedShader extends FatPointsShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)

    this.setShaderStage('FRAGMENT_SHADER', SelectedFrag)
  }
}

Registry.register('FatPointsShader', FatPointsShader)
Registry.register('FatPointsGeomDataShader', FatPointsGeomDataShader)
Registry.register('FatPointsSelectedShader', FatPointsSelectedShader)

// Note: due to a bug in webpack, if these classes are not exported,
// then we get a mangling of the code _only_in_release_mode_.
// The factory returns FatPointsSelectedShader
// instead of FatPointsShader when the GLPAss tries to construct it.
export { FatPointsShader, FatPointsGeomDataShader, FatPointsSelectedShader }
