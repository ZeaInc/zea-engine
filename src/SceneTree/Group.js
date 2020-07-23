/* eslint-disable no-unused-vars */
import { Vec3, Color, Xfo } from '../Math/index'
import {
  ValueSetMode,
  BooleanParameter,
  NumberParameter,
  Vec3Parameter,
  ColorParameter,
  ItemSetParameter,
  MultiChoiceParameter,
} from './Parameters/index'
import { MaterialParameter } from './Parameters/MaterialParameter.js'
import { ItemFlags } from './BaseItem'
import { TreeItem } from './TreeItem'
import { BaseGeomItem } from './BaseGeomItem'
import { sgFactory } from './SGFactory.js'

const GROUP_INITIAL_XFO_MODES = {
  manual: 0,
  first: 1,
  average: 2,
  globalOri: 3,
}

/**
 * Groups are a special type of `TreeItem` that allows you to gather/classify/organize/modify
 * multiple items contained within the group. Items can be added to the group directly, or using
 * its path.
 * All parameters set to the group are also set to the children; in other words, it's a faster way
 * to apply common things to multiple items.
 *
 * **Parameters**
 * * **Items(`ItemSetParameter`):** _todo_
 * * **Highlighted(`BooleanParameter`):** _todo_
 * * **HighlightColor(`ColorParameter`):** _todo_
 * * **HighlightFill(`NumberParameter`):** _todo_
 * * **Material(`MaterialParameter`):** _todo_
 * * **CutAwayEnabled(`BooleanParameter`):** _todo_
 * * **CutPlaneNormal(`Vec3Parameter`):** _todo_
 * * **CutPlaneDist(`NumberParameter`):** _todo_
 *
 * @extends TreeItem
 */
class Group extends TreeItem {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)

    // Items which can be constructed by a user (not loaded in binary data.)
    // Should always have this flag set.
    this.setFlag(ItemFlags.USER_EDITED)

    this.groupXfoDirty = false
    this.calculatingGroupXfo = false
    this.dirty = false
    this.searchRoot = null

    this.invGroupXfo = undefined
    this.__initialXfos = []
    this.__signalIndices = []

    const pid = 0
    this.__itemsParam = this.addParameter(new ItemSetParameter('Items', (item) => item instanceof TreeItem))
    this.__itemsParam.addListener('itemAdded', (event) => {
      this.__bindItem(event.item, event.index)
    })
    this.__itemsParam.addListener('itemRemoved', (event) => {
      this.__unbindItem(event.item, event.index)
    })
    this.__itemsParam.addListener('valueChanged', () => {
      this.calcGroupXfo()
      this._setBoundingBoxDirty()
    })

    this.__initialXfoModeParam = this.addParameter(
      new MultiChoiceParameter('InitialXfoMode', GROUP_INITIAL_XFO_MODES.average, [
        'manual',
        'first',
        'average',
        'global',
      ])
    )
    this.__initialXfoModeParam.addListener('valueChanged', () => {
      this.calcGroupXfo()
    })

    this.__highlightedParam = this.addParameter(new BooleanParameter('Highlighted', false))
    this.__highlightedParam.addListener('valueChanged', () => {
      this.__updateHighlight()
    })

    this.__updateHighlight = this.__updateHighlight.bind(this)
    const highlightColorParam = this.addParameter(new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1)))
    highlightColorParam.addListener('valueChanged', this.__updateHighlight)
    const highlightFillParam = this.addParameter(new NumberParameter('HighlightFill', 0.0, [0, 1]))
    highlightFillParam.addListener('valueChanged', this.__updateHighlight)

    this.__materialParam = this.addParameter(new MaterialParameter('Material'))
    this.__materialParam.addListener('valueChanged', () => {
      this.__updateMaterial()
    })

    this.__updateCutaway = this.__updateCutaway.bind(this)
    this.addParameter(new BooleanParameter('CutAwayEnabled', false)).addListener('valueChanged', this.__updateCutaway)
    this.addParameter(new Vec3Parameter('CutPlaneNormal', new Vec3(1, 0, 0))).addListener(
      'valueChanged',
      this.__updateCutaway
    )
    this.addParameter(new NumberParameter('CutPlaneDist', 0.0)).addListener('valueChanged', this.__updateCutaway)

    // TODO: this should be the way we propagate dirty. Instead
    // of using the overloaded method (_setGlobalXfoDirty)
    // However we seem to get infinite callstacks.
    // The migration to real operators should clean this up.
    // Check: servo_mestre/?stage=assembly
    this.__globalXfoParam.addListener('valueChanged', (event) => {
      if (!this.calculatingGroupXfo && !this.groupXfoDirty) {
        this._propagateDirtyXfoToItems()
      }
    })
  }

  /**
   * Returns enum of available xfo modes.
   *
   * | Name | Default |
   * | --- | --- |
   * | manual | <code>0</code> |
   * | first | <code>1</code> |
   * | average | <code>2</code> |
   * | globalOri | <code>3</code> |
   */
  static get INITIAL_XFO_MODES() {
    return GROUP_INITIAL_XFO_MODES
  }

  /**
   * The __updateVisiblity method.
   * @return {boolean} - The return value.
   * @private
   */
  __updateVisiblity() {
    if (super.__updateVisiblity()) {
      const value = this.getVisible()
      Array.from(this.__itemsParam.getValue()).forEach((item) => {
        if (item instanceof TreeItem) item.propagateVisiblity(value ? 1 : -1)
      })
      return true
    }
    return false
  }

  // /////////////////////////////

  /**
   * The __updateHighlight method.
   * @private
   */
  __updateHighlight() {
    let highlighted = false
    let color
    if (this.getParameter('Highlighted').getValue() || this.isSelected()) {
      highlighted = true
      color = this.getParameter('HighlightColor').getValue()
      color.a = this.getParameter('HighlightFill').getValue()
    }

    const key = 'groupItemHighlight' + this.getId()
    Array.from(this.__itemsParam.getValue()).forEach((item) => {
      if (item instanceof TreeItem) {
        if (highlighted) item.addHighlight(key, color, true)
        else item.removeHighlight(key, true)
      }
    })
  }

  /**
   * Changes selection's state of the group with all items it owns.
   *
   * @param {boolean} sel - Boolean indicating the new selection state.
   */
  setSelected(sel) {
    super.setSelected(sel)
    this.__updateHighlight()

    // if (sel) {
    //   if (!this.getParameter('Highlighted').getValue()) {
    //     Array.from(this.__itemsParam.getValue()).forEach(item => {
    //       if (item instanceof TreeItem)
    //         item.addHighlight(
    //           'branchselected' + this.getId(),
    //           TreeItem.getBranchSelectionOutlineColor(),
    //           true
    //         )
    //     })
    //   }
    //   // We want to re-apply the group hilight over the branch selection hilight.
    //   this.__updateHighlight()
    // } else {
    //   Array.from(this.__itemsParam.getValue()).forEach(item => {
    //     if (item instanceof TreeItem)
    //       item.removeHighlight('branchselected' + this.getId(), true)
    //   })
    // }
  }

  // ////////////////////////////////////////
  // Global Xfo

  /**
   * The _setGlobalXfoDirty method.
   * @private
   */
  _setGlobalXfoDirty() {
    super._setGlobalXfoDirty()
    // Note: dirty should propagat from one
    // Parameter to others following the operator graph.
    // See: comment above (line 124)
    // this._propagateDirtyXfoToItems()
  }

  /**
   * Calculate the group Xfo translate.
   * @private
   * @return {Xfo} - Returns a new Xfo.
   */
  calcGroupXfo() {
    const items = Array.from(this.__itemsParam.getValue())
    if (items.length == 0) return new Xfo()
    this.calculatingGroupXfo = true
    const initialXfoMode = this.__initialXfoModeParam.getValue()
    let xfo
    if (initialXfoMode == GROUP_INITIAL_XFO_MODES.manual) {
      // The xfo is manually set by the current global xfo.
      this.invGroupXfo = this.getGlobalXfo().inverse()
      this.calculatingGroupXfo = false
      this.groupXfoDirty = false
      return
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.first) {
      xfo = this.__initialXfos[0]
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.average) {
      xfo = new Xfo()
      xfo.ori.set(0, 0, 0, 0)
      let numTreeItems = 0
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          xfo.tr.addInPlace(this.__initialXfos[index].tr)
          xfo.ori.addInPlace(this.__initialXfos[index].ori)
          numTreeItems++
        }
      })
      xfo.tr.scaleInPlace(1 / numTreeItems)
      xfo.ori.normalizeInPlace()
      // xfo.sc.scaleInPlace(1/ numTreeItems);
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.globalOri) {
      xfo = new Xfo()
      let numTreeItems = 0
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          xfo.tr.addInPlace(this.__initialXfos[index].tr)
          numTreeItems++
        }
      })
      xfo.tr.scaleInPlace(1 / numTreeItems)
    } else {
      throw new Error('Invalid mode.')
    }

    this.setGlobalXfo(xfo, ValueSetMode.GENERATED_VALUE)

    // Note: if the Group global param becomes dirty
    // then it stops propagating dirty to its members.
    const newGlobal = this.getGlobalXfo() // force a cleaning.
    this.invGroupXfo = newGlobal.inverse()

    this.calculatingGroupXfo = false
    this.groupXfoDirty = false
  }

  /**
   * The _propagateDirtyXfoToItems method.
   * @private
   */
  _propagateDirtyXfoToItems() {
    if (this.groupXfoDirty || this.calculatingGroupXfo) return

    const items = Array.from(this.__itemsParam.getValue())
    // Only after all the items are resolved do we have an invXfo and we can tranform our items.
    if (!this.calculatingGroupXfo && items.length > 0 && this.invGroupXfo && !this.dirty) {
      // Note: because each 'clean' function is a unique
      // value, the parameter does not know that this Group
      // has already registered a clean function. For now
      // we use this 'dirty' hack to avoid registering multiple
      // clean functions. However, once the cleaning is handled
      // via a bound operator, then this code will be removed.
      this.dirty = true
      this.propagatingXfoToItems = true // Note: selection group needs this set.
      let delta
      const setDirty = (item, initialXfo) => {
        const param = item.getParameter('GlobalXfo')
        const clean = () => {
          if (!delta) {
            // Compute the skinning transform that we can
            // apply to all the items in the group.
            const xfo = this.__globalXfoParam.getValue()
            delta = xfo.multiply(this.invGroupXfo)
            this.dirty = false
          }
          const result = delta.multiply(initialXfo)
          param.setClean(result)
        }
        param.setDirty(clean)
      }
      items.forEach((item, index) => {
        if (item instanceof TreeItem) setDirty(item, this.__initialXfos[index])
      })
      this.propagatingXfoToItems = false
    }
  }

  // _propagateGroupXfoToItem(index) {
  //   const clean = () => {
  //     const xfo = this.__globalXfoParam.getValue()
  //     const delta = xfo.multiply(this.invGroupXfo)
  //     return delta.multiply(this.__initialXfos[index])
  //   }
  //   item.getParameter('GlobalXfo').setDirty(clean)
  // }

  // ////////////////////////////////////////
  // Materials

  /**
   * The __updateMaterial method.
   * @private
   */
  __updateMaterial() {
    const material = this.getParameter('Material').getValue()

    Array.from(this.__itemsParam.getValue()).forEach((item) => {
      item.traverse((treeItem) => {
        if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
          const p = treeItem.getParameter('Material')
          if (material) {
            const m = p.getValue()
            if (m != material) {
              p.__backupMaterial = m
              p.setValue(material, ValueSetMode.GENERATED_VALUE)
            }
          } else if (p.__backupMaterial) {
            p.setValue(p.__backupMaterial, ValueSetMode.GENERATED_VALUE)
          }
        }
      }, false)
    })
  }

  // ////////////////////////////////////////
  // Cutaways

  /**
   * The __updateCutaway method.
   * @private
   */
  __updateCutaway() {
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue()
    const cutAwayVector = this.getParameter('CutPlaneNormal').getValue()
    const cutAwayDist = this.getParameter('CutPlaneDist').getValue()

    Array.from(this.__itemsParam.getValue()).forEach((item) => {
      item.traverse((treeItem) => {
        if (treeItem instanceof BaseGeomItem) {
          treeItem.setCutawayEnabled(cutEnabled)
          treeItem.setCutVector(cutAwayVector)
          treeItem.setCutDist(cutAwayDist)
        }
      }, true)
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

  setOwner(owner) {
    if (!this.searchRoot || this.searchRoot == this.getOwner())
      this.searchRoot = owner
    super.setOwner(owner)
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
      console.warn('Group does not have an owner and so cannot resolve paths:', this.getName())
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
   * Uses the specified list of paths to look and get each `BaseItem` object and add it to Group's `Items` parameter.
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
  __bindItem(item, index) {
    if (!(item instanceof TreeItem)) return

    const sigIds = {}

    sigIds.mouseDownIndex = item.addListener('mouseDown', (event) => {
      this.onMouseDown(event)
    })
    sigIds.mouseUpIndex = item.addListener('mouseUp', (event) => {
      this.onMouseUp(event)
    })
    sigIds.mouseMoveIndex = item.addListener('mouseMove', (event) => {
      this.onMouseMove(event)
    })
    sigIds.mouseEnterIndex = item.addListener('mouseEnter', (event) => {
      this.onMouseEnter(event)
    })
    sigIds.mouseLeaveIndex = item.addListener('mouseLeave', (event) => {
      this.onMouseLeave(event)
    })

    // ///////////////////////////////
    // Update the Material
    const material = this.getParameter('Material').getValue()
    if (material) {
      item.traverse((treeItem) => {
        if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
          const p = treeItem.getParameter('Material')
          if (material) {
            const m = p.getValue()
            if (m != material) {
              p.__backupMaterial = m
              p.setValue(material, ValueSetMode.GENERATED_VALUE)
            }
          }
        }
      }, true)
    }

    // ///////////////////////////////
    // Update the highlight
    if (item instanceof TreeItem && this.getParameter('Highlighted').getValue()) {
      const color = this.getParameter('HighlightColor').getValue()
      color.a = this.getParameter('HighlightFill').getValue()
      item.addHighlight('groupItemHighlight' + this.getId(), color, true)
    }

    // ///////////////////////////////
    // Update the item cutaway
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue()
    if (cutEnabled) {
      const cutAwayVector = this.getParameter('CutPlaneNormal').getValue()
      const cutAwayDist = this.getParameter('CutPlaneDist').getValue()
      item.traverse((treeItem) => {
        if (treeItem instanceof BaseGeomItem) {
          // console.log("cutEnabled:", treeItem.getPath(), cutAwayVector.toString(), treeItem.getMaterial().getShaderName())
          treeItem.setCutawayEnabled(cutEnabled)
          treeItem.setCutVector(cutAwayVector)
          treeItem.setCutDist(cutAwayDist)
        }
      }, true)
    }

    if (!this.getVisible()) {
      // Decrement the visiblity counter which might cause
      // this item to become invisible. (or it might already be invisible.)
      item.propagateVisiblity(-1)
    }

    const updateGlobalXfo = () => {
      const initialXfoMode = this.__initialXfoModeParam.getValue()
      if (initialXfoMode == GROUP_INITIAL_XFO_MODES.first && index == 0) {
        this.calcGroupXfo()
      } else if (
        initialXfoMode == GROUP_INITIAL_XFO_MODES.average ||
        initialXfoMode == GROUP_INITIAL_XFO_MODES.globalOri
      ) {
        this.calcGroupXfo()
      }
    }

    sigIds.globalXfoChangedIndex = item.addListener('globalXfoChanged', (event) => {
      // If the item's xfo changees, potentially through its own hierarchy
      // then we need to re-bind here.
      if (!this.propagatingXfoToItems) {
        this.__initialXfos[index] = item.getGlobalXfo()
        this.groupXfoDirty = true
        updateGlobalXfo()
      }
    })
    this.__initialXfos[index] = item.getGlobalXfo()

    sigIds.bboxChangedIndex = item.addListener('boundingChanged', this._setBoundingBoxDirty)

    this.__signalIndices[index] = sigIds

    updateGlobalXfo()
  }

  /**
   * The __unbindItem method.
   * @param {BaseItem} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __unbindItem(item, index) {
    if (!(item instanceof TreeItem)) return

    item.removeHighlight('branchselected' + this.getId(), true)
    if (this.getParameter('Highlighted').getValue()) {
      item.removeHighlight('groupItemHighlight' + this.getId(), true)
    }

    if (!this.getVisible()) {
      // Increment the visiblity counter which might cause
      // this item to become visible.
      // It will stay invisible if its parent is invisible, or if
      // multiple groups connect to it and say it is invisible.
      item.propagateVisiblity(1)
    }

    // ///////////////////////////////
    // Update the item cutaway
    item.traverse((treeItem) => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(false)
      }
    }, true)

    const sigIds = this.__signalIndices[index]
    item.removeListenerById('mouseDown', sigIds.mouseDownIndex)
    item.removeListenerById('mouseUp', sigIds.mouseUpIndex)
    item.removeListenerById('mouseMove', sigIds.mouseMoveIndex)
    item.removeListenerById('mouseEnter', sigIds.mouseEnterIndex)
    item.removeListenerById('mouseLeave', sigIds.mouseLeaveIndex)

    item.removeListenerById('globalXfoChanged', sigIds.globalXfoChangedIndex)
    item.removeListenerById('boundingChanged', sigIds.bboxChangedIndex)
    this.__signalIndices.splice(index, 1)
    this.__initialXfos.splice(index, 1)
  }

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
   * Removes all items from the group and kind of returns the object to the default state.
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
    this.__signalIndices = []
    this.__initialXfos = []
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
   * Removes old items in current group and adds new ones.
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
        if (item.getVisible() && !item.testFlag(ItemFlags.IGNORE_BBOX)) result.addBox3(item.getBoundingBox())
      }
    })
    return result
  }

  // ///////////////////////
  // Events

  /**
   * Occurs when a user presses a mouse button over an element.
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onMouseDown(event) {
    console.warn('@todo-review')
    super.onMouseDown(event)
  }

  /**
   * Occurs when a user releases a mouse button over an element.
   *
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onMouseUp(event) {
    console.warn('@todo-review')
    super.onMouseUp(event)
  }

  /**
   * Occur when the mouse pointer is moving  while over an element.
   * @private
   * @param {MouseEvent} event - The mouse event that occurs.
   */
  onMouseMove(event) {
    console.warn('@todo-review')
    super.onMouseMove(event)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   *
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags)
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
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags)

    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.setFlag(ItemFlags.USER_EDITED)

    if (!j.treeItems) {
      console.warn('Invalid Parameter JSON')
      return
    }
    let count = j.treeItems.length

    const addItem = (path) => {
      context.resolvePath(
        path,
        (treeItem) => {
          this.addItem(treeItem)
          count--
          if (count == 0) {
            this.calculatingGroupXfo = true
            // this.setGlobalXfo(this.calcGroupXfo(), ValueSetMode.GENERATED_VALUE)
            this.calcGroupXfo()
            this.calculatingGroupXfo = false
          }
        },
        (reason) => {
          console.warn("Group: '" + this.getName() + "'. Unable to load item:" + path)
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
   * The clone method constructs a new group,
   * copies its values and returns it.
   *
   * @param {number} flags - The flags value.
   * @return {Group} - Returns a new cloned group.
   */
  clone(flags) {
    const cloned = new Group()
    cloned.copyFrom(this, flags)
    return cloned
  }

  /**
   * Copies current Group with all owned items.
   *
   * @param {Group} src - The group to copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    super.copyFrom(src, flags)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
  }
}

sgFactory.registerClass('Group', Group)

export { Group }
