import { EventEmitter } from '../../Utilities/EventEmitter.js'
import { sgFactory } from '../SGFactory.js'

// Note: In some cases we want the parameter to emit a notification
// and cause the update of the scene during evaluation (like statemachine updates).
// But we also don't want the parameter value to then
// be considered modified so it is saved to the JSON file. I'm not sure how to address this.
// We need to check what happens if a parameter emits a 'valueChanged' during cleaning (maybe it gets ignored).
const ValueSetMode = {
  USER_SETVALUE: 0 /* A value has being modified by a local user. emit events and set user edited flag */,
  REMOTEUSER_SETVALUE: 1 /* A value has being modified by a remote user. emit events and set user edited flag. may not trigger file save. */,
  USER_SETVALUE_DONE: 2 /* A value has finished being interactively set */,
  OPERATOR_SETVALUE: 3 /* No events*/,
  OPERATOR_DIRTIED: 4 /* Emitted when the param is dirtied. Generate events, but don't flag the parameter as user edited*/,
  COMPUTED_VALUE: 4 /* Generate events, but don't flag the parameter as user edited*/,
  GENERATED_VALUE: 4 /* Generate events, but don't flag the parameter as user edited*/,
  DATA_LOAD: 4 /* Generate events, but don't flag the parameter as user edited*/,
}
const ParamFlags = {
  USER_EDITED: 1 << 1,
  DISABLED: 1 << 2,
}

const OperatorOutputMode = {
  OP_WRITE: 0,
  OP_READ_WRITE: 1,
}


/**
 * Represents a reactive type of attribute that can be owned by a `ParameterOwner` class.
 *
 * **Events**
 * * **nameChanged:** Triggered when the name of the parameter changes.
 * * **valueChanged:** Triggered when the value of the parameter changes.
 */
class Parameter extends EventEmitter {
  /**
   * Create a base parameter.
   * @param {string} name - The name of the base parameter.
   */
  constructor(name, value, dataType) {
    super(name)
  
    this.__name = name
    this.__value = value
    this.__dataType = dataType ? dataType : undefined
    this.__boundOps = []
    this.__dirtyOpIndex = this.__boundOps.length
    this.__flags = 0

    this.getName = this.getName.bind(this)
    this.setName = this.setName.bind(this)
    this.getValue = this.getValue.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  /**
   * The clone method.
   * @param {number} flags - The flags value.
   */
  clone(flags) {
    const cloneded = new Parameter(this.__name, this.__value, this.__dataType)
    return cloneded
  }

  /**
   * Returns specified name of the parameter.
   *
   * @return {string} - Returns the name.
   */
  getName() {
    return this.__name
  }

  /**
   * Sets the name of the current parameter.
   *
   * @param {string} name - The base parameter name.
   * @return {Parameter} - The instance itself.
   */
  setName(name) {
    if (name === this.__name) {
      return this
    }

    const prevName = this.__name
    this.__name = name
    this.emit('nameChanged', { newName: this.__name, prevName })
  }

  /**
   * Returns the owner item of the current parameter.
   *
   * @return {ParameterOwner} - The return value.
   */
  getOwner() {
    return this.ownerItem
  }

  /**
   * Sets the owner item of the current parameter.
   *
   * @param {ParameterOwner} ownerItem - The ownerItem value.
   */
  setOwner(ownerItem) {
    this.ownerItem = ownerItem
  }

  /**
   * Returns the parameter's path as an array of strings.
   * Includes owner's path in case it is owned by a `ParameterOwner`.
   *
   * @return {array} - The return value.
   */
  getPath() {
    if (this.ownerItem && this.ownerItem.getName) {
      return [...this.ownerItem.getPath(), this.__name]
    } else {
      return [this.__name]
    }
  }

  /**
   * Returns parameter's data type.
   *
   * @return {string} - The return value.
   */
  getDataType() {
    return this.__dataType
  }

  /**
   * The setFlag method.
   * @private
   * @param {number} flag - The flag value.
   */
  setFlag(flag) {
    this.__flags |= flag
  }

  /**
   * The clearFlag method.
   * @private
   * @param {number} flag - The flag value.
   */
  clearFlag(flag) {
    this.__flags &= ~flag
  }

  /**
   * Returns true if the flag if set, otherwise returns false.
   *
   * @private
   * @param {number} flag - The flag to test.
   * @return {boolean} - Returns a boolean indicating if the flag is set.
   */
  testFlag(flag) {
    return (this.__flags & flag) != 0
  }

  // ////////////////////////////////////////////////
  // Operator bindings

  /**
   * Binds an OperatorOutput to this parameter. 
   *
   * @param {OperatorOutput} operatorOutput - The output that we are unbinding from the Parameter
   * @param {number} index - The index(optional) that the output is being bound at.
   * @return {number} - The index of the bound output.
   */
  bindOperatorOutput(operatorOutput, index = -1) {
    if (index == -1) index = this.__boundOps.length
    this.__boundOps.splice(index, 0, operatorOutput)
    // Update the remaining binding indices
    for (let i = index; i < this.__boundOps.length; i++) {
      this.__boundOps[i].setParamBindIndex(i)
    }
    this.__dirtyOpIndex = 0
    this.emit('valueChanged', { mode: 0 })
    return index
  }

  /**
   * The unbindOperator method.
   *
   * @param {OperatorOutput} operatorOutput - The output that we are unbinding from the Parameter
   * @return {boolean} - The return value.
   */
  unbindOperator(operatorOutput) {
    const index = operatorOutput.getParamBindIndex()
    this.__boundOps.splice(index, 1)
    // Update the remaining binding indices
    for (let i = index; i < this.__boundOps.length; i++) {
      this.__boundOps[i].setParamBindIndex(i)
    }
    this.__dirtyOpIndex = 0
    this.emit('valueChanged', { mode: 0 })
    return index
  }

  /**
   * The setDirty method dirties this Parameter so subsequent calls to getValue will cause an evaluation of its bound operators.
   * @param {OperatorOutput} operatorOutput - The cleanerFn value.
   * @return {boolean} true if the Parameter was made dirty, else false if it was already dirty.
   */
  setDirty(operatorOutput) {
    // Determine the first operator in the stack that must evaluate
    // to clean the parameter.
    let dirtyId = Math.min(this.__dirtyOpIndex, operatorOutput.getParamBindIndex())
    for (; ; dirtyId--) {
      if (dirtyId == 0 || this.__boundOps[dirtyId].getMode() == OperatorOutputMode.OP_WRITE) break
    }

    // console.log("setDirtyFromOp:", this.getPath(), dirtyId, this.__dirtyOpIndex)
    if (dirtyId != this.__dirtyOpIndex) {
      this.__dirtyOpIndex = dirtyId
      this.emit('valueChanged', { mode: 0 })
      return true
    }
    return false
  }

  /**
   * Returns true if this parameter is currently dirty and will evaluate its bound
   * operators if its value is requested by a call to getValue.
   *
   * @return {boolean} - Returns a boolean.
   */
  isDirty() {
    return this.__dirtyOpIndex < this.__boundOps.length
  }

  /**
   * The setCleanFromOp method.
   * @param {any} value - The computed value to be stored in the Parameter.
   * @param {OperatorOutput} operatorOutput - The source output on the operator that is setting the value.
   * @param {number} index - The index of the bound OperatorOutput.
   */
  setCleanFromOp(value, operatorOutput, index) {
    if (index < this.__dirtyOpIndex) {
      // We see this message when parameters are evaluated as soon as a change is detected instead of 
      // in batches. Now that all rendering code is pulling data only during the render cycle, we ara
      // not seeing it anymore. However, maybe with a UI open, it will start emitting this warning. 
      // Note: this would be caused, if a Parameter is already cleaned by an Operator, and yet the Operator
      // is re-evaluating. I am not sure how this can occur.
      const op = operatorOutput.getOperator()
      console.warn(`Operator:: ${op.constructor.name} with name: ${op.getName()} is being cleaned immediately, instead of lazily.`)
    }
    if (index > this.__dirtyOpIndex + 1) {
      const op = operatorOutput.getOperator()
      throw(`Parameter: ${this.constructor.name} with name: ${this.getName()} is not cleaning all outputs during evaluation of op:: ${op.constructor.name} with name: ${op.getName()}`)
    }
    this.__value = value

    // As each operator writes its value, the dirty value is incremented
    this.__dirtyOpIndex = index + 1
  }

  /**
   * During operator evaluation, operators can use this method to retrieve the existing
   * value of one of their outputs.
   * @param {number} index - The index of the bound OperatorOutput to evaluate up to.
   * @return {object|string|number|any} - The return value.
   */
  getValueFromOp(index) {
    // Note: during evaluation of an Operator that writes to multiple outputs,
    // it can write to an output with an IO setting, which means it retrieves
    // the previous value while calculating the next.
    if (this.__dirtyOpIndex < index) {
      this._clean(index)
    }
    return this.__value
  }

  /**
   * Cleans the parameter up tp the index of the specified index of the bound OperatorOutput
   * @param {number} index - The index of the bound OperatorOutput to evaluate up to.
   */
  _clean(index) {
    // if (this.__boundOps.length > 1) {
    //   console.log(this.getPath())
    // }
    // to clean te parameter, we need to start from the first bound op
    // that needs to be evaluated, and go down the stack from there.
    // for (; this.__dirtyOpIndex < index; this.__dirtyOpIndex++) {
    while (this.__dirtyOpIndex < index) {
      const operatorOutput = this.__boundOps[this.__dirtyOpIndex]
      // The op can get the current value and modify it in place
      // and set the output to clean.
      operatorOutput.getOperator().evaluate()
    }

    if (this.__dirtyOpIndex < index) {
      const op = this.__boundOps[this.__dirtyOpIndex].getOperator()
      throw(`Operator: ${op.constructor.name} with name: ${op.getName()} is not cleaning its outputs during evaluation`)
    }
  }

  /**
   * Returns parameter's value.
   *
   * @param {number} mode - The mode value.
   * @return {object|string|number|any} - The return value.
   */
  getValue(mode) {
    if (mode != undefined) {
      console.warn("WARNING in Parameter.setValue: 'mode' is deprecated.")
    }
    if (this.__dirtyOpIndex < this.__boundOps.length) {
      this._clean(this.__boundOps.length)
    }
    return this.__value
  }

  /**
   * Sets parameter's value, but runs a few internal cleaning processes.
   *
   * @param {object|string|number|any} value - The value param.
   */
  setValue(value, mode) {
    if (value == undefined) {
      // eslint-disable-next-line no-throw-literal
      throw 'undefined was passed into the set value for param:' + this.getName()
    }
    if (mode != undefined) {
      console.warn("WARNING in Parameter.setValue: 'mode' is deprecated.")
    }

    if (this.__boundOps.length > 0) {
      for (let i = this.__boundOps.length - 1; i >= 0; i--) {
        const operatorOutput = this.__boundOps[i]
        value = operatorOutput.setValue(value)
        if (operatorOutput.getMode() == 0/*OP_WRITE*/) return;
      }
    }

    if (!value.fromJSON) {
      // Note: equality tests on anything but simple values is going to be super expenseive.
      if (this.__value == value) return
    }
    this.__value = value

    // Note: only users call 'setValue'. Operators call 'setCleanFromOp'
    if (this.__flags & ParamFlags.USER_EDITED) this.setFlag(ParamFlags.USER_EDITED)
    this.emit('valueChanged', { mode: ParamFlags.USER_EDITED })
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The loadValue is used to change the value of a parameter, without triggering a 
   * valueChanges, or setting the USER_EDITED state.
   *
   * @param {any} value - The context value.
   */
  loadValue(value) {
    this.__value = value
  }

  /**
   * The toJSON method serializes this instance as a JSON.
   * It can be used for persistence, data transfer, etc.
   *
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    if (this.__value.toJSON) return { value: this.__value.toJSON(context, flags) }
    else return { value: this.__value }
  }

  /**
   * The fromJSON method takes a JSON and deserializes into an instance of this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }
    // Since JSON data is only used to store user edits,
    // parameters loaded from JSON are considered user edited.
    this.setFlag(ParamFlags.USER_EDITED)

    if (j.value.type && this.__value == undefined) {
      this.__value = sgFactory.constructClass(j.value.type)
    }
    if (this.__value == undefined || !this.__value.fromJSON) {
      this.__value = j.value
    } else {
      this.__value.fromJSON(j.value, context)
    }
    this.emit('valueChanged', { mode: 0 })
  }

  /**
   * The readBinary method.
   *
   * @private
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    console.warn('@todo-review')
    console.error('TODO')
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new parameter, copies its values
   * from this parameter and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Parameter} - Returns a new cloned parameter.
   */
  clone(flags) {
    const clonedValue = this.__value
    if (clonedValue.clone) clonedValue = clonedValue.clone()
    const clonedParam = new Parameter(this.__name, clonedValue, this.__dataType)
    return clonedParam
  }
}

export { ParamFlags, ValueSetMode, OperatorOutputMode, Parameter }
