import { Signal } from '../Utilities/index'
import { RefCounted } from '../SceneTree/index'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL geom. */
class GLGeom extends RefCounted {
  /**
   * Create a GL geom.
   * @param {any} gl - The gl value.
   * @param {any} geom - The geom value.
   */
  constructor(gl, geom) {
    super()
    this.__gl = gl
    this.__geom = geom
    this.__glattrs = {}

    this.__glattrbuffers = {}
    this.__shaderBindings = {}
    this.destructing = new Signal()
    this.updated = new Signal()

    const updateBuffers = opts => {
      this.updateBuffers(opts)
      this.updated.emit()
    }
    this.__geom.geomDataChanged.connect(updateBuffers)

    const regenBuffers = opts => {
      this.clearShaderBindings()
      this.updateBuffers(opts)
      this.updated.emit()
    }
    this.__geom.geomDataTopologyChanged.connect(regenBuffers)
  }

  /**
   * The getGeom method.
   * @return {any} - The return value.
   */
  getGeom() {
    return this.__geom
  }

  // /////////////////////////////////////
  // Buffers

  /**
   * The genBuffers method.
   */
  genBuffers() {}

  /**
   * The updateBuffers method.
   * @param {any} opts - The opts value.
   */
  updateBuffers(opts) {}

  // /////////////////////////////////////
  // Binding

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    if (this.__destroyed) throw new Error('Error binding a destroyed geom')

    let shaderBinding = this.__shaderBindings[renderstate.shaderkey]
    if (!shaderBinding) {
      const gl = this.__gl
      shaderBinding = generateShaderGeomBinding(
        gl,
        renderstate.attrs,
        this.__glattrbuffers,
        this.__indexBuffer
      )
      this.__shaderBindings[renderstate.shaderkey] = shaderBinding
    }
    shaderBinding.bind(renderstate)
    return true
  }

  /**
   * The unbind method.
   * @param {any} renderstate - The renderstate value.
   */
  unbind(renderstate) {
    // Unbinding a geom is important as it puts back some important
    // GL state. (vertexAttribDivisor)
    const shaderBinding = this.__shaderBindings[renderstate.shaderkey]
    if (shaderBinding) {
      shaderBinding.unbind(renderstate)
    }
  }

  // /////////////////////////////////////
  // Drawing
  // Draw an item to screen.

  /**
   * The draw method.
   */
  draw() {
    throw new Error(
      'Not implemented. Implement this method in a derived class.'
    )
  }

  /**
   * The drawInstanced method.
   * @param {any} instanceCount - The instanceCount param.
   */
  drawInstanced(instanceCount) {
    throw new Error(
      'Not implemented. Implement this method in a derived class.'
    )
  }

  /**
   * The bindAndDraw method.
   * @param {any} renderstate - The renderstate value.
   */
  bindAndDraw(renderstate) {
    this.bind(renderstate)
    this.draw(renderstate)
  }

  /**
   * The clearShaderBindings method.
   */
  clearShaderBindings() {
    for (const shaderkey in this.__shaderBindings) {
      const shaderBinding = this.__shaderBindings[shaderkey]
      shaderBinding.destroy()
    }
    this.__shaderBindings = {}
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    this.__geom.deleteMetadata('glgeom')

    this.clearShaderBindings()

    const gl = this.__gl
    // eslint-disable-next-line guard-for-in
    for (const attrName in this.__glattrbuffers) {
      const glbuffer = this.__glattrbuffers[attrName]
      if (glbuffer.shared)
        continue /* This buffer is shared between geoms. do not destroy */
      gl.deleteBuffer(glbuffer.buffer)
    }
    this.__glattrs = {}

    this.__shaderBindings = {}
    this.__destroyed = true
    this.destructing.emit(this)
  }
}

export { GLGeom }
