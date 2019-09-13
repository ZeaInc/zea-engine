import { Signal } from '../../Utilities';
import { Parameter } from './Parameter.js';
import { sgFactory } from '../SGFactory';

class BooleanParameter extends Parameter {
  constructor(name, value) {
    super(name, value, 'Boolean');
  }

  clone(flags) {
    const clonedParam = new BooleanParameter(this.__name, this.__value);
    return clonedParam;
  }
}

sgFactory.registerClass('BooleanParameter', BooleanParameter);

export { BooleanParameter };
