import { sgFactory } from '../../SceneTree/index'
import { FlatSurfaceShader } from './FlatSurfaceShader.js'

class ToolIconShader extends FlatSurfaceShader {
  constructor(gl) {
    super(gl)
    this.invisibleToGeomBuffer = true
  }
}

sgFactory.registerClass('ToolIconShader', ToolIconShader)
export { ToolIconShader }
