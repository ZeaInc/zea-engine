import { Parameter } from './Parameter.js'
import { Registry } from '../../Registry'

/**
 * Represents a specific type of parameter, that only stores `boolean` values.
 *
 * i.e.:
 * ```javascript
 * const booleanParam = new BooleanParameter('MyBoolean', true)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(booleanParam)
 * ```
 * @extends Parameter
 */
class BooleanParameter extends Parameter {
  /**
   * Creates a new parameter with `Boolean` data type.
   *
   * @param {string} name - The name of the boolean parameter.
   * @param {boolean} value - The value of the parameter.
   */
  constructor(name, value) {
    super(name, value, 'Boolean')
  }

  /**
   * The clone method constructs a new boolean parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {BooleanParameter} - Returns a new cloned boolean parameter.
   */
  clone() {
    const clonedParam = new BooleanParameter(this.__name, this.__value)
    return clonedParam
  }
}

Registry.register('BooleanParameter', BooleanParameter)

export { BooleanParameter }
