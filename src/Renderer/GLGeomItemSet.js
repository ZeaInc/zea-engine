import '../SceneTree/GeomItem.js'

import { Signal } from '../Utilities/index'

/** This class abstracts the rendering of a collection of geometries to screen. */
class GLGeomItemSet {
  /**
   * Create a GL geom item set.
   * @param {any} gl - The gl value.
   * @param {any} glgeom - The glgeom value.
   */
  constructor(gl, glgeom) {
    this.gl = gl
    this.glgeom = glgeom
    this.glgeomItems = []
    this.glgeomItems_freeIndices = []
    this.glgeomItemSignalIds = []
    this.drawIdsArray = null
    this.drawIdsBuffer = null
    this.drawIdsBufferDirty = true

    this.highlightedIdsArray = null
    this.highlightedIdsBuffer = null
    this.highlightedIdsBufferDirty = true

    // this.inverted = false;
    this.lightmapName = undefined

    this.drawCountChanged = new Signal()

    this.visibleItems = []
    this.highlightedItems = []
  }

  /**
   * The getGLGeom method.
   * @return {any} - The return value.
   */
  getGLGeom() {
    return this.glgeom
  }

  // getGLGeomItemCount() {
  //     return this.glgeomItems.length;
  // }

  // getGLGeomItem(index) {
  //     return this.glgeomItems[index];
  // }

  // //  Note: used by patternade to iterate over items.
  // getGLGeomItems() {
  //     return this.glgeomItems;
  // }

  /**
   * The getLightmapName method.
   * @return {any} - The return value.
   */
  getLightmapName() {
    return this.lightmapName
  }

  /**
   * The getDrawCount method.
   * @return {any} - The return value.
   */
  getDrawCount() {
    return this.visibleItems.length
  }

  /**
   * The addGeomItem method.
   * @param {any} glgeomItem - The glgeomItem value.
   */
  addGeomItem(glgeomItem) {
    let index
    if (this.glgeomItems_freeIndices.length > 0) {
      index = this.glgeomItems_freeIndices.pop()
    } else {
      index = this.glgeomItems.length
      this.glgeomItems.push(null)
    }
    if (glgeomItem.visible) {
      this.visibleItems.push(index)
      this.drawCountChanged.emit(1)
    }
    if (glgeomItem.getGeomItem().isHighlighted()) {
      this.highlightedItems.push(index)
      this.highlightedIdsBufferDirty = true
    }

    if (this.glgeomItems.length == 1) {
      this.lightmapName = glgeomItem.getGeomItem().getLightmapName()
    }

    const signalIds = {}

    signalIds.sel = glgeomItem.highlightChanged.connect(() => {
      if (glgeomItem.getGeomItem().isHighlighted()) {
        // Note: highlightChanged is fired when the color changes
        // or another hilight is added over the top. We avoid
        // adding the same index again here. (TODO: use Set?)
        if (this.highlightedItems.indexOf(index) != -1) return
        this.highlightedItems.push(index)
      } else {
        this.highlightedItems.splice(this.highlightedItems.indexOf(index), 1)
      }
      // console.log("highlightChanged:", glgeomItem.getGeomItem().getName(), glgeomItem.getGeomItem().isHighlighted(), this.highlightedItems)
      this.highlightedIdsBufferDirty = true
    })

    signalIds.vis = glgeomItem.visibilityChanged.connect(visible => {
      if (visible) {
        this.visibleItems.push(index)
        this.drawCountChanged.emit(1)
      } else {
        this.visibleItems.splice(this.visibleItems.indexOf(index), 1)
        this.drawCountChanged.emit(-1)
      }
      this.drawIdsBufferDirty = true
    })

    this.glgeomItems[index] = glgeomItem
    this.glgeomItemSignalIds[index] = signalIds

    this.drawIdsBufferDirty = true
  }

  /**
   * The removeGeomItem method.
   * @param {any} glgeomItem - The glgeomItem value.
   */
  removeGeomItem(glgeomItem) {
    const index = this.glgeomItems.indexOf(glgeomItem)
    const signalIds = this.glgeomItemSignalIds[index]
    glgeomItem.highlightChanged.disconnectId(signalIds.sel)
    glgeomItem.visibilityChanged.disconnectId(signalIds.vis)

    this.glgeomItems[index] = null
    this.glgeomItemSignalIds[index] = null

    this.glgeomItems_freeIndices.push(index)

    if (glgeomItem.visible) {
      this.visibleItems.splice(this.visibleItems.indexOf(index), 1)
      this.drawCountChanged.emit(-1)
    }
    const highlighted = glgeomItem.getGeomItem().isHighlighted()
    if (highlighted) {
      this.highlightedItems.splice(this.highlightedItems.indexOf(index), 1)
    }
    this.drawIdsBufferDirty = true
    // console.log("removeGeomItem:", glgeomItem.getGeomItem().getName(), this.glgeomItems.length)
    if (this.glgeomItems.length == 0) {
      this.destroy()
    }
  }

  // ////////////////////////////////////
  // Instance Ids

  /**
   * The updateDrawIDsBuffer method.
   * The culling system will specify a subset of the total number of items for
   * drawing.
   */
  updateDrawIDsBuffer() {
    const gl = this.gl
    if (!gl.floatTexturesSupported) {
      this.drawIdsBufferDirty = false
      return
    }
    if (
      this.drawIdsBuffer &&
      this.glgeomItems.length != this.drawIdsArray.length
    ) {
      this.gl.deleteBuffer(this.drawIdsBuffer)
      this.drawIdsBuffer = null
    }
    if (!this.drawIdsBuffer) {
      this.drawIdsArray = new Float32Array(this.glgeomItems.length)
      this.drawIdsBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.drawIdsBuffer)
    }

    // Collect all visible geom ids into the instanceIds array.
    // Note: the draw count can be less than the number of instances
    // we re-use the same buffer and simply invoke fewer draw calls.
    this.visibleItems.forEach((index, tgtIndex) => {
      this.drawIdsArray[tgtIndex] = this.glgeomItems[index].getId()
    })
    gl.bindBuffer(gl.ARRAY_BUFFER, this.drawIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.drawIdsArray, gl.STATIC_DRAW)

    this.drawIdsBufferDirty = false
  }

  // ////////////////////////////////////
  // Selected Items

  /**
   * The updateHighlightedIDsBuffer method.
   */
  updateHighlightedIDsBuffer() {
    const gl = this.gl
    if (!gl.floatTexturesSupported) {
      this.highlightedIdsBufferDirty = false
      return
    }
    if (
      this.highlightedIdsBuffer &&
      this.glgeomItems.length != this.highlightedIdsArray.length
    ) {
      this.gl.deleteBuffer(this.highlightedIdsBuffer)
      this.highlightedIdsBuffer = null
    }

    // Collect all visible geom ids into the instanceIds array.
    // Note: the draw count can be less than the number of instances
    // we re-use the same buffer and simply invoke fewer draw calls.
    if (
      !this.highlightedIdsArray ||
      this.highlightedItems.length > this.highlightedIdsArray.length
    ) {
      this.highlightedIdsArray = new Float32Array(this.highlightedItems.length)
      if (this.highlightedIdsBuffer) {
        gl.deleteBuffer(this.highlightedIdsBuffer)
        this.highlightedIdsBuffer = null
      }
    }

    this.highlightedItems.forEach((index, tgtIndex) => {
      this.highlightedIdsArray[tgtIndex] = this.glgeomItems[index].getId()
    })

    if (!this.highlightedIdsBuffer) {
      this.highlightedIdsBuffer = gl.createBuffer()
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.highlightedIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.highlightedIdsArray, gl.STATIC_DRAW)

    this.highlightedIdsBufferDirty = false
  }

  // ////////////////////////////////////
  // Drawing

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    if (this.visibleItems.length == 0) {
      return
    }
    if (this.drawIdsBufferDirty) {
      this.updateDrawIDsBuffer()
    }

    const gl = this.gl
    const unifs = renderstate.unifs

    if (renderstate.lightmaps && unifs.lightmap) {
      if (renderstate.boundLightmap != this.lightmapName) {
        const gllightmap = renderstate.lightmaps[this.lightmapName]
        if (gllightmap && gllightmap.glimage.isLoaded()) {
          gllightmap.glimage.bindToUniform(renderstate, unifs.lightmap)
          gl.uniform2fv(
            unifs.lightmapSize.location,
            gllightmap.atlasSize.asArray()
          )
          if (unifs.lightmapConnected) {
            gl.uniform1i(unifs.lightmapConnected.location, true)
          }
          renderstate.boundLightmap = this.lightmapName
        } else {
          // disable lightmaps. Revert to default lighting.
          if (unifs.lightmapConnected) {
            gl.uniform1i(unifs.lightmapConnected.location, false)
          }
        }
      }
    }

    this.__bindAndRender(renderstate, this.visibleItems, this.drawIdsBuffer)
  }

  /**
   * The drawHighlighted method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlighted(renderstate) {
    if (this.highlightedItems.length == 0) {
      return
    }
    if (this.highlightedIdsBufferDirty) {
      this.updateHighlightedIDsBuffer()
    }

    this.__bindAndRender(
      renderstate,
      this.highlightedItems,
      this.highlightedIdsBuffer
    )
  }

  /**
   * The __bindAndRender method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} itemIndices - The itemIndices value.
   * @param {any} drawIdsBuffer - The drawIdsBuffer value.
   * @private
   */
  __bindAndRender(renderstate, itemIndices, drawIdsBuffer) {
    const gl = this.gl
    const unifs = renderstate.unifs

    // Lazy unbinding. We can have situations where we have many materials
    // all bound to the same geom. e.g. lots of billboards
    // We can avoid the expensive re-binding of geoms with a simple check.
    if (renderstate.glgeom != this.glgeom) {
      this.glgeom.bind(renderstate)
      renderstate.glgeom = this.glgeom
    }

    if (
      !gl.floatTexturesSupported ||
      !gl.drawElementsInstanced ||
      !renderstate.supportsInstancing
    ) {
      if (renderstate.unifs.instancedDraw) {
        gl.uniform1i(renderstate.unifs.instancedDraw.location, 0)
      }
      itemIndices.forEach(index => {
        this.glgeomItems[index].bind(renderstate)
        renderstate.bindViewports(unifs, () => {
          this.glgeom.draw(renderstate)
        })
      })
    } else {
      // console.log("draw:"+ this.drawIdsArray);

      // Specify an instanced draw to the shader so it knows how
      // to retrieve the modelmatrix.
      gl.uniform1i(renderstate.unifs.instancedDraw.location, 1)

      // The instanced transform ids are bound as an instanced attribute.
      const location = renderstate.attrs.instancedIds.location
      gl.enableVertexAttribArray(location)
      gl.bindBuffer(gl.ARRAY_BUFFER, drawIdsBuffer)
      gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 1 * 4, 0)
      gl.vertexAttribDivisor(location, 1) // This makes it instanced

      renderstate.bindViewports(unifs, () => {
        this.glgeom.drawInstanced(itemIndices.length)
      })
    }
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
  }
}

export { GLGeomItemSet }
