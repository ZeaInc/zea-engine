import { Signal } from '../../Utilities';
import { sgFactory } from '../SGFactory';
import { Parameter, ValueSetMode } from './Parameter.js';

class StringParameter extends Parameter {
  constructor(name, value = '') {
    super(name, value, 'String');
    this.multiLine = false;
  }

  setMultiLine(multiLine) {
    this.multiLine = multiLine;
  }

  getMultiLine() {
    return this.multiLine;
  }

  clone(flags) {
    const clonedParam = new StringParameter(this.__name, this.__value);
    return clonedParam;
  }

  readBinary(reader, context) {
    const value = reader.loadStr();
    this.setValue(value, ValueSetMode.DATA_LOAD);
  }
}

sgFactory.registerClass('StringParameter', StringParameter);
sgFactory.registerClass('Property_String', StringParameter);

export { StringParameter };
