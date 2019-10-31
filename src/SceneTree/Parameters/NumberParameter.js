import { Signal } from '../../Utilities';
import { sgFactory } from '../SGFactory';
import { ValueSetMode, Parameter } from './Parameter.js';

/** Class representing a number parameter.
 * @extends Parameter
 */
class NumberParameter extends Parameter {
  /**
   * Create a number parameter.
   * @param {string} name - The name of the number parameter.
   * @param {number} value - The value of the parameter.
   * @param {any} range - The range value.
   * @param {any} step - The step value.
   */
  constructor(name, value = 0, range = undefined, step = undefined) {
    super(name, value, 'Number');
    // The value might not have a range.
    if (range && !Array.isArray(range))
      console.error('Range value must be an array of 2 numbers.');
    this.__range = range;
    this.__step = step;
  }

  /**
   * The setValue method.
   * @param {any} value - The value param.
   * @param {number} mode - The mode value.
   */
  setValue(value, mode) {
    if (mode == ValueSetMode.USER_SETVALUE) {
      if (this.__range) {
        value = Math.clamp(value, this.__range[0], this.__range[1]);
      }
      if (this.__step) {
        value = Math.round(value / this.__step) * this.__step;
      }
    }
    super.setValue(value, mode);
  }

  /**
   * The getValue method.
   * @param {number} mode - The mode value.
   * @return {any} - The return value.
   */
  getValue(mode) {
    // Still not sure if we should clamp the output.
    // if(this.__range) {
    //     return Math.clamp(super.getValue(), this.__range[0], this.__range[1]);
    // }
    return super.getValue(mode);
  }

  /**
   * The getRange method.
   * @return {any} - The return value.
   */
  getRange() {
    return this.__range;
  }

  /**
   * The setRange method.
   * @param {any} range - The range value.
   * @return {any} - The return value.
   */
  setRange(range) {
    // Should be an array [0, 20]
    this.__range = range;
    return this;
  }

  /**
   * The getStep method.
   * @return {any} - The return value.
   */
  getStep() {
    return this.__step;
  }

  /**
   * The setStep method.
   * @param {any} step - The step value.
   * @return {any} - The return value.
   */
  setStep(step) {
    this.__step = step;
    return this;
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (this.__range) j.range = this.__range;
    if (this.__step) j.step = this.__step;
    return j;
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    if (j.range) this.__range = j.range;
    if (j.step) this.__step = j.step;
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = reader.loadFloat32();
    this.setValue(value, ValueSetMode.DATA_LOAD);
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new number parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {NumberParameter} - Returns a new number parameter.
   */
  clone(flags) {
    const clonedParam = new NumberParameter(this.__name, this.__value);
    clonedParam.__range = this.__range;
    clonedParam.__step = this.__step;
    return clonedParam;
  }
}

sgFactory.registerClass('NumberParameter', NumberParameter);
sgFactory.registerClass('Property_SInt32', NumberParameter);
sgFactory.registerClass('Property_UInt32', NumberParameter);
sgFactory.registerClass('Property_Float32', NumberParameter);

export { NumberParameter };
