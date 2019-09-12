import { Xfo } from '../../Math';
import { Parameter } from './Parameter.js';

class XfoParameter extends Parameter {
  constructor(name, value) {
    super(name, value ? value : new Xfo(), 'Xfo');
  }

  clone(flags) {
    const clonedParam = new XfoParameter(this.__name, this.__value.clone());
    return clonedParam;
  }
}

export { XfoParameter };
