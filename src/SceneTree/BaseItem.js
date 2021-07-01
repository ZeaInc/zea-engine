/* eslint-disable no-unused-vars */
import { ParameterOwner } from './ParameterOwner.js'
import { BinReader } from './BinReader.js'
import { Registry } from '../Registry'

let numBaseItems = 0

/**
 * Base class for Items in the scene. It can be parameterized and can emit events.
 *
 * **Events**
 * * **nameChanged:** Emitted every time the Item's name is change. mostly in `setName` method.
 * * **selectedChanged:** Emitted `selected` status changes, mostly in `setSelected` method.
 *
 * @extends {ParameterOwner}
 */
class BaseItem extends ParameterOwner {
  /**
   * Create a base item by defining its name.
   *
   * @param {string} name - The name of the base item.
   */
  constructor(name) {
    super()
    this.__name = name ? name : ''
    this.__path = [this.__name]
    this.__ownerItem = undefined // TODO: will create a circular ref. Figure out and use weak refs

    // Note: one day we will remove the concept of 'selection' from the engine
    // and keep it only in UX. to Select an item, we will add it to the selection
    // in the selection manager. Then the selection group will apply a highlight.
    this.__selectable = true
    this.__selected = false

    this.__metaData = {}

    numBaseItems++
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * The getNumBaseItems method returns the total number of base items created.
   * This method is used in debugging memory consumption.
   *
   * @return {number} - Returns the total number of base items created.
   */
  static getNumBaseItems() {
    return numBaseItems
  }

  // ////////////////////////////////////////
  // Name and Path

  /**
   * Returns the name of the base item.
   *
   * @return {string} - Returns the base item name.
   */
  getName() {
    return this.__name
  }

  /**
   * Sets the name of the base item(Updates path).
   *
   * @emits `nameChanged` with `newName` and `oldName` data.
   * @param {string} name - The base item name.
   */
  setName(name) {
    if (this.__name != name) {
      const oldName = this.__name
      this.__name = name
      this.__updatePath()
      this.emit('nameChanged', { newName: name, oldName })
    }
  }

  /**
   * When the name or the hierarchy changes, this method
   * recomputes and caches the path of this item.
   * @private
   */
  __updatePath() {
    if (this.__ownerItem == undefined) this.__path = [this.__name]
    else {
      this.__path = [...this.__ownerItem.getPath(), this.__name]
    }
  }

  /**
   * Returns the current path of the item in the tree as an array of names.
   *
   * @return {array} - Returns an array.
   */
  getPath() {
    return this.__path
  }

  // Path Traversal

  /**
   * The resolvePath method traverses the subtree from this item down
   * matching each name in the path with a child until it reaches the
   * end of the path.
   *
   * @param {array} path - The path value.
   * @param {number} index - The index value.
   * @return {BaseItem|Parameter} - The return value.
   */
  resolvePath(path, index = 0) {
    if (index == 0) {
      if (path[0] == '.' || path[0] == this.__name) index++
    }
    if (index == path.length) {
      return this
    }
    if (path[index] == '>' && index == path.length - 1) {
      return this.getParameter(path[index + 1])
    }

    // Maybe the name is a parameter name.
    const param = this.getParameter(path[index])
    if (param) {
      return param
    }
    throw new Error('Invalid path:' + path + '[' + index + '] member not found')
  }

  // ////////////////////////////////////////
  // Owner Item

  /**
   * The getOwner method returns the current owner of the item.
   * The item is a child of the current owner.
   *
   * @return {object} - Returns the current owner.
   */
  getOwner() {
    // return this.__private.get('ownerItem');
    return this.__ownerItem
  }

  /**
   * The setOwner method assigns a new owner to the item.
   *
   * @param {object} ownerItem - The new owner item.
   */
  setOwner(ownerItem) {
    // this.__private.set(ownerItem, ownerItem);
    if (this.__ownerItem !== ownerItem) {
      this.__ownerItem = ownerItem
      this.__updatePath()
    }
  }

  // ////////////////////////////////////////
  // Selectability and Selection

  /**
   * Returns a boolean indicating if this item is selectable.
   *
   * @return {boolean} - Returns a boolean indicating if the item is selectable.
   */
  getSelectable() {
    return this.__selectable
  }

  /**
   * Modifies the selectability of this item.
   *
   * @param {boolean} val - A boolean indicating the selectability of the item.
   * @return {boolean} - Returns true if value changed.
   */
  setSelectable(val) {
    if (this.__selectable != val) {
      this.__selectable = val
      this.emit('selectabilityChanged', { value: this.__selectable })
      return true
    }
    return false
  }

  /**
   * The isSelected method.
   * @return {boolean} - The return value.
   */
  isSelected() {
    return this.__selected
  }

  /**
   * Returns `true` if this item has been selected.
   *
   * @return {boolean} - The current selection state.
   */
  getSelected() {
    return this.__selected
  }

  /**
   * Changes the current state of the selection of this item.
   *
   * @emits `selectedChanged` with selected state
   * @param {boolean} sel - Boolean indicating the new selection state.
   */
  setSelected(sel) {
    this.__selected = sel
    this.emit('selectedChanged', { selected: this.__selected })
  }

  // ////////////////////////////////////////
  // Metadata

  /**
   * Gets Item's meta-data value by passing the `key` string.
   *
   * @param {string} key - The key value under which to check for metadata.
   * @return {object|string|any} - Returns the metadata associated with the given key.
   */
  getMetadata(key) {
    return this.__metaData[key]
  }

  /**
   * Checks to see if there is metadata for a given key.
   *
   * @param {string} key - The key value under which to check for metadata.
   * @return {boolean} - Returns `true` if metadata exists under the given key, otherwise returns `false`.
   */
  hasMetadata(key) {
    return key in this.__metaData
  }

  /**
   * Assigns metadata to a given key.
   *
   * @param {string} key - The key value under which the metadata is is going to be saved.
   * @param {object} metaData - The metaData value.
   */
  setMetadata(key, metaData) {
    this.__metaData[key] = metaData
  }

  /**
   * Removes metadata for a given key.
   *
   * @param {string} key - The key value.
   */
  deleteMetadata(key) {
    delete this.__metaData[key]
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * Encodes the current object as a json object.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    j.name = this.__name
    j.type = Registry.getBlueprintName(this)
    return j
  }

  /**
   * Decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.name) this.__name = j.name
    super.fromJSON(j, context)
  }

  /**
   * Sets state of current Item(Including parameters) using a binary reader object.
   *
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    const type = reader.loadStr()
    this.setName(reader.loadStr())

    // Note: parameters follow name...
    super.readBinary(reader, context)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * Clones this base item and returns a new base item.
   * <br>
   * **Note:** Each class should implement clone to be cloneable.
   * @param {object} context - The context value.
   */
  clone(context) {
    throw new Error(this.constructor.name + ' does not implement its clone method')
  }

  /**
   * When a BaseItem is cloned, initially the constructor is
   * called to generate a new instance. This instance then copies
   * its values from the source using this method.
   * This method copies any relevant data from the source object to
   * ensure that it represents a valid clone.
   * Derived classes override this method to copy any relevant
   * data from the source object.
   *
   * @param {BaseItem} src - The BaseItem to copy from.
   * @param {object} context - The context value.
   */
  copyFrom(src, context) {
    super.copyFrom(src, context)
    this.setName(src.getName())
  }
}

export { BaseItem }
