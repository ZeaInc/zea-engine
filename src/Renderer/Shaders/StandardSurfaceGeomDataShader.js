/* eslint-disable require-jsdoc */
import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/index'
import frag from './StandardSurfaceGeomData.frag'
import vert from './StandardSurfaceGeomData.vert'
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
