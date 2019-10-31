import { Parameter } from './Parameter.js';
import { NumberParameter } from './NumberParameter.js';

/** Class representing a multi choice parameter.
 * @extends NumberParameter
 */
class MultiChoiceParameter extends NumberParameter {
  /**
   * Create a multi choice parameter.
   * @param {string} name - The name of the multi choice parameter.
   * @param {number} index - The index value.
   * @param {any} choices - The choices value.
   */
  constructor(name, index, choices) {
    super(name, index, [0, choices.length], 1);
    this.choices = choices;
  }

  /**
   * The getChoices method.
   * @return {any} - The return value.
   */
  getChoices() {
    return this.choices;
  }

  /**
   * The setValue method.
   * @param {any} value - The value param.
   * @param {number} mode - The mode value.
   */
  setValue(value, mode) {
    if (typeof value === 'string') {
      super.setValue(this.choices.indexOf(value), mode);
    } else {
      super.setValue(value, mode);
    }
  }
}

export { MultiChoiceParameter };
