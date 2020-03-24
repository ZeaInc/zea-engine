import { Vec4 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Vec4 parameter.
 * A Vec4 represents a four-dimensional coordinate.
 * @extends Parameter
 */
class Vec4Parameter extends Parameter {
  /**
   * Create a Vec4 parameter.
   * @param {string} name - The name of the Vec4 parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value ? value : new Vec4(), 'Vec4')
  }

  /**
   * The clone method constructs a new Vec4 parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Vec4Parameter} - Returns a new Vec4 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec4Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec4Parameter }
