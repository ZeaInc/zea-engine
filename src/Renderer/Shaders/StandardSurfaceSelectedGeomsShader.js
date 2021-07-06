import { shaderLibrary } from '../ShaderLibrary'
import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'

import frag from './GLSLFiles/StandardSurfaceSelectedGeoms.frag.glsl'
import vert from './GLSLFiles/StandardSurfaceSelectedGeoms.vert.glsl'
class StandardSurfaceSelectedGeomsShader extends GLShader {
  constructor(gl, floatGeomBuffer) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
    // TODO: add finalize?
  }
}

Registry.register('StandardSurfaceSelectedGeomsShader', StandardSurfaceSelectedGeomsShader)
export { StandardSurfaceSelectedGeomsShader }
