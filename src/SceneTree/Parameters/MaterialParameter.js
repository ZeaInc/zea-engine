import { Signal } from '../../Utilities/index'
import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js'
import { materialLibraryManager } from '../MaterialLibraryManager.js'

/** Class representing a material parameter.
 * @extends Parameter
 */
class MaterialParameter extends Parameter {
  /**
   * Create a material parameter.
   * @param {string} name - The name of the material parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'Material')
    this.valueParameterValueChanged = new Signal()
  }

  /**
   * The setValue method.
   * @param {any} material - The material param.
   * @param {number} mode - The mode param.
   */
  setValue(material, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2 = change by loading/cloning code.
    if (this.__value !== material) {
      if (this.__value) {
        this.__value.parameterValueChanged.disconnect(
          this.valueParameterValueChanged.emit
        )
      }
      this.__value = material
      if (this.__value) {
        this.__value.parameterValueChanged.connect(
          this.valueParameterValueChanged.emit
        )
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
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return
    return {
      value: this.__value.getPath(),
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }
    const materialPath = j.value

    const material = materialLibraryManager.resolveMaterialFromPath(
      materialPath
    )
    if (material) this.setValue(material)
    this.__flags |= ParamFlags.USER_EDITED
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new material parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {MaterialParameter} - Returns a new material parameter.
   */
  clone(flags) {
    const clonedParam = new MaterialParameter(this.__name, this.__value)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    // Note: Some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // E.g. freeing GPU Memory.

    if (this.__value) {
      this.__value.parameterValueChanged.disconnect(
        this.valueParameterValueChanged.emit
      )
    }
  }
}

export { MaterialParameter }
