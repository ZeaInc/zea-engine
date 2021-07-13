/* eslint-disable require-jsdoc */
import { Vec3 } from '../../Math/index'
import { Registry } from '../../Registry'
import { GLShader } from '../GLShader.js'

import './GLSL/index'
import vert from './EnvProjection.vert'
import LatLongEnvProjectionFrag from './LatLongEnvProjection.frag'
import OctahedralEnvProjectionFrag from './OctahedralEnvProjection.frag'

class EnvProjectionShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
  }

  static getParamDeclarations() {
    const paramDescs = super.getParamDeclarations()
    paramDescs.push({
      name: 'projectionCenter',
      defaultValue: new Vec3(0.0, 0.0, 1.7),
    })
    return paramDescs
  }
}

class OctahedralEnvProjectionShader extends EnvProjectionShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('FRAGMENT_SHADER', OctahedralEnvProjectionFrag)
  }
}

Registry.register('OctahedralEnvProjectionShader', OctahedralEnvProjectionShader)

class LatLongEnvProjectionShader extends EnvProjectionShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('FRAGMENT_SHADER', LatLongEnvProjectionFrag)
  }
}

Registry.register('LatLongEnvProjectionShader', LatLongEnvProjectionShader)
export { EnvProjectionShader, OctahedralEnvProjectionShader, LatLongEnvProjectionShader }
