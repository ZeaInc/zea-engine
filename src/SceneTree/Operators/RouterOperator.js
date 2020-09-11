import { Operator } from './Operator.js'
import { OperatorInput } from './OperatorInput.js'
import { OperatorOutput } from './OperatorOutput.js'

import { Registry } from '../../Registry'

/** Class representing a router operator.
 * @extends Operator
 * @private
 */
class RouterOperator extends Operator {
  /**
   * Create a router operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.__input = this.addInput(new OperatorInput('Input'))
  }

  /**
   * The addRoute method.
   * @return {OperatorOutput} - The added output.
   */
  addRoute() {
    return this.addOutput(new OperatorOutput('Output' + this.__outputs.size))
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    if (this.__input.isConnected()) {
      const inputValue = this.__input.getValue()
      let i = this.__outputs.size
      while (i--) {
        const output = this.getOutputByIndex(i)
        output.setClean(inputValue)
      }
    } else {
      let i = this.__outputs.size
      while (i--) {
        const output = this.getOutputByIndex(i)
        output.setClean(0.0)
      }
    }
  }
}

Registry.register('RouterOperator', RouterOperator)

export { RouterOperator }
