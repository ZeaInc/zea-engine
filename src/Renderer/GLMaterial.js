import { Signal } from '../Utilities/index'
import { MaterialShaderBinding } from './MaterialShaderBinding.js'

/** Class representing a GL material. */
class GLMaterial /* extends BaseItem why do we inherit base item here?*/ {
  /**
   * Create a GL material.
   * @param {any} gl - The gl value.
   * @param {any} material - The material value.
   * @param {any} glshader - The glshader value.
   */
  constructor(gl, material, glshader) {
    // super(name);
    this.__gl = gl
    this.__material = material
    this.__glshader = glshader

    this.updated = new Signal()

    this.__shaderBindings = {}
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
   * The generateShaderBinding method.
   */
  generateShaderBinding() {
    const params = this.__material.getParameters()
    for (const param of params) {
      bindParam(gl, param)
    }
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} warnMissingUnifs - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate, warnMissingUnifs) {
    // console.log("Material:" + this.__material.getName());
    this.__boundTexturesBeforeMaterial = renderstate.boundTextures

    let shaderBinding = this.__shaderBindings[renderstate.shaderkey]
    if (!shaderBinding) {
      const gl = this.__gl
      shaderBinding = new MaterialShaderBinding(
        gl,
        this,
        renderstate.unifs,
        warnMissingUnifs
      )
      this.__shaderBindings[renderstate.shaderkey] = shaderBinding
    }
    return shaderBinding.bind(renderstate)

    return true
  }

  /**
   * The unbind method.
   * @param {any} renderstate - The renderstate value.
   */
  unbind(renderstate) {
    // Enable texture units to be re-used by resetting the count back
    // to what it was.
    renderstate.boundTextures = this.__boundTexturesBeforeMaterial
  }
}

export { GLMaterial }
