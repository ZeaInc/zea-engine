import { Vec2 } from '../../Math/index'
import { Parameter, ValueSetMode } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores Vec2(two-dimensional coordinate) values.
 *
 * i.e.:
 * ```javascript
 * const vec2Param = new Vec2Parameter('MyVec2', new Vec2(1.2, 3.4))
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(vec2Param)
 * ```
 *
 * **Events**
 * * **rangeChanged:** Triggered when rage array changes.
 *
 * @extends Parameter
 */
class Vec2Parameter extends Parameter {
  /**
   * Create a Vec2 parameter.
   *
   * @param {string} name - The name of the Vec2 parameter.
   * @param {Vec2} value - The value of the parameter.
   * @param {array} range - The range value is an array of two `Vec2` objects.
   */
  constructor(name, value, range = undefined) {
    super(name, value ? value : new Vec2(), 'Vec2')
    this.__range = range
  }

  /**
   * Returns the range of values in which current parameter can be.
   *
   * @return {array} - The return value.
   */
  getRange() {
    // Range should be an array of 2 vec2s. [min(x,y), max(x,y)]
    return this.__range
  }

  /**
   * The __setRange method.
   * @param {array} range - The range value.
   * @private
   */
  __setRange(range) {
    // Should be an array [0, 20]
    this.__range = range
    this.emit('rangeChanged', { range })
  }

   /**
   * Extracts a number value from a buffer, updating current parameter state.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = new Vec2()
    value.readBinary(reader)
    this.setValue(value, ValueSetMode.DATA_LOAD)
  }

  /**
   * The clone method constructs a new Vec2 parameter, copies its values
   * from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Vec2Parameter} - Returns a new Vec2 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec2Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec2Parameter }
