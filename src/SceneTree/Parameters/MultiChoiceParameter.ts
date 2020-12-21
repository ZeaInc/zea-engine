import { Registry } from '../../Registry'
import { NumberParameter } from './NumberParameter.js'

/**
 * Represents a specific type of parameter, that stores multiple choice(array) values.
 *
 * i.e.:
 * ```javascript
 * const multiChoiceParameter =  new MultiChoiceParameter('InitialXfoMode', GROUP_INITIAL_XFO_MODES.average, [
 *                                  'manual',
 *                                  'first',
 *                                  'average',
 *                                  'global',
 *                                ])
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(multiChoiceParameter)
 * ```
 * @extends NumberParameter
 */
class MultiChoiceParameter extends NumberParameter {
  choices: any;
  /**
   * Create a multi choice parameter.
   * @param {string} name - The name of the multi choice parameter.
   * @param {number} index - The index value.
   * @param {array} choices - The choices value.
   */
  constructor(name: any, index: any, choices: any) {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
    super(name, index, [0, choices.length], 1)
    this.choices = choices
  }

  /**
   * Returns choices array.
   *
   * @return {array} - The return value.
   */
  getChoices() {
    return this.choices
  }

  /**
   * Sets parameter index value.
   *
   * @param {string|number} value - The value param.
   */
  setValue(value: any) {
    if (typeof value === 'string') {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      super.setValue(this.choices.indexOf(value))
    } else {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      super.setValue(value)
    }
  }
}

Registry.register('MultiChoiceParameter', MultiChoiceParameter)

export { MultiChoiceParameter }
