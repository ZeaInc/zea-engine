/* eslint-disable no-unused-vars */
import { Vec3, Color, Xfo } from '../../Math/index'
import { Registry } from '../../Registry'
import {
  BooleanParameter,
  NumberParameter,
  Vec3Parameter,
  ColorParameter,
  XfoParameter,
  MultiChoiceParameter,
} from '../Parameters/index'
import { BaseGroup } from './BaseGroup'
import { MaterialParameter } from '../Parameters/MaterialParameter.js'
import { TreeItem } from '../TreeItem'
import { BaseGeomItem } from '../BaseGeomItem'
import { GroupTransformXfoOperator, GroupMemberXfoOperator } from '../Operators/GroupMemberXfoOperator.js'

const GROUP_XFO_MODES = {
  disabled: 0,
  manual: 1,
  first: 2,
  average: 3,
  globalOri: 4,
}

/**
 * Groups are a special type of `BaseGroup` that allows you to gather/classify/organize/modify
 * multiple items contained within the group. Items can be added to the group directly, or using
 * its path.
 * All parameters set to the group are also set to the children; in other words, it's a faster way
 * to apply common things to multiple items.
 *
 * **Parameters**
 * * **Items(`ItemSetParameter`):** The items referenced in this group are stored in this parameter.
 * * **Highlighted(`BooleanParameter`):** _todo_
 * * **HighlightColor(`ColorParameter`):** _todo_
 * * **HighlightFill(`NumberParameter`):** _todo_
 * * **Material(`MaterialParameter`):** _todo_
 * * **CutAwayEnabled(`BooleanParameter`):** _todo_
 * * **CutPlaneNormal(`Vec3Parameter`):** _todo_
 * * **CutPlaneDist(`NumberParameter`):** _todo_
 *
 * @extends BaseGroup
 */
class Group extends BaseGroup {
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

    this.__highlightedParam = this.addParameter(new BooleanParameter('Highlighted', false))
    this.__highlightedParam.on('valueChanged', () => {
      this.__updateHighlight()
    })

    this.__updateHighlight = this.__updateHighlight.bind(this)
    const highlightColorParam = this.addParameter(new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1)))
    highlightColorParam.on('valueChanged', this.__updateHighlight)
    const highlightFillParam = this.addParameter(new NumberParameter('HighlightFill', 0.0, [0, 1]))
    highlightFillParam.on('valueChanged', this.__updateHighlight)

    this.__materialParam = this.addParameter(new MaterialParameter('Material'))
    this.__materialParam.on('valueChanged', () => {
      this.__updateMaterial()
    })

    this.__updateCutaway = this.__updateCutaway.bind(this)
    this.addParameter(new BooleanParameter('CutAwayEnabled', false)).on('valueChanged', this.__updateCutaway)
    this.addParameter(new Vec3Parameter('CutPlaneNormal', new Vec3(1, 0, 0))).on('valueChanged', this.__updateCutaway)
    this.addParameter(new NumberParameter('CutPlaneDist', 0.0)).on('valueChanged', this.__updateCutaway)

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

    // Note: if the Group global param becomes dirty
    // then it stops propagating dirty to its members.
    // const newGlobal = this.getParameter('GlobalXfo').getValue() // force a cleaning.
    // this.invGroupXfo = newGlobal.inverse()

    this.getParameter('GlobalXfo').setValue(xfo)
    this.groupTransformOp.setBindXfo(xfo)

    this.memberXfoOps.forEach((op) => op.enable())
    this.calculatingGroupXfo = false
  }

  // ////////////////////////////////////////
  // Materials

  /**
   * The __updateMaterial method.
   * @private
   */
  __updateMaterial() {
    // Make this function async so that we don't pull on the
    // graph immediately when we receive a notification.
    // Note: propagating using an operator would be much better.
    new Promise((resolve) => {
      const material = this.getParameter('Material').getValue()

      // TODO: Bind an operator
      Array.from(this.__itemsParam.getValue()).forEach((item) => {
        item.traverse((treeItem) => {
          if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
            const p = treeItem.getParameter('Material')
            if (material) {
              const m = p.getValue()

              // TODO: How do we filter material assignments? this is a nasty hack.
              // but else we end up assigning surface materials to our edges.
              if (m != material && (!m || m.getShaderName() != 'LinesShader')) {
                p.__backupMaterial = m
                p.loadValue(material)
              }
            } else if (p.__backupMaterial) {
              p.loadValue(p.__backupMaterial)
            }
          }
        }, false)
      })
      resolve()
    })
  }

  // ////////////////////////////////////////
  // Cutaways

  /**
   * The __updateCutaway method.
   * @private
   */
  __updateCutaway() {
    // Make this function async so that we don't pull on the
    // graph immediately when we receive a notification.
    // Note: propagating using an operator would be much better.
    new Promise((resolve) => {
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
      resolve()
    })
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
    // Update the Material
    const material = this.getParameter('Material').getValue()
    if (material) {
      // TODO: Bind an operator instead
      item.traverse((treeItem) => {
        if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
          const p = treeItem.getParameter('Material')
          if (material) {
            const m = p.getValue()
            // TODO: How do we filter material assignments? this is a nasty hack.
            // but else we end up assigning surface materials to our edges.
            if (m != material && (!m || m.getShaderName() != 'LinesShader')) {
              p.__backupMaterial = m
              p.loadValue(material)
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
          // console.log("cutEnabled:", treeItem.getPath(), cutAwayVector.toString(), treeItem.getParameter('Material').getValue().getShaderName())
          treeItem.setCutawayEnabled(cutEnabled)
          treeItem.setCutVector(cutAwayVector)
          treeItem.setCutDist(cutAwayDist)
        }
      }, true)
    }

    if (!this.isVisible()) {
      // Decrement the visibility counter which might cause
      // this item to become invisible. (or it might already be invisible.)
      item.propagateVisibility(-1)
    }

    if (item instanceof TreeItem) {
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
   * @return {Group} - Returns a new cloned group.
   */
  clone(context) {
    const cloned = new Group()
    cloned.copyFrom(this, context)
    return cloned
  }
}

Registry.register('Group', Group)

export { Group }
