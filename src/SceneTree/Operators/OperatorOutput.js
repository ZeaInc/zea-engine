import { OperatorOutputMode } from '../Parameters/Parameter'
import { EventEmitter } from '../../Utilities/EventEmitter'

/** Class representing an operator output.
 * @extends EventEmitter
 */
class OperatorOutput extends EventEmitter {
  /**
   * Create an operator output.
   * @param {string} name - The name value.
   * @param {OperatorOutputMode} operatorOutputMode - The mode which the OperatorOutput uses to bind to its target parameter.
   */
  constructor(name, operatorOutputMode = OperatorOutputMode.OP_WRITE) {
    super()
    this.__name = name
    this._mode = operatorOutputMode
    this._param = undefined
    this._paramBindIndex = -1
    this.detached = false
  }

  /**
   * Returns name of the output.
   * @return {string} - The name string.
   */
  getName() {
    return this.__name
  }

  /**
   * Sets operator that owns this output. Called by the operator when adding outputs
   * @param {Operator} op - The operator object.
   */
  setOperator(op) {
    this._op = op
  }

  /**
   * Returns operator that owns this output.
   * @return {Operator} - The operator object.
   */
  getOperator() {
    return this._op
  }

  /**
   * Returns mode that the output writes to be parameter. Must be a number from OperatorOutputMode
   * @return {OperatorOutputMode} - The mode value.
   */
  getMode() {
    return this._mode
  }

  /**
   * Returns true if this output is connected to a parameter.
   * @return {boolean} - The return value.
   */
  isConnected() {
    return this._param != undefined
  }

  /**
   * The getParam method.
   * @return {any} - The return value.
   */
  getParam() {
    return this._param
  }

  /**
   * Sets the Parameter for this out put to write to.
   * @param {Parameter} param - The param value.
   */
  setParam(param, index = -1) {
    if (this._param) {
      this._param.unbindOperator(this, index)
    }
    this._param = param
    if (this._param) {
      this._paramBindIndex = this._param.bindOperatorOutput(this, index)
    }
    this.emit('paramSet', { param: this._param })
  }

  /**
   * Returns the index of the binding on the parameter of this OperatorOutput
   * up to date.
   * @return {number} index - The index of the binding on the parameter.
   */
  getParamBindIndex() {
    return this._paramBindIndex
  }

  /**
   * If bindings change on a Parameter, it will call this method to ensure the output index is
   * up to date.
   * @param {number} index - The index of the binding on the parameter.
   */
  setParamBindIndex(index) {
    this._paramBindIndex = index
  }

  /**
   * Propagates dirty to the connected parameter.
   */
  setDirty() {
    if (this._param) {
      this._param.setDirty(this._paramBindIndex)
    }
  }

  /**
   * The getValue method.
   * @return {any} - The return value.
   */
  getValue() {
    if (this._param) {
      return this._param.getValueFromOp(this._paramBindIndex)
    } else {
      throw new Error('Cannot call getValue on OperatorOutput that is not connected:', this.__name)
    }
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
    if (this._param) {
      value = this._op.backPropagateValue(value, this)
    }
    return value
  }

  /**
   * The setClean method.
   * @param {any} value - The value param.
   */
  setClean(value) {
    if (this._param) {
      this._param.setCleanFromOp(value, this._paramBindIndex)
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const paramPath = this._param ? this._param.getPath() : ''
    return {
      name: this.__name,
      paramPath: context && context.makeRelative ? context.makeRelative(paramPath) : paramPath,
      paramBindIndex: this._paramBindIndex,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.paramPath) {
      // Note: the tree should have fully loaded by the time we are loading operators
      // even new items and groups should have been created. Operators and state machines
      // are loaded last.
      context.resolvePath(
        j.paramPath,
        (param) => {
          this.setParam(param, j.paramBindIndex)
        },
        (reason) => {
          console.warn("OperatorOutput: '" + this.getName() + "'. Unable to connect to:" + j.paramPath)
        }
      )
    }
  }

  /**
   * The detach method is called when an operator is being removed from the scene tree.
   * It removes all connections to parameters in the scene.
   */
  detach() {
    // This function is called when we want to suspend an operator
    // from functioning because it is deleted and on the undo stack.
    // Once operators have persistent connections,
    // we will simply uninstall the output from the parameter.
    this.detached = true
    this._paramBindIndex = this._param ? this._param.unbindOperator(this) : -1
  }

  /**
   * The reattach method can be called when re-instating an operator in the scene.
   */
  reattach() {
    this.detached = false
    if (this._param) {
      this._paramBindIndex = this._param.bindOperatorOutput(this, this._paramBindIndex)
    }
  }

  /**
   * The rebind rebinds the outputs to be at the top of the stack for its parameter.
   */
  rebind() {
    if (this._param) {
      this._param.unbindOperator(this)
      this._paramBindIndex = this._param.bindOperatorOutput(this)
    }
  }
}

export { OperatorOutput }
