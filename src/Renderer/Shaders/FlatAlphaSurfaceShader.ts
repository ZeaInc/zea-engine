import { Registry } from '../../Registry'
import { FlatSurfaceShader } from './FlatSurfaceShader.js'

class FlatAlphaSurfaceShader extends FlatSurfaceShader {
  static isTransparent() {
    return true
  }

  bind(renderstate: any, key: any) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

Registry.register('FlatAlphaSurfaceShader', FlatAlphaSurfaceShader)
export { FlatAlphaSurfaceShader }
