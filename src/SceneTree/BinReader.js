import {
    Vec2,
    Vec3,
    Quat,
    Color,
    Box2,
    Box3
} from '../Math';

import {
  SystemDesc
} from '../BrowserDetection.js';

class BinReader {
    constructor(data, byteOffset = 0) {
        this.__data = data;
        this.__byteOffset = byteOffset;
        this.__dataView = new DataView(this.__data);
    }

    get isMobileDevice() {
        return SystemDesc.isMobileDevice;
    }

    get data() {
        return this.__data;
    }

    get byteLength() {
        return this.__dataView.byteLength;
    }

    get remainingByteLength() {
        return this.__dataView.byteLength - this.__byteOffset;
    }

    pos() {
        return this.__byteOffset;
    }

    seek(byteOffset) {
        this.__byteOffset = byteOffset;
    }

    advance(byteOffset) {
        this.__byteOffset += byteOffset;
    }

    loadUInt8() {
        const result = this.__dataView.getUint8(this.__byteOffset);
        this.__byteOffset += 1;
        return result;
    }

    loadUInt16() {
        const result = this.__dataView.getUint16(this.__byteOffset, true);
        this.__byteOffset += 2;
        return result;
    }

    loadUInt32() {
        const result = this.__dataView.getUint32(this.__byteOffset, true);
        this.__byteOffset += 4;
        return result;
    }

    loadSInt32() {
        const result = this.__dataView.getInt32(this.__byteOffset, true);
        this.__byteOffset += 4;
        return result;
    }

    loadFloat16() {
        const uint16 = this.loadUInt16();
        return Math.decode16BitFloat(uint16);
    }

    loadFloat16From2xUInt8() {
        const result = this.__dataView.getFloat16(this.__byteOffset, true);
        // const uint8s = this.loadUInt8Array(2);
        // return Math.decode16BitFloat(uint8s);
        this.__byteOffset += 2;
        return result;
    }


    loadFloat32() {
        const result = this.__dataView.getFloat32(this.__byteOffset, true);
        this.__byteOffset += 4;
        return result;
    }

    loadUInt8Array(size = undefined, clone = false) {
        if (size == undefined)
            size = this.loadUInt32();
        const result = new Uint8Array(this.__data, this.__byteOffset, size);
        this.__byteOffset += size;
        const padd = this.__byteOffset % 4;
        //this.readPadd();
        return result;
    }

    loadUInt16Array(size = undefined, clone = false) {
        if (size == undefined)
            size = this.loadUInt32();
        if (size == 0)
            return new Uint16Array();
        this.readPadd(2);
        let result;
        if (SystemDesc.isMobileDevice) {
            result = new Uint16Array(size);
            for (let i = 0; i < size; i++) {
                result[i] = this.__dataView.getUint16(this.__byteOffset, true);
                this.__byteOffset += 2;
            }
        } else {
            result = new Uint16Array(this.__data, this.__byteOffset, size);
            this.__byteOffset += size * 2;
        }
        //this.readPadd();
        return result;
    }

    loadUInt32Array(size = undefined, clone = false) {
        if (size == undefined)
            size = this.loadUInt32();
        if (size == 0)
            return new Uint32Array();
        this.readPadd(4);
        let result;
        if (SystemDesc.isMobileDevice) {
            result = new Uint32Array(size);
            for (let i = 0; i < size; i++) {
                result[i] = this.__dataView.getUint32(this.__byteOffset, true);
                this.__byteOffset += 4;
            }
        } else {
            result = new Uint32Array(this.__data, this.__byteOffset, size);
            this.__byteOffset += size * 4;
        }
        return result;
    }


    loadFloat32Array(size = undefined, clone = false) {
        if (size == undefined)
            size = this.loadUInt32();
        if (size == 0)
            return new Float32Array();
        this.readPadd(4);
        let result;
        if (SystemDesc.isMobileDevice) {
            result = new Float32Array(size);
            for (let i = 0; i < size; i++) {
                result[i] = this.__dataView.getFloat32(this.__byteOffset, true);
                this.__byteOffset += 4;
            }
        } else {
            result = new Float32Array(this.__data, this.__byteOffset, size);
            this.__byteOffset += size * 4;
        }
        return result;
    }

    loadStr() {
        const numChars = this.loadUInt32();
        const chars = new Uint8Array(this.__data, this.__byteOffset, numChars);
        this.__byteOffset += numChars;
        let result = '';
        for (let i = 0; i < numChars; i++)
            result = result + String.fromCharCode(chars[i]);
        return result;
    }

    loadSInt32Vec2() {
        const x = this.loadSInt32();
        const y = this.loadSInt32();
        return new Vec2(x, y);
    }

    loadUInt32Vec2() {
        const x = this.loadUInt32();
        const y = this.loadUInt32();
        return new Vec2(x, y);
    }

    loadFloat16Vec2() {
        const x = this.loadFloat16();
        const y = this.loadFloat16();
        return new Vec2(x, y);
    }

    loadFloat32Vec2() {
        const x = this.loadFloat32();
        const y = this.loadFloat32();
        return new Vec2(x, y);
    }

    loadFloat16Vec3() {
        const x = this.loadFloat16();
        const y = this.loadFloat16();
        const z = this.loadFloat16();
        return new Vec3(x, y, z);
    }

    loadFloat32Vec3() {
        const x = this.loadFloat32();
        const y = this.loadFloat32();
        const z = this.loadFloat32();
        return new Vec3(x, y, z);
    }

    loadFloat16Quat() {
        const x = this.loadFloat16();
        const y = this.loadFloat16();
        const z = this.loadFloat16();
        const w = this.loadFloat16();
        return new Quat(x, y, z, w);
    }

    loadFloat32Quat() {
        const x = this.loadFloat32();
        const y = this.loadFloat32();
        const z = this.loadFloat32();
        const w = this.loadFloat32();
        return new Quat(x, y, z, w);
    }

    loadRGBFloat32Color() {
        const r = this.loadFloat32();
        const g = this.loadFloat32();
        const b = this.loadFloat32();
        return new Color(r, g, b);
    }

    loadRGBAFloat32Color() {
        const r = this.loadFloat32();
        const g = this.loadFloat32();
        const b = this.loadFloat32();
        const a = this.loadFloat32();
        return new Color(r, g, b, a);
    }

    loadRGBUInt8Color() {
        const r = this.loadUInt8();
        const g = this.loadUInt8();
        const b = this.loadUInt8();
        return new Color(r / 255, g / 255, b / 255);
    }

    loadRGBAUInt8Color() {
        const r = this.loadUInt8();
        const g = this.loadUInt8();
        const b = this.loadUInt8();
        const a = this.loadUInt8();
        return new Color(r / 255, g / 255, b / 255, a / 255);
    }

    loadBox2() {
        return new Box2(this.loadFloat32Vec2(), this.loadFloat32Vec2());
    }

    loadBox3() {
        return new Box3(this.loadFloat32Vec3(), this.loadFloat32Vec3());
    }

    readPadd(stride) {
        const padd = this.__byteOffset % stride;
        if (padd != 0)
            this.__byteOffset += stride - padd;
    }

};

export {
    BinReader
};