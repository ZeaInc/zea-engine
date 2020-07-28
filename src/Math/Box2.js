/* eslint-disable camelcase */
import StringFunctions from '../Utilities/StringFunctions'

import { Vec2 } from './Vec2'
import { typeRegistry } from './TypeRegistry.js'

/**
 * Represents a box in 2D space. Needing two Vec2 vectors describing the corners
 */
class Box2 {
  /**
   * Creates a Box2 object using Vec2s.
   * In case the parameters are not passed by, their values are pre-defined:
   * <br>
   * p0 is a Vec2 with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY|`Number.POSITIVE_INFINITY`}
   * <br>
   * p1 is a Vec2 with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY|`Number.NEGATIVE_INFINITY`}
   *
   * @param {Vec2} p0 - A point representing the corners of a 2D box.
   * @param {Vec2} p1 - A point representing the corners of a 2D box.
   */
  constructor(p0 = undefined, p1 = undefined) {
    if (p0 instanceof Vec2) {
      this.p0 = p0
    } else {
      this.p0 = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
    }
    if (p1 instanceof Vec2) {
      this.p1 = p1
    } else {
      this.p1 = new Vec2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)
    }
  }

  /**
   * Sets both Vect2 points
   *
   * @param {Vec2} p0 - A point representing the corners of a 2D box.
   * @param {Vec2} p1 - A point representing the corners of a 2D box.
   */
  set(p0, p1) {
    this.p0 = p0
    this.p1 = p1
  }

  /**
   * Resets the box2 back to an uninitialized state.
   *
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY|`Number.POSITIVE_INFINITY`}
   * and {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY|`Number.NEGATIVE_INFINITY`}
   */
  reset() {
    this.p0.x = Number.POSITIVE_INFINITY
    this.p1.x = Number.NEGATIVE_INFINITY
    this.p0.y = Number.POSITIVE_INFINITY
    this.p1.y = Number.NEGATIVE_INFINITY
  }

  /**
   * Returns `true` if the box has been expanded to contain a point.
   *
   * @return {boolean} - The return value.
   */
  isValid() {
    return (
      this.p0.x != Number.POSITIVE_INFINITY &&
      this.p1.x != Number.NEGATIVE_INFINITY &&
      this.p0.y != Number.POSITIVE_INFINITY &&
      this.p1.y != Number.NEGATIVE_INFINITY
    )
  }

  /**
   * Expands the Box2 to contain the new point.
   *
   * @param {Vec2} point - A point represents the corners of a 2D box.
   */
  addPoint(point) {
    if (this.p0.x == Number.POSITIVE_INFINITY || point.x < this.p0.x)
      this.p0.x = point.x
    if (this.p0.y == Number.POSITIVE_INFINITY || point.y < this.p0.y)
      this.p0.y = point.y

    if (this.p1.y == Number.NEGATIVE_INFINITY || point.x > this.p1.x)
      this.p1.x = point.x
    if (this.p1.y == Number.NEGATIVE_INFINITY || point.y > this.p1.y)
      this.p1.y = point.y
  }

  /**
   * Returns the size of a Box2.
   *
   * @return {Box2} - Returns a Box2.
   */
  size() {
    return this.p1.subtract(this.p0)
  }

  /**
   * Returns the size of a Box2 - the same as size().
   *
   * @return {Box2} - Returns a Box2.
   */
  diagonal() {
    return this.p1.subtract(this.p0)
  }

  /**
   * Returns the center point of a Box2.
   *
   * @return {Vec2} - Returns a Vec2.
   */
  center() {
    const result = this.p1.subtract(this.p0)
    result.scaleInPlace(0.5)
    result.addInPlace(this.p0)
    return result
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new Box2.
   * @param {...object} ...args - The ...args param.
   * @return {Box2} - Returns a new Box2.
   * @private
   */
  static create(...args) {
    return new Box2(...args)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Encodes `Box2` Class as a JSON object for persistence.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      p0: this.p0.toJSON(),
      p1: this.p1.toJSON(),
    }
  }

  /**
   * Calls `toJSON` method and stringifies it.
   *
   * @return {string} - The return value.
   */
  toString() {
    // eslint-disable-next-line new-cap
    return StringFunctions.stringifyJSONWithFixedPrecision(this.toJSON())
  }
}

typeRegistry.registerType('Box2', Box2)

export { Box2 }
