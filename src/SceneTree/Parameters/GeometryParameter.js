import { Signal } from '../../Utilities/index'
import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js'

/** Class representing a geometry parameter.
 * @extends Parameter
 */
class GeometryParameter extends Parameter {
  /**
   * Create a geometry parameter.
   * @param {string} name - The name of the color parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, undefined, 'Geometry')
    this.boundingBoxDirtied = new Signal()
    this.setValue(value)
  }

  /**
   * The setValue method.
   * @param {any} geom - The geom value.
   * @param {any} mode - The mode value.
   */
  setValue(geom, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2 = change by loading/cloning code.
    if (this.__value !== geom) {
      if (this.__value) {
        this.__value.boundingBoxDirtied.disconnect(this.boundingBoxDirtied.emit)
      }
      this.__value = geom
      if (this.__value) {
        this.__value.boundingBoxDirtied.connect(this.boundingBoxDirtied.emit)
      }

      if (
        mode == ValueSetMode.USER_SETVALUE ||
        mode == ValueSetMode.REMOTEUSER_SETVALUE
      ) {
        this.__flags |= ParamFlags.USER_EDITED
      }

      // During the cleaning process, we don't want notifications.
      if (mode != ValueSetMode.OPERATOR_SETVALUE) this.valueChanged.emit(mode)
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return super.toJSON(context, flags)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  fromJSON(j, context, flags) {
    return super.fromJSON(j, context, flags)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new geometry parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {GeometryParameter} - Returns a new geometry parameter.
   */
  clone(flags) {
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
      this.__value.boundingBoxDirtied.disconnect(this.boundingBoxDirtied.emit)
    }
  }
}

export { GeometryParameter }
