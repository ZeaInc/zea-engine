import { Vec3 } from '../../Math/index'
import { Parameter, ValueSetMode } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Vec3(three-dimensional coordinate) values.
 *
 * i.e.:
 * ```javascript
 * const vec3Param = new Vec3Parameter('MyVec3', new Vec3(1.2, 3.4, 1))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(vec3Param)
 * ```
 * @extends Parameter
 */
class Vec3Parameter extends Parameter {
  /**
   * Create a Vec3 parameter.
   * @param {string} name - The name of the Vec3 parameter.
   * @param {Vec3} value - The value of the parameter.
   * @param {array} range - The range value is an array of two `Vec2` objects.
   */
  constructor(name, value, range = undefined) {
    super(name, value ? value : new Vec3(), 'Vec3')
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Extracts a number value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = new Vec3()
    value.readBinary(reader)
    this.setValue(value, ValueSetMode.DATA_LOAD)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new Vec3 parameter, copies its values
   * from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Vec3Parameter} - Returns a new Vec3 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec3Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec3Parameter }
