/* eslint-disable no-unused-vars */
import { ItemSetParameter } from '../Parameters/index'
import { TreeItem } from '../TreeItem'

/**
 * BaseGroup are a special type of `TreeItem` that allows you to gather/classify/organize/modify
 * multiple items contained within the group. Items can be added to the group directly, or using
 * its path.
 * All parameters set to the group are also set to the children; in other words, it's a faster way
 * to apply common things to multiple items.
 *
 * **Parameters**
 * * **Items(`ItemSetParameter`):** _todo_
 *
 * @extends TreeItem
 */
class BaseGroup extends TreeItem {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)
    this.searchRoot = null
    this.__itemsParam = this.addParameter(new ItemSetParameter('Items', (item) => item instanceof TreeItem))
    this.__itemsParam.on('itemAdded', (event) => {
      this.__bindItem(event.item, event.index)
    })
    this.__itemsParam.on('itemRemoved', (event) => {
      this.__unbindItem(event.item, event.index)
    })
  }

  // ////////////////////////////////////////
  // Items

  /**
   *  sets the root item to be used as the search root.
   * @param {TreeItem} treeItem
   */
  setSearchRoot(treeItem) {
    this.searchRoot = treeItem
  }

  /**
   * The setOwner method assigns a new owner to the item. The owner of a group becomes its search root unless another search root is already set.
   *
   * @param {object} ownerItem - The new owner item.
   */
  setOwner(ownerItem) {
    if (!this.searchRoot || this.searchRoot == this.getOwner()) this.searchRoot = ownerItem
    super.setOwner(ownerItem)
  }

  /**
   * This method is mostly used in our demos,
   * and should be removed from the interface.
   *
   * @deprecated
   * @param {array} paths - The paths value.
   * @private
   */
  setPaths(paths) {
    this.clearItems(false)

    const searchRoot = this.getOwner()
    if (this.searchRoot == undefined) {
      console.warn('BaseGroup does not have an owner and so cannot resolve paths:', this.getName())
      return
    }
    const items = []
    paths.forEach((path) => {
      const treeItem = this.searchRoot.resolvePath(path)
      if (treeItem) items.push(treeItem)
      else {
        console.warn('Path does not resolve to an Item:', path, ' group:', this.getName())
      }
    })
    this.setItems(items)
  }

  /**
   * Uses the specified list of paths to look and get each `BaseItem` object and add it to BaseGroup's `Items` parameter.
   *
   * @param {array} paths - The paths value.
   */
  resolveItems(paths) {
    this.setPaths(paths)
  }

  /**
   * The __bindItem method.
   * @param {BaseItem} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __bindItem(item, index) {}

  /**
   * The __unbindItem method.
   * @param {BaseItem} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __unbindItem(item, index) {}

  /**
   * Adds an item to the group(See `Items` parameter).
   *
   * @param {BaseItem} item - The item value.
   * @param {boolean} emit - The emit value.
   */
  addItem(item, emit = true) {
    if (!item) {
      console.warn('Error adding item to group. Item is null')
      return
    }
    this.__itemsParam.addItem(item, emit)
  }

  /**
   * Removes an item from the group(See `Items` parameter).
   *
   * @param {BaseItem} item - The item value.
   * @param {boolean} emit - The emit value.
   */
  removeItem(item, emit = true) {
    this.__itemsParam.removeItem(item, emit)
  }

  /**
   * Removes all items from the group.
   *
   * @param {boolean} emit - `true` triggers `valueChanged` event.
   */
  clearItems(emit = true) {
    // Note: Unbind reversed so that indices
    // do not get changed during the unbind.
    const items = Array.from(this.__itemsParam.getValue())
    for (let i = items.length - 1; i >= 0; i--) {
      this.__unbindItem(items[i], i)
    }
    this.__itemsParam.clearItems(emit)
  }

  /**
   * Returns the list of `BaseItem` objects owned by the group.
   *
   * @return {array} - The return value.
   */
  getItems() {
    return this.__itemsParam.getValue()
  }

  /**
   * Sets an entire new array of items to the BaseGroup replacing any previous items.
   *
   * @param {array} items - List of `BaseItem` you want to add to the group
   */
  setItems(items) {
    this.clearItems(false)
    this.__itemsParam.setItems(items)
  }

  /**
   * The _cleanBoundingBox method.
   * @param {Box3} bbox - The bounding box value.
   * @return {Box3} - The return value.
   * @private
   */
  _cleanBoundingBox(bbox) {
    const result = super._cleanBoundingBox(bbox)
    const items = Array.from(this.__itemsParam.getValue())
    items.forEach((item) => {
      if (item instanceof TreeItem) {
        if (item.isVisible()) {
          result.addBox3(item.getParameter('BoundingBox').getValue())
        }
      }
    })
    return result
  }

  // ///////////////////////
  // Events

  /**
   * Occurs when a user presses a mouse button over an element.
   * Note: these methods are useful for debugging mouse event propagation to groups
   *
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerDown(event) {
    super.onPointerDown(event)
  }

  /**
   * Occurs when a user releases a mouse button over an element.
   * Note: these methods are useful for debugging mouse event propagation to groups
   *
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerUp(event) {
    super.onPointerUp(event)
  }

  /**
   * Occur when the mouse pointer is moving  while over an element.
   * Note: these methods are useful for debugging mouse event propagation to groups
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onPointerMove(event) {
    super.onPointerMove(event)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const j = super.toJSON(context)
    const items = Array.from(this.__itemsParam.getValue())
    const treeItems = []
    items.forEach((p) => {
      const path = p.getPath()
      treeItems.push(context ? context.makeRelative(path) : path)
    })
    j.treeItems = treeItems
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)

    if (!j.treeItems) {
      console.warn('Invalid Parameter JSON')
      return
    }
    if (!context) {
      throw new Error('Unable to load JSON on a BaseGroup without a load context')
    }
    let count = j.treeItems.length

    const addItem = (path) => {
      context.resolvePath(
        path,
        (treeItem) => {
          this.addItem(treeItem)
          count--
          if (count == 0) {
          }
        },
        (reason) => {
          console.warn("BaseGroup: '" + this.getName() + "'. Unable to load item:" + path)
        }
      )
    }
    for (const path of j.treeItems) {
      addItem(path)
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * Copies current BaseGroup with all owned items.
   *
   * @param {BaseGroup} src - The group to copy from.
   * @param {object} context - The group to copy from.
   */
  copyFrom(src, context) {
    super.copyFrom(src, context)
  }
}

export { BaseGroup }
