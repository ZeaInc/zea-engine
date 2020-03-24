import { Operator } from './Operator.js'
import { XfoOperatorOutput } from './OperatorOutput.js'
import { XfoParameter } from '../Parameters/index'
import { sgFactory } from '../SGFactory.js'

/** An operator for aiming items at targets.
 * @extends Operator
 */
class CalcGlobalXfoOperator extends Operator {
  /**
   * Create a gears operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.addParameter(new XfoParameter('ParentGlobal'))
    this.addParameter(new XfoParameter('LocalXfo'))
    this.addOutput(new XfoOperatorOutput('GlobalXfo'))
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const parentGlobalXfo = this.getParameter('ParentGlobal').getValue()
    const localXfo = this.getParameter('LocalXfo').getValue()
    this.getOutputByIndex(0).setClean(parentGlobalXfo.multiply(localXfo))
  }
}

sgFactory.registerClass('CalcGlobalXfoOperator', CalcGlobalXfoOperator)

export { CalcGlobalXfoOperator }
