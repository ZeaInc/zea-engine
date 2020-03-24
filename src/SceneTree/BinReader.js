import { Vec2, Vec3, Quat, Color, Box2, Box3 } from '../Math/index'

/** Class representing a bin reader. */
class BinReader {
  /**
   * Create a bin reader.
   * @param {any} data - The data value.
   * @param {number} byteOffset - The byteOffset value.
   * @param {boolean} isMobileDevice - Boolean determining if on a mobile device.
   */
  constructor(data, byteOffset = 0, isMobileDevice = true) {
    this.__data = data
    this.__byteOffset = byteOffset
    this.__dataView = new DataView(this.__data)
    this.__isMobileDevice = isMobileDevice
    this.utf8decoder = new TextDecoder()
  }

  /**
   * Getter for isMobileDevice.
   * @return {boolean} - Returns true if on a mobile device.
   */
  get isMobileDevice() {
    return this.__isMobileDevice
  }

  /**
   * Getter for data.
   * @return {any} - The return value.
   */
  get data() {
    return this.__data
  }

  /**
   * Getter for byteLength.
   * @return {number} - The return value.
   */
  get byteLength() {
    return this.__dataView.byteLength
  }

  /**
   * Getter for remainingByteLength.
   * @return {number} - The return value.
   */
  get remainingByteLength() {
    return this.__dataView.byteLength - this.__byteOffset
  }

  /**
   * The pos method.
   * @return {any} - The return value.
   */
  pos() {
    return this.__byteOffset
  }

  /**
   * The seek method.
   * @param {number} byteOffset - The byteOffset value.
   */
  seek(byteOffset) {
    this.__byteOffset = byteOffset
  }

  /**
   * The advance method.
   * @param {number} byteOffset - The byteOffset value.
   */
  advance(byteOffset) {
    this.__byteOffset += byteOffset
  }

  /**
   * The loadUInt8 method.
   * @return {any} - The return value.
   */
  loadUInt8() {
    const result = this.__dataView.getUint8(this.__byteOffset)
    this.__byteOffset += 1
    return result
  }

  /**
   * The loadUInt16 method.
   * @return {any} - The return value.
   */
  loadUInt16() {
    const result = this.__dataView.getUint16(this.__byteOffset, true)
    this.__byteOffset += 2
    return result
  }

  /**
   * The loadUInt32 method.
   * @return {any} - The return value.
   */
  loadUInt32() {
    const result = this.__dataView.getUint32(this.__byteOffset, true)
    this.__byteOffset += 4
    return result
  }

  /**
   * The loadSInt32 method.
   * @return {any} - The return value.
   */
  loadSInt32() {
    const result = this.__dataView.getInt32(this.__byteOffset, true)
    this.__byteOffset += 4
    return result
  }

  /**
   * The loadFloat16 method.
   * @return {any} - The return value.
   */
  loadFloat16() {
    const uint16 = this.loadUInt16()
    return Math.decode16BitFloat(uint16)
  }

  /**
   * The loadFloat16From2xUInt8 method.
   * @return {any} - The return value.
   */
  loadFloat16From2xUInt8() {
    const result = this.__dataView.getFloat16(this.__byteOffset, true)
    // const uint8s = this.loadUInt8Array(2);
    // return Math.decode16BitFloat(uint8s);
    this.__byteOffset += 2
    return result
  }

  /**
   * The loadFloat32 method.
   * @return {any} - The return value.
   */
  loadFloat32() {
    const result = this.__dataView.getFloat32(this.__byteOffset, true)
    this.__byteOffset += 4
    return result
  }

  /**
   * The loadUInt8Array method.
   * @param {number} size - The size value.
   * @param {boolean} clone - The clone value.
   * @return {any} - The return value.
   */
  loadUInt8Array(size = undefined, clone = false) {
    if (size == undefined) size = this.loadUInt32()
    const result = new Uint8Array(this.__data, this.__byteOffset, size)
    this.__byteOffset += size
    const padd = this.__byteOffset % 4
    // this.readPadd();
    return result
  }

  /**
   * The loadUInt16Array method.
   * @param {number} size - The size value.
   * @param {boolean} clone - The clone value.
   * @return {any} - The return value.
   */
  loadUInt16Array(size = undefined, clone = false) {
    if (size == undefined) size = this.loadUInt32()
    if (size == 0) return new Uint16Array()
    this.readPadd(2)
    let result
    if (this.__isMobileDevice) {
      result = new Uint16Array(size)
      for (let i = 0; i < size; i++) {
        result[i] = this.__dataView.getUint16(this.__byteOffset, true)
        this.__byteOffset += 2
      }
    } else {
      result = new Uint16Array(this.__data, this.__byteOffset, size)
      this.__byteOffset += size * 2
    }
    // this.readPadd();
    return result
  }

  /**
   * The loadUInt32Array method.
   * @param {number} size - The size value.
   * @param {boolean} clone - The clone value.
   * @return {any} - The return value.
   */
  loadUInt32Array(size = undefined, clone = false) {
    if (size == undefined) size = this.loadUInt32()
    if (size == 0) return new Uint32Array()
    this.readPadd(4)
    let result
    if (this.__isMobileDevice) {
      result = new Uint32Array(size)
      for (let i = 0; i < size; i++) {
        result[i] = this.__dataView.getUint32(this.__byteOffset, true)
        this.__byteOffset += 4
      }
    } else {
      result = new Uint32Array(this.__data, this.__byteOffset, size)
      this.__byteOffset += size * 4
    }
    return result
  }

  /**
   * The loadFloat32Array method.
   * @param {number} size - The size value.
   * @param {boolean} clone - The clone value.
   * @return {any} - The return value.
   */
  loadFloat32Array(size = undefined, clone = false) {
    if (size == undefined) size = this.loadUInt32()
    if (size == 0) return new Float32Array()
    this.readPadd(4)
    let result
    if (this.__isMobileDevice) {
      result = new Float32Array(size)
      for (let i = 0; i < size; i++) {
        result[i] = this.__dataView.getFloat32(this.__byteOffset, true)
        this.__byteOffset += 4
      }
    } else {
      result = new Float32Array(this.__data, this.__byteOffset, size)
      this.__byteOffset += size * 4
    }
    return result
  }

  /**
   * The loadStr method.
   * @return {string} - The return value.
   */
  loadStr() {
    const numChars = this.loadUInt32()
    const chars = new Uint8Array(this.__data, this.__byteOffset, numChars)
    this.__byteOffset += numChars
    return this.utf8decoder.decode(chars)
  }

  /**
   * The loadStrArray method.
   * @return {any} - The return value.
   */
  loadStrArray() {
    const size = this.loadUInt32()

    const result = []
    for (let i = 0; i < size; i++) {
      result[i] = this.loadStr()
    }
    return result
  }

  /**
   * The loadSInt32Vec2 method.
   * @return {Vec2} - Returns a Vec2.
   */
  loadSInt32Vec2() {
    const x = this.loadSInt32()
    const y = this.loadSInt32()
    return new Vec2(x, y)
  }

  /**
   * The loadUInt32Vec2 method.
   * @return {Vec2} - Returns a Vec2.
   */
  loadUInt32Vec2() {
    const x = this.loadUInt32()
    const y = this.loadUInt32()
    return new Vec2(x, y)
  }

  /**
   * The loadFloat16Vec2 method.
   * @return {Vec2} - Returns a Vec2.
   */
  loadFloat16Vec2() {
    const x = this.loadFloat16()
    const y = this.loadFloat16()
    return new Vec2(x, y)
  }

  /**
   * The loadFloat32Vec2 method.
   * @return {Vec2} - Returns a Vec2.
   */
  loadFloat32Vec2() {
    const x = this.loadFloat32()
    const y = this.loadFloat32()
    return new Vec2(x, y)
  }

  /**
   * The loadFloat16Vec3 method.
   * @return {Vec3} - Returns a Vec3.
   */
  loadFloat16Vec3() {
    const x = this.loadFloat16()
    const y = this.loadFloat16()
    const z = this.loadFloat16()
    return new Vec3(x, y, z)
  }

  /**
   * The loadFloat32Vec3 method.
   * @return {Vec3} - Returns a Vec3.
   */
  loadFloat32Vec3() {
    const x = this.loadFloat32()
    const y = this.loadFloat32()
    const z = this.loadFloat32()
    return new Vec3(x, y, z)
  }

  /**
   * The loadFloat16Quat method.
   * @return {Quat} - Returns a Quat.
   */
  loadFloat16Quat() {
    const x = this.loadFloat16()
    const y = this.loadFloat16()
    const z = this.loadFloat16()
    const w = this.loadFloat16()
    return new Quat(x, y, z, w)
  }

  /**
   * The loadFloat32Quat method.
   * @return {Quat} - Returns a Quat.
   */
  loadFloat32Quat() {
    const x = this.loadFloat32()
    const y = this.loadFloat32()
    const z = this.loadFloat32()
    const w = this.loadFloat32()
    return new Quat(x, y, z, w)
  }

  /**
   * The loadRGBFloat32Color method.
   * @return {Color} - Returns a Color.
   */
  loadRGBFloat32Color() {
    const r = this.loadFloat32()
    const g = this.loadFloat32()
    const b = this.loadFloat32()
    return new Color(r, g, b)
  }

  /**
   * The loadRGBAFloat32Color method.
   * @return {Color} - Returns a Color.
   */
  loadRGBAFloat32Color() {
    const r = this.loadFloat32()
    const g = this.loadFloat32()
    const b = this.loadFloat32()
    const a = this.loadFloat32()
    return new Color(r, g, b, a)
  }

  /**
   * The loadRGBUInt8Color method.
   * @return {Color} - Returns a Color.
   */
  loadRGBUInt8Color() {
    const r = this.loadUInt8()
    const g = this.loadUInt8()
    const b = this.loadUInt8()
    return new Color(r / 255, g / 255, b / 255)
  }

  /**
   * The loadRGBAUInt8Color method.
   * @return {Color} - Returns a Color.
   */
  loadRGBAUInt8Color() {
    const r = this.loadUInt8()
    const g = this.loadUInt8()
    const b = this.loadUInt8()
    const a = this.loadUInt8()
    return new Color(r / 255, g / 255, b / 255, a / 255)
  }

  /**
   * The loadBox2 method.
   * @return {Box2} - Returns a Box2.
   */
  loadBox2() {
    return new Box2(this.loadFloat32Vec2(), this.loadFloat32Vec2())
  }

  /**
   * The loadBox3 method.
   * @return {Box3} - Returns a Box3.
   */
  loadBox3() {
    return new Box3(this.loadFloat32Vec3(), this.loadFloat32Vec3())
  }

  /**
   * The readPadd method.
   * @param {any} stride - The stride value.
   */
  readPadd(stride) {
    const padd = this.__byteOffset % stride
    if (padd != 0) this.__byteOffset += stride - padd
  }
}

export { BinReader }
