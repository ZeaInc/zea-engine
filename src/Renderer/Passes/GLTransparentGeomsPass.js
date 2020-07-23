import { Vec3 } from '../../Math/Vec3'
import { PassType } from './GLPass.js'
import { GLStandardGeomsPass } from './GLStandardGeomsPass.js'
import { GLRenderer } from '../GLRenderer.js'

/** Class representing a GL transparent geoms pass.
 * @extends GLStandardGeomsPass
 * @private
 */
class GLTransparentGeomsPass extends GLStandardGeomsPass {
  /**
   * Create GL transparent geoms pass.
   */
  constructor() {
    super()
  }

  /**
   * The init method.
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)

    this.transparentItems = []
    this.freeList = []
    this.visibleItems = []
    this.prevSortCameraPos = new Vec3(999, 999, 999)
    this.resort = false
  }

  /**
   * The init method.
   * @param {any} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  filterGeomItem(geomItem) {
    const shaderClass = geomItem.getMaterial().getShaderClass()
    if (shaderClass) {
      if (shaderClass.isTransparent()) return true
      if (shaderClass.isOverlay()) return false

      const baseColorParam = geomItem.getMaterial().getParameter("BaseColor")
      if (baseColorParam && baseColorParam.getValue().a < 0.999)
        return true;
    }
    return false
  }

  /**
   * The addGeomItem method.
   * @param {any} geomItem - The geomItem value.
   */
  addGeomItem(geomItem) {
    const material = geomItem.getMaterial()
    const shaderName = material.getShaderName()
    const shaders = this.constructShaders(shaderName)
    const glmaterial = this.addMaterial(material)
    const glgeomitem = super.addGeomItem(geomItem)

    const visibilityChangedId = geomItem.on('visibilityChanged', event => {
      if (event.visible) {
        this.visibleItems.push(item)
      } else {
        const index = this.visibleItems.indexOf(item)
        this.visibleItems.splice(index, 1)
      }
    })
    const geomXfoChangedId = geomItem.on('geomXfoChanged', () => {
      this.resort = true
    })

    const item = {
      geomItem,
      shaders,
      glmaterial,
      glgeomitem,
      visibilityChangedId,
      geomXfoChangedId,
    }
    let itemindex
    if (this.freeList.length > 0) itemindex = this.freeList.pop()
    else itemindex = this.transparentItems.length
    this.transparentItems[itemindex] = item
    geomItem.setMetadata('itemIndex', itemindex)
    if (geomItem.getVisible()) {
      this.visibleItems.push(item)
    }

    // force a resort.
    this.resort = true
  }

  /**
   * The removeGeomItem method.
   * @param {any} geomItem - The geomItem value.
   */
  removeGeomItem(geomItem) {
    if (!super.removeGeomItem(geomItem)) return

    const itemindex = geomItem.getMetadata('itemIndex')
    const item = this.transparentItems[itemindex]
    this.transparentItems[itemindex] = null
    this.freeList.push(itemindex)

    const visibleindex = this.visibleItems.indexOf(item)
    if (visibleindex != -1) this.visibleItems.splice(visibleindex, 1)
  }

  /**
   * The sortItems method.
   * @param {any} viewPos - The viewPos value.
   */
  sortItems(viewPos) {
    for (const transparentItem of this.visibleItems) {
      const mat4 = transparentItem.glgeomitem.geomItem.getGeomMat4()
      transparentItem.dist = mat4.translation.distanceTo(viewPos)
    }
    this.visibleItems.sort((a, b) =>
      a.dist > b.dist ? -1 : a.dist < b.dist ? 1 : 0
    )
    this.prevSortCameraPos = viewPos
    this.resort = false
  }


  _drawItem(renderstate, transparentItem, cache) {
    if (cache.currentglMaterial != transparentItem.glmaterial) {
      cache.currentglMaterial = transparentItem.glmaterial
      if (!cache.currentglMaterial.bind(renderstate)) {
        return
      }
    }

    const glgeomitem = transparentItem.glgeomitem
    if (cache.currentglGeom != glgeomitem.glGeom) {
      cache.currentglGeom = glgeomitem.glGeom
      if (!cache.currentglGeom.bind(renderstate)) {
        return
      }
    }

    if (glgeomitem.bind(renderstate)) {
      // Specify an non-instanced draw to the shader
      if (renderstate.unifs.instancedDraw) {
        const gl = this.__gl
        gl.uniform1i(renderstate.unifs.instancedDraw.location, 0)
        gl.disableVertexAttribArray(renderstate.attrs.instancedIds.location)
      }

      renderstate.bindViewports(renderstate.unifs, () => {
        cache.currentglGeom.draw(renderstate)
      })
    }
  }

  /**
   * The _drawItems method.
   * @param {any} renderstate - The renderstate value.
   * @private
   */
  _drawItems(renderstate) {
    const cache = {
      currentglShader: null,
      currentglMaterial: null,
      currentglGeom: null,
    }
    for (const transparentItem of this.visibleItems) {
      if (cache.currentglShader != transparentItem.shaders.glshader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, transparentItem.shaders.glshader)) {
          continue
        }
        cache.currentglShader = transparentItem.shaders.glshader
      }

      this._drawItem(renderstate, transparentItem, cache)
    }

    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    if (this.visibleItems.length == 0) return

    if (this.newItemsReadyForLoading()) this.finalize()

    const gl = this.__gl

    const viewPos = renderstate.viewXfo.tr
    // TODO: Avoid sorting if the camera did not movemore than 30cm
    if (this.resort || viewPos.distanceTo(this.prevSortCameraPos) > 0.3)
      this.sortItems(viewPos)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    gl.depthMask(true)

    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    // Complex transparent surfaces require mutiple passes.
    // First the multiply pass tints the background color, simulating
    // light passing through the surface, and then the add layer
    // adds new color to the backbuffer to simulate light bouncing off
    // the surface.

    // TODO: Optimise this system.
    // After depth sorting, we should split the items into 2 groups.
    // Multipy items, and Add  items. (Many items will be in both)
    // Then we can simply check if we have any multiply items here
    // before rendering all items.

    renderstate.pass = 'MULTIPLY'
    gl.blendFunc(gl.DST_COLOR, gl.ZERO) // For multiply, select this.
    this._drawItems(renderstate)

    renderstate.pass = 'ADD'
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) // For add
    this._drawItems(renderstate)

    gl.disable(gl.BLEND)
  }
  
  /**
   * The drawHighlightedGeoms method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlightedGeoms(renderstate) {
    const gl = this.__gl
    gl.disable(gl.CULL_FACE) // 2-sided rendering.

    const cache = {
      currentglShader: null,
      currentglMaterial: null,
      currentglGeom: null,
    }
    for (const transparentItem of this.visibleItems) {
      if (!transparentItem.geomItem.isHighlighted()) continue
      if (!transparentItem.shaders.glselectedshader) continue
      const shaders = transparentItem.shaders
      if (cache.currentglShader != shaders.glselectedshader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, shaders.glselectedshader)) {
          continue
        }
        cache.currentglShader = shaders.glselectedshader
      }

      this._drawItem(renderstate, transparentItem, cache)
    }

    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }

  /**
   * The getGeomItemAndDist method.
   * @param {any} geomData - The geomData value.
   * @return {any} - The return value.
   */
  getGeomItemAndDist(geomData) {
    let itemId
    let dist
    const gl = this.__gl
    if (gl.floatGeomBuffer) {
      itemId = Math.round(geomData[1])
      dist = geomData[3]
    } else {
      itemId = geomData[0] + (geomData[1] << 8)
      dist = Math.decode16BitFloatFrom2xUInt8([geomData[2], geomData[3]])
    }

    const glgeomItem = this.__drawItems[itemId]
    if (glgeomItem) {
      return {
        geomItem: glgeomItem.getGeomItem(),
        dist,
      }
    }
  }

  /**
   * The drawGeomData method.
   * @param {any} renderstate - The renderstate value.
   */
  drawGeomData(renderstate) {
    if (this.newItemsReadyForLoading()) this.finalize()

    const gl = this.__gl
    gl.disable(gl.BLEND)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    gl.depthMask(true)

    const cache = {
      currentglShader: null,
      currentglMaterial: null,
      currentglGeom: null,
    }
    for (const transparentItem of this.visibleItems) {
      const shaders = transparentItem.shaders
      if (shaders.glgeomdatashader) {
        continue
      }
      if (cache.currentglShader != shaders.glgeomdatashader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, shaders.glgeomdatashader)) {
          continue
        }
        cache.currentglShader = shaders.glgeomdatashader
      }
      {
        const unif = renderstate.unifs.floatGeomBuffer
        if (unif) {
          gl.uniform1i(unif.location, gl.floatGeomBuffer ? 1 : 0)
        }
      }
      {
        const unif = renderstate.unifs.passId
        if (unif) {
          gl.uniform1i(unif.location, this.__passIndex)
        }
      }

      this._drawItem(renderstate, transparentItem, cache)
    }

    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }
}

GLRenderer.registerPass(GLTransparentGeomsPass, PassType.TRANSPARENT)

export { GLTransparentGeomsPass }
