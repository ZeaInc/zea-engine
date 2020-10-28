/* eslint-disable no-unused-vars */
import { Registry } from '../../Registry'
import { BaseGroup } from './BaseGroup'
import { MaterialParameter } from '../Parameters/MaterialParameter.js'
import { TreeItem } from '../TreeItem'

/**
 *
 * **Parameters**
 * * **Material(`MaterialParameter`):** _todo_
 *
 * @extends BaseGroup
 */
class MaterialGroup extends BaseGroup {
  /**
   * Creates an instance of a group.
   *
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name)

    this.__materialParam = this.addParameter(new MaterialParameter('Material'))
    this.__materialParam.on('valueChanged', () => {
      this.__updateMaterial()
    })
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
                p.setValue(material)
              }
            } else if (p.__backupMaterial) {
              p.setValue(p.__backupMaterial)
            }
          }
        }, false)
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
    super.__bindItem(item, index)

    if (!(item instanceof TreeItem)) return

    // ///////////////////////////////
    // Update the highlight
    if (this.isSelected()) {
      const color = this.getHighlight()
      color.a = 0.2
      const key = 'materialGroupItemHighlight' + this.getId()
      item.addHighlight(key, color, true)
    }

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
              p.setValue(material)
            }
          }
        }
      }, true)
    }
  }

  /**
   * The __unbindItem method.
   * @param {BaseItem} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __unbindItem(item, index) {
    super.__unbindItem(item, index)
    if (!(item instanceof TreeItem)) return

    if (this.isSelected()) {
      const key = 'materialGroupItemHighlight' + this.getId()
      item.removeHighlight(key, true)
    }
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new group,
   * copies its values and returns it.
   *
   * @param {object} context - The context value.
   * @return {MaterialGroup} - Returns a new cloned group.
   */
  clone(context) {
    const cloned = new MaterialGroup()
    cloned.copyFrom(this, context)
    return cloned
  }
}

Registry.register('MaterialGroup', MaterialGroup)

export { MaterialGroup }
