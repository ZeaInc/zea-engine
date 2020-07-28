/** Class representing an operator input.
 */
class OperatorInput {
  /**
   * Create an operator input.
   * @param {string} name - The name value.
   */
  constructor(name) {
    this.__name = name
    this._param = undefined
    this._paramValueChanged = this._paramValueChanged.bind(this)
  }

  /**
   * The getName method.
   * @return {any} - The return value.
   */
  getName() {
    return this.__name
  }

  /**
   * Sets operator that owns this input. Called by the operator when adding inputs
   * @param {Operator} op - The operator object.
   */
  setOperator(op) {
    this._op = op
  }

  /**
   * Returns operator that owns this input.
   * @return {Operator} - The operator object.
   */
  getOperator() {
    return this._op
  }

  /**
   * Returns true if this input is connected to a parameter.
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
   * @private
   * The handler function for when the input paramter changes.
   * @param {object} event - The event object.
   */
  _paramValueChanged(event) {
    if (this._op) this._op.setDirty(this.__name)
  }

  /**
   * Assigns the Paramter to be used to provide the input value.
   * @param {Parameter} param - The param value.
   */
  setParam(param) {
    if (this._param) {
      this._param.off('valueChanged', this._paramValueChanged)
    }
    this._param = param
    if (this._param) {
      this._param.on('valueChanged', this._paramValueChanged)
    }
  }

  /**
   * The getValue method.
   * @return {any} - The return value.
   */
  getValue() {
    if (this._param) return this._param.getValue()
  }

  /**
   * The setValue method.
   * @param {any} value - The value param.
   */
  setValue(value) {
    if (this._param) {
      this._param.setValue(value)
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const paramPath = this._param ? this._param.getPath() : ''
    return {
      paramPath: context && context.makeRelative ? context.makeRelative(paramPath) : paramPath,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.paramPath) {
      // Note: the tree should have fully loaded by the time we are loading operators
      // even new items and groups should have been created. Operators and state machines
      // are loaded last.
      context.resolvePath(
        j.paramPath,
        (param) => {
          this.setParam(param)
        },
        (reason) => {
          console.warn("OperatorInput: '" + this.getName() + "'. Unable to connect to:" + j.paramPath)
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
    if (this._param) {
      this._param.off('valueChanged', this._paramValueChanged)
    }
  }

  /**
   * The reattach method can be called when re-instating an operator in the scene.
   */
  reattach() {
    this.detached = false
    if (this._param) {
      this._param.on('valueChanged', this._paramValueChanged)
    }
  }
}

export { OperatorInput }
