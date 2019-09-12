import { Vec2, Vec3, Quat, Color, Box2, Box3 } from '../Math';

class BinWriter {
  constructor(dataSize = 0) {
    this.__data = new ArrayBuffer(dataSize);
    this.__byteOffset = 0;
    this.__reserved = dataSize;
    this.__dataView = new DataView(this.__data);
  }
  pos() {
    return this.__byteOffset;
  }

  seek(byteOffset) {
    this.__byteOffset = byteOffset;
  }

  seekEnd() {
    this.__byteOffset = this.__reserved;
  }

  getBuffer() {
    if (this.__data.byteLength == this.__byteOffset) {
      return this.__data;
    } else {
      const unit8Array = new Uint8Array(this.__data);
      return unit8Array.slice(0, this.__byteOffset).buffer;
    }
  }

  __grow() {
    const newSize = (this.__reserved > 0 ? this.__reserved : 1) * 2;
    const data = new ArrayBuffer(newSize);
    const unit8Array = new Uint8Array(data);
    const old_unit8Array = new Uint8Array(this.__data);
    unit8Array.set(old_unit8Array);
    this.__data = data;
    this.__dataView = new DataView(this.__data);
    this.__reserved = newSize;
  }

  __reserve(offset) {
    if (this.__byteOffset + offset > this.__reserved) {
      this.__grow();
    }
  }

  __offset(byteCount) {
    this.__byteOffset += byteCount;
    if (this.__byteOffset > this.__reserved) {
      this.__grow();
    }
  }

  writeUInt8(value) {
    this.__reserve(1);
    this.__dataView.setUint8(this.__byteOffset, value);
    this.__offset(1);
  }

  writeUInt16(value) {
    this.__reserve(2);
    this.__dataView.setUint16(this.__byteOffset, value, true);
    this.__offset(2);
  }

  writeUInt32(value) {
    this.__reserve(4);
    this.__dataView.setUint32(this.__byteOffset, value, true);
    this.__offset(4);
  }

  writeSInt32(value) {
    this.__reserve(4);
    this.__dataView.setInt32(this.__byteOffset, value, true);
    this.__offset(4);
  }

  writeFloat16(value) {
    const uint16 = Math.encode16BitFloat(value);
    this.writeUInt16(uint16);
  }

  writeFloat32(value) {
    this.__reserve(4);
    this.__dataView.setFloat32(this.__byteOffset, value, true);
    this.__offset(4);
  }

  writeUInt8Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length;
    this.__reserve(count + (writeSize ? 4 : 0));
    if (writeSize) this.writeUInt32(count);
    for (let i = 0; i < count; i++) {
      this.writeUInt8(value[i]);
    }
  }

  writeUInt16Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length;
    this.__reserve(count * 2 + (writeSize ? 4 : 0));
    if (writeSize) this.writeUInt32(count);
    for (let i = 0; i < count; i++) {
      this.writeUInt16(value[i]);
    }
  }

  writeUInt32Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length;
    this.__reserve(count * 4 + (writeSize ? 4 : 0));
    if (writeSize) this.writeUInt32(count);
    for (let i = 0; i < count; i++) {
      this.writeUInt32(value[i]);
    }
  }

  writeFloat32Array(value, writeSize = true) {
    const count = value.size ? value.size : value.length;
    this.__reserve(count * 4 + (writeSize ? 4 : 0));
    if (writeSize) this.writeUInt32(count);
    for (let i = 0; i < count; i++) {
      this.writeFloat32(value[i]);
    }
  }

  writeStr(str, writeSize = true) {
    const count = value.length;
    this.__reserve(count * 4 + (writeSize ? 4 : 0));
    if (writeSize) this.writeUInt32(count);
    for (let i = 0; i < count; i++) {
      this.writeFloat32(value.charCodeAt(i));
    }
  }

  writeSInt32Vec2(value) {
    this.writeSInt32(value.x);
    this.writeSInt32(value.y);
  }

  writeUInt32Vec2(value) {
    this.writeUInt32(value.x);
    this.writeUInt32(value.y);
  }

  writeFloat16Vec2(value) {
    this.writeFloat16(value.x);
    this.writeFloat16(value.y);
  }

  writeFloat32Vec2(value) {
    this.writeFloat32(value.x);
    this.writeFloat32(value.y);
  }

  writeFloat16Vec3(value) {
    this.writeFloat16(value.x);
    this.writeFloat16(value.y);
    this.writeFloat16(value.z);
  }

  writeFloat32Vec3(value) {
    this.writeFloat32(value.x);
    this.writeFloat32(value.y);
    this.writeFloat32(value.z);
  }

  writeFloat16Quat(value) {
    this.writeFloat16(value.x);
    this.writeFloat16(value.y);
    this.writeFloat16(value.z);
    this.writeFloat16(value.w);
  }

  writeFloat32Quat(value) {
    this.writeFloat32(value.x);
    this.writeFloat32(value.y);
    this.writeFloat32(value.z);
    this.writeFloat32(value.w);
  }

  writeRGBFloat32Color(value) {
    this.writeFloat32(value.r);
    this.writeFloat32(value.g);
    this.writeFloat32(value.b);
  }

  writeRGBAFloat32Color(value) {
    this.writeFloat32(value.r);
    this.writeFloat32(value.g);
    this.writeFloat32(value.b);
    this.writeFloat32(value.a);
  }

  writeRGBUInt8Color(value) {
    this.writeUInt8(value.r);
    this.writeUInt8(value.g);
    this.writeUInt8(value.b);
  }

  writeRGBAUInt8Color(value) {
    this.writeUInt8(value.r);
    this.writeUInt8(value.g);
    this.writeUInt8(value.b);
    this.writeUInt8(value.a);
  }

  writeBox2(value) {
    this.writeFloat32Vec2(value.p0);
    this.writeFloat32Vec2(value.p1);
  }

  writeBox3(value) {
    this.writeFloat32Vec3(value.p0);
    this.writeFloat32Vec3(value.p1);
  }

  writePadd(size) {
    const bytes = size - this.__byteOffset;
    this.__reserve(bytes);
    this.__offset(bytes);
  }

  writeAlignment(numBytes) {
    const bytes = this.__byteOffset % numBytes;
    if (bytes != 0) {
      this.__reserve(numBytes - bytes);
      this.__offset(numBytes - bytes);
    }
  }
}

export { BinWriter };
