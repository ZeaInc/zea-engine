/* eslint-disable new-cap */
/* eslint-disable camelcase */
import StringFunctions from '../Utilities/StringFunctions'
import { AttrValue } from './AttrValue.js'
import { typeRegistry } from './TypeRegistry.js'
import { Vec3 } from './Vec3.js'

/**
 * Class representing a sphere.
 *
 * @extends AttrValue
 */
class SphereType extends AttrValue {
  /**
   * Create a sphere.
   * @param {Vec3} pos - The position of the sphere.
   * @param {number} radius - The radius of the sphere.
   */
  constructor(pos, radius = 0) {
    super()
    if (pos instanceof Vec3) {
      this.pos = pos
    } else {
      this.pos = new Vec3()
    }
    this.radius = radius
  }

  /**
   * Clones this sphere and returns a new sphere.
   *
   * @return {Sphere} - Returns a new sphere.
   */
  clone() {
    return new Sphere(this.pos.clone(), this.radius)
  }

  /**
   * Checks if this sphere intersects a box.
   *
   * @param {Box3} box - The box value.
   * @return {boolean} - The return value.
   */
  intersectsBox(box) {
    return box.intersectsSphere(this)
  }

  // ///////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      pos: this.pos.toJSON(),
      radius: this.radius,
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
  
  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new sphere.
   *
   * @param {...object} ...args - The ...args param.
   * @return {Sphere} - Returns a new sphere.
   * @private
   */
  static create(...args) {
    return new Sphere(...args)
  }
}

typeRegistry.registerType('SphereType', SphereType)

export { SphereType }
