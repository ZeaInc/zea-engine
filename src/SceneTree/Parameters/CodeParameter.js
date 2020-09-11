import { Registry } from '../../Registry'
import { StringParameter } from './StringParameter.js'

/**
 * Represents a specific type of parameter, that only stores `string` values.
 *
 * i.e.:
 * ```javascript
 * const codeStr = `const sayHello = () => console.log('Hello World')`
 * const codeParam = new CodeParameter('MyCode', codeStr)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(codeParam)
 * ```
 *
 * @extends StringParameter
 */
class CodeParameter extends StringParameter {
  /**
   * Creates a code parameter.
   * The default language is `js`.
   *
   * @param {string} name - The name of the code parameter.
   * @param {string} value - The value of the parameter.
   */
  constructor(name, value = '') {
    super(name, value, 'String')
    this.lang = 'js'
  }

  /**
   * Sets code language for parameter.
   *
   * @param {string} lang - The language value.
   */
  setLanguage(lang) {
    this.lang = lang
  }

  /**
   * Returns code language of parameter.
   *
   * @return {string} - Returns the language.
   */
  getLanguage() {
    return this.lang
  }

  /**
   * The clone method constructs a new code parameter,
   * copies its values from this parameter and returns it.
   *
   * @return {CodeParameter} - Returns a new cloned code parameter.
   */
  clone() {
    const clonedParam = new CodeParameter(this.__name, this.__value)
    return clonedParam
  }
}

Registry.register('CodeParameter', CodeParameter)

export { CodeParameter }
