/* eslint-disable new-cap */
import { AttrValue } from './AttrValue.js'
import { Registry } from '../Registry'
import { Vec3 } from './Vec3.js'
/**
 * Represents a four-dimensional coordinate.
 * Math types internally store values in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array|Float32Array} and
 * expose getters and setters for the component values.
 *
 * @extends AttrValue
 */
class Vec4 extends AttrValue {
  /**
   /**
   * Creates a Vec4.
   *
   * The type of values of the `(x, y, z, t)` coordinates can be {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array|Float32Array},
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array|Uint32Array},
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array|Int32Array} and
   * {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/ArrayBuffer|ArrayBuffer}.
   * <br>
   * You can also pass one JSON object parameter.
   * 
   * @param {Number|Float32Array|json} x - The x value. Default is 0.
   * @param {number} y - The y value. Default is 0.
   * @param {number} z - The y value. Default is 0.
   * @param {number} t - The t value. Default is 0.
   */
  constructor(x = 0, y = 0, z = 0, t = 0) {
    super()

    if (x instanceof Float32Array || x instanceof Uint32Array) {
      this.__data = x
    } else if (x instanceof ArrayBuffer) {
      console.warn(`deprecated, please use new Vec4(new Float32Array(buffer, byteOffset, 4))`)
      const buffer = x
      const byteOffset = y
      this.__data = new Float32Array(buffer, byteOffset, 4)
    } else if (x != null && typeof x == 'object') {
      this.__data = new Float32Array(4)
      this.fromJSON(x)
    } else {
      this.__data = new Float32Array(4)
      this.__data[0] = x
      this.__data[1] = y
      this.__data[2] = z
      this.__data[3] = t
    }
  }

  /**
   * Getter for `x` value.
   *
   * @return {number} - Returns the x value.
   */
  get x() {
    return this.__data[0]
  }

  /**
   * Setter for `x` value.
   *
   * @param {number} val - The val param.
   */
  set x(val) {
    this.__data[0] = val
  }

  /**
   * Getter for `y` value.
   *
   * @return {number} - Returns the y value.
   */
  get y() {
    return this.__data[1]
  }

  /**
   * Setter for `y` value.
   *
   * @param {number} val - The val param.
   */
  set y(val) {
    this.__data[1] = val
  }

  /**
   * Getter for `z` value.
   *
   * @param {number} val - The val param.
   */
  get z() {
    return this.__data[2]
  }

  /**
   * Setter for `z` value.
   *
   * @param {number} val - The val param.
   */
  set z(val) {
    this.__data[2] = val
  }

  /**
   * Getter for `t` value.
   *
   * @param {number} val - The val param.
   */
  get t() {
    return this.__data[3]
  }

  /**
   * Setter for `t` value.
   *
   * @param {number} val - The val param.
   */
  set t(val) {
    this.__data[3] = val
  }

  /**
   * Getter for `w` value.
   *
   * @param {number} val - The val param.
   */
  get w() {
    return this.__data[3]
  }

  /**
   * Setter for `w` value.
   *
   * @param {number} val - The val param.
   */
  set w(val) {
    this.__data[3] = val
  }

  /**
   * Getter for `xy` swizzel.
   *
   * @return {number} - Returns the z value.
   */
  get xyz() {
    return new Vec3(this.__data[0], this.__data[1], this.__data[2])
  }

  /**
   * Setter from scalar components.
   *
   * @param {number} x - The x value.
   * @param {number} y  - The y value.
   * @param {number} z  - The y value.
   * @param {number} t  - The t value.
   */
  set(x, y, z, t) {
    this.x = x
    this.y = y
    this.z = z
    this.t = t
  }

  /**
   * Sets the state of a Vec4 Object from another Vec4.
   *
   * @param {Vec4} other - The other Vec4 to set from.
   */
  setFromOther(other) {
    this.x = other.x
    this.y = other.y
    this.z = other.z
    this.t = other.t
  }

  /**
   * Checks if this Vec4 is exactly the same as another Vec4.
   *
   * @deprecated
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {boolean} - Returns true or false.
   */
  equal(other) {
    console.warn('Deprecated. Use #isEqual instead.')
    return this.isEqual(other)
  }

  /**
   * Checks if this Vec4 is exactly the same as another Vec4.
   *
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {boolean} - Returns true or false.
   */
  isEqual(other) {
    return this.x == other.x && this.y == other.y && this.z == other.z && this.t == other.t
  }

  /**
   * Checks if this Vec4 is different from another Vec4.
   *
   * @deprecated
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {boolean} - Returns true or false.
   */
  notEquals(other) {
    console.warn('Deprecated. Use #notEqual instead.')
    return this.notEqual(other)
  }

  /**
   * Checks if this Vec4 is different from another Vec4.
   *
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {boolean} - Returns true or false.
   */
  notEqual(other) {
    return this.x != other.x && this.y != other.y && this.z != other.z && this.t != other.t
  }

  /**
   * Returns true if this Vec4 is approximately the same as other.
   *
   * @param {Vec4} other - The other Vec4 to compare with.
   * @param {number} precision - The precision to which the values must match.
   * @return {boolean} - The return value.
   */
  approxEqual(other, precision = Number.EPSILON) {
    return (
      Math.abs(this.x - other.x) < precision &&
      Math.abs(this.y - other.y) < precision &&
      Math.abs(this.z - other.z) < precision &&
      Math.abs(this.t - other.t) < precision
    )
  }

  /**
   * Adds other to this Vec4 and returns the result as a new Vec4.
   *
   * @param {Vec4} other - The other Vec4 to add.
   * @return {Vec4} - Returns a new Vec4.
   */
  add(other) {
    return new Vec4(this.x + other.x, this.y + other.y, this.z + other.z, this.t + other.t)
  }

  /**
   * Adds other to this Vec4 mutating the values of this instance
   *
   * @param {Vec4} other - The other Vec4 to add.
   */
  addInPlace(other) {
    this.x += other.x
    this.y += other.y
    this.z += other.z
    this.t += other.t
  }

  /**
   * Subtracts other from this Vec4 and returns then result as a new Vec4.
   *
   * @param {Vec4} other - The other Vec4 to subtract.
   * @return {Vec4} - Returns a new Vec4.
   */
  subtract(other) {
    return new Vec4(this.x - other.x, this.y - other.y, this.z - other.z, this.t - other.t)
  }

  /**
   * Subtracts other from this Vec4 mutating the values of this instance
   *
   * @param {Vec4} other - The other Vec4 to subtract.
   */
  subtractInPlace(other) {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z
    this.t -= other.t
  }

  /**
   * Multiplies two Vec4s and returns the result as a new Vec4.
   *
   * @param {Vec4} other - The other Vec4 to multiply with.
   * @return {Vec4} - Returns a new Vec4.
   */
  multiply(other) {
    return new Vec4(this.x * other.x, this.y * other.y, this.z * other.z, this.t * other.t)
  }

  /**
   * Multiplies two Vec4s mutating the values of this instance
   *
   * @param {Vec4} other - The other Vec4 to multiply with.
   */
  multiplyInPlace(other) {
    this.x *= other.x
    this.y *= other.y
    this.z *= other.z
    this.t *= other.t
  }

  /**
   * Divides two Vec4s and returns the result as a new Vec4.
   *
   * @param {Vec4} other - The other Vec4 to divide by.
   * @return {Vec4} - Returns a new Vec4.
   */
  divide(other) {
    return new Vec4(this.x / other.x, this.y / other.y, this.z / other.z, this.t / other.t)
  }

  /**
   * Divides two Vec4s.
   *
   * @param {Vec4} other - The other Vec4 to divide by.
   */
  divideInPlace(other) {
    this.x /= other.x
    this.y /= other.y
    this.z /= other.z
    this.t /= other.t
  }

  /**
   * Scales this Vec4 by scalar and returns the result as a new Vec4.
   *
   * @param {number} scalar - The scalar value.
   * @return {Vec4} - The return value.
   */
  scale(scalar) {
    return new Vec4(this.x * scalar, this.y * scalar, this.z * scalar, this.t * scalar)
  }

  /**
   * Scales this Vec4 by scalar.
   *
   * @param {number} scalar - The scalar value.
   */
  scaleInPlace(scalar) {
    this.set(this.x * scalar, this.y * scalar, this.z * scalar, this.t * scalar)
  }

  /**
   * Calculates the length of this Vec4.
   *
   * @return {number} - Returns the length.
   */
  length() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const t = this.__data[2]
    return Math.sqrt(x * x + y * y + z * z + t * t)
  }

  /**
   * Calculates the squared length of this Vec4.
   *
   * @return {number} - Returns the length.
   */
  lengthSquared() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const t = this.__data[3]
    return x * x + y * y + z * z + t * t
  }

  /**
   * Normalizes the Vec4 and returns it as a new Vec4.
   * Multiplies coordenates value by the inverse of the vector length.
   *
   * @return {Vec4} - Returns the Vec4 normalized.
   */
  normalize() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const t = this.__data[3]
    let len = x * x + y * y + z * z + t * t
    if (len < Number.EPSILON) {
      return new Vec4()
    }

    // TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len)
    return new Vec4(x * len, y * len, z * len)
  }

  /**
   * Normalizes this Vec4 multiplying coordenate values by the inverse of the vector length.
   */
  normalizeInPlace() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    const t = this.__data[3]
    let len = x * x + y * y + z * z + t * t
    if (len < Number.EPSILON) {
      return
    }
    len = 1 / Math.sqrt(len)
    this.set(x * len, y * len, z * len, t * len)
  }

  /**
   * Calculates the dot product of this Vec4 against another Vec4.
   *
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {number} - Returns the dot product.
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z + this.t * b.t
  }

  /**
   * Calculates the cross product of two Vec4s and returns the result as a new Vec4.
   *
   * @param {Vec4} other - The other Vec4 to calculate with.
   * @return {Vec4} - Returns the cross product as a new Vec4.
   */
  cross(other) {
    const ax = this.x
    const ay = this.y
    const az = this.z
    const at = this.t
    const bx = other.x
    const by = other.y
    const bz = other.z
    const bt = other.t

    return new Vec4(ay * bz - az * by, az * bt - at * bz, at * bx - ax * bt, ax * by - ay * bx)
  }

  /**
   * Gets the angle between this Vec4 and b.
   *
   * @param {Vec4} other - The other Vec4 to compare with.
   * @return {number} - Returns the angle in radians.
   */
  angleTo(other) {
    const tempA = this.normalize()
    const tempB = other.normalize()
    const cosine = tempA.dot(tempB)

    if (cosine > 1.0) {
      return 0
    } else {
      return Math.acos(cosine)
    }
  }

  /**
   * Performs a linear interpolation between this Vec4 and other.
   *
   * @param {Vec4} other - The other Vec4 to interpolate between.
   * @param {number} t - Interpolation amount between the two inputs.
   * @return {Vec4} - Returns a new Vec4.
   */
  lerp(other, t) {
    const ax = this.x
    const ay = this.y
    const az = this.z
    at = this.t
    return new Vec4(ax + t * (other.x - ax), ay + t * (other.y - ay), az + t * (other.z - az), at + t * (other.t - at))
  }

  /**
   * Generates a random vector with the given scale.
   *
   * @param {number} scale - Length of the resulting vector. If ommitted, a unit vector will be returned.
   * @return {Vec4} - The return value.
   */
  random(scale = 1.0) {
    const r = glMatrix.RANDOM() * 2.0 * Math.PI
    const z = glMatrix.RANDOM() * 2.0 - 1.0
    const zScale = Math.sqrt(1.0 - z * z) * scale

    out[0] = Math.cos(r) * zScale
    out[1] = Math.sin(r) * zScale
    out[2] = z * scale
    return out
  }

  /**
   * Clones this Vec4 and returns a new Vec4.
   *
   * @return {Vec4} - Returns a new Vec4.
   */
  clone() {
    return new Vec4(this.__data[0], this.__data[1], this.__data[2], this.__data[3])
  }

  /**
   * Converts this Vec4 into a Vec3.
   *
   * @return {Vec3} - Returns the value as a new Vec3.
   */
  toVec3() {
    return new Vec3(this.__data[0], this.__data[1], this.__data[2])
  }

  /**
   * Returns the type as an array. Often used to pass types to the GPU.
   *
   * @return {aray} - Returns as an array.
   */
  asArray() {
    return this.__data
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new Vec3.
   * @param {...object} ...args - The ...args param.
   * @return {Vec3} - Returns a new Vec3.
   * @private
   */
  static create(...args) {
    return new Vec3(...args)
  }

  /**
   * Creates a new Vec4 to wrap existing memory in a buffer.
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {number} offset - The offset value.
   * @return {Vec4} - Returns a new Vec3.
   * @deprecated
   * @private
   */
  static createFromFloat32Buffer(buffer, offset = 0) {
    console.warn('Deprecated, use #createFromBuffer instead')
    return new Vec4(new Float32Array(buffer, offset * 4, 4)) // 4 bytes per 32bit float
  }

  /**
   * Creates an instance of a `Vec4` using an ArrayBuffer.
   *
   * @static
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {number} byteOffset - The offset value.
   * @return {Vec4} - Returns a new Vec4.
   */
  static createFromBuffer(buffer, byteOffset) {
    return new Vec4(new Float32Array(buffer, byteOffset, 4)) // 4 bytes per 32bit float
  }

  /**
   * Returns the number of Float32 elements used by this type. Used to calculate storage requirements for large arrays of this type.
   * @return {number} - The return value.
   * @private
   */
  static numElements() {
    return 4
  }

  // ///////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      t: this.t,
    }
  }

  /**
   * Decodes a JSON object to set the state of this class.
   *
   * @param {object} j - The json object.
   */
  fromJSON(j) {
    this.x = j.x
    this.y = j.y
    this.z = j.z
    this.t = j.t
  }

  /**
   * Loads the state of the value from a binary reader.
   *
   * @param {BinReader} reader - The reader value.
   */
  readBinary(reader) {
    this.x = reader.loadFloat32()
    this.y = reader.loadFloat32()
    this.z = reader.loadFloat32()
    this.t = reader.loadFloat32()
  }
}

Registry.register('Vec4', Vec4)

export { Vec4 }
