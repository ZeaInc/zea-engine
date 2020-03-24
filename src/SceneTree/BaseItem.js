import { Signal } from '../Utilities/index'
import { sgFactory } from './SGFactory.js'
import { ValueSetMode } from './Parameters/Parameter.js'
import { ParameterOwner } from './ParameterOwner.js'

const ItemFlags = {
  USER_EDITED: 1 << 1,
  IGNORE_BBOX: 1 << 2,
  BIN_NODE: 1 << 3, // This node was generated when loading a binary file.
  INVISIBLE: 1 << 4, // This node was generated when loading a binary file.
}
let numBaseItems = 0

/** The base class for the scene tree. A base item has a name and parameters.
 * @extends ParameterOwner
 */
class BaseItem extends ParameterOwner {
  /**
   * Create a base item.
   * @param {string} name - The name of the base item.
   */
  constructor(name) {
    super()
    if (name == undefined) name = sgFactory.getClassName(this)
    this.__name = name
    this.__path = [name]
    this.__ownerItem = undefined // TODO: will create a circular ref. Figure out and use weak refs
    this.__flags = 0

    this.__selectable = true
    this.__selected = false
    this.selectedChanged = new Signal()

    this.__metaData = {}

    this.nameChanged = new Signal()

    numBaseItems++
  }

  // ////////////////////////////////////////
  // Static Methods

  /**
   * The getNumBaseItems method returns the total number of base items created.
   * This method is used in debugging memory consumption.
   * @return {number} - Returns the total number of base items created.
   */
  static getNumBaseItems() {
    return numBaseItems
  }

  /**
   * The __parameterValueChanged method.
   * @param {any} param - The param value.
   * @param {number} mode - The mode value.
   * @private
   */
  __parameterValueChanged(param, mode) {
    super.__parameterValueChanged(param, mode)
    if (
      mode == ValueSetMode.USER_SETVALUE ||
      mode == ValueSetMode.REMOTEUSER_SETVALUE
    ) {
      this.setFlag(ItemFlags.USER_EDITED)
    }
  }

  // ////////////////////////////////////////
  // Name and Path

  /**
   * Returns the name of the base item.
   * @return {string} - Returns the base item name.
   */
  getName() {
    return this.__name
  }

  /**
   * Sets the name of the base item.
   * @param {string} name - The base item name.
   * @param {number} mode - The mode value
   */
  setName(name, mode = ValueSetMode.USER_SETVALUE) {
    if (this.__name != name) {
      const oldName = this.__name
      this.__name = name
      this.__updatePath()
      this.nameChanged.emit(name, oldName, mode)
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
      this.__path = this.__ownerItem.getPath().slice()
      this.__path.push(this.__name)
    }
  }

  /**
   * Returns the current path of the item in the tree as an array of names.
   * @return {array} - Returns an array.
   */
  getPath() {
    return this.__path
  }

  // ////////////////////////////////////////
  // Flags

  /**
   * The setFlag method.
   * @param {number} flag - the flag value.
   */
  setFlag(flag) {
    this.__flags |= flag
  }

  /**
   * The clearFlag method.
   * @param {number} flag - the flag value.
   */
  clearFlag(flag) {
    this.__flags &= ~flag
  }

  /**
   * Returns true if the flag if set, otherwise returns false.
   * @param {number} flag - The flag to test.
   * @return {boolean} - Returns a boolean indicating if the flag is set.
   */
  testFlag(flag) {
    return (this.__flags & flag) != 0
  }

  // ////////////////////////////////////////
  // Path Traversial

  /**
   * The resolvePath method traverses the subtree from this item down
   * matching each name in the path with a child until it reaches the
   * end of the path.
   * @param {any} path - The path value.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  resolvePath(path, index) {
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
    throw new Error('Invalid path:' + path + ' member not found')
  }

  // ////////////////////////////////////////
  // Owner Item

  /**
   * The getOwner method returns the current owner of the item.
   * The item is a child of the current owner.
   * @return {object} - Returns the current owner.
   */
  getOwner() {
    // return this.__private.get('ownerItem');
    return this.__ownerItem
  }

  /**
   * The setOwner method assigns a new owner to the item.
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
   * The getSelectable method returns a boolean indicating if this item is selectable.
   * @return {boolean} - Returns a boolean indicating if the item is selectable.
   */
  getSelectable() {
    return this.__selectable
  }

  /**
   * The setSelectable method modifies the selectability of this item.
   * @param {boolean} val - A boolean indicating the selectability of the item.
   * @return {boolean} - Returns a boolean.
   */
  setSelectable(val) {
    if (this.__selectable != val) {
      this.__selectable = val
      return true
    }
    return false
  }

  /**
   * The isSelected method.
   * @deprecated
   * @return {boolean} - The return value.
   */
  isSelected() {
    return this.__selected
  }

  /**
   * The getSelected method returns true if this item has been selected.
   * @return {boolean} - The current selection state.
   */
  getSelected() {
    return this.__selected
  }

  /**
   * The getSelected method changes the current state of the selection of this item.
   * @param {boolean} sel - Boolean indicating the new selection state.
   */
  setSelected(sel) {
    this.__selected = sel
    this.selectedChanged.emit(this.__selected)
  }

  // ////////////////////////////////////////
  // Metadata

  /**
   * The getMetadata method.
   * @param {any} key - The key value under which to check for metadata.
   * @return {object} - Returns the metadata associated with the given key.
   */
  getMetadata(key) {
    return this.__metaData[key]
  }

  /**
   * The hasMetadata method checks to see if there is metadata for a given key.
   * @param {any} key - The key value.
   * @return {boolean} - Returns true if metadata exists under the given key, otherwise returns false.
   */
  hasMetadata(key) {
    return key in this.__metaData
  }

  /**
   * The setMetadata method assigns metadata to a given key.
   * @param {any} key - The key value.
   * @param {object} metaData - The metaData value.
   */
  setMetadata(key, metaData) {
    this.__metaData[key] = metaData
  }

  /**
   * The deleteMetadata method removes metadata for a given key.
   * @param {any} key - The key value.
   */
  deleteMetadata(key) {
    delete this.__metaData[key]
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes the current object as a json object.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    let j = super.toJSON(context, flags)
    if (!j && this.testFlag(ItemFlags.USER_EDITED)) j = {}
    if (j) {
      j.name = this.__name

      // Binary Tree nodes should only be re-created
      // by loading binary data. The JSON tree just stores
      // modifications to those items, and if, when loading
      // the node no longer exists, then the json loader
      // simply keeps going. (no errors).
      if (!this.testFlag(ItemFlags.BIN_NODE))
        j.type = sgFactory.getClassName(this)
    }
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.name) this.__name = j.name
    super.fromJSON(j, context, flags)
    // Note: JSON data is only used to store user edits, so
    // parameters loaded from JSON are considered user edited.
    this.__flags |= ItemFlags.USER_EDITED
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
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
   * Clones this bse item and returns a new base item.
   * Note: Each class should implement clone to be clonable.
   * @param {number} flags - The flags value.
   */
  clone(flags) {
    throw new Error(
      this.constructor.name + ' does not implment its clone method'
    )
  }

  /**
   * When a BaseItem is cloned, initially the constructor is
   * called to generate a new instance. This instance then copies
   * its values from the source using this method.
   * This method copies any relevant data from the source object to
   * ensure that it represents a valid clone.
   * Derived classes override this method to copy any relevant
   * data from the source object.
   * @param {BaseItem} src - The BaseItem to copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    super.copyFrom(src, flags)
    this.setName(src.getName())
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
  }
}

export { ItemFlags, BaseItem }
