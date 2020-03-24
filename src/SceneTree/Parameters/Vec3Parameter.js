import { Vec3 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Vec3 parameter.
 * A Vec3 represents a three-dimensional coordinate.
 * @extends Parameter
 */
class Vec3Parameter extends Parameter {
  /**
   * Create a Vec3 parameter.
   * @param {string} name - The name of the Vec3 parameter.
   * @param {any} value - The value of the parameter.
   * @param {any} range - The range value.
   */
  constructor(name, value, range = undefined) {
    super(name, value ? value : new Vec3(), 'Vec3')
  }

  /**
   * The clone method constructs a new Vec3 parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Vec3Parameter} - Returns a new Vec3 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec3Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec3Parameter }
