import { Signal } from '../../Utilities/index'
import { ValueSetMode, ValueGetMode } from '../Parameters/index'
import { sgFactory } from '../SGFactory'

/** Class representing an operator output. */
class OperatorOutput {
  /**
   * Create an operator output.
   * @param {string} name - The name value.
   * @param {any} filterFn - The filterFn value.
   */
  constructor(name, filterFn) {
    this.__name = name
    this.__filterFn = filterFn
    this._param = undefined
    this.detached = false

    this.paramSet = new Signal()
  }

  /**
   * The getName method.
   * @return {any} - The return value.
   */
  getName() {
    return this.__name
  }

  /**
   * The getFilterFn method.
   * @return {any} - The return value.
   */
  getFilterFn() {
    return this.__filterFn
  }

  /**
   * The isConnected method.
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
   * The setParam method.
   * @param {any} param - The param value.
   */
  setParam(param) {
    this._param = param
    this.paramSet.emit()
  }

  /**
   * The getValue method.
   * @param {boolean} mode - The mode param.
   * @return {any} - The return value.
   */
  getValue(mode = ValueGetMode.OPERATOR_GETVALUE) {
    if (this._param) return this._param.getValue(mode)
  }

  /**
   * The setValue method.
   * Note: Sometimes outputs are used in places like statemachines,
   * where we would want the change to cause an event.
   * @param {any} value - The value param.
   * @param {boolean} mode - The mode value.
   */
  setValue(value, mode = ValueSetMode.OPERATOR_SETVALUE) {
    if (this._param) {
      this._param.setValue(value, mode)
    }
  }

  /**
   * The setClean method.
   * @param {any} value - The value param.
   */
  setClean(value) {
    if (this._param) {
      this._param.setClean(value)
    }
  }

  /**
   * The setDirty method.
   * @param {any} fn - The fn value.
   */
  setDirty(fn) {
    if (this._param) {
      this._param.setDirty(fn)
    }
  }
  setDirtyFromOp() {
    if (this._param) {
      this._param.setDirtyFromOp()
    }
  }

  /**
   * The removeCleanerFn method.
   * @param {any} fn - The fn value.
   */
  removeCleanerFn(fn) {
    if (this._param) this._param.removeCleanerFn(fn)
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
    const paramPath = this._param ? this._param.getPath() : ''
    return {
      type: this.constructor.name,
      paramPath:
        context && context.makeRelative
          ? context.makeRelative(paramPath)
          : paramPath,
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
        param => {
          this.setParam(param)
        },
        reason => {
          console.warn(
            "Operator Output: '" +
              this.getName() +
              "'. Unable to load item:" +
              j.paramPath
          )
        }
      )
    }
  }

  /**
   * The detach method.
   */
  detach() {
    // This function is called when we want to suspend an operator
    // from functioning because it is deleted and on the undo stack.
    // Once operators have persistent connections,
    // we will simply uninstall the output from the parameter.
    this.detached = true
  }

  /**
   * The reattach method.
   */
  reattach() {
    this.detached = false
  }
}
sgFactory.registerClass('OperatorOutput', OperatorOutput)

/** Class representing an Xfo operator output.
 * @extends OperatorOutput
 */
class XfoOperatorOutput extends OperatorOutput {
  /**
   * Create an Xfo operator output.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name, p => p.getDataType() == 'Xfo')
  }

  /**
   * The getInitialValue method.
   * @return {any} - The return value.
   */
  getInitialValue() {
    return this._initialParamValue
  }

  /**
   * The setParam method.
   * @param {any} param - The param value.
   */
  setParam(param) {
    // Note: sometimes the param value is changed after binding.
    // e.g. The group Xfo is updated after the operator
    // that binds to it is loaded. It could also change if a user
    // Is adding items to the group using the UI. Therefore, the
    // initial Xfo needs to be updated.
    const init = () => {
      this._initialParamValue = param.getValue()
      if (this._initialParamValue.clone)
        this._initialParamValue = this._initialParamValue.clone()

      if (this._initialParamValue == undefined) throw new Error('WTF?')
    }
    init()
    // param.valueChanged.connect(mode => {
    //   if (
    //     mode == ValueSetMode.USER_SETVALUE ||
    //     mode == ValueSetMode.REMOTEUSER_SETVALUE ||
    //     mode == ValueSetMode.DATA_LOAD
    //   ) {
    //     init()
    //   }
    // })

    this._param = param
    this.paramSet.emit(param)
  }
}
sgFactory.registerClass('XfoOperatorOutput', XfoOperatorOutput)

export { OperatorOutput, XfoOperatorOutput }
