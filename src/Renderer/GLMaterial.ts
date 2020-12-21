import { EventEmitter } from '../Utilities/index'
import { MaterialShaderBinding } from './MaterialShaderBinding.js'

/** Class representing a GL material.
 * @extends EventEmitter
 * @private
 */
class GLMaterial extends EventEmitter {
  __boundTexturesBeforeMaterial: any;
  __gl: any;
  __glshader: any;
  __material: any;
  __shaderBindings: any;
  /**
   * Create a GL material.
   * @param {any} gl - The gl value.
   * @param {any} material - The material value.
   * @param {any} glshader - The glshader value.
   */
  constructor(gl: any, material: any, glshader: any) {
    super()
    this.__gl = gl
    this.__material = material
    this.__glshader = glshader

    this.__shaderBindings = {}

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    material.on('parameterValueChanged', () => this.emit('updated'))
  }

  /**
   * The getMaterial method.
   * @return {any} - The return value.
   */
  getMaterial() {
    return this.__material
  }

  /**
   * The getGLShader method.
   * @return {any} - The return value.
   */
  getGLShader() {
    return this.__glshader
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} warnMissingUnifs - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate: any, warnMissingUnifs: any) {
    this.__boundTexturesBeforeMaterial = renderstate.boundTextures

    let shaderBinding = this.__shaderBindings[renderstate.shaderkey]
    if (!shaderBinding) {
      const gl = this.__gl
      shaderBinding = new MaterialShaderBinding(gl, this, renderstate.unifs, warnMissingUnifs)
      this.__shaderBindings[renderstate.shaderkey] = shaderBinding
    }
    return shaderBinding.bind(renderstate)

    return true
  }

  /**
   * The unbind method.
   * @param {any} renderstate - The renderstate value.
   */
  unbind(renderstate: any) {
    // Enable texture units to be re-used by resetting the count back
    // to what it was.
    renderstate.boundTextures = this.__boundTexturesBeforeMaterial
  }
}

export { GLMaterial }
