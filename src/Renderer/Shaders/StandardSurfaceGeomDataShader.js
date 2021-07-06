import { GLShader } from '../GLShader.js'
import { Registry } from '../../Registry'

import './GLSL/stack-gl/inverse.js'
import './GLSL/stack-gl/transpose.js'
import './GLSL/drawItemTexture.js'
import './GLSL/modelMatrix.js'
import './GLSL/glsl-bits.js'

import frag from './GLSLFiles/StandardSurfaceGeomData.frag.glsl'
import vert from './GLSLFiles/StandardSurfaceGeomData.vert.glsl'
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
