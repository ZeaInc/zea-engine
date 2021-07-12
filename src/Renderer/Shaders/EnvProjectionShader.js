import { Color, Vec3 } from '../../Math/index'
import { Registry } from '../../Registry'
import { GLShader } from '../GLShader.js'
import { shaderLibrary } from '../ShaderLibrary.js'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/envmap-equirect.js'
import './GLSL/envmap-octahedral.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

import vert from './EnvProjection.vert.glsl'
import LatLongEnvProjectionFrag from './LatLongEnvProjection.frag.glsl'
import OctahedralEnvProjectionFrag from './OctahedralEnvProjection.frag.glsl'

class EnvProjectionShader extends GLShader {
  /**
   * Create a GL shader.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   */
  constructor(gl) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)

    this.finalize()
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
    this.finalize()
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
    this.finalize()
  }
}

Registry.register('LatLongEnvProjectionShader', LatLongEnvProjectionShader)
export { EnvProjectionShader, OctahedralEnvProjectionShader, LatLongEnvProjectionShader }
