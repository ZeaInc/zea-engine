import { Registry } from '../../Registry'
import { FlatSurfaceShader } from './FlatSurfaceShader.js'

class ToolIconShader extends FlatSurfaceShader {
  constructor(gl) {
    super(gl)
    this.invisibleToGeomBuffer = true
  }
}

Registry.register('ToolIconShader', ToolIconShader)
export { ToolIconShader }
