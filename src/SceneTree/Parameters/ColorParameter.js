import { Color } from '../../Math';
import { sgFactory } from '../SGFactory';
import { Parameter, ValueSetMode } from './Parameter.js';

class ColorParameter extends Parameter {
  constructor(name, value) {
    super(name, value ? value : new Color(), 'Color');
  }

  clone(flags) {
    const clonedParam = new ColorParameter(this.__name, this.__value.clone());
    return clonedParam;
  }

  readBinary(reader, context) {
    const value = reader.loadRGBAFloat32Color();
    // If the value is in linear space, then we should convert it to gamma space.
    // Note: !! this should always be done in preprocessing...
    value.applyGamma(2.2);

    this.setValue(value, ValueSetMode.DATA_LOAD);
  }
}

sgFactory.registerClass('ColorParameter', ColorParameter);

export { ColorParameter };
