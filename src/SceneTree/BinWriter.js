import { Vec2, Vec3, Quat, Color, Box2, Box3 } from '../Math/index'

/** Class representing a bin writer. */
class BinWriter {
  /**
   * Create a bin writer.
   * @param {number} dataSize - The dataSize value.
   */
  constructor(dataSize = 0) {
    this.__data = new ArrayBuffer(dataSize)
    this.__byteOffset = 0
    this.__reserved = dataSize
    this.__dataView = new DataView(this.__data)
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
   * The seekEnd method.
   */
  seekEnd() {
    this.__byteOffset = this.__reserved
  }

  /**
   * The getBuffer method.
   * @return {ArrayBuffer} - Returns an array buffer.
   */
  getBuffer() {
    if (this.__data.byteLength == this.__byteOffset) {
      return this.__data
    } else {
      const unit8Array = new Uint8Array(this.__data)
      return unit8Array.slice(0, this.__byteOffset).buffer
    }
  }

  /**
   * The __grow method.
   * @private
   */
  __grow() {
    const newSize = (this.__reserved > 0 ? this.__reserved : 1) * 2
    const data = new ArrayBuffer(newSize)
    const unit8Array = new Uint8Array(data)
    const old_unit8Array = new Uint8Array(this.__data)
    unit8Array.set(old_unit8Array)
    this.__data = data
    this.__dataView = new DataView(this.__data)
    this.__reserved = newSize
  }

  /**
   * The __reserve method.
   * @param {any} offset - The offset value.
   * @private
   */
  __reserve(offset) {
    if (this.__byteOffset + offset > this.__reserved) {
      this.__grow()
    }
  }

  /**
   * The __offset method.
   * @param {any} byteCount - The byteCount value.
   * @private
   */
  __offset(byteCount) {
    this.__byteOffset += byteCount
    if (this.__byteOffset > this.__reserved) {
      this.__grow()
    }
  }

  /**
   * The writeUInt8 method.
   * @param {any} value - The value param.
   */
  writeUInt8(value) {
    this.__reserve(1)
    this.__dataView.setUint8(this.__byteOffset, value)
    this.__offset(1)
  }

  /**
   * The writeUInt16 method.
   * @param {any} value - The value param.
   */
  writeUInt16(value) {
    this.__reserve(2)
    this.__dataView.setUint16(this.__byteOffset, value, true)
    this.__offset(2)
  }

  /**
   * The writeUInt32 method.
   * @param {any} value - The value param.
   */
  writeUInt32(value) {
    this.__reserve(4)
    this.__dataView.setUint32(this.__byteOffset, value, true)
    this.__offset(4)
  }

  /**
   * The writeSInt32 method.
   * @param {any} value - The value param.
   */
  writeSInt32(value) {
    this.__reserve(4)
    this.__dataView.setInt32(this.__byteOffset, value, true)
    this.__offset(4)
  }

  /**
   * The writeFloat16 method.
   * @param {any} value - The value param.
   */
  writeFloat16(value) {
    const uint16 = Math.encode16BitFloat(value)
    this.writeUInt16(uint16)
  }

  /**
   * The writeFloat32 method.
   * @param {any} value - The value param.
   */
  writeFloat32(value) {
    this.__reserve(4)
    this.__dataView.setFloat32(this.__byteOffset, value, true)
    this.__offset(4)
  }

  /**
   * The writeUInt8Array method.
   * @param {any} value - The value param.
   * @param {boolean} writeSize - The writeSize value.
   */
  writeUInt8Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length
    this.__reserve(count + (writeSize ? 4 : 0))
    if (writeSize) this.writeUInt32(count)
    for (let i = 0; i < count; i++) {
      this.writeUInt8(value[i])
    }
  }

  /**
   * The writeUInt16Array method.
   * @param {any} value - The value param.
   * @param {boolean} writeSize - The writeSize value.
   */
  writeUInt16Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length
    this.__reserve(count * 2 + (writeSize ? 4 : 0))
    if (writeSize) this.writeUInt32(count)
    for (let i = 0; i < count; i++) {
      this.writeUInt16(value[i])
    }
  }

  /**
   * The writeUInt32Array method.
   * @param {any} value - The value param.
   * @param {boolean} writeSize - The writeSize value.
   */
  writeUInt32Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length
    this.__reserve(count * 4 + (writeSize ? 4 : 0))
    if (writeSize) this.writeUInt32(count)
    for (let i = 0; i < count; i++) {
      this.writeUInt32(value[i])
    }
  }

  /**
   * The writeFloat32Array method.
   * @param {any} value - The value param.
   * @param {boolean} writeSize - The writeSize value.
   */
  writeFloat32Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length
    this.__reserve(count * 4 + (writeSize ? 4 : 0))
    if (writeSize) this.writeUInt32(count)
    for (let i = 0; i < count; i++) {
      this.writeFloat32(value[i])
    }
  }

  /**
   * The writeStr method.
   * @param {any} str - The str value.
   * @param {boolean} writeSize - The writeSize value.
   */
  writeStr(str, writeSize = true) {
    const count = value.length
    this.__reserve(count * 4 + (writeSize ? 4 : 0))
    if (writeSize) this.writeUInt32(count)
    for (let i = 0; i < count; i++) {
      this.writeFloat32(value.charCodeAt(i))
    }
  }

  /**
   * The writeSInt32Vec2 method.
   * @param {Vec2} value - The Vec2 to write.
   */
  writeSInt32Vec2(value) {
    this.writeSInt32(value.x)
    this.writeSInt32(value.y)
  }

  /**
   * The writeUInt32Vec2 method.
   * @param {Vec2} value - The Vec2 to write.
   */
  writeUInt32Vec2(value) {
    this.writeUInt32(value.x)
    this.writeUInt32(value.y)
  }

  /**
   * The writeFloat16Vec2 method.
   * @param {Vec2} value - The Vec2 to write.
   */
  writeFloat16Vec2(value) {
    this.writeFloat16(value.x)
    this.writeFloat16(value.y)
  }

  /**
   * The writeFloat32Vec2 method.
   * @param {Vec2} value - The Vec2 to write.
   */
  writeFloat32Vec2(value) {
    this.writeFloat32(value.x)
    this.writeFloat32(value.y)
  }

  /**
   * The writeFloat16Vec3 method.
   * @param {Vec3} value - The Vec3 to write.
   */
  writeFloat16Vec3(value) {
    this.writeFloat16(value.x)
    this.writeFloat16(value.y)
    this.writeFloat16(value.z)
  }

  /**
   * The writeFloat32Vec3 method.
   * @param {Vec3} value - The Vec3 to write.
   */
  writeFloat32Vec3(value) {
    this.writeFloat32(value.x)
    this.writeFloat32(value.y)
    this.writeFloat32(value.z)
  }

  /**
   * The writeFloat16Quat method.
   * @param {Quat} value - The Quat to write.
   */
  writeFloat16Quat(value) {
    this.writeFloat16(value.x)
    this.writeFloat16(value.y)
    this.writeFloat16(value.z)
    this.writeFloat16(value.w)
  }

  /**
   * The writeFloat32Quat method.
   * @param {Quat} value - The Quat to write.
   */
  writeFloat32Quat(value) {
    this.writeFloat32(value.x)
    this.writeFloat32(value.y)
    this.writeFloat32(value.z)
    this.writeFloat32(value.w)
  }

  /**
   * The writeRGBFloat32Color method.
   * @param {Color} value - The Color to write.
   */
  writeRGBFloat32Color(value) {
    this.writeFloat32(value.r)
    this.writeFloat32(value.g)
    this.writeFloat32(value.b)
  }

  /**
   * The writeRGBAFloat32Color method.
   * @param {Color} value - The Color to write.
   */
  writeRGBAFloat32Color(value) {
    this.writeFloat32(value.r)
    this.writeFloat32(value.g)
    this.writeFloat32(value.b)
    this.writeFloat32(value.a)
  }

  /**
   * The writeRGBUInt8Color method.
   * @param {Color} value - The Color to write.
   */
  writeRGBUInt8Color(value) {
    this.writeUInt8(value.r)
    this.writeUInt8(value.g)
    this.writeUInt8(value.b)
  }

  /**
   * The writeRGBAUInt8Color method.
   * @param {Color} value - The Color to write.
   */
  writeRGBAUInt8Color(value) {
    this.writeUInt8(value.r)
    this.writeUInt8(value.g)
    this.writeUInt8(value.b)
    this.writeUInt8(value.a)
  }

  /**
   * The writeBox2 method.
   * @param {Box2} value - The Box2 to write.
   */
  writeBox2(value) {
    this.writeFloat32Vec2(value.p0)
    this.writeFloat32Vec2(value.p1)
  }

  /**
   * The writeBox3 method.
   * @param {Box3} value - The Box3 to write.
   */
  writeBox3(value) {
    this.writeFloat32Vec3(value.p0)
    this.writeFloat32Vec3(value.p1)
  }

  /**
   * The writePadd method.
   * @param {any} size - The size value.
   */
  writePadd(size) {
    const bytes = size - this.__byteOffset
    this.__reserve(bytes)
    this.__offset(bytes)
  }

  /**
   * The writeAlignment method.
   * @param {any} numBytes - The numBytes value.
   */
  writeAlignment(numBytes) {
    const bytes = this.__byteOffset % numBytes
    if (bytes != 0) {
      this.__reserve(numBytes - bytes)
      this.__offset(numBytes - bytes)
    }
  }
}

export { BinWriter }
