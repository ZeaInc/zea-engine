import { Mat3 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Mat3 (3x3 matrix) parameter.
 * @extends Parameter
 */
class Mat3Parameter extends Parameter {
  /**
   * Create a Mat3 parameter.
   * @param {string} name - The name of the Mat3 parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Mat3(), 'Mat3')
  }

  /**
   * The clone method constructs a new Mat3 parameter,
   * copies its values from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Mat3Parameter} - Returns a new cloned Mat3 parameter.
   */
  clone(flags) {
    const clonedParam = new Mat3Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Mat3Parameter }
