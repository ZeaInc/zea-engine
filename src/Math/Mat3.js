import { AttrValue } from './AttrValue.js';
import { Vec3 } from './Vec3.js';
import { typeRegistry } from './TypeRegistry.js';

// This matrix class is based on GLM, and is column major.

class Mat3 extends AttrValue {
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
    super();

    if (m00 instanceof ArrayBuffer) {
      const buffer = m00;
      const byteOffset = m01;
      this.__data = new Float32Array(buffer, byteOffset, 9);
    } else {
      this.__data = new Float32Array(9);
      this.set(m00, m01, m02, m10, m11, m12, m20, m21, m22);
    }
  }

  // /////////////////////////////////////////
  // properties

  get m00() {
    return this.__data[0];
  }

  set m00(val) {
    this.__data[0] = val;
  }

  get m01() {
    return this.__data[1];
  }

  set m01(val) {
    this.__data[1] = val;
  }

  get m02() {
    return this.__data[2];
  }

  set m02(val) {
    this.__data[2] = val;
  }

  get m10() {
    return this.__data[4];
  }

  set m10(val) {
    this.__data[4] = val;
  }

  get m11() {
    return this.__data[5];
  }

  set m11(val) {
    this.__data[5] = val;
  }

  get m12() {
    return this.__data[6];
  }

  set m12(val) {
    this.__data[6] = val;
  }

  get m20() {
    return this.__data[8];
  }

  set m20(val) {
    this.__data[8] = val;
  }

  get m21() {
    return this.__data[9];
  }

  set m21(val) {
    this.__data[9] = val;
  }

  get m22() {
    return this.__data[10];
  }

  set m22(val) {
    this.__data[10] = val;
  }

  get xAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 0);
  }

  set xAxis(vec3) {
    this.xAxis.set(vec3.x, vec3.y, vec3.z);
  }

  get yAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 3);
  }

  set yAxis(vec3) {
    this.yAxis.set(vec3.x, vec3.y, vec3.z);
  }

  get zAxis() {
    return Vec3.createFromFloat32Buffer(this.__data.buffer, 6);
  }

  set zAxis(vec3) {
    this.zAxis.set(vec3.x, vec3.y, vec3.z);
  }

  // /////////////////////////////////////////
  // Setters

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
    this.__data[0] = m00;
    this.__data[1] = m01;
    this.__data[2] = m02;
    this.__data[3] = m10;
    this.__data[4] = m11;
    this.__data[5] = m12;
    this.__data[6] = m20;
    this.__data[7] = m21;
    this.__data[8] = m22;
  }

  setIdentity() {
    this.set();
  }

  // Not: works with either mat3 or mat4
  setFromMat(mat) {
    this.__data[0] = mat.m00;
    this.__data[1] = mat.m01;
    this.__data[2] = mat.m02;
    this.__data[3] = mat.m10;
    this.__data[4] = mat.m11;
    this.__data[5] = mat.m12;
    this.__data[6] = mat.m20;
    this.__data[7] = mat.m21;
    this.__data[8] = mat.m22;
  }

  setFromDirectionAndUpvector(dir, up) {
    const zAxis = dir;
    const zLen = zAxis.length();
    if (zLen < Number.EPSILON) {
      this.setIdentity();
      return;
    }
    zAxis.scaleInPlace(1 / zLen);

    const xAxis = up.cross(zAxis);
    const xLen = xAxis.length();
    if (xLen > Number.EPSILON) xAxis.scaleInPlace(1 / xLen);

    const yAxis = zAxis.cross(xAxis);
    const yLen = yAxis.length();
    if (yLen > Number.EPSILON) yAxis.scaleInPlace(1 / yLen);

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
    );
  }

  // returnse the inverted matrix
  inverse() {
    const a00 = this.__data[0];
    const a01 = this.__data[1];
    const a02 = this.__data[2];
    const a10 = this.__data[3];
    const a11 = this.__data[4];
    const a12 = this.__data[5];
    const a20 = this.__data[6];
    const a21 = this.__data[7];
    const a22 = this.__data[8];
    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;
    // Calculate the determinant
    const det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
      console.warn('Unable to invert Mat3');
      return null;
    }
    det = 1.0 / det;

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
    );
  }

  invertInPlace() {
    const a00 = this.__data[0];
    const a01 = this.__data[1];
    const a02 = this.__data[2];
    const a10 = this.__data[3];
    const a11 = this.__data[4];
    const a12 = this.__data[5];
    const a20 = this.__data[6];
    const a21 = this.__data[7];
    const a22 = this.__data[8];
    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;
    // Calculate the determinant
    const det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
      console.warn('Unable to invert Mat3');
      return false;
    }
    det = 1.0 / det;

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
    );
    return true;
  }

  transpose() {
    return Mat4(
      this.__data[0],
      this.__data[3],
      this.__data[6],
      this.__data[1],
      this.__data[4],
      this.__data[7],
      this.__data[2],
      this.__data[5],
      this.__data[8]
    );
  }

  transposeInPlace() {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    const a01 = this.__data[1];
    const a02 = this.__data[2];
    const a12 = this.__data[5];

    this.__data[1] = this.__data[3];
    this.__data[2] = this.__data[6];
    this.__data[3] = a01;
    this.__data[5] = this.__data[7];
    this.__data[6] = a02;
    this.__data[7] = a12;
  }

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
    );
  }

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
    );
  }

  // ////////////////////////////////////////
  // Static Methods

  static create(...args) {
    return new Mat3(...args);
  }

  // Creates a new Mat3 to wrap existing memory in a buffer.
  static createFromFloat32Buffer(buffer, offset = 0) {
    return new Mat3(buffer, offset * 4); // 4 bytes per 32bit float
  }

  // ///////////////////////////
  // Persistence

  toJSON() {
    return this.__data;
  }

  fromJSON(json) {
    this.__data = new Float32Array(json);
  }

  // ///////////////////////////
  // Debugging

  toString() {
    return this.toJSON().toString();
  }
}

typeRegistry.registerType('Mat3', Mat3);

export { Mat3 };
// export default Mat3;
