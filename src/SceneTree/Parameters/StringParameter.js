import { Signal } from '../../Utilities';
import { sgFactory } from '../SGFactory';
import { Parameter, ValueSetMode } from './Parameter.js';

/** Class representing a string parameter.
 * @extends Parameter
 */
class StringParameter extends Parameter {
  /**
   * Create a string parameter.
   * @param {string} name - The name of the material color parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value = '') {
    super(name, value, 'String');
    this.multiLine = false;
  }

  /**
   * The setMultiLine method.
   * @param {any} multiLine - The multiLine value.
   */
  setMultiLine(multiLine) {
    this.multiLine = multiLine;
  }

  /**
   * The getMultiLine method.
   * @return {any} - The return value.
   */
  getMultiLine() {
    return this.multiLine;
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const value = reader.loadStr();
    this.setValue(value, ValueSetMode.DATA_LOAD);
  }

  /**
   * The clone method constructs a new string parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {StringParameter} - Returns a new string parameter.
   */
  clone(flags) {
    const clonedParam = new StringParameter(this.__name, this.__value);
    return clonedParam;
  }
}

sgFactory.registerClass('StringParameter', StringParameter);
sgFactory.registerClass('Property_String', StringParameter);

export { StringParameter };
