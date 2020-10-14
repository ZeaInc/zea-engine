import { EventEmitter } from '../Utilities/index'

import '../SceneTree/GeomItem.js'

const GLGeomItemChangeType = {
  GEOMITEM_CHANGED: 0,
  GEOM_CHANGED: 1,
  VISIBILITY_CHANGED: 2,
  HIGHLIGHT_CHANGED: 3,
}

/** This class abstracts the rendering of a collection of geometries to screen.
 * @extends EventEmitter
 */
class GLGeomItem extends EventEmitter {
  /**
   * Create a GL geom item.
   * @param {any} gl - The gl value.
   * @param {any} geomItem - The geomItem value.
   * @param {any} glGeom - The glGeom value.
   * @param {any} id - The id value.
   * @param {number} flags - The flags value.
   */
  constructor(gl, geomItem, glGeom, id, supportInstancing = false) {
    super()
    this.gl = gl
    this.geomItem = geomItem
    this.glGeom = glGeom
    this.id = id
    this.supportInstancing = supportInstancing
    this.visible = this.geomItem.isVisible()
    this.culled = false

    this.cutDataChanged = false
    this.cutData = [0, 0, 0, 0]

    // if(glGeom.__numTriangles) {
    //   numSceneMeshTriangles += glGeom.__numTriangles
    //   console.log(this.geomItem.getName(), glGeom.__numTriangles, numSceneMeshTriangles)
    // }

    this.updateVisibility = this.updateVisibility.bind(this)
    this.destroy = this.destroy.bind(this)

    if (!this.supportInstancing) {
      this.geomMatrixDirty = true
      this.geomMatrixChanged = () => {
        this.geomMatrixDirty = true
        this.emit('updated')
      }
    } else {
      this.geomMatrixChanged = () => {
        this.emit('updated', { type: GLGeomItemChangeType.GEOMITEM_CHANGED })
      }
    }

    this.cutAwayChanged = () => {
      if (!this.supportInstancing) {
        this.cutDataChanged = true
      } else {
        this.emit('updated', { type: GLGeomItemChangeType.GEOMITEM_CHANGED })
      }
    }
    this.highlightChanged = () => {
      this.emit('updated', { type: GLGeomItemChangeType.HIGHLIGHT_CHANGED })
      this.emit('highlightChanged')
    }
    this.glGeomUpdated = () => {
      this.emit('updated', { type: GLGeomItemChangeType.GEOM_CHANGED })
    }

    this.geomItem.getParameter('GeomMat').on('valueChanged', this.geomMatrixChanged)
    this.geomItem.on('visibilityChanged', this.updateVisibility)
    this.geomItem.on('cutAwayChanged', this.cutAwayChanged)
    this.geomItem.on('highlightChanged', this.highlightChanged)
    this.glGeom.on('updated', this.glGeomUpdated)

    if (!this.supportInstancing) {
      const materialId = 0
      let flags = 0
      if (this.geomItem.isCutawayEnabled()) {
        const GEOMITEM_FLAG_CUTAWAY = 1 // 1<<0;
        flags |= GEOMITEM_FLAG_CUTAWAY
      }
      this.geomData = [flags, materialId, 0, 0]
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
   * The getGLGeom method.
   * @return {any} - The return value.
   */
  getGLGeom() {
    return this.glGeom
  }

  /**
   * The isVisible method.
   * @return {any} - The return value.
   */
  isVisible() {
    return this.geomItem.isVisible()
  }

  /**
   * The getId method.
   * @return {any} - The return value.
   */
  getId() {
    return this.id
  }

  /**
   * The updateVisibility method.
   */
  updateVisibility() {
    const geomVisible = this.geomItem.isVisible()
    const visible = geomVisible && !this.culled
    if (this.visible != visible) {
      this.visible = visible
      this.emit('visibilityChanged', { visible })
      this.emit('updated', {})
    }
  }

  /**
   * The setCullState method.
   * @param {any} culled - The culled value.
   */
  setCullState(culled) {
    this.culled = culled
    this.updateVisibility()
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
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
      const cutawayDataunif = unifs.cutawayData
      if (cutawayDataunif) {
        if (this.cutDataChanged) {
          if (this.geomItem.isCutawayEnabled()) {
            const cutAwayVector = this.geomItem.getCutVector()
            const cutAwayDist = this.geomItem.getCutDist()
            this.cutData = [cutAwayVector.x, cutAwayVector.y, cutAwayVector.z, cutAwayDist]
          }
        }
        gl.uniform4fv(cutawayDataunif.location, this.cutData)
      }
    }

    const unif = unifs.transformIndex
    if (unif) {
      gl.uniform1i(unif.location, this.id)
    }
    return true
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    this.geomItem.getParameter('GeomMat').off('valueChanged', this.geomMatrixChanged)
    this.geomItem.off('visibilityChanged', this.updateVisibility)
    this.geomItem.off('cutAwayChanged', this.cutAwayChanged)
    this.geomItem.off('highlightChanged', this.highlightChanged)
    this.glGeom.off('updated', this.glGeomUpdated)
  }
}

export { GLGeomItemChangeType, GLGeomItem }
