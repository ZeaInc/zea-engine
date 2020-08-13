import Registry from '../../Registry'
import { BaseItem } from '../BaseItem.js'
import { OperatorInput } from './OperatorInput'
import { OperatorOutput } from './OperatorOutput'

/**
 * Class representing an operator.
 *
 * @extends BaseItem
 */
class Operator extends BaseItem {
  /**
   * Create an operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.__inputs = new Map()
    this.__outputs = new Map()
  }

  /**
   * This method sets the state of the operator to dirty which propagates
   * to the outputs of this operator, and which may then propagate to other
   * operators. When the scene is cleaned, which usually is caused by rendering
   * then the chain of operators are cleaned by triggering evaluation.
   * @private
   */
  setDirty() {
    this.__outputs.forEach((output) => output.setDirty())
  }

  /**
   * This method can be overridden in derived classes
   * to perform general updates (see GLPass or BaseItem).
   *
   * @param {object} event
   * @private
   */
  __parameterValueChanged(event) {
    super.__parameterValueChanged(event)
    this.setDirty()
  }

  /**
   * The addInput method.
   * @param {string|OperatorInput} input - The name of the input, or the input object
   * @return {array} - The return value.
   */
  addInput(input) {
    if (typeof input == 'string') input = new OperatorInput(input)
    input.setOperator(this)
    this.__inputs.set(input.getName(), input)
    this.setDirty()
    return input
  }

  /**
   * The removeInput method.
   * @param {string|OperatorInput} input - The name of the input, or the input object
   */
  removeInput(input) {
    if (typeof input == 'string') input = this.getInput(input)
    if (!(input instanceof OperatorInput)) {
      throw new Error('Invalid parameter for removeInput:', input)
    }
    if (input.getParam()) input.setParam(null)
    this.__inputs.delete(input.getName())
  }

  /**
   * Getter for the number of inputs in this operator.
   * @return {number} - Returns the number of inputs.
   */
  getNumInputs() {
    return this.__inputs.size
  }

  /**
   * The getInputByIndex method.
   * @param {number} index - The index value.
   * @return {object} - The return value.
   */
  getInputByIndex(index) {
    return Array.from(this.__inputs.values())[index]
  }

  /**
   * The getInput method.
   * @param {string} name - The name value.
   * @return {OperatorInput} - The return value.
   */
  getInput(name) {
    return this.__inputs.get(name)
  }

  /**
   * The addOutput method.
   * @param {string|OperatorOutput} output - The name of the output, or the output object
   * @return {array} - The return value.
   */
  addOutput(output) {
    if (typeof output == 'string') output = new OperatorOutput(output)
    output.setOperator(this)
    if (this.getOutput(output.getName())) throw new Error(`Operator output already exists ${output.getName()}`)
    this.__outputs.set(output.getName(), output)
    this.setDirty()
    return output
  }

  /**
   * The removeOutput method.
   * @param {string|OperatorOutput} output - The name of the output, or the output object
   */
  removeOutput(output) {
    if (typeof output == 'string') output = this.getOutput(output)
    if (!(output instanceof OperatorOutput)) {
      throw new Error('Invalid parameter for removeOutput:', output)
    }
    if (output.getParam()) output.setParam(null)
    this.__outputs.delete(output.getName())
  }

  /**
   * Getter for the number of outputs in this operator.
   * @return {number} - Returns the number of outputs.
   */
  getNumOutputs() {
    return this.__outputs.size
  }

  /**
   * The getOutputByIndex method.
   * @param {number} index - The index value.
   * @return {object} - The return value.
   */
  getOutputByIndex(index) {
    return Array.from(this.__outputs.values())[index]
  }

  /**
   * The getOutput method.
   * @param {string} name - The name value.
   * @return {OperatorOutput} - The return value.
   */
  getOutput(name) {
    return this.__outputs.get(name)
  }

  /**
   * The evaluate method.
   * Computes the values of each of the outputs based on the values of the inputs
   * and the values of outputs with mode OP_READ_WRITE.
   * This method must be implemented by all Operators.
   */
  evaluate() {
    throw new Error('Not yet implemented')
  }

  /**
   * When the value on a Parameter is modified by a user by calling 'setValue,
   * then if any operators are bound, the value of the Parameter cannot be modified
   * directly as it is the result of a computation. Instead, the Parameter calls
   * 'backPropagateValue' on the Operator to cause the Operator to handle propagating
   * the value to one or more of its inputs.
   * to its inputs.
   * @param {any} value - The value param.
   * @return {any} - The modified value.
   */
  backPropagateValue(value) {
    // TODO: Implement me for custom manipulations.
    return value
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    j.type = Registry.getBlueprintName(this)

    const inputs = []
    this.__inputs.forEach((input) => {
      inputs.push(input.toJSON(context))
    })
    j.inputs = inputs

    const outputs = []
    this.__outputs.forEach((output) => {
      outputs.push(output.toJSON(context))
    })
    j.outputs = outputs
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)

    if (j.inputs) {
      j.inputs.forEach((inputJson, index) => {
        let input
        if (inputJson.name) {
          input = this.getInput(inputJson.name)
          if (!input) {
            input = this.addInput(inputJson.name)
          }
        } else {
          input = this.getInputByIndex(index)
        }
        input.fromJSON(inputJson, context)
      })
    }
    if (j.outputs) {
      j.outputs.forEach((outputJson, index) => {
        let output
        if (outputJson.name) {
          output = this.getOutput(outputJson.name)
          if (!output) {
            output = this.addOutput(outputJson.name)
          }
        } else {
          output = this.getOutputByIndex(index)
        }
        output.fromJSON(outputJson, context)
      })
    }
  }

  /**
   * The detach method.
   */
  detach() {
    this.__inputs.forEach((input) => input.detach())
    this.__outputs.forEach((output) => output.detach())
  }

  /**
   * The reattach method.
   */
  reattach() {
    this.__inputs.forEach((input) => input.reattach())
    this.__outputs.forEach((output) => output.reattach())
  }

  /**
   * The rebind method.
   */
  rebind() {
    this.__outputs.forEach((output) => output.rebind())
  }
}

export { Operator }
