import { Signal } from '../../Utilities';
import { Parameter } from './Parameter.js';
import { sgFactory } from '../SGFactory';

/** Class representing a boolean parameter.
 * @extends Parameter
 */
class BooleanParameter extends Parameter {
  /**
   * Create a boolean parameter.
   * @param {string} name - The name of the boolean parameter.
   * @param {any} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'Boolean');
  }

  /**
   * The clone method constructs a new boolean parameter,
   * copies its values from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {BooleanParameter} - Returns a new cloned boolean parameter.
   */
  clone(flags) {
    const clonedParam = new BooleanParameter(this.__name, this.__value);
    return clonedParam;
  }
}

sgFactory.registerClass('BooleanParameter', BooleanParameter);

export { BooleanParameter };
