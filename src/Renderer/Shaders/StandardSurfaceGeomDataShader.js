import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/index'
import frag from './StandardSurfaceGeomData.frag.glsl'
import vert from './StandardSurfaceGeomData.vert.glsl'
class StandardSurfaceGeomDataShader extends GLShader {
  constructor(gl, floatGeomBuffer) {
    super(gl)
    this.setShaderStage('VERTEX_SHADER', vert)
    this.setShaderStage('FRAGMENT_SHADER', frag)
    // TODO: add finalize?
  }
}

Registry.register('StandardSurfaceGeomDataShader', StandardSurfaceGeomDataShader)

export { StandardSurfaceGeomDataShader }
