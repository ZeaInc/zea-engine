import { Operator } from './Operator.js'
import { OperatorOutput } from './OperatorOutput.js'
import { ValueGetMode, NumberParameter, ListParameter } from '../Parameters/index'

import { sgFactory } from '../SGFactory.js'

/** Class representing a router operator.
 * @extends Operator
 */
class RouterOperator extends Operator {
  /**
   * Create a router operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)

    this.__inputParam = this.addParameter(new NumberParameter('Input'))
    this.__routesParam = this.addParameter(
      new ListParameter('Routes', NumberParameter)
    )
    this.__routesParam.elementAdded.connect(value => {
      value.setValue(1.0)
      this.addOutput(new OperatorOutput('Output'))
    })
    this.__routesParam.elementRemoved.connect((value, index) => {
      this.removeOutput(this.getOutputByIndex(index))
    })
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const input = this.__inputParam.getValue(ValueGetMode.OPERATOR_GETVALUE)
    const routes = this.__routesParam.getValue()
    let i = this.__outputs.length
    while (i--) {
      const output = this.__outputs[i]
      output.setValue(
        input * routes[i].getValue(ValueGetMode.OPERATOR_GETVALUE)
      )
    }
    this.postEval.emit(input)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return super.toJSON(context, flags)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
  }
}

sgFactory.registerClass('RouterOperator', RouterOperator)

export { RouterOperator }
