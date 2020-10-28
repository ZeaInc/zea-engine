import { Registry } from '../../Registry'
import { Parameter } from './Parameter.js'

/** Class representing a geometry parameter.
 * @extends Parameter
 * @private
 */
class GeometryParameter extends Parameter {
  /**
   * Create a geometry parameter.
   * @param {string} name - The name of the color parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, undefined, 'Geometry')

    this.__emitBoundingBoxDirtied = this.__emitBoundingBoxDirtied.bind(this)
    this.setValue(value)
  }

  // eslint-disable-next-line require-jsdoc
  __emitBoundingBoxDirtied(event) {
    this.emit('boundingBoxChanged', event)
  }

  /**
   * The setValue method.
   * @param {any} geom - The geom value.
   */
  setValue(geom) {
    // 0 == normal set. 1 = changed via cleaner fn, 2 = change by loading/cloning code.
    if (this.__value !== geom) {
      if (this.__value) {
        this.__value.off('boundingBoxChanged', this.__emitBoundingBoxDirtied)
      }
      this.__value = geom
      if (this.__value) {
        this.__value.on('boundingBoxChanged', this.__emitBoundingBoxDirtied)
      }

      this.emit('valueChanged', {})
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The loadValue is used to change the value of a parameter, without triggering a
   * valueChanges, or setting the USER_EDITED state.
   *
   * @param {any} value - The context value.
   */
  loadValue(value) {
    if (this.__value) {
      this.__value.off('boundingBoxChanged', this.__emitBoundingBoxDirtied)
    }
    this.__value = value
    if (this.__value) {
      this.__value.on('boundingBoxChanged', this.__emitBoundingBoxDirtied)
    }
  }

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    return super.toJSON(context)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  fromJSON(j, context) {
    return super.fromJSON(j, context)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new geometry parameter, copies its values
   * from this parameter and returns it.
   * @return {GeometryParameter} - Returns a new geometry parameter.
   */
  clone() {
    const clonedParam = new GeometryParameter(this.__name, this.__value)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    // Note: some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // e.g. freeing GPU Memory.

    if (this.__value) {
      this.__value.off('boundingBoxChanged', this.__emitBoundingBoxDirtied)
    }
  }
}

Registry.register('GeometryParameter', GeometryParameter)

export { GeometryParameter }
