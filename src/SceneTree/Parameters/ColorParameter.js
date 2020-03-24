import { Color } from '../../Math/index'
import { sgFactory } from '../SGFactory'
import { Parameter, ValueSetMode } from './Parameter.js'

/** Class representing a color parameter.
 * @extends Parameter
 */
class ColorParameter extends Parameter {
  /**
   * Create a color parameter.
   * @param {string} name - The name of the color parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Color(), 'Color')
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = reader.loadRGBAFloat32Color()
    // If the value is in linear space, then we should convert it to gamma space.
    // Note: !! this should always be done in preprocessing...
    value.applyGamma(2.2)

    this.setValue(value, ValueSetMode.DATA_LOAD)
  }

  /**
   * The clone method constructs a new color parameter,
   * copies its values from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {ColorParameter} - Returns a new cloned color parameter.
   */
  clone(flags) {
    const clonedParam = new ColorParameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

sgFactory.registerClass('ColorParameter', ColorParameter)

export { ColorParameter }
