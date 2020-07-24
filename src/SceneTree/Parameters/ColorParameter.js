import { Color } from '../../Math/index'
import { sgFactory } from '../SGFactory'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores `Color` values.
 *
 * i.e.:
 * ```javascript
 * const colorParam = new ColorParameter('MyColor', new Color(0, 254, 2))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(colorParam)
 * ```
 *
 * @extends Parameter
 */
class ColorParameter extends Parameter {
  /**
   * Create a color parameter.
   * @param {string} name - The name of the color parameter.
   * @param {Color} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Color(), 'Color')
  }

  /**
   * Extracts `Color` values from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = reader.loadRGBAFloat32Color()
    // If the value is in linear space, then we should convert it to gamma space.
    // Note: !! this should always be done in preprocessing...
    value.applyGamma(2.2)

    this.__value = value
  }

  /**
   * The clone method constructs a new color parameter,
   * copies its values from this parameter and returns it.
   *
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
