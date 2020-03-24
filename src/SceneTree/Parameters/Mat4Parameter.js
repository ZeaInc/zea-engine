import { Mat4 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Mat4 (4x4 matrix) parameter.
 * @extends Parameter
 */
class Mat4Parameter extends Parameter {
  /**
   * Create a Mat4 parameter.
   * @param {string} name - The name of the Mat4 parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Mat4(), 'Mat4')
  }

  /**
   * The clone method constructs a new Mat4 parameter,
   * copies its values from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Mat4Parameter} - Returns a new cloned Mat4 parameter.
   */
  clone(flags) {
    const clonedParam = new Mat4Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Mat4Parameter }
