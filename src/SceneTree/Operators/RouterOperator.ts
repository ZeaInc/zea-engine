import { Operator } from './Operator.js'
import { OperatorInput } from './OperatorInput.js'
import { OperatorOutput } from './OperatorOutput.js'

import { Registry } from '../../Registry'

/** Class representing a router operator.
 * @extends Operator
 * @private
 */
class RouterOperator extends Operator {
  __input: any;
  /**
   * Create a router operator.
   * @param {string} name - The name value.
   */
  constructor(name: any) {
    super(name)
    this.__input = this.addInput(new OperatorInput('Input'))
  }

  /**
   * The addRoute method.
   * @param {Parameter} param - The parameter to router values to.
   * @return {OperatorOutput} - The added output.
   */
  addRoute(param: any) {
    const output = this.addOutput(new OperatorOutput('Output' + this.__outputs.size))
    if (param) {
      output.setParam(param)
    }
    return output
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
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        output.setClean(inputValue)
      }
    } else {
      let i = this.__outputs.size
      while (i--) {
        const output = this.getOutputByIndex(i)
        // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
        output.setClean(0.0)
      }
    }
  }
}

Registry.register('RouterOperator', RouterOperator)

export { RouterOperator }
