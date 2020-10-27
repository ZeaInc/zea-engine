/* eslint-disable no-unused-vars */
import { Color } from '../../Math/index'
import { Registry } from '../../Registry'
import { BooleanParameter, NumberParameter, ColorParameter } from '../Parameters/index'
import { BaseGroup } from './BaseGroup'
import { TreeItem } from '../TreeItem'
import { BaseGeomItem } from '../BaseGeomItem'

/**
 *
 * **Parameters**
 * * **Highlighted(`BooleanParameter`):** _todo_
 * * **HighlightColor(`ColorParameter`):** _todo_
 * * **HighlightFill(`NumberParameter`):** _todo_
 *
 * @extends BaseGroup
 */
class SelectionSet extends BaseGroup {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)

    this.__highlightedParam = this.addParameter(new BooleanParameter('Highlighted', false))
    this.__highlightedParam.on('valueChanged', () => {
      this.__updateHighlight()
    })

    this.__updateHighlight = this.__updateHighlight.bind(this)
    const highlightColorParam = this.addParameter(new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1)))
    highlightColorParam.on('valueChanged', this.__updateHighlight)
    const highlightFillParam = this.addParameter(new NumberParameter('HighlightFill', 0.0, [0, 1]))
    highlightFillParam.on('valueChanged', this.__updateHighlight)
  }

  /**
   * The __updateVisibility method.
   * @return {boolean} - The return value.
   * @private
   */
  __updateVisibility() {
    if (super.__updateVisibility()) {
      const value = this.isVisible()
      Array.from(this.__itemsParam.getValue()).forEach((item) => {
        if (item instanceof TreeItem) item.propagateVisibility(value ? 1 : -1)
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
    // Make this function async so that we don't pull on the
    // graph immediately when we receive a notification.
    // Note: propagating using an operator would be much better.
    new Promise((resolve) => {
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
      resolve()
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
  }

  // ////////////////////////////////////////
  // Items

  /**
   * The __bindItem method.
   * @param {BaseItem} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __bindItem(item, index) {
    if (!(item instanceof TreeItem)) return

    item.on('pointerDown', this.onPointerDown)
    item.on('pointerUp', this.onPointerUp)
    item.on('pointerMove', this.onPointerMove)
    item.on('pointerEnter', this.onPointerEnter)
    item.on('pointerLeave', this.onPointerLeave)

    // ///////////////////////////////
    // Update the highlight
    if (item instanceof TreeItem && this.getParameter('Highlighted').getValue()) {
      const color = this.getParameter('HighlightColor').getValue()
      color.a = this.getParameter('HighlightFill').getValue()
      item.addHighlight('groupItemHighlight' + this.getId(), color, true)
    }

    if (!this.isVisible()) {
      // Decrement the visibility counter which might cause
      // this item to become invisible. (or it might already be invisible.)
      item.propagateVisibility(-1)
    }

    if (item instanceof TreeItem) {
      item.getParameter('BoundingBox').on('valueChanged', this._setBoundingBoxDirty)
    }
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

    if (!this.isVisible()) {
      // Increment the Visibility counter which might cause
      // this item to become visible.
      // It will stay invisible if its parent is invisible, or if
      // multiple groups connect to it and say it is invisible.
      item.propagateVisibility(1)
    }

    // ///////////////////////////////
    // Update the item cutaway
    item.traverse((treeItem) => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(false)
      }
    }, true)

    item.off('pointerDown', this.onPointerDown)
    item.off('pointerUp', this.onPointerUp)
    item.off('pointerMove', this.onPointerMove)
    item.off('pointerEnter', this.onPointerEnter)
    item.off('pointerLeave', this.onPointerLeave)

    if (item instanceof TreeItem) {
      this.memberXfoOps[index].detach()
      this.memberXfoOps.splice(index, 1)
      this._setBoundingBoxDirty()
    }

    // const eventHandlers = this.__eventHandlers[index]
    // item.off('globalXfoChanged', eventHandlers.globalXfoChanged)
    item.off('boundingChanged', this._setBoundingBoxDirty)

    // this.__eventHandlers.splice(index, 1)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new group,
   * copies its values and returns it.
   *
   * @param {object} context - The context value.
   * @return {SelectionSet} - Returns a new cloned group.
   */
  clone(context) {
    const cloned = new SelectionSet()
    cloned.copyFrom(this, context)
    return cloned
  }
}

Registry.register('SelectionSet', SelectionSet)

export { SelectionSet }
