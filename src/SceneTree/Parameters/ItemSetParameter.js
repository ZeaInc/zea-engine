import { Parameter } from './Parameter.js'

/** Class representing an item set parameter.
 * @extends Parameter
 * @private
 */
class ItemSetParameter extends Parameter {
  /**
   * Create an item set parameter.
   * @param {string} name - The name of the item set parameter.
   * @param {any} filterFn - The filterFn value.
   */
  constructor(name, filterFn) {
    super(name, undefined, 'BaseItem')
    this.__items = new Set()
    this.__filterFn = filterFn // Note: the filter Fn indicates that users will edit the set.
  }

  /**
   * The setFilterFn method.
   * @param {any} filterFn - The filterFn value.
   */
  setFilterFn(filterFn) {
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
   * The getItem method.
   * @param {number} index - The index param.
   * @return {any} - The return value.
   */
  getItem(index) {
    return Array.from(this.__items)[index]
  }

  /**
   * The addItem method.
   * @param {any} item - The item value.
   * @param {boolean} emitValueChanged - The emit value.
   * @return {boolean} - The return value.
   */
  addItem(item, emitValueChanged = true) {
    if (this.__filterFn && !this.__filterFn(item)) {
      console.warn('ItemSet __filterFn rejecting item:', item.getPath())
      return false
    }
    this.__items.add(item)
    const index = Array.from(this.__items).indexOf(item)
    this.emit('itemAdded', { item, index })
    if (emitValueChanged) this.emit('valueChanged', {})
    return index
  }

  /**
   * The addItems method.
   * @param {any} items - The index value.
   * @param {boolean} emit - The emit value.
   */
  addItems(items, emitValueChanged = true) {
    items.forEach((item) => this.addItem(item, false))
    if (emitValueChanged) this.emit('valueChanged', {})
  }

  /**
   * The removeItem method.
   * @param {any} index - The index value.
   * @param {boolean} emitValueChanged - The emit param.
   * @return {any} - The return value.
   */
  removeItem(index, emitValueChanged = true) {
    const item = Array.from(this.__items)[index]
    this.__items.delete(item)
    this.emit('itemRemoved', { item, index })
    if (emitValueChanged) this.emit('valueChanged', {})
    return item
  }

  /**
   * The setItems method.
   * @param {any} items - The item param.
   * @param {boolean} emit - The emit param.
   */
  setItems(items, emit = true) {
    for (let i = this.__items.length - 1; i >= 0; i--) {
      const item = this.__items[i]
      if (!items.has(item)) {
        this.removeItem(item, false)
      }
    }
    for (const item of items) {
      if (!this.__items.has(item)) {
        this.addItem(item, false)
      }
    }
    if (emit) this.emit('valueChanged', {})
  }

  /**
   * The clearItems method.
   * @param {boolean} emit - The emit value.
   */
  clearItems(emitValueChanged = true) {
    this.__items.clear()
    if (emitValueChanged) this.emit('valueChanged', {})
  }

  /**
   * The getNumItems method.
   * @return {any} - The return value.
   */
  getNumItems() {
    return Array.from(this.__items).length
  }

  /**
   * The getValue method.
   * @return {any} - The return value.
   */
  getValue() {
    return this.__items
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {any} - The return value.
   */
  toJSON(context, flags) {
    return {}
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {}

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a item set new parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {ItemSetParameter} - Returns a new item set parameter.
   */
  clone(flags) {
    const clonedParam = new ItemSetParameter(this.__name, this.__filterFn)
    return clonedParam
  }
}

export { ItemSetParameter }
