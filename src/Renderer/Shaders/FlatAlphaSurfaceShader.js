import { sgFactory } from '../../SceneTree/index'
import { FlatSurfaceShader } from './FlatSurfaceShader.js'

class FlatAlphaSurfaceShader extends FlatSurfaceShader {
  static isTransparent() {
    return true
  }

  bind(renderstate, key) {
    if (renderstate.pass != 'ADD') return false
    return super.bind(renderstate, key)
  }
}

sgFactory.registerClass('FlatAlphaSurfaceShader', FlatAlphaSurfaceShader)
export { FlatAlphaSurfaceShader }
