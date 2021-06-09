import { EventEmitter } from '../../Utilities/index'

import '../../SceneTree/GeomItem.js'
import { GeomItem } from '../../SceneTree/GeomItem.js'

const GLGeomItemChangeType = {
  GEOMITEM_CHANGED: 0,
  GEOM_CHANGED: 1,
  VISIBILITY_CHANGED: 2,
  HIGHLIGHT_CHANGED: 3,
}

const GLGeomItemFlags = {
  GEOMITEM_FLAG_CUTAWAY: 1, // 1<<0;
  GEOMITEM_INVISIBLE_IN_GEOMDATA: 2, // 1<<0;
}

/** This class is responsible for managing a GeomItem within the renderer.
 * @private
 * @extends EventEmitter
 */
class GLGeomItem extends EventEmitter {
  /**
   * Create a GL geom item.
   * @param {WebGLContextAttributes} gl - The gl value.
   * @param {GeomItem} geomItem - The geomItem value.
   * @param {number} drawItemId - The drawItemId value.
   * @param {number} geomId - The geomId value.
   * @param {number} materialId - The materialId value.
   * @param {boolean} supportInstancing - a boolean to disable instancing support on some mobile platforms
   */
  constructor(gl, geomItem, drawItemId, geomId, materialId, supportInstancing = false) {
    super()
    this.gl = gl
    this.geomItem = geomItem
    this.drawItemId = drawItemId
    this.geomId = geomId
    this.materialId = materialId
    this.supportInstancing = supportInstancing

    this.geomVisible = this.geomItem.isVisible()
    this.visible = this.geomVisible
    this.culled = false

    this.updateVisibility = this.updateVisibility.bind(this)
    this.geomItem.on('visibilityChanged', this.updateVisibility)

    if (!this.supportInstancing) {
      this.cutDataChanged = false
      this.cutData = [0, 0, 0, 0]

      const materialId = 0
      let flags = 0
      if (this.geomItem.isCutawayEnabled()) {
        flags |= GLGeomItemFlags.GEOMITEM_FLAG_CUTAWAY
      }
      if (geomItem.visibleInGeomDataBuffer == false) {
        flags |= GLGeomItemFlags.GEOMITEM_INVISIBLE_IN_GEOMDATA
      }

      this.geomData = [flags, materialId, 0, 0]

      this.geomMatrixDirty = true
      this.geomItem.getParameter('GeomMat').on('valueChanged', () => {
        this.geomMatrixDirty = true
        this.emit('updated')
      })
      this.geomItem.on('cutAwayChanged', () => {
        this.cutDataChanged = true
        this.emit('updated')
      })
    }
  }

  /**
   * The getGeomItem method.
   * @return {any} - The return value.
   */
  getGeomItem() {
    return this.geomItem
  }

  /**
   * The isVisible method.
   * @return {any} - The return value.
   */
  isVisible() {
    return this.visible
  }

  /**
   * The getId method.
   * @return {any} - The return value.
   */
  getDrawItemId() {
    return this.drawItemId
  }

  /**
   * The updateVisibility method.
   */
  updateVisibility() {
    this.geomVisible = this.geomItem.isVisible()
    const visible = this.geomVisible && !this.culled
    if (this.visible != visible) {
      this.visible = visible
      this.emit('visibilityChanged', { visible })
      this.emit('updated', {})
    }
  }

  /**
   * Sets the additional culled value which controls visiblity
   * @param {boolean} culled - True if culled, else false.
   */
  setCulled(culled) {
    this.culled = culled
    const visible = this.geomVisible && !this.culled
    if (this.visible != visible) {
      this.visible = visible
      this.emit('visibilityChanged', { visible })
    }
  }

  /**
   * The bind method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @return {any} - The return value.
   */
  bind(renderstate) {
    const gl = this.gl
    const unifs = renderstate.unifs

    if (!this.supportInstancing) {
      const modelMatrixunif = unifs.modelMatrix
      if (modelMatrixunif) {
        if (this.geomMatrixDirty) {
          this.modelMatrixArray = this.geomItem.getGeomMat4().asArray()
        }
        gl.uniformMatrix4fv(modelMatrixunif.location, false, this.modelMatrixArray)
      }
      const drawItemDataunif = unifs.drawItemData
      if (drawItemDataunif) {
        gl.uniform4fv(drawItemDataunif.location, this.geomData)
      }
      const cutawayDataUnif = unifs.cutawayData
      if (cutawayDataUnif) {
        if (this.cutDataChanged) {
          if (this.geomItem.isCutawayEnabled()) {
            const cutAwayVector = this.geomItem.getCutVector()
            const cutAwayDist = this.geomItem.getCutDist()
            this.cutData = [cutAwayVector.x, cutAwayVector.y, cutAwayVector.z, cutAwayDist]
          }
        }
        gl.uniform4fv(cutawayDataUnif.location, this.cutData)
      }
    }

    const unif = unifs.drawItemId
    if (unif) {
      gl.uniform1i(unif.location, this.drawItemId)
    }
    return true
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    this.geomItem.off('visibilityChanged', this.updateVisibility)
    if (!this.supportInstancing) {
      this.geomItem.getParameter('GeomMat').off('valueChanged', this.geomMatrixChanged)
      this.geomItem.off('cutAwayChanged', this.cutAwayChanged)
      this.geomItem.off('highlightChanged', this.highlightChanged)
    }
    // this.glGeom.off('updated', this.glGeomUpdated)
  }
}

export { GLGeomItemChangeType, GLGeomItemFlags, GLGeomItem }
