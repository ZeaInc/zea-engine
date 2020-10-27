/* eslint-disable no-unused-vars */
import { Vec4 } from '../../Math/index'
import { Registry } from '../../Registry'
import { BooleanParameter } from '../Parameters/index'
import { BaseGroup } from './BaseGroup'
import { TreeItem } from '../TreeItem'
import { BaseGeomItem } from '../BaseGeomItem'
import { CuttingPlaneOperator } from '../Operators/CuttingPlaneOperator.js'

/**
 * Groups are a special type of `BaseGroup` that allows you to gather/classify/organize/modify
 * multiple items contained within the group. Items can be added to the group directly, or using
 * its path.
 * All parameters set to the group are also set to the children; in other words, it's a faster way
 * to apply common things to multiple items.
 *
 * **Parameters**
 * * **CutAwayEnabled(`BooleanParameter`):** _todo_
 * * **CutPlaneNormal(`Vec3Parameter`):** _todo_
 * * **CutPlaneDist(`NumberParameter`):** _todo_
 *
 * @extends BaseGroup
 */
class CuttingPlane extends BaseGroup {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)

    this.__updateCutaway = this.__updateCutaway.bind(this)
    this.addParameter(new BooleanParameter('CutAwayEnabled', false)).on('valueChanged', this.__updateCutaway)
    this.addParameter(new Vec4Parameter('CutPlane', new Vec4(1, 0, 0))).on('valueChanged', this.__updateCutaway)
    this.cutPlaneOp = new CuttingPlaneOperator(this.getParameter('GlobalXfo'), this.getParameter('CutPlane'))
  }

  // ////////////////////////////////////////
  // Cutaways

  /**
   * The __updateCutaway method.
   * @private
   */
  __updateCutaway(item) {
    // Make this function async so that we don't pull on the
    // graph immediately when we receive a notification.
    // Note: propagating using an operator would be much better.
    new Promise((resolve) => {
      const cutEnabled = this.getParameter('CutAwayEnabled').getValue()
      const cutAwayVector = this.getParameter('CutPlaneNormal').getValue()
      const cutAwayDist = this.getParameter('CutPlaneDist').getValue()

      if (item) {
        if (treeItem instanceof BaseGeomItem) {
          treeItem.setCutawayEnabled(cutEnabled)
          treeItem.setCutVector(cutAwayVector)
          treeItem.setCutDist(cutAwayDist)
        }
      } else {
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

    // ///////////////////////////////
    // Update the item cutaway
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue()
    if (cutEnabled) {
      this.__updateCutaway(item)
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

    // ///////////////////////////////
    // Update the item cutaway
    item.traverse((treeItem) => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(false)
      }
    }, true)
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new group,
   * copies its values and returns it.
   *
   * @param {object} context - The context value.
   * @return {CuttingPlane} - Returns a new cloned group.
   */
  clone(context) {
    const cloned = new CuttingPlane()
    cloned.copyFrom(this, context)
    return cloned
  }
}

Registry.register('CuttingPlane', CuttingPlane)

export { CuttingPlane }
