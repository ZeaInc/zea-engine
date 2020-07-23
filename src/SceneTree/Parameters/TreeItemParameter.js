/* eslint-disable require-jsdoc */
import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that only stores `TreeItem` values.
 *
 * i.e.:
 * ```javascript
 * const treeItem = new TreeItem('tree1')
 * const treeItemParam = new TreeItemParameter('MyTreeItem', treeItem)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(treeItemParam)
 * ```
 *
 * **Events**
 * * **treeItemGlobalXfoChanged:** Triggered when computed world Xfo of parameter's `TreeItem` changes.
 * * **valueChanged:** Triggered when parameter's value changes.
 *
 * @extends Parameter
 */
class TreeItemParameter extends Parameter {
  /**
   * Create a tree item parameter.
   * @param {string} name - The name of the tree item parameter.
   * @param {function} filterFn - The filterFn value.
   */
  constructor(name, filterFn = undefined) {
    super(name, undefined, 'TreeItem')
    this.__filterFn = filterFn
    this.__emittreeItemGlobalXfoChanged = this.__emittreeItemGlobalXfoChanged.bind(this)
  }

  __emittreeItemGlobalXfoChanged(event) {
    this.emit('treeItemGlobalXfoChanged', event)
  }

  /**
   * Sets parameter value's owner `TreeItem`.
   *
   * @param {TreeItem} owner - The owner value.
   */
  setOwner(owner) {
    this.__owner = owner
  }

  /**
   * Returns parameter value's owner `TreeItem`.
   *
   * @return {TreeItem} - The return value.
   */
  getOwner() {
    return this.__owner
  }

  /**
   * The setFilterFn method.
   * @param {function} flterFn - The flterFn value.
   */
  setFilterFn() {
    this.__filterFn = filterFn
  }

  /**
   * The getFilterFn method.
   * @return {function} - The return value.
   */
  getFilterFn() {
    return this.__filterFn
  }

  /**
   * Sets parameter's `TreeItem` value.
   *
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {number} mode - The mode value.
   * @return {boolean} - The return value.
   */
  setValue(treeItem, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
    if (this.__filterFn && !this.__filterFn(treeItem)) return false
    if (this.__value !== treeItem) {
      if (this.__value) {
        this.__value.off('globalXfoChanged', this.__emittreeItemGlobalXfoChanged)
      }
      this.__value = treeItem
      if (this.__value) {
        this.__value.on('globalXfoChanged', this.__emittreeItemGlobalXfoChanged)
      }
      if (mode == ValueSetMode.USER_SETVALUE || mode == ValueSetMode.REMOTEUSER_SETVALUE) {
        this.__flags |= ParamFlags.USER_EDITED
      }
      this.emit('valueChanged', { mode })
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
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
    context.resolvePath(
      j.value,
      (treeItem) => {
        this.setValue(treeItem)
      },
      () => {
        console.warn('Unable to resolve tree item parameter value:' + pj.paramPath)
      }
    )
    this.__flags |= ParamFlags.USER_EDITED
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new tree item parameter, copies its values
   * from this parameter and returns it.
   *
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
      this.__value.off('globalXfoChanged', this.__emittreeItemGlobalXfoChanged)
    }
  }
}

export { TreeItemParameter /* ,
  TreeItemListParameter */ }
