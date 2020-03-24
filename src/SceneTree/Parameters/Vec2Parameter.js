import { Vec2 } from '../../Math/index'
import { Parameter } from './Parameter.js'

/** Class representing a Vec2 parameter.
 * A Vec2 represents a two-dimensional coordinate.
 * @extends Parameter
 */
class Vec2Parameter extends Parameter {
  /**
   * Create a Vec2 parameter.
   * @param {string} name - The name of the Vec2 parameter.
   * @param {any} value - The value of the parameter.
   * @param {any} range - The range value.
   */
  constructor(name, value, range = undefined) {
    super(name, value ? value : new Vec2(), 'Vec2')
    this.__range = range
  }

  /**
   * The getRange method.
   * @return {any} - The return value.
   */
  getRange() {
    // Range should be an array of 2 vec2s. [min(x,y), max(x,y)]
    return this.__range
  }

  /**
   * The __setRange method.
   * @param {any} range - The range value.
   * @private
   */
  __setRange(range) {
    // Should be an array [0, 20]
    this.__range = range
    this.rangeChanged.emit()
  }

  /**
   * The clone method constructs a new Vec2 parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Vec2Parameter} - Returns a new Vec2 parameter.
   */
  clone(flags) {
    const clonedParam = new Vec2Parameter(this.__name, this.__value.clone())
    return clonedParam
  }
}

export { Vec2Parameter }
