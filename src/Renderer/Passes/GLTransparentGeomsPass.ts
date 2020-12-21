import { Vec3 } from '../../Math/Vec3'
import { PassType } from './GLPass.js'
import { GLStandardGeomsPass } from './GLStandardGeomsPass.js'
import { GLRenderer } from '../GLRenderer.js'
import { MathFunctions } from '../../Utilities/MathFunctions'

/** Class representing a GL transparent geoms pass.
 * @extends GLStandardGeomsPass
 * @private
 */
class GLTransparentGeomsPass extends GLStandardGeomsPass {
  freeList: any;
  prevSortCameraPos: any;
  resort: any;
  sortCameraMovementDistance: any;
  transparentItems: any;
  visibleItems: any;
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
  init(renderer: any, passIndex: any) {
    super.init(renderer, passIndex)

    this.transparentItems = []
    this.freeList = []
    this.visibleItems = []
    this.prevSortCameraPos = new Vec3(999, 999, 999)
    this.sortCameraMovementDistance = 0.25 // meters
    this.resort = false
  }

  /**
   * The init method.
   * @param {any} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  filterGeomItem(geomItem: any) {
    const material = geomItem.getParameter('Material').getValue()
    const shaderClass = material.getShaderClass()
    if (shaderClass) {
      if (shaderClass.isTransparent()) return true
      if (shaderClass.isOverlay()) return false

      const baseColorParam = material.getParameter('BaseColor')
      if (baseColorParam && baseColorParam.getValue().a < 1.0) {
        return true
      }
      const opacityParam = material.getParameter('Opacity')
      if (opacityParam && opacityParam.getValue() < 1.0) {
        return true
      }
    }
    return false
  }

  /**
   * The addGeomItem method.
   * @param {any} geomItem - The geomItem value.
   */
  // @ts-expect-error ts-migrate(2416) FIXME: Property 'addGeomItem' in type 'GLTransparentGeoms... Remove this comment to see the full error message
  addGeomItem(geomItem: any) {
    const materialParam = geomItem.getParameter('Material')
    const material = geomItem.getParameter('Material').getValue()
    const shaderName = material.getShaderName()
    const shaders = this.constructShaders(shaderName)

    // @todo - make sure we remove materials and GeomItems from the base pass.
    // This code will leak memory for these classes as we are not cleaning them up.
    const glmaterial = this.addMaterial(material)
    const glgeomitem = super.addGeomItem(geomItem)

    // ////////////////////////////////////
    // Tracking Material Transparency changes...
    // In the case that a geometry material changes, we may need to
    // select a different pass. e.g. if the new material is not transparent
    // then the object moves to the OpaqueGeomsPass
    const materialChanged = () => {
      this.removeGeomItem(geomItem)
      this.__renderer.assignTreeItemToGLPass(geomItem)
    }
    materialParam.on('valueChanged', materialChanged)

    const baseColorParam = material.getParameter('BaseColor')
    if (baseColorParam) {
      baseColorParam.on('valueChanged', materialChanged)
    }
    const opacityParam = material.getParameter('Opacity')
    if (opacityParam) {
      opacityParam.on('valueChanged', materialChanged)
    }

    // ////////////////////////////////////
    // Tracking visibility changes.
    const visibilityChanged = (event: any) => {
      if (event.visible) {
        this.visibleItems.push(item)
      } else {
        const index = this.visibleItems.indexOf(item)
        this.visibleItems.splice(index, 1)
      }
    }
    geomItem.on('visibilityChanged', visibilityChanged)

    // ////////////////////////////////////
    // Tracking GeomMat changes.
    const geomMatChanged = () => {
      this.resort = true
    }
    geomItem.getParameter('GeomMat').on('valueChanged', geomMatChanged)

    const item = {
      geomItem,
      shaders,
      glmaterial,
      glgeomitem,
      material,
      materialChanged,
      visibilityChanged,
      geomMatChanged,
    }
    let itemindex
    if (this.freeList.length > 0) itemindex = this.freeList.pop()
    else itemindex = this.transparentItems.length
    this.transparentItems[itemindex] = item
    geomItem.setMetadata('itemIndex', itemindex)
    if (geomItem.isVisible()) {
      this.visibleItems.push(item)
    }

    // force a resort.
    this.resort = true
  }

  /**
   * The removeGeomItem method.
   * @param {any} geomItem - The geomItem value.
   */
  removeGeomItem(geomItem: any) {
    if (!super.removeGeomItem(geomItem)) return

    const itemindex = geomItem.getMetadata('itemIndex')
    const item = this.transparentItems[itemindex]

    const materialParam = geomItem.getParameter('Material')
    if (materialParam) {
      materialParam.off('valueChanged', item.materialChanged)

      // Note: if the material has changed in the PArameter, we need to
      // to have a cache of the pervious material so we can disconnect from it.
      const material = item.material
      const baseColorParam = material.getParameter('BaseColor')
      if (baseColorParam) {
        baseColorParam.off('valueChanged', item.materialChanged)
      }

      const opacityParam = material.getParameter('Opacity')
      if (opacityParam) {
        opacityParam.off('valueChanged', item.materialChanged)
      }
    }

    geomItem.off('visibilityChanged', item.visibilityChanged)
    geomItem.getParameter('GeomMat').off('valueChanged', item.geomMatChanged)

    this.transparentItems[itemindex] = null
    this.freeList.push(itemindex)

    const visibleindex = this.visibleItems.indexOf(item)
    if (visibleindex != -1) this.visibleItems.splice(visibleindex, 1)
  }

  /**
   * The sortItems method.
   * @param {any} viewPos - The viewPos value.
   */
  sortItems(viewPos: any) {
    for (const transparentItem of this.visibleItems) {
      const mat4 = transparentItem.glgeomitem.geomItem.getGeomMat4()
      transparentItem.dist = mat4.translation.distanceTo(viewPos)
    }
    this.visibleItems.sort((a: any, b: any) => (a.dist > b.dist ? -1 : a.dist < b.dist ? 1 : 0))
    this.resort = false
  }

  /**
   * Draw n individual item, binding the shader and material if necessary.
   * @param {object} renderstate - current renderstad
   * @param {object} transparentItem - current item to render
   * @param {object} cache - cache tracking which material/shader is currently bound.
   */
  _drawItem(renderstate: any, transparentItem: any, cache: any) {
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
  _drawItems(renderstate: any) {
    const cache = {
      currentglShader: null,
      currentglMaterial: null,
      currentglGeom: null,
    }
    for (const transparentItem of this.visibleItems) {
      const glshader = transparentItem.shaders.glshader
      if (cache.currentglShader != glshader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, glshader)) {
          continue
        }
        cache.currentglShader = glshader
      }

      this._drawItem(renderstate, transparentItem, cache)
    }

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate: any) {
    if (this.visibleItems.length == 0) return

    if (this.newItemsReadyForLoading()) this.finalize()

    const gl = this.__gl

    const viewPos = renderstate.viewXfo.tr
    // Avoid sorting if the camera did not move more than the specified tolerance.
    if (this.resort || viewPos.distanceTo(this.prevSortCameraPos) > this.sortCameraMovementDistance) {
      this.sortItems(viewPos)

      this.prevSortCameraPos = viewPos
      if (renderstate.viewport) {
        // Adapt the sort tolerance to the focal distance.
        // In a tiny scene, we want to sort more frequently.
        const camera = renderstate.viewport.getCamera()
        this.sortCameraMovementDistance = camera.getFocalDistance() * 0.1
      }
    }

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)

    // Disable depth testing.
    // This means that if overlapping transparent geoms are rendered then faces in front will
    // not occlude faces behind. This can occur for large faces on objects that are technically in front
    // but have faces that are behind other faces of objects that are technically behind.
    // e.g. 2 large transparent polygons that intersect or wrap around each other.
    gl.depthMask(false)

    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    // Complex transparent surfaces require mutiple passes.
    // First the multiply pass tints the background color, simulating
    // light passing through the surface, and then the add layer
    // adds new color to the backbuffer to simulate light bouncing off
    // the surface.

    // TODO: Optimise this system.
    // After depth sorting, we should split the items into 2 groups.
    // Multiply items, and Add  items. (Many items will be in both)
    // Then we can simply check if we have any multiply items here
    // before rendering all items.

    // for Multiply pass, we can use front and back surfaces to calculate depth and how much
    // of the background layer to let through.
    // gl.disable(gl.CULL_FACE)

    // renderstate.pass = 'MULTIPLY'
    // gl.blendFunc(gl.DST_COLOR, gl.ZERO) // For multiply, select this.
    // this._drawItems(renderstate)

    // for the Add
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)

    renderstate.pass = 'ADD'
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA) // For add
    // Only draw font faces. BEcause all faces are drawn, it can make a mess to see the back faces through the front faces.
    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.BACK)
    this._drawItems(renderstate)

    gl.disable(gl.BLEND)
    gl.depthMask(true)
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlightedGeoms(renderstate: any) {
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

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }

  /**
   * The getGeomItemAndDist method.
   * @param {any} geomData - The geomData value.
   * @return {any} - The return value.
   */
  getGeomItemAndDist(geomData: any) {
    let itemId
    let dist
    const gl = this.__gl
    if (gl.floatGeomBuffer) {
      itemId = Math.round(geomData[1])
      dist = geomData[3]
    } else {
      itemId = geomData[0] + ((geomData[1] & 63) << 8)
      dist = MathFunctions.decode16BitFloatFrom2xUInt8([geomData[2], geomData[3]])
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
  drawGeomData(renderstate: any) {
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
      if (!shaders.glgeomdatashader) {
        continue
      }
      if (cache.currentglShader != shaders.glgeomdatashader) {
        // Some passes, like the depth pass, bind custom uniforms.
        if (!this.bindShader(renderstate, shaders.glgeomdatashader)) {
          continue
        }
        cache.currentglShader = shaders.glgeomdatashader
      }
      const material = transparentItem.glmaterial.getMaterial()
      if (!material.visibleInGeomDataBuffer) continue
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

    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    if (cache.currentglGeom) cache.currentglGeom.unbind(renderstate)
  }
}

GLRenderer.registerPass(GLTransparentGeomsPass, PassType.TRANSPARENT)

export { GLTransparentGeomsPass }
