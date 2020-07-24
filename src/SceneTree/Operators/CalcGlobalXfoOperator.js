import { Operator } from './Operator.js'
import { OperatorInput } from './OperatorInput.js'
import { OperatorOutput } from './OperatorOutput.js'

/** The operator the calculates the global Xfo of a TreeItem based on its parents GlobalXfo and its own LocalXfo
 * @extends Operator
 * @private
 */
class CalcGlobalXfoOperator extends Operator {
  /**
   * Create a CalcGlobalXfoOperator operator.
   * @param {string} name - The name value.
   */
  constructor(globalXfoParam, localXfoParam) {
    super("CalcGlobalXfoOperator")
    this.addInput(new OperatorInput('ParentGlobal'))
    this.addInput(new OperatorInput('LocalXfo')).setParam(localXfoParam)
    this.addOutput(new OperatorOutput('GlobalXfo')).setParam(globalXfoParam)
  }

  /**
   * The setValue method.
   * @param {Xfo} value - the new value being set on the GlobalXfo
   */
  setValue(value) {
    const localXfoParam = this.getInput('LocalXfo').getParam()
    const parentGlobalInput = this.getInput('ParentGlobal')
    if (parentGlobalInput.isConnected()) {
      const parentGlobalXfo = parentGlobalInput.getValue()
      localXfoParam.setValue(parentGlobalXfo.inverse().multiply(value))
    } else {
      localXfoParam.setValue(value)
    }
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const localXfo = this.getInput('LocalXfo').getValue()
    const parentGlobalInput = this.getInput('ParentGlobal')
    const globalXfoOutput = this.getOutput('GlobalXfo')
    if (parentGlobalInput.isConnected()) {
      const parentGlobalXfo = parentGlobalInput.getValue()
      globalXfoOutput.setClean(parentGlobalXfo.multiply(localXfo), this)
    } else {
      globalXfoOutput.setClean(localXfo, this)
    }
  }
}

// sgFactory.registerClass('CalcGlobalXfoOperator', CalcGlobalXfoOperator)

export { CalcGlobalXfoOperator }

