import '../../SceneTree/GeomItem.js'

import { EventEmitter } from '../../Utilities/index'

/** This class abstracts the rendering of a collection of geometries to screen.
 * @extends EventEmitter
 * @private
 */
class GLGeomItemSet extends EventEmitter {
  /**
   * Create a GL geom item set.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   * @param {any} glGeom - The glGeom value.
   */
  constructor(gl, glGeom) {
    super()
    this.gl = gl
    this.glGeom = glGeom
    this.id = glGeom ? glGeom.getGeom().getId() : this.getId()
    this.glGeomItems = []
    this.glgeomItems_freeIndices = []
    this.glgeomItemEventHandlers = []
    this.drawIdsArray = null
    this.drawIdsBuffer = null
    this.drawIdsBufferDirty = true

    this.highlightedIdsArray = null
    this.highlightedIdsBuffer = null
    this.highlightedIdsBufferDirty = true

    this.visibleItems = []
    this.highlightedItems = []
  }

  /**
   * The getGLGeom method.
   * @return {any} - The return value.
   */
  getGLGeom() {
    return this.glGeom
  }

  /**
   * The getDrawCount method.
   * @return {any} - The return value.
   */
  getDrawCount() {
    return this.visibleItems.length
  }

  /**
   * The addGLGeomItem method.
   * @param {any} glGeomItem - The glGeomItem value.
   */
  addGLGeomItem(glGeomItem) {
    let index
    if (this.glgeomItems_freeIndices.length > 0) {
      index = this.glgeomItems_freeIndices.pop()
    } else {
      index = this.glGeomItems.length
      this.glGeomItems.push(null)
    }
    if (glGeomItem.geomItem.isVisible()) {
      this.visibleItems.push(index)
      this.emit('drawCountChanged', { change: 1, count: this.visibleItems.length })
    }
    if (glGeomItem.geomItem.isHighlighted()) {
      this.highlightedItems.push(index)
      this.highlightedIdsBufferDirty = true
    }

    const eventHandlers = {}

    eventHandlers.highlightChanged = (event) => {
      if (glGeomItem.geomItem.isHighlighted()) {
        // Note: highlightChanged is fired when the color changes
        // or another highlight is added over the top. We avoid
        // adding the same index again here. (TODO: use Set?)
        if (this.highlightedItems.includes(index)) return
        this.highlightedItems.push(index)
        this.emit('highlightedCountChanged', { change: 1, count: this.highlightedItems.length })
      } else {
        this.highlightedItems.splice(this.highlightedItems.indexOf(index), 1)
        this.emit('highlightedCountChanged', { change: -1, count: this.highlightedItems.length })
      }
      // console.log("highlightChanged:", glGeomItem.geomItem.getName(), glGeomItem.geomItem.isHighlighted(), this.highlightedItems)
      this.highlightedIdsBufferDirty = true
    }
    glGeomItem.geomItem.on('highlightChanged', eventHandlers.highlightChanged)
    eventHandlers.visibilityChanged = (event) => {
      const visible = event.visible
      if (visible) {
        this.visibleItems.push(index)
        this.emit('drawCountChanged', { change: 1, count: this.visibleItems.length })
      } else {
        this.visibleItems.splice(this.visibleItems.indexOf(index), 1)
        this.emit('drawCountChanged', { change: -1, count: this.visibleItems.length })
      }
      this.drawIdsBufferDirty = true
    }
    glGeomItem.geomItem.on('visibilityChanged', eventHandlers.visibilityChanged)

    this.glGeomItems[index] = glGeomItem
    this.glgeomItemEventHandlers[index] = eventHandlers

    this.drawIdsBufferDirty = true

    glGeomItem.GLGeomItemSet = this
  }

  /**
   * The removeGLGeomItem method.
   * @param {any} glGeomItem - The glGeomItem value.
   */
  removeGLGeomItem(glGeomItem) {
    const index = this.glGeomItems.indexOf(glGeomItem)
    const eventHandlers = this.glgeomItemEventHandlers[index]
    glGeomItem.geomItem.off('highlightChanged', eventHandlers.highlightChanged)
    glGeomItem.geomItem.off('visibilityChanged', eventHandlers.visibilityChanged)

    this.glGeomItems[index] = null
    this.glgeomItemEventHandlers[index] = null
    glGeomItem.GLGeomItemSet = null

    this.glgeomItems_freeIndices.push(index)

    if (glGeomItem.geomItem.isVisible()) {
      this.visibleItems.splice(this.visibleItems.indexOf(index), 1)
      this.emit('drawCountChanged', { change: -1, count: this.visibleItems.length })
    }
    if (glGeomItem.geomItem.isHighlighted()) {
      this.highlightedItems.splice(this.highlightedItems.indexOf(index), 1)
      this.emit('highlightedCountChanged', { change: -1, count: this.highlightedItems.length })
    }
    this.drawIdsBufferDirty = true
    // console.log("removeGLGeomItem:", glGeomItem.geomItem.getName(), this.glGeomItems.length)
    if (this.glGeomItems.length == this.glgeomItems_freeIndices.length) {
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
    if (this.drawIdsBuffer && this.glGeomItems.length != this.drawIdsArray.length) {
      this.gl.deleteBuffer(this.drawIdsBuffer)
      this.drawIdsBuffer = null
    }
    if (!this.drawIdsBuffer) {
      this.drawIdsBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, this.drawIdsBuffer)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.drawIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.getDrawIdsArray(), gl.STATIC_DRAW)

    this.drawIdsBufferDirty = false
  }

  /**
   * The getDrawIdsArray method.
   * @return {Float32Array} - The drawIds for each GeomItem packed into a Float32Array
   */
  getDrawIdsArray() {
    if (this.drawIdsBufferDirty) {
      if (!this.drawIdsArray || this.glGeomItems.length != this.drawIdsArray.length) {
        this.drawIdsArray = new Float32Array(this.glGeomItems.length)
      }

      // Collect all visible geom ids into the instanceIds array.
      // Note: the draw count can be less than the number of instances
      // we re-use the same buffer and simply invoke fewer draw calls.
      this.visibleItems.forEach((index, tgtIndex) => {
        this.drawIdsArray[tgtIndex] = this.glGeomItems[index].getDrawItemId()
      })

      this.drawIdsBufferDirty = false
    }
    return this.drawIdsArray
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
    if (this.highlightedIdsBuffer && this.glGeomItems.length > this.highlightedIdsArray.length) {
      this.gl.deleteBuffer(this.highlightedIdsBuffer)
      this.highlightedIdsBuffer = null
    }
    if (!this.highlightedIdsBuffer) {
      this.highlightedIdsBuffer = gl.createBuffer()
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.highlightedIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.getHighlightedIdsArray(), gl.STATIC_DRAW)

    this.highlightedIdsBufferDirty = false
  }

  /**
   * The getHighlightedIdsArray method.
   * @return {Float32Array} - The drawIds for each GeomItem packed into a Float32Array
   */
  getHighlightedIdsArray() {
    if (this.highlightedIdsBufferDirty) {
      if (!this.highlightedIdsArray || this.highlightedItems.length > this.highlightedIdsArray.length) {
        this.highlightedIdsArray = new Float32Array(this.glGeomItems.length)
      }

      // Collect all visible geom ids into the instanceIds array.
      // Note: the draw count can be less than the number of instances
      // we re-use the same buffer and simply invoke fewer draw calls.
      this.highlightedItems.forEach((index, tgtIndex) => {
        this.highlightedIdsArray[tgtIndex] = this.glGeomItems[index].getDrawItemId()
      })

      this.highlightedIdsBufferDirty = false
    }
    return this.highlightedIdsArray
  }

  // ////////////////////////////////////
  // Drawing

  /**
   * The draw method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  draw(renderstate) {
    if (this.visibleItems.length == 0) {
      return
    }
    if (this.drawIdsBufferDirty) {
      this.updateDrawIDsBuffer()
    }

    this.__bindAndRender(renderstate, this.visibleItems, this.drawIdsBuffer)
  }

  /**
   * The drawHighlighted method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawHighlighted(renderstate) {
    if (this.highlightedItems.length == 0) {
      return
    }
    if (this.highlightedIdsBufferDirty) {
      this.updateHighlightedIDsBuffer()
    }

    this.__bindAndRender(renderstate, this.highlightedItems, this.highlightedIdsBuffer)
  }

  /**
   * The __bindAndRender method.
   * @param {object} renderstate - The object tracking the current state of the renderer
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
    if (renderstate.glGeom != this.glGeom) {
      this.glGeom.bind(renderstate)
      renderstate.glGeom = this.glGeom
    }

    if (!gl.floatTexturesSupported || !gl.drawElementsInstanced || !renderstate.supportsInstancing) {
      if (renderstate.unifs.instancedDraw) {
        gl.uniform1i(renderstate.unifs.instancedDraw.location, 0)
      }
      itemIndices.forEach((index) => {
        this.glGeomItems[index].bind(renderstate)
        renderstate.bindViewports(unifs, () => {
          this.glGeom.draw(renderstate)
        })
      })
    } else {
      // console.log("draw:"+ this.drawIdsArray);

      // Specify an instanced draw to the shader so it knows how
      // to retrieve the modelmatrix.
      if (renderstate.unifs.instancedDraw) {
        gl.uniform1i(renderstate.unifs.instancedDraw.location, 1)
      }

      // The instanced transform ids are bound as an instanced attribute.
      const location = renderstate.attrs.instancedIds.location
      gl.enableVertexAttribArray(location)
      gl.bindBuffer(gl.ARRAY_BUFFER, drawIdsBuffer)
      gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 1 * 4, 0)
      gl.vertexAttribDivisor(location, 1) // This makes it instanced

      renderstate.bindViewports(unifs, () => {
        this.glGeom.drawInstanced(renderstate, itemIndices.length)
      })
    }
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    if (this.drawIdsBuffer) {
      this.gl.deleteBuffer(this.drawIdsBuffer)
      this.drawIdsBuffer = null
    }

    if (this.highlightedIdsBuffer) {
      this.gl.deleteBuffer(this.highlightedIdsBuffer)
      this.highlightedIdsBuffer = null
    }

    this.emit('destructing')
  }
}

export { GLGeomItemSet }
