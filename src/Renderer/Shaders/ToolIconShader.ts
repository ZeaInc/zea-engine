import { Registry } from '../../Registry'
import { FlatSurfaceShader } from './FlatSurfaceShader.js'

class ToolIconShader extends FlatSurfaceShader {
  constructor(gl: any) {
    super(gl)
    this.invisibleToGeomBuffer = true
  }
}

Registry.register('ToolIconShader', ToolIconShader)
export { ToolIconShader }
