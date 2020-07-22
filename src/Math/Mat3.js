/* eslint-disable new-cap */
import { AttrValue } from './AttrValue.js'
import { Vec3 } from './Vec3.js'
import { typeRegistry } from './TypeRegistry.js'

/**
 * A class representing a 3x3 matrix.
 * This matrix class is based on GLM, and is column major.
 *
 * @extends AttrValue
 */
class Mat3 extends AttrValue {
  /**
   * Initializes the Mat3 class with given data.
   *
   * @param {number | ArrayBuffer} m00 - Row 0, column 0.
   * @param {number} m01 - Row 0, column 1.
   * @param {number} m02 - Row 0, column 2.
   * @param {number} m10 - Row 1, column 0.
   * @param {number} m11 - Row 1, column 1.
   * @param {number} m12 - Row 1, column 2.
   * @param {number} m20 - Row 2, column 0.
   * @param {number} m21 - Row 2, column 1.
   * @param {number} m22 - Row 2, column 2.
   */
  constructor(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1
  ) {
    super()

    if (m00 instanceof ArrayBuffer) {
      const buffer = m00
      const byteOffset = m01
      this.__data = new Float32Array(buffer, byteOffset, 9)
    } else {
      this.__data = new Float32Array(9)
      this.set(m00, m01, m02, m10, m11, m12, m20, m21, m22)
    }
  }

  // /////////////////////////////////////////
  // properties

  /**
   * Getter for row 0, column 0.
   * @return {number} - Returns the m00 value.
   */
  get m00() {
    return this.__data[0]
  }

  /**
   * Setter for row 0, column 0.
   *
   * @param {number} val - The val param.
   */
  set m00(val) {
    this.__data[0] = val
  }

  /**
   * Getter for row 0, column 1.
   *
   * @return {number} - Returns the m01 value.
   */
  get m01() {
    return this.__data[1]
  }

  /**
   * Setter for row 0, column 1.
   *
   * @param {number} val - The val param.
   */
  set m01(val) {
    this.__data[1] = val
  }

  /**
   * Getter for row 0, column 2.
   *
   * @return {number} - Returns the m02 value.
   */
  get m02() {
    return this.__data[2]
  }

  /**
   * Setter for row 0, column 2.
   *
   * @param {number} val - The val param.
   */
  set m02(val) {
    this.__data[2] = val
  }

  /**
   * Getter for row 1, column 0.
   *
   * @return {number} - Returns the m10 value.
   */
  get m10() {
    return this.__data[3]
  }

  /**
   * Setter for row 1, column 0.
   *
   * @param {number} val - The val param.
   */
  set m10(val) {
    this.__data[3] = val
  }

  /**
   * Getter for row 1, column 1
   *
   * @return {number} - Returns the m11 value.
   */
  get m11() {
    return this.__data[4]
  }

  /**
   * Setter for row 1, column 1.
   *
   * @param {number} val - The val param.
   */
  set m11(val) {
    this.__data[4] = val
  }

  /**
   * Getter for row 1, column 2.
   *
   * @return {number} - Returns the m12 value.
   */
  get m12() {
    return this.__data[5]
  }

  /**
   * Setter for row 1, column 2.
   *
   * @param {number} val - The val param.
   */
  set m12(val) {
    this.__data[5] = val
  }

  /**
   * Getter for row 2, column 0.
   *
   * @return {number} - Returns the m20 value.
   */
  get m20() {
    return this.__data[6]
  }

  /**
   * Setter for row 2, column 0.
   *
   * @param {number} val - The val param.
   */
  set m20(val) {
    this.__data[6] = val
  }

  /**
   * Getter for row 2, column 1.
   *
   * @return {number} - Returns the m21 value.
   */
  get m21() {
    return this.__data[7]
  }

  /**
   * Setter for row 2, column 1.
   *
   * @param {number} val - The val param.
   */
  set m21(val) {
    this.__data[7] = val
  }

  /**
   * Getter for row 2, column 2.
   *
   * @return {number} - Returns the m22 value.
   */
  get m22() {
    return this.__data[8]
  }

  /**
   * Setter for row 2, column 2.
   *
   * @param {number} val - The val param.
   */
  set m22(val) {
    this.__data[8] = val
  }

  /**
   * Getter for the `x` axis.
   *
   * @return {Vec3} - Returns the `x` axis as a Vec3.
   */
  get xAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 0)
  }

  /**
   * Setter for the `x` axis.
   *
   * @param {Vec3} vec3 - The vec3 value.
   */
  set xAxis(vec3) {
    this.xAxis.set(vec3.x, vec3.y, vec3.z)
  }

  /**
   * Getter for the `y` axis.
   * * @return {Vec3} - Returns the `y` axis as a Vec3.
   */
  get yAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 3)
  }

  /**
   * Setter for the `y` axis.
   * @param {Vec3} vec3 - The vec3 value.
   */
  set yAxis(vec3) {
    this.yAxis.set(vec3.x, vec3.y, vec3.z)
  }

  /**
   * Getter for the `z` axis.
   * * @return {Vec3} - Returns the `z` axis as a Vec3.
   */
  get zAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 6)
  }

  /**
   * Setter for the `z` axis.
   * @param {Vec3} vec3 - The vec3 value.
   */
  set zAxis(vec3) {
    this.zAxis.set(vec3.x, vec3.y, vec3.z)
  }

  // /////////////////////////////////////////
  // Setters

  /**
   * Sets the state of the Mat3 class
   *
   * @param {number} m00 - Row 0, column 0.
   * @param {number} m01 - Row 0, column 1.
   * @param {number} m02 - Row 0, column 2.
   * @param {number} m10 - Row 1, column 0.
   * @param {number} m11 - Row 1, column 1.
   * @param {number} m12 - Row 1, column 2.
   * @param {number} m20 - Row 2, column 0.
   * @param {number} m21 - Row 2, column 1.
   * @param {number} m22 - Row 2, column 2.
   */
  set(
    m00 = 1,
    m01 = 0,
    m02 = 0,
    m10 = 0,
    m11 = 1,
    m12 = 0,
    m20 = 0,
    m21 = 0,
    m22 = 1
  ) {
    this.__data[0] = m00
    this.__data[1] = m01
    this.__data[2] = m02
    this.__data[3] = m10
    this.__data[4] = m11
    this.__data[5] = m12
    this.__data[6] = m20
    this.__data[7] = m21
    this.__data[8] = m22
  }

  /**
   * Sets state of the Mat3 with the identity  Matrix
   */
  setIdentity() {
    this.set()
  }

  /**
   * Sets state of the Mat3 from another Mat3
   * <br>
   * Note: works with either Mat3 or Mat4.
   *
   * @param {Mat3} mat - The mat value.
   */
  setFromMat(mat) {
    this.__data[0] = mat.m00
    this.__data[1] = mat.m01
    this.__data[2] = mat.m02
    this.__data[3] = mat.m10
    this.__data[4] = mat.m11
    this.__data[5] = mat.m12
    this.__data[6] = mat.m20
    this.__data[7] = mat.m21
    this.__data[8] = mat.m22
  }

  /**
   * Scales and calculates the cross product of the `Vec3` and sets the result in the Mat3
   *
   * @param {Vec3} dir - The dir value.
   * @param {Vec3} up - The up value.
   */
  setFromDirectionAndUpvector(dir, up) {
    const zAxis = dir
    const zLen = zAxis.length()
    if (zLen < Number.EPSILON) {
      this.setIdentity()
      return
    }
    zAxis.scaleInPlace(1 / zLen)

    const xAxis = up.cross(zAxis)
    const xLen = xAxis.length()
    if (xLen > Number.EPSILON) xAxis.scaleInPlace(1 / xLen)

    const yAxis = zAxis.cross(xAxis)
    const yLen = yAxis.length()
    if (yLen > Number.EPSILON) yAxis.scaleInPlace(1 / yLen)

    this.set(
      xAxis.x,
      xAxis.y,
      xAxis.z,
      yAxis.x,
      yAxis.y,
      yAxis.z,
      zAxis.x,
      zAxis.y,
      zAxis.z
    )
  }

  /**
   * Inverts a Mat3 and returns the result as a new instance.
   *
   * @return {Mat3} - Returns a new Mat3.
   */
  inverse() {
    const a00 = this.__data[0]
    const a01 = this.__data[1]
    const a02 = this.__data[2]
    const a10 = this.__data[3]
    const a11 = this.__data[4]
    const a12 = this.__data[5]
    const a20 = this.__data[6]
    const a21 = this.__data[7]
    const a22 = this.__data[8]
    const b01 = a22 * a11 - a12 * a21
    const b11 = -a22 * a10 + a12 * a20
    const b21 = a21 * a10 - a11 * a20
    // Calculate the determinant
    const det = a00 * b01 + a01 * b11 + a02 * b21

    if (!det) {
      console.warn('Unable to invert Mat3')
      return null
    }
    det = 1.0 / det

    return new Mat3(
      b01 * det,
      (-a22 * a01 + a02 * a21) * det,
      (a12 * a01 - a02 * a11) * det,
      b11 * det,
      (a22 * a00 - a02 * a20) * det,
      (-a12 * a00 + a02 * a10) * det,
      b21 * det,
      (-a21 * a00 + a01 * a20) * det,
      (a11 * a00 - a01 * a10) * det
    )
  }

  /**
   * Inverts a Mat3.
   *
   * @return {boolean} - The return value.
   */
  invertInPlace() {
    const a00 = this.__data[0]
    const a01 = this.__data[1]
    const a02 = this.__data[2]
    const a10 = this.__data[3]
    const a11 = this.__data[4]
    const a12 = this.__data[5]
    const a20 = this.__data[6]
    const a21 = this.__data[7]
    const a22 = this.__data[8]
    const b01 = a22 * a11 - a12 * a21
    const b11 = -a22 * a10 + a12 * a20
    const b21 = a21 * a10 - a11 * a20
    // Calculate the determinant
    const det = a00 * b01 + a01 * b11 + a02 * b21

    if (!det) {
      console.warn('Unable to invert Mat3')
      return false
    }
    det = 1.0 / det

    this.set(
      b01 * det,
      (-a22 * a01 + a02 * a21) * det,
      (a12 * a01 - a02 * a11) * det,
      b11 * det,
      (a22 * a00 - a02 * a20) * det,
      (-a12 * a00 + a02 * a10) * det,
      b21 * det,
      (-a21 * a00 + a01 * a20) * det,
      (a11 * a00 - a01 * a10) * det
    )
    return true
  }

  /**
   * Transposes (exchanges columns with rows) this matrix
   * and returns the result as a new instance.
   *
   * @return {Mat3} - Return a new transposed Mat3.
   */
  transpose() {
    return Mat3(
      this.__data[0],
      this.__data[3],
      this.__data[6],
      this.__data[1],
      this.__data[4],
      this.__data[7],
      this.__data[2],
      this.__data[5],
      this.__data[8]
    )
  }

  /**
   * Transposes (exchanges columns with rows) this matrix.
   */
  transposeInPlace() {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    const a01 = this.__data[1]
    const a02 = this.__data[2]
    const a12 = this.__data[5]

    this.__data[1] = this.__data[3]
    this.__data[2] = this.__data[6]
    this.__data[3] = a01
    this.__data[5] = this.__data[7]
    this.__data[6] = a02
    this.__data[7] = a12
  }

  /**
   * Transforms the Vec3 with a Mat3.
   *
   * @param {Vec3} vec3 - The vec3 value.
   * @return {Vec3} - Return the result as a new Vec3.
   */
  transformVec3(vec3) {
    return new Vec3(
      this.__data[0] * vec3.x +
        this.__data[1] * vec3.y +
        this.__data[2] * vec3.z,
      this.__data[3] * vec3.x +
        this.__data[4] * vec3.y +
        this.__data[5] * vec3.z,
      this.__data[6] * vec3.x +
        this.__data[7] * vec3.y +
        this.__data[8] * vec3.z
    )
  }

  /**
   * Clones this Mat3 returning a new instance.
   *
   * @return {Mat3} - Returns a new Mat3.
   */
  clone() {
    return new Mat3(
      this.__data[0],
      this.__data[1],
      this.__data[2],
      this.__data[3],
      this.__data[4],
      this.__data[5],
      this.__data[6],
      this.__data[7],
      this.__data[8],
      this.__data[9]
    )
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * Create a new Mat3.
   * @param {...object} ...args - The ...args param.
   * @return {Mat3} - Returns a new Mat3.
   * @private
   */
  static create(...args) {
    return new Mat3(...args)
  }

  /**
   * Creates a new Mat3 to wrap existing memory in a buffer.
   *
   * @param {ArrayBuffer} buffer - The buffer value.
   * @param {number} offset - The offset value.
   * @return {Mat3} - Returns a new Mat3.
   * @private
   */
  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Mat3(buffer, offset * 4) // 4 bytes per 32bit float
  }

  // ///////////////////////////
  // Persistence

  /**
   * Loads the state of the value from a binary reader.
   *
   * @param {BinReader} reader - The reader value.
   */
  readBinary(reader) {
    this.__data = reader.loadFloat32Array(9)
  }

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @return {object} - The json object.
   */
  toJSON() {
    return this.__data
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} json - The json param.
   */
  fromJSON(json) {
    this.__data = new Float32Array(json)
  }

  // ///////////////////////////
  // Debugging

  /**
   * Calls `toJSON` method and stringifies it.
   *
   * @return {string} - The return value.
   */
  toString() {
    return this.toJSON().toString()
  }
}

typeRegistry.registerType('Mat3', Mat3)

export { Mat3 }
