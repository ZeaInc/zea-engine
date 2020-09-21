import { EventEmitter } from '../../Utilities/EventEmitter.js'
import { Registry } from '../../Registry'

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
   * When initializing a new parameter, the passed in value could be anything.
   * If it is a new type of value, just ensure you register it in the `Registry`.
   *
   * How to use it:
   *
   * ```javascript
   *  // Creating a parameter object
   *  const param = new Parameter('Title', 'Awesome Parameter Value', 'String')
   *
   *   // Capturing events
   *  param.on('valueChanged', (...params) => console.log('Value changed!'))
   *
   *  // Changing parameter's value will cause `valueChanged` event to trigger.
   *  param.setValue('A New Awesome Parameter Value')
   *  // As result the console log code will execute: Value Changed!
   * ```
   *
   * @param {string} name - The name of the parameter.
   * @param {object|string|number|any} value - The value of the parameter.
   * @param {string} dataType - The data type of the parameter.
   */
  constructor(name, value, dataType) {
    super(name)

    this.__name = name
    this.__value = value
    this.__dataType = dataType ? dataType : undefined
    this.__boundOps = []
    this.__dirtyOpIndex = 0
    this.__cleaning = false

    this.getName = this.getName.bind(this)
    this.setName = this.setName.bind(this)
    this.getValue = this.getValue.bind(this)
    this.setValue = this.setValue.bind(this)
  }

  /**
   * Copies and returns the exact clone of current parameter
   *
   * @return {Parameter} - Clone of current parameter
   */
  clone() {
    const clonedParameter = new Parameter(this.__name, this.__value, this.__dataType)
    return clonedParameter
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
    // If we weren't already dirty, make sure to emit a 'valueChanged' anyway.
    if (!this.setDirty(index)) this.emit('valueChanged', { mode: 0 })
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
    this.setDirty(Math.max(0, index - 1))
    return index
  }

  /**
   * Dirties this Parameter so subsequent calls to `getValue` will cause an evaluation of its bound operators.
   *
   * @param {number} index - Index of the operator
   * @return {boolean} - `true` if the Parameter was made dirty, else `false` if it was already dirty.
   */
  setDirty(index) {
    // Determine the first operator in the stack that must evaluate to clean the parameter.
    if (index < this.__dirtyOpIndex) {
      // Walk back down the stack and dirty each of the other bound operators.
      // If we must dirty all operators in the stack from the last OP_WRITE to the end.
      // Note: If a setDirty call comes from an op that precedes an OP_WRITE operator, we
      // can safely discard it, as its output will have no effect on the value of this parameter.
      let newDirtyIndex = this.__dirtyOpIndex
      for (newDirtyIndex--; newDirtyIndex > 0; newDirtyIndex--) {
        // Find the first OP_WRITE binding. (Note: we could cache this)
        if (this.__boundOps[newDirtyIndex].getMode() == OperatorOutputMode.OP_WRITE) break
      }
      if (newDirtyIndex <= index) {
        this.__dirtyOpIndex = newDirtyIndex
        for (newDirtyIndex++; newDirtyIndex < this.__boundOps.length; newDirtyIndex++) {
          // Dirty all the other bound ops from the OP_WRITE to the top of the stack.
          if (newDirtyIndex != index) {
            // This will cause the other outputs of the operator to become dirty.
            this.__boundOps[newDirtyIndex].getOperator().setDirty()
          }
        }
        this.emit('valueChanged', { mode: 0 })
        return true
      }
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
   * Returns the index of the first 'dirty' binding in the stack. This will be the index of the
   * first operator that will evaluate when the parameter needs to be cleaned.
   *
   * @return {number} - The index of the dirty binding in the binding stack.
   */
  getDirtyBindingIndex() {
    return this.__dirtyOpIndex
  }

  /**
   * The setCleanFromOp method.
   * @param {any} value - The computed value to be stored in the Parameter.
   * @param {number} index - The index of the bound OperatorOutput.
   */
  setCleanFromOp(value, index) {
    if (index != this.__dirtyOpIndex) {
      if (index < this.__dirtyOpIndex) {
        // This can happen when an operator in the following case.

        // ParamA [OpC, OpB, OpA]
        // ParamB [OpC, OpA]
        // When OpB dirties ParamA, and is evaluated, ParamB is considered clean because OpA was never dirtied

        // We see this message when parameters are evaluated as soon as a change is detected instead of
        // in batches. Now that all rendering code is pulling data only during the render cycle, we ara
        // not seeing it anymore. However, maybe with a UI open, it will start emitting this warning.
        // Note: this would be caused, if a Parameter is already cleaned by an Operator, and yet the Operator
        // is re-evaluating. I am not sure how this can occur.
        // const op = operatorOutput.getOperator()
        // console.log(
        //   `Operator:: ${
        //     op.constructor.name
        //   } with name: ${op.getName()} is being cleaned immediately, instead of lazily.`
        // )
        console.log(`Parameter is cleaned when it was already clean to that point in the stack:`, this.getPath())
      } else if (this.__boundOps[index].getMode() != OperatorOutputMode.OP_WRITE) {
        // A parameter can become dirty (so __dirtyOpIndex == 0), and then another operator bound on top.
        // if the next op is a WRITE op, then we can fast forward the dirty index.
        const thisClassName = Registry.getBlueprintName(this)
        const op = this.__boundOps[index].getOperator()
        const opClassName = Registry.getBlueprintName(op)
        throw new Error(
          `Parameter: ${thisClassName} with name: ${this.getName()} is not cleaning all outputs during evaluation of op: ${opClassName} with name: ${op.getName()}`
        )
      }
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
   *
   * @param {number} index - The index of the bound OperatorOutput to evaluate up to.
   */
  _clean(index) {
    if (this.__cleaning) {
      throw new Error(`Cycle detected when cleaning: ${this.getPath()}. Operators need to be rebound to fix errors`)
    }
    this.__cleaning = true

    while (this.__dirtyOpIndex < index) {
      const tmp = this.__dirtyOpIndex
      const operatorOutput = this.__boundOps[this.__dirtyOpIndex]
      // The op can get the current value and modify it in place
      // and set the output to clean.
      operatorOutput.getOperator().evaluate()

      if (tmp == this.__dirtyOpIndex) {
        // During initial configuration of an operator, cleaning outputs might be disabled.
        const op = this.__boundOps[this.__dirtyOpIndex].getOperator()
        const opClassName = Registry.getBlueprintName(op)
        console.warn(
          `Operator: ${opClassName} with name: ${op.getName()} is not cleaning its outputs during evaluation`
        )
        this.__dirtyOpIndex++
      }
    }

    this.__cleaning = false
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
   * Sets value of the parameter.
   *
   * @param {object|string|number|any} value - The value param.
   * @param {number} mode - This is deprecated now.
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
        value = operatorOutput.backPropagateValue(value)
        if (operatorOutput.getMode() == 0 /* OP_WRITE */) return
      }
    }

    if (!value.fromJSON) {
      // Note: equality tests on anything but simple values is going to be super expensive.
      if (this.__value == value) return
    }
    this.__value = value

    // Note: only users call 'setValue'. Operators call 'setCleanFromOp'
    this.emit('valueChanged', {})
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
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    if (this.__value.toJSON) return { value: this.__value.toJSON(context) }
    else return { value: this.__value }
  }

  /**
   * The fromJSON method takes a JSON and deserializes into an instance of this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }

    if (j.value.type && this.__value == undefined) {
      this.__value = Registry.constructClass(j.value.type)
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
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    console.warn(`TODO: Parameter: ${this.constructor.name} with name: ${this.__name} does not implement readBinary`)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {Parameter} - Returns a new cloned parameter.
   */
  clone() {
    const clonedValue = this.__value
    if (clonedValue.clone) clonedValue = clonedValue.clone()
    const clonedParam = new Parameter(this.__name, clonedValue, this.__dataType)
    return clonedParam
  }
}

export { OperatorOutputMode, Parameter }
