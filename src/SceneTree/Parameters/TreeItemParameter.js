import { Signal } from '../../Utilities/index'
import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js'

/** Class representing a tree item parameter.
 * @extends Parameter
 */
class TreeItemParameter extends Parameter {
  /**
   * Create a tree item parameter.
   * @param {string} name - The name of the tree item parameter.
   * @param {any} filterFn - The filterFn value.
   */
  constructor(name, filterFn = undefined) {
    super(name, undefined, 'TreeItem')
    this.__filterFn = filterFn
    this.treeItemGlobalXfoChanged = new Signal()
  }

  /**
   * The setOwner method.
   * @param {any} owner - The owner value.
   */
  setOwner(owner) {
    this.__owner = owner
  }

  /**
   * The getOwner method.
   * @return {any} - The return value.
   */
  getOwner() {
    return this.__owner
  }

  /**
   * The setFilterFn method.
   * @param {any} flterFn - The flterFn value.
   */
  setFilterFn() {
    this.__filterFn = filterFn
  }

  /**
   * The getFilterFn method.
   * @return {any} - The return value.
   */
  getFilterFn() {
    return this.__filterFn
  }

  /**
   * The setValue method.
   * @param {any} treeItem - The treeItem value.
   * @param {number} mode - The mode value.
   * @return {boolean} - The return value.
   */
  setValue(treeItem, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
    if (this.__filterFn && !this.__filterFn(treeItem)) return false
    if (this.__value !== treeItem) {
      if (this.__value) {
        this.__value.globalXfoChanged.disconnect(
          this.treeItemGlobalXfoChanged.emit
        )
      }
      this.__value = treeItem
      if (this.__value) {
        this.__value.globalXfoChanged.connect(
          this.treeItemGlobalXfoChanged.emit
        )
      }
      if (
        mode == ValueSetMode.USER_SETVALUE ||
        mode == ValueSetMode.REMOTEUSER_SETVALUE
      ) {
        this.__flags |= ParamFlags.USER_EDITED
      }
      this.valueChanged.emit(mode)
    }
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
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return
    return {
      value: context.makeRelative(this.__value.getPath()),
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }
    context.resolvePath(
      j.value,
      treeItem => {
        this.setValue(treeItem)
      },
      () => {
        console.warn(
          'Unable to resolve tree item parameter value:' + pj.paramPath
        )
      }
    )
    this.__flags |= ParamFlags.USER_EDITED
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new tree item parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {TreeItemParameter} - Returns a new tree item parameter.
   */
  clone(flags) {
    const clonedParam = new TreeItemParameter(this.__name, this.__filterFn)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    if (this.__value) {
      this.__value.parameterValueChanged.disconnect(
        this.valueParameterValueChanged.emit
      )
    }
  }
}

export { TreeItemParameter /* ,
  TreeItemListParameter */ }
