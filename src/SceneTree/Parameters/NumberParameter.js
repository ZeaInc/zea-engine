import { Signal } from '../../Utilities';
import { sgFactory } from '../SGFactory';
import { ValueSetMode, Parameter } from './Parameter.js';

class NumberParameter extends Parameter {
  constructor(name, value = 0, range = undefined, step = undefined) {
    super(name, value, 'Number');
    // The value might not have a range.
    if (range && !Array.isArray(range))
      console.error('Range value must be an array of 2 numbers.');
    this.__range = range;
    this.__step = step;
  }

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

  getValue(mode) {
    // Still not sure if we should clamp the output.
    // if(this.__range) {
    //     return Math.clamp(super.getValue(), this.__range[0], this.__range[1]);
    // }
    return super.getValue(mode);
  }

  getRange() {
    return this.__range;
  }

  setRange(range) {
    // Should be an array [0, 20]
    this.__range = range;
    return this;
  }

  getStep() {
    return this.__step;
  }

  setStep(step) {
    this.__step = step;
    return this;
  }

  clone(flags) {
    const clonedParam = new NumberParameter(this.__name, this.__value);
    clonedParam.__range = this.__range;
    clonedParam.__step = this.__step;
    return clonedParam;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (this.__range) j.range = this.__range;
    if (this.__step) j.step = this.__step;
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    if (j.range) this.__range = j.range;
    if (j.step) this.__step = j.step;
  }

  readBinary(reader, context) {
    const value = reader.loadFloat32();
    this.setValue(value, ValueSetMode.DATA_LOAD);
  }
}

sgFactory.registerClass('NumberParameter', NumberParameter);
sgFactory.registerClass('Property_SInt32', NumberParameter);
sgFactory.registerClass('Property_UInt32', NumberParameter);
sgFactory.registerClass('Property_Float32', NumberParameter);

export { NumberParameter };
