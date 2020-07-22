import { AttrValue } from './AttrValue.js'
import { typeRegistry } from './TypeRegistry.js'
import { Vec2 } from './Vec2.js'

/**
 * Represents a three dimensional coordinate, such as 3D scene values, or mesh vertex positions.
 *
 * Math types internally store values in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array|Float32Array} and
 * expose getters and setters for the component values.
 *
 * @extends AttrValue
 */
class Vec3 extends AttrValue {
  /**
   * Creates a Vec3.
   *
   * The type of values of the `(x, y, z)` coordenates can be {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array|Float32Array},
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array|Uint32Array},
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array|Int32Array} and
   * {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/ArrayBuffer|ArrayBuffer}.
   * <br>
   * You can also pass one JSON object parameter.
   *
   * @param {Number|Float32Array|json} x - The x value. Default is 0.
   * @param {number} y - The y value. Default is 0.
   * @param {number} z - The z value. Default is 0.
   */
  constructor(x = 0, y = 0, z = 0) {
    super()
    if (x instanceof Float32Array || x instanceof Uint32Array) {
      this.__data = x
    } else if (x instanceof ArrayBuffer) {
      const buffer = x
      const byteOffset = y
      this.__data = new Float32Array(buffer, byteOffset, 3)
    } else if (x != null && typeof x == 'object') {
      this.__data = new Float32Array(3)
      this.fromJSON(x)
    } else {
      this.__data = new Float32Array(3)
      this.__data[0] = x
      this.__data[1] = y
      this.__data[2] = z
    }
  }

  /**
   * Getter for `x` component.
   *
   * @return {number} - Returns the x component.
   */
  get x() {
    return this.__data[0]
  }

  /**
   * Setter for `x` component.
   *
   * @param {number} val - The val param.
   */
  set x(val) {
    this.__data[0] = val
  }

  /**
   * Getter for `y` component.
   *
   * @return {number} - Returns the y component.
   */
  get y() {
    return this.__data[1]
  }

  /**
   * Setter for `y` component.
   *
   * @param {number} val - The val param.
   */
  set y(val) {
    this.__data[1] = val
  }

  /**
   * Getter for `z` component.
   *
   * @return {number} - Returns the z component.
   */
  get z() {
    return this.__data[2]
  }

  /**
   * Setter for `z` component.
   *
   * @param {number} val - The val param.
   */
  set z(val) {
    this.__data[2] = val
  }

  /**
   * Getter for `xy` swizzel.
   *
   * @return {Vec2} - Returns the z component.
   */
  get xy() {
    return new Vec2(this.__data[0], this.__data[1])
  }

  /**
   * Getter for `yz` swizzel.
   *
   * @return {Vec2} - Returns the z component.
   */
  get yz() {
    return new Vec2(this.__data[1], this.__data[2])
  }

  /**
   * Setter from scalar components.
   *
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The y component.
   */
  set(x, y, z) {
    this.x = x
    this.y = y !== undefined ? y : x
    this.z = z !== undefined ? z : x
  }

  /**
   * Sets the state of a Vec3 Object.
   *
   * @param {Float32Array} float32Array - The float32Array value.
   */
  setDataArray(float32Array) {
    this.__data = float32Array
  }

  /**
   * Sets the state of a Vec3 Object from another Vec3.
   *
   * @param {Vec3} other - The other Vec3 to set from.
   */
  setFromOther(other) {
    this.x = other.x
    this.y = other.y
    this.z = other.z
  }

  /**
   * Checks if the coordenates of this Vec3 are 0 0 0.
   *
   * @return {boolean} - Returns `true` if the coordenates are(0, 0, 0), otherwise, `false`.
   */
  isNull() {
    return Math.abs(this.x) < Number.EPSILON && Math.abs(this.y) < Number.EPSILON && Math.abs(this.z) < Number.EPSILON
  }

  /**
   * Checks if the coordenates of this Vec3 are 1 1 1.
   *
   * @return {boolean} - Returns `true` if the coordenates are(1, 1, 1), otherwise, `false`.
   */
  is111() {
    return (
      Math.abs(1.0 - this.x) < Number.EPSILON &&
      Math.abs(1.0 - this.y) < Number.EPSILON &&
      Math.abs(1.0 - this.z) < Number.EPSILON
    )
  }

  /**
   * @deprecated
   * Checks if this Vec3 is exactly the same as another Vec3.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {boolean} - Returns `true` if are the same Vector, otherwise, `false`.
   */
  equal(other) {
    console.warn('Deprecated. Use #isEqual instead.')
    return this.equals(other)
  }

  /**
   * Checks if this Vec3 is exactly the same as another Vec3.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {boolean} - Returns `true` if are the same Vector, otherwise, `false`.
   */
  isEqual(other) {
    return this.x == other.x && this.y == other.y && this.z == other.z
  }

  /**
   * @deprecated
   * Checks if this Vec2 is different from another Vec2.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {boolean} - Returns `true` if the Vec3s are different, otherwise, `false`.
   */
  notEquals(other) {
    console.warn('Deprecated. Use #notEqual instead.')
    return this.notEqual(other)
  }

  /**
   * Checks if this Vec2 is different from another Vec2.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {boolean} - Returns `true` if the Vec3s are different, otherwise, `false`.
   */
  notEqual(other) {
    return this.x != other.x && this.y != other.y && this.z != other.z
  }

  /**
   * Returns true if this Vec2 is approximately the same as other.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @param {number} precision - The precision to which the values must match.
   * @return {boolean} - Returns true or false.
   */
  approxEqual(other, precision = Number.EPSILON) {
    return (
      Math.abs(this.x - other.x) < precision &&
      Math.abs(this.y - other.y) < precision &&
      Math.abs(this.z - other.z) < precision
    )
  }

  /**
   * Adds other to this Vec3 and return the result as a new Vec3.
   *
   * @param {Vec3} other - The other Vec3 to add.
   * @return {Vec3} - Returns a new Vec3.
   */
  add(other) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z)
  }

  /**
   * Adds other to this Vec3.
   *
   * @param {Vec3} other - The other Vec3 to add.
   */
  addInPlace(other) {
    this.x += other.x
    this.y += other.y
    this.z += other.z
  }

  /**
   * Subtracts other from this Vec3 and returns the result as a new Vec3.
   *
   * @param {Vec3} other - The other Vec3 to subtract.
   * @return {Vec3} - Returns a new Vec3.
   */
  subtract(other) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z)
  }

  /**
   * Subtracts other from this Vec3.
   *
   * @param {Vec3} other - The other Vec3 to subtract.
   */
  subtractInPlace(other) {
    this.x -= other.x
    this.y -= other.y
    this.z -= other.z
  }

  /**
   * Multiplies two Vec3s and returns the result as a new Vec3.
   *
   * @param {Vec3} other - The other Vec3 to multiply with.
   * @return {Vec3} - Returns a new Vec3.
   */
  multiply(other) {
    return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z)
  }

  /**
   * Multiplies two Vec3s.
   *
   * @param {Vec3} other - The other Vec3 to multiply with.
   */
  multiplyInPlace(other) {
    this.x *= other.x
    this.y *= other.y
    this.z *= other.z
  }

  /**
   * Divides two Vec3s and returns the result as a new Vec3.
   *
   * @param {Vec3} vec3 - The other Vec3 to divide by.
   * @return {Vec3} - Returns a new Vec3.
   */
  divide(vec3) {
    return new Vec3(this.x / vec3.x, this.y / vec3.y, this.z / vec3.z)
  }

  /**
   * Divides two Vec3s.
   *
   * @param {Vec3} vec3 - The other Vec3 to divide by.
   */
  divideInPlace(vec3) {
    this.x /= vec3.x
    this.y /= vec3.y
    this.z /= vec3.z
  }

  /**
   * Scales this Vec3 by scalar and returns the result as a new Vec3.
   *
   * @param {number} scalar - The scalar value.
   * @return {Vec3} - Returns a new Vec3.
   */
  scale(scalar) {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar)
  }

  /**
   * Scales this Vec3 by scalar.
   *
   * @param {number} scalar - The scalar value.
   */
  scaleInPlace(scalar) {
    this.x *= scalar
    this.y *= scalar
    this.z *= scalar
  }

  /**
   * Negates this Vec3 (x = -x, y = -y and z = -z), but returns the result as a new Vec3.
   *
   * @return {Vec3} - Returns a new Vec3.
   */
  negate() {
    return new Vec3(-this.x, -this.y, -this.z)
  }

  /**
   * Returns the inverse of this Vec3, but returns. the result as a new Vec3
   *
   * @return {Vec3} - Returns a new Vec3.
   */
  inverse() {
    return new Vec3(1.0 / this.x, 1.0 / this.y, 1.0 / this.z)
  }

  /**
   * Calculates the squared length of this Vec3.
   *
   * @return {number} - Returns the length.
   */
  lengthSquared() {
    const x = this.__data[0]
    const y = this.__data[1]
    const z = this.__data[2]
    return x * x + y * y + z * z
  }

  /**
   * Calculates the length of this Vec3.
   *
   * @return {number} - Returns the length.
   */
  length() {
    return Math.sqrt(this.lengthSquared())
  }

  /**
   * Calculates the distance to another Vec3.
   *
   * @param {Vec3} other - The other Vec3 to calculate the distance to.
   * @return {number} - Returns the distance between vectors.
   */
  distanceTo(other) {
    const x = this.__data[0] - other.x
    const y = this.__data[1] - other.y
    const z = this.__data[2] - other.z
    return Math.sqrt(x * x + y * y + z * z)
  }

  /**
   * Normalizes the Vec3 and returns it as a new Vec3.
   * Multiplies coordenates value by the inverse of the vector length.
   *
   * @return {Vec3} - Returns the Vec3 normalized.
   */
  normalize() {
    let len = this.__data[0] * this.__data[0] + this.__data[1] * this.__data[1] + this.__data[2] * this.__data[2]
    if (len < Number.EPSILON) {
      return new Vec3()
    }

    // TODO: evaluate use of glm_invsqrt here?
    len = 1.0 / Math.sqrt(len)
    return new Vec3(this.__data[0] * len, this.__data[1] * len, this.__data[2] * len)
  }

  /**
   * Normalizes this Vec3 multiplying coordenate values by the inverse of the vector length.
   *
   * @return {number} - The return value.
   */
  normalizeInPlace() {
    let len = this.__data[0] * this.__data[0] + this.__data[1] * this.__data[1] + this.__data[2] * this.__data[2]
    if (len < Number.EPSILON) {
      return
    }
    len = Math.sqrt(len)
    const tmp = 1.0 / len
    this.__data[0] *= tmp
    this.__data[1] *= tmp
    this.__data[2] *= tmp

    return len
  }

  /**
   * Creates and returns a new Vec3 with the new coordenates(calculated with this Vec3 coordenates and the specified length).
   *
   * @param {number} length - The length value.
   * @return {Vec3} - The return value.
   */
  resize(length) {
    const currlen = this.__data[0] * this.__data[0] + this.__data[1] * this.__data[1] + this.__data[2] * this.__data[2]
    if (currlen < Number.EPSILON) {
      return
    }
    const scl = length / Math.sqrt(currlen)
    return new Vec3(this.__data[0] * scl, this.__data[1] * scl, this.__data[2] * scl)
  }

  /**
   * Modifies current coordenates using the specified length.
   *
   * @param {number} length - The length value.
   */
  resizeInPlace(length) {
    const currlen = this.__data[0] * this.__data[0] + this.__data[1] * this.__data[1] + this.__data[2] * this.__data[2]
    if (currlen < Number.EPSILON) {
      return
    }
    const scl = length / Math.sqrt(currlen)
    this.__data[0] *= scl
    this.__data[1] *= scl
    this.__data[2] *= scl
  }

  /**
   * Calculates the dot product of this Vec3 against another Vec3.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {number} - Returns the dot product.
   */
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z
  }

  /**
   * Calculates the cross product of two Vec3s and returns the result as a new Vec3.
   *
   * @param {Vec3} other - The other Vec3 to calculate with.
   * @return {Vec3} - Returns the cross product as a new Vec3.
   */
  cross(other) {
    const ax = this.x
    const ay = this.y
    const az = this.z
    const bx = other.x
    const by = other.y
    const bz = other.z

    return new Vec3(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx)
  }

  /**
   * Gets the angle between this Vec3 and b.
   *
   * @param {Vec3} other - The other Vec3 to compare with.
   * @return {number} - Returns the angle in radians.
   */
  angleTo(other) {
    const cosine = this.dot(other)
    if (cosine > 1.0) {
      return 0
    } else {
      return Math.acos(cosine)
    }
  }

  /**
   * Performs a linear interpolation between this Vec3 and other.
   *
   * @param {Vec3} other - The other Vec3 to interpolate between.
   * @param {number} t - Interpolation amount between the two inputs.
   * @return {Vec3} - Returns a new Vec3.
   */
  lerp(other, t) {
    const ax = this.x
    const ay = this.y
    const az = this.z
    return new Vec3(ax + t * (other.x - ax), ay + t * (other.y - ay), az + t * (other.z - az))
  }

  /**
   * Returns a new Vec3 whose component values are the abs of this Vec3s component values.
   *
   * @return {Vec3} - Returns a new Vec3.
   */
  abs() {
    return new Vec3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z))
  }

  /**
   * Sets the vector a random vector on the surface of a sphere with the radius of the givenn scale value.
   *
   * @param {number} scale - The radius of the surface sphere.
   * @return {Vec3} - The random Vec3.
   */
  setRandomDir(scale = 1.0) {
    const r = Math.random() * 2.0 * Math.PI
    const z = Math.random() * 2.0 - 1.0
    const zScale = Math.sqrt(1.0 - z * z) * scale

    this.__data[0] = Math.cos(r) * zScale
    this.__data[1] = Math.sin(r) * zScale
    this.__data[2] = z * scale
    return this
  }

  /**
   * Generates a randome vector anywhere in the sphere defined by the provided scale value.
   *
   * @param {number} scale - The radius of the bounding sphere.
   * @return {Vec3} - The random Vec3.
   */
  setRandom(scale = 1.0) {
    this.__data[0] = (Math.random() - 0.5) * scale
    this.__data[1] = (Math.random() - 0.5) * scale
    this.__data[2] = (Math.random() - 0.5) * scale
    return this
  }

  /**
   * Clones this Vec3 and returns a new Vec3.
   *
   * @return {Vec3} - Returns a new Vec3.
   */
  clone() {
    return new Vec3(this.__data[0], this.__data[1], this.__data[2])
  }

  /**
   * Returns the type as an array. Often used to pass types to the GPU.
   *
   * @return {array} - Returns as an array.
   */
  asArray() {
    return this.__data
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Creates a new Vec3.
   *
   * @param {...object} ...args - The ...args param.
   * @return {Vec3} - Returns a new Vec3.
   * @private
   */
  static create(...args) {
    return new Vec3(...args)
  }

  /**
   * The createFromJSON method.
   * @param {object} json - The json param.
   * @return {Vec3} - The return value.
   * @private
   */
  static createFromJSON(json) {
    const result = new Vec3()
    result.fromJSON(json)
    return result
  }

  /**
   * The createFromFloat32Buffer method.
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {number} offset - The offset value.
   * @return {Vec3} - Returns a new Vec3.
   * @private
   */
  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Vec3(buffer, offset * 4) // 4 bytes per 32bit float
  }

  /**
   * The createFromFloat32Array method.
   * @param {Float32Array} array - A Float32Array value
   * @return {Vec3} - Returns a new Vec3.
   * @private
   */
  static createFromFloat32Array(array) {
    return new Vec3(array)
  }

  /**
   * Returns the number of Float32 elements used by this type. Used to calculate storage requirements for large arrays of this type.
   * @return {number} - The return value.
   * @private
   */
  static numElements() {
    return 3
  }

  // ///////////////////////////
  // Persistence

  /**
   * Encodes Vec3 Class as a JSON object for persistence.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
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
  }
}

typeRegistry.registerType('Vec3', Vec3)

export { Vec3 }
