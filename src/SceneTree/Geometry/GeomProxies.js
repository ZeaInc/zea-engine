import { Box3 } from '../../Math/index'
import { EventEmitter } from '../../Utilities/EventEmitter.js'
import { Registry } from '../../Registry'

/** Class representing a base geometry proxy.
 * @extends EventEmitter
 * @private
 */
class BaseProxy extends EventEmitter {
  /**
   * Create a base proxy.
   * @param {any} data - The data value.
   */
  constructor(data) {
    super()
    this.name = data.name
    this.__buffers = data.geomBuffers
    if (this.__buffers.attrBuffers) {
      // eslint-disable-next-line guard-for-in
      for (const attrName in this.__buffers.attrBuffers) {
        const attrData = this.__buffers.attrBuffers[attrName]
        const dataType = Registry.getBlueprint(attrData.dataType)
        attrData.dataType = dataType
      }
    }

    this.boundingBox = new Box3()
    this.boundingBox.p0.__data = data.bbox.p0.__data
    this.boundingBox.p1.__data = data.bbox.p1.__data

    this.__metaData = new Map()
  }

  /**
   * Returns the number of vertex attributes.
   *
   * @return {number} - The return value.
   */
  getNumVertices() {
    return this.__buffers.numVertices
  }

  /**
   * Returns the bounding box for geometry.
   * @return {Vec3} - The return value.
   */
  getBoundingBox() {
    return this.boundingBox
  }

  /**
   * The genBuffers method.
   * @return {any} - The return value.
   */
  genBuffers() {
    return this.__buffers
  }

  /**
   * The freeBuffers method.
   */
  freeBuffers() {
    // Note: Explicitly transfer data to a web worker and then
    // terminate the worker. (hacky way to free TypedArray memory explicitly)
    const freeData = { attrBuffers: {} }
    const transferables = []
    if (this.__buffers.indices) {
      transferables.push(this.__buffers.indices.buffer)
      freeData.indices = this.__buffers.indices
      delete this.__buffers.indices
    }
    if (this.__buffers.attrBuffers) {
      for (const attrName in this.__buffers.attrBuffers) {
        const attrData = this.__buffers.attrBuffers[attrName]
        freeData.attrBuffers[attrName] = this.__buffers.attrBuffers[attrName]
        transferables.push(attrData.values.buffer)
        delete this.__buffers.attrBuffers[attrName]
      }
      delete this.__buffers.attrBuffers
    }
  }

  // ////////////////////////////////////////
  // Metadata

  /**
   * The getMetadata method.
   * @param {any} key - The key value.
   * @return {any} - The return value.
   */
  getMetadata(key) {
    return this.__metaData.get(key)
  }

  /**
   * The hasMetadata method.
   * @param {any} key - The key value.
   * @return {any} - The return value.
   */
  hasMetadata(key) {
    return this.__metaData.has(key)
  }

  /**
   * The setMetadata method.
   * @param {any} key - The key value.
   * @param {object} metaData - The metaData value.
   */
  setMetadata(key, metaData) {
    this.__metaData.set(key, metaData)
  }
}

/** Class representing a points proxy.
 * @extends BaseProxy
 * @private
 */
class PointsProxy extends BaseProxy {
  /**
   * Create a points proxy.
   * @param {any} data - The data value.
   */
  constructor(data) {
    super(data)
  }
}

/** Class representing a lines proxy.
 * @extends BaseProxy
 * @private
 */
class LinesProxy extends BaseProxy {
  /**
   * Create a lines proxy.
   * @param {any} data - The data value.
   */
  constructor(data) {
    super(data)
  }
}

/** Class representing a mesh proxy.
 * @extends BaseProxy
 * @private
 */
class MeshProxy extends BaseProxy {
  /**
   * Create a mesh proxy.
   * @param {any} data - The data value.
   */
  constructor(data) {
    super(data)
  }
}

export { PointsProxy, LinesProxy, MeshProxy }
