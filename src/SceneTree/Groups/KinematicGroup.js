/* eslint-disable no-unused-vars */
import { Xfo } from '../../Math/index'
import { Registry } from '../../Registry'
import { XfoParameter, MultiChoiceParameter } from '../Parameters/index'
import { BaseGroup } from './BaseGroup'
import { TreeItem } from '../TreeItem'
import { GroupTransformXfoOperator, GroupMemberXfoOperator } from '../Operators/GroupMemberXfoOperator.js'

const GROUP_XFO_MODES = {
  disabled: 0,
  manual: 1,
  first: 2,
  average: 3,
  globalOri: 4,
}

/**
 * The KinematicGroup is used to control the transform of a collection of objects int eh scene.
 * Objects can be added to a kinematic group and then the group can be transformed, causing each
 * of the members to be transformed as one.
 *
 **Parameters**
 * **InitialXfoMode(`MultiChoiceParameter`):** _todo_
 * **GroupTransform(`XfoParameter`):** _todo_
 *
 * @extends BaseGroup
 */
class KinematicGroup extends BaseGroup {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)

    // Items which can be constructed by a user (not loaded in binary data.)
    this.calculatingGroupXfo = false
    this.memberXfoOps = []

    this.__initialXfoModeParam = this.addParameter(
      new MultiChoiceParameter('InitialXfoMode', GROUP_XFO_MODES.average, ['manual', 'first', 'average', 'global'])
    )
    this.__initialXfoModeParam.on('valueChanged', () => {
      this.calcGroupXfo()
    })
    const groupTransformParam = this.addParameter(new XfoParameter('GroupTransform', new Xfo()))
    this.groupTransformOp = new GroupTransformXfoOperator(this.getParameter('GlobalXfo'), groupTransformParam)
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
    return GROUP_XFO_MODES
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
      if (this.isSelected()) {
        highlighted = true
        color = this.getHighlight()
        color.a = 0.2
      }

      const key = 'kinematicGroupItemHighlight' + this.getId()
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
  // Global Xfo

  /**
   * Calculate the group Xfo translate.
   * @private
   * @return {Xfo} - Returns a new Xfo.
   */
  calcGroupXfo() {
    const items = Array.from(this.__itemsParam.getValue())
    if (items.length == 0) return new Xfo()
    this.calculatingGroupXfo = true

    this.memberXfoOps.forEach((op) => op.disable())

    // TODO: Disable the group operator?
    const initialXfoMode = this.__initialXfoModeParam.getValue()
    let xfo
    if (initialXfoMode == GROUP_XFO_MODES.manual) {
      // The xfo is manually set by the current global xfo.
      xfo = this.getParameter('GlobalXfo').getValue()
    } else if (initialXfoMode == GROUP_XFO_MODES.first) {
      if (items[0] instanceof TreeItem) {
        xfo = items[0].getParameter('GlobalXfo').getValue()
      }
    } else if (initialXfoMode == GROUP_XFO_MODES.average) {
      xfo = new Xfo()
      xfo.ori.set(0, 0, 0, 0)
      let numTreeItems = 0
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          const itemXfo = item.getParameter('GlobalXfo').getValue()
          xfo.tr.addInPlace(itemXfo.tr)
          xfo.ori.addInPlace(itemXfo.ori)
          numTreeItems++
        }
      })
      xfo.tr.scaleInPlace(1 / numTreeItems)
      xfo.ori.normalizeInPlace()
      // xfo.sc.scaleInPlace(1/ numTreeItems);
    } else if (initialXfoMode == GROUP_XFO_MODES.globalOri) {
      xfo = new Xfo()
      let numTreeItems = 0
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          const itemXfo = item.getParameter('GlobalXfo').getValue()
          xfo.tr.addInPlace(itemXfo.tr)
          numTreeItems++
        }
      })
      xfo.tr.scaleInPlace(1 / numTreeItems)
    } else {
      throw new Error('Invalid GROUP_XFO_MODES.')
    }

    // Note: if the KinematicGroup global param becomes dirty
    // then it stops propagating dirty to its members.
    // const newGlobal = this.getParameter('GlobalXfo').getValue() // force a cleaning.
    // this.invGroupXfo = newGlobal.inverse()

    this.getParameter('GlobalXfo').setValue(xfo)
    this.groupTransformOp.setBindXfo(xfo)

    this.memberXfoOps.forEach((op) => op.enable())
    this.calculatingGroupXfo = false
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
    if (this.isSelected()) {
      const color = this.getHighlight()
      color.a = 0.2
      const key = 'kinematicGroupItemHighlight' + this.getId()
      item.addHighlight(key, color, true)
    }

    {
      const memberGlobalXfoParam = item.getParameter('GlobalXfo')
      const memberXfoOp = new GroupMemberXfoOperator(this.getParameter('GroupTransform'), memberGlobalXfoParam)
      this.memberXfoOps.splice(index, 0, memberXfoOp)

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

    if (this.isSelected()) {
      const key = 'kinematicGroupItemHighlight' + this.getId()
      item.removeHighlight(key, true)
    }

    item.off('pointerDown', this.onPointerDown)
    item.off('pointerUp', this.onPointerUp)
    item.off('pointerMove', this.onPointerMove)
    item.off('pointerEnter', this.onPointerEnter)
    item.off('pointerLeave', this.onPointerLeave)

    {
      this.memberXfoOps[index].detach()
      this.memberXfoOps.splice(index, 1)
      this._setBoundingBoxDirty()

      item.getParameter('BoundingBox').off('valueChanged', this._setBoundingBoxDirty)
    }
  }

  /**
   * Adds an item to the group(See `Items` parameter).
   *
   * @param {BaseItem} item - The item value.
   * @param {boolean} emit - The emit value.
   */
  addItem(item, emit = true) {
    super.addItem(item, emit)
    if (emit) {
      this.calcGroupXfo()
    }
  }

  /**
   * Removes an item from the group(See `Items` parameter).
   *
   * @param {BaseItem} item - The item value.
   * @param {boolean} emit - The emit value.
   */
  removeItem(item, emit = true) {
    super.removeItem(item, emit)
    if (emit) {
      this.calcGroupXfo()
    }
  }

  /**
   * Sets an entire new array of items to the BaseGroup replacing any previous items.
   *
   * @param {array} items - List of `BaseItem` you want to add to the group
   */
  setItems(items) {
    super.setItems(emit)
    this.calcGroupXfo()
  }

  /**
   * Removes all items from the group.
   *
   * @param {boolean} emit - `true` triggers `valueChanged` event.
   */
  clearItems(emit = true) {
    super.clearItems(emit)
    this.memberXfoOps = []
    if (emit) {
      this.calcGroupXfo()
    }
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new group,
   * copies its values and returns it.
   *
   * @param {object} context - The context value.
   * @return {KinematicGroup} - Returns a new cloned group.
   */
  clone(context) {
    const cloned = new KinematicGroup()
    cloned.copyFrom(this, context)
    return cloned
  }
}

Registry.register('KinematicGroup', KinematicGroup)

export { KinematicGroup }
