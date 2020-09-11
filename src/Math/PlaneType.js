/* eslint-disable new-cap */
/* eslint-disable camelcase */
import { StringFunctions } from '../Utilities/StringFunctions'
import { AttrValue } from './AttrValue.js'
import { Registry } from '../Registry'
import { Vec3 } from './Vec3.js'

/**
 * Class representing a plane.
 *
 * @extends AttrValue
 */
class PlaneType extends AttrValue {
  /**
   * Create a plane.
   *
   * @param {Vec3} normal - The normal of the plane.
   * @param {number} w - The w value.
   */
  constructor(normal, w = 0) {
    super()
    if (normal instanceof Vec3) {
      this.normal = normal
    } else {
      this.normal = new Vec3()
    }
    this.w = w
  }

  /**
   * Setter from scalar components.
   *
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   * @param {number} z - The z value.
   * @param {number} w - The w value.
   */
  set(x, y, z, w) {
    this.normal.set(x, y, z)
    this.w = w
  }

  /**
   * Thet divideScalar method
   *
   * @param {number} value - The value value.
   */
  divideScalar(value) {
    this.normal.scaleInPlace(1 / value)
    this.w /= value
  }

  /**
   * Calculates the distance from a point to this place.
   *
   * @param {Vec3} point - The point value.
   * @return {number} - The rreturn value.
   */
  distanceToPoint(point) {
    return point.dot(this.normal) + this.w
  }

  /**
   * Normalize this plane in place modifying its values.
   */
  normalizeInPlace() {
    const inverseNormalLength = 1.0 / this.normal.length()
    this.normal.scaleInPlace(inverseNormalLength)
    this.w *= inverseNormalLength
  }

  /**
   * Clones this plane and returns a new plane.
   *
   * @return {Plane} - Returns a new plane.
   */
  clone() {
    return new Plane(this.normal.clone(), this.w)
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new plane.
   * @param {...object} ...args - The ...args param.
   * @return {Plane} - Returns a new plane.
   * @private
   */
  static create(...args) {
    return new Plane(...args)
  }

  // ///////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      normal: this.normal.toJSON(),
      w: this.w,
    }
  }

  /**
   * Calls `toJSON` method and stringifies it.
   *
   * @return {string} - The return value.
   */
  toString() {
    return StringFunctions.stringifyJSONWithFixedPrecision(this.toJSON())
  }
}

Registry.register('PlaneType', PlaneType)

export { PlaneType }
