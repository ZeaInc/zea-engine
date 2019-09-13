import { Float32, UInt32, SInt32 } from '../../Math';
import { typeRegistry } from '../../Math/TypeRegistry.js';

class Attribute {
  constructor(dataType, expectedSize, defaultScalarValue = undefined) {
    this.__dataType = dataType;
    if (dataType.numFloat32Elements != undefined) {
      this.__numFloat32Elements = this.__dataType.numFloat32Elements();
    } else {
      switch (dataType) {
        case Float32:
        case UInt32:
        case SInt32:
          this.__numFloat32Elements = 1;
          break;
        default:
          throw 'Invalid data type for attribute:' + dataType;
      }
    }
    this.__data = new Float32Array(expectedSize * this.__numFloat32Elements);
    this.__defaultScalarValue =
      defaultScalarValue != undefined ? defaultScalarValue : Number.MAX_VALUE;
    this.initRange(0);
  }

  resize(size) {
    const prevLength = this.__data.length;
    const newLength = size * this.__numFloat32Elements;
    const data = new Float32Array(newLength);
    for (let i = 0; i < Math.min(this.__data.length, newLength); i++) {
      data[i] = this.__data[i];
    }
    if (this.__data.length < newLength) this.__data = data;
    this.initRange(prevLength);
  }

  initRange(start) {
    // Initialize the values to invalid values.
    for (let i = start; i < this.__data.length; i++) {
      this.__data[i] = this.__defaultScalarValue;
    }
  }

  getCount() {
    return this.__data.length / this.__numFloat32Elements;
  }

  get length() {
    return this.__data.length / this.__numFloat32Elements;
  }

  get data() {
    return this.__data;
  }

  get numFloat32Elements() {
    return this.__numFloat32Elements;
  }

  getFloat32Value(index) {
    return this.__data[index];
  }

  setFloat32Value(index, value) {
    this.__data[index] = value;
  }

  getValueRef(index) {
    const numElems = this.__numFloat32Elements;
    if (index >= this.__data.length / numElems)
      throw 'Invalid vertex index:' +
        index +
        '. Num Vertices:' +
        this.__data.length / 3;
    return this.__dataType.createFromFloat32Buffer(
      this.__data.buffer,
      index * numElems
    );
  }

  setValue(index, value) {
    const numElems = this.__numFloat32Elements;
    if (index >= this.__data.length / numElems)
      throw 'Invalid vertex index:' +
        index +
        '. Num Vertices:' +
        this.__data.length / 3;
    this.__dataType
      .createFromFloat32Buffer(this.__data.buffer, index * numElems)
      .setFromOther(value);
  }

  toJSON(context, flags) {
    return {
      data: Array.from(this.__data),
      dataType: typeRegistry.getTypeName(this.__dataType),
      defaultScalarValue: this.__defaultScalarValue,
      length: this.__data.length / this.__numFloat32Elements,
    };
  }

  fromJSON(j) {
    this.__data = Float32Array.from(j.data);
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}

export { Attribute };
// export default Attribute;
