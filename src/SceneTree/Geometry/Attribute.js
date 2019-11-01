import { Float32, UInt32, SInt32 } from '../../Math';
import { typeRegistry } from '../../Math/TypeRegistry.js';

/** Class representing an attribute. */
class Attribute {
  /**
   * Create an attribute.
   * @param {any} dataType - The dataType value.
   * @param {any} expectedSize - The expectedSize value.
   * @param {number} defaultScalarValue - The default scalar value.
   */
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
          throw new Error('Invalid data type for attribute:' + dataType);
      }
    }
    this.__data = new Float32Array(expectedSize * this.__numFloat32Elements);
    this.__defaultScalarValue =
      defaultScalarValue != undefined ? defaultScalarValue : Number.MAX_VALUE;
    this.initRange(0);
  }

  /**
   * The resize method.
   * @param {any} size - The size value.
   */
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

  /**
   * The initRange method.
   * @param {any} start - The start value.
   */
  initRange(start) {
    // Initialize the values to invalid values.
    for (let i = start; i < this.__data.length; i++) {
      this.__data[i] = this.__defaultScalarValue;
    }
  }

  /**
   * The getCount method.
   * @return {any} - The return value.
   */
  getCount() {
    return this.__data.length / this.__numFloat32Elements;
  }

  /**
   * Getter for length.
   */
  get length() {
    return this.__data.length / this.__numFloat32Elements;
  }

  /**
   * Getter for data.
   */
  get data() {
    return this.__data;
  }

  /**
   * Getter for numFloat32Elements.
   */
  get numFloat32Elements() {
    return this.__numFloat32Elements;
  }

  /**
   * The getFloat32Value method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getFloat32Value(index) {
    return this.__data[index];
  }

  /**
   * The setFloat32Value method.
   * @param {number} index - The index value.
   * @param {any} value - The value param.
   */
  setFloat32Value(index, value) {
    this.__data[index] = value;
  }

  /**
   * The getValueRef method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getValueRef(index) {
    const numElems = this.__numFloat32Elements;
    if (index >= this.__data.length / numElems)
      throw new Error(
        'Invalid vertex index:' +
          index +
          '. Num Vertices:' +
          this.__data.length / 3
      );
    return this.__dataType.createFromFloat32Buffer(
      this.__data.buffer,
      index * numElems
    );
  }

  /**
   * The setValue method.
   * @param {number} index - The index value.
   * @param {any} value - The value param.
   */
  setValue(index, value) {
    const numElems = this.__numFloat32Elements;
    if (index >= this.__data.length / numElems)
      throw new Error(
        'Invalid vertex index:' +
          index +
          '. Num Vertices:' +
          this.__data.length / 3
      );
    this.__dataType
      .createFromFloat32Buffer(this.__data.buffer, index * numElems)
      .setFromOther(value);
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return {
      data: Array.from(this.__data),
      dataType: typeRegistry.getTypeName(this.__dataType),
      defaultScalarValue: this.__defaultScalarValue,
      length: this.__data.length / this.__numFloat32Elements,
    };
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   */
  fromJSON(j) {
    this.__data = Float32Array.from(j.data);
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}

export { Attribute };
