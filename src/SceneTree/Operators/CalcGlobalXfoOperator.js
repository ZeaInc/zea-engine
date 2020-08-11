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
    super('CalcGlobalXfoOperator')
    this.addInput(new OperatorInput('ParentGlobal'))
    this.addInput(new OperatorInput('LocalXfo')).setParam(localXfoParam)
    this.addOutput(new OperatorOutput('GlobalXfo')).setParam(globalXfoParam)
  }

  /**
   * The backPropagateValue method inverts the mathematics of the 'evaluate'
   * method so it can propagate the value backwards to its inputs.
   * @param {Xfo} value - the new value being set on the output GlobalXfo
   */
  backPropagateValue(value) {
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
   * The evaluate method calculates a new global Xfo based on the parents Global Xfo,
   * and the local Xfo value.
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

// Registry.register('CalcGlobalXfoOperator', CalcGlobalXfoOperator)

export { CalcGlobalXfoOperator }
