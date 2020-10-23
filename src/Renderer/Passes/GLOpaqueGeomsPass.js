import { PassType } from './GLPass.js'
import { GLStandardGeomsPass } from './GLStandardGeomsPass.js'
import { GLRenderer } from '../GLRenderer.js'

import { GLGeomItemSet } from '../GLGeomItemSet.js'
import { MathFunctions } from '../../Utilities/MathFunctions'

/** Class representing GL shader materials.
 * @private
 */
class GLShaderMaterials {
  /**
   * Create a GL shader material.
   * @param {any} glshader - The glshader value.
   * @param {any} glgeomdatashader - The glgeomdatashader value.
   * @param {any} glselectedshader - The glselectedshader value.
   */
  constructor(shaders) {
    this.glshader = shaders.glshader
    this.glgeomdatashader = shaders.glgeomdatashader
    this.glselectedshader = shaders.glselectedshader
    this.glmaterialGeomItemSets = []
  }

  /**
   * The findMaterialGeomItemSets method.
   * @param {any} glmaterial - The glmaterial value.
   * @return {any} - The return value.
   */
  findMaterialGeomItemSets(glmaterial) {
    for (const matGeomItemSet of this.glmaterialGeomItemSets) {
      if (matGeomItemSet.glmaterial == glmaterial) return matGeomItemSet
    }
  }

  /**
   * The addMaterialGeomItemSets method.
   * @param {any} glmaterialGeomItemSets - The glmaterialGeomItemSets value.
   */
  addMaterialGeomItemSets(glmaterialGeomItemSets) {
    this.glmaterialGeomItemSets.push(glmaterialGeomItemSets)
  }

  /**
   * The removeMaterialGeomItemSets method.
   * @param {any} glmaterialGeomItemSets - The glmaterialGeomItemSets value.
   */
  removeMaterialGeomItemSets(glmaterialGeomItemSets) {
    const index = this.glmaterialGeomItemSets.indexOf(glmaterialGeomItemSets)
    this.glmaterialGeomItemSets.splice(index, 1)
  }

  /**
   * The getMaterialGeomItemSets method.
   * @return {any} - The return value.
   */
  getMaterialGeomItemSets() {
    return this.glmaterialGeomItemSets
  }
}

/** Class representing GL material geom item sets.
 * @private
 */
class GLMaterialGeomItemSets {
  /**
   * Create a GL material geom item set.
   * @param {any} glmaterial - The glmaterial value.
   */
  constructor(glmaterial = undefined) {
    this.glmaterial = glmaterial
    this.geomItemSets = []
    this.drawCount = 0
    this.visibleInGeomDataBuffer = glmaterial.getMaterial().visibleInGeomDataBuffer
    this.__drawCountChanged = this.__drawCountChanged.bind(this)
  }

  /**
   * The getGLMaterial method.
   * @return {any} - The return value.
   */
  getGLMaterial() {
    return this.glmaterial
  }

  /**
   * The __drawCountChanged method.
   * @param {any} change - The change value.
   * @private
   */
  __drawCountChanged(change) {
    this.drawCount += change.count
  }

  /**
   * The addGeomItemSet method.
   * @param {any} geomItemSet - The geomItemSet value.
   */
  addGeomItemSet(geomItemSet) {
    if (!this.geomItemSets.includes(geomItemSet)) {
      this.geomItemSets.push(geomItemSet)
      geomItemSet.on('drawCountChanged', this.__drawCountChanged)
    } else {
      console.warn('geomItemSet already added to GLMaterialGeomItemSets')
    }
  }

  /**
   * The removeGeomItemSet method.
   * @param {any} geomItemSet - The geomItemSet value.
   */
  removeGeomItemSet(geomItemSet) {
    const index = this.geomItemSets.indexOf(geomItemSet)
    this.geomItemSets.splice(index, 1)
    geomItemSet.off('drawCountChanged', this.__drawCountChanged)
  }

  /**
   * The removeGeomItemSet method.
   * @param {any} glgeom - The glgeom value.
   * @return {any} - The return value.
   */
  findGeomItemSet(glgeom) {
    for (const geomItemSet of this.geomItemSets) {
      if (geomItemSet.getGLGeom() == glgeom) return geomItemSet
    }
    return null
  }

  /**
   * The getGeomItemSets method.
   * @return {any} - The return value.
   */
  getGeomItemSets() {
    return this.geomItemSets
  }
}

/** Class representing a GL opaque geoms pass.
 * @extends GLStandardGeomsPass
 * @private
 */
class GLOpaqueGeomsPass extends GLStandardGeomsPass {
  /**
   * Create a GL opaque geoms pass.
   */
  constructor() {
    super()

    // Optimized Render Tree
    // Structured like so for efficient render traversial.
    // {GLShaders}[GLMaterials][GLGeoms][GLGeomItems]
    this.__glshadermaterials = {}
  }

  /**
   * The init method.
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)
  }

  // ///////////////////////////////////
  // Bind to Render Tree

  /**
   * The filterGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  filterGeomItem(geomItem) {
    const material = geomItem.getParameter('Material').getValue()
    const shaderClass = material.getShaderClass()
    if (shaderClass) {
      if (shaderClass.isTransparent()) return false
      if (shaderClass.isOverlay()) return false

      const baseColorParam = material.getParameter('BaseColor')
      if (baseColorParam && baseColorParam.getValue().a < 1.0) return false

      return true
    }
    return false
  }

  /**
   * The addGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  addGeomItem(geomItem) {
    const material = geomItem.getParameter('Material').getValue()
    const shaderName = material.getShaderName()
    const shaders = this.constructShaders(shaderName)
    let glshader = shaders.glshader
    let glgeomdatashader = shaders.glgeomdatashader
    let glselectedshader = shaders.glselectedshader
    // const glshader = this.__renderer.getOrCreateShader(shaderName)
    // if (glshader.constructor.getGeomDataShaderName())
    //   glgeomdatashader = this.__renderer.getOrCreateShader(
    //     glshader.constructor.getGeomDataShaderName()
    //   )
    // if (glshader.constructor.getSelectedShaderName())
    //   glselectedshader = this.__renderer.getOrCreateShader(
    //     glshader.constructor.getSelectedShaderName()
    //   )
    const glmaterial = this.addMaterial(material)
    const glgeomItem = super.addGeomItem(geomItem)

    let glshaderMaterials = this.__glshadermaterials[shaderName]
    if (!glshaderMaterials) {
      glshaderMaterials = new GLShaderMaterials(shaders)
      this.__glshadermaterials[shaderName] = glshaderMaterials
    }

    let glmaterialGeomItemSets = glshaderMaterials.findMaterialGeomItemSets(glmaterial)
    if (!glmaterialGeomItemSets) {
      glmaterialGeomItemSets = new GLMaterialGeomItemSets(glmaterial)
      glshaderMaterials.addMaterialGeomItemSets(glmaterialGeomItemSets)
    }

    let geomItemSet = glmaterialGeomItemSets.findGeomItemSet(glgeomItem.glGeom)
    if (!geomItemSet) {
      geomItemSet = new GLGeomItemSet(this.__gl, glgeomItem.glGeom)
      glmaterialGeomItemSets.addGeomItemSet(geomItemSet)
    }

    geomItem.setMetadata('geomItemSet', geomItemSet)

    geomItemSet.addGeomItem(glgeomItem)

    return true
  }

  /**
   * The removeGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  removeGeomItem(geomItem) {
    const glgeomItem = super.removeGeomItem(geomItem)
    if (!glgeomItem) return false

    const geomItemSet = geomItem.getMetadata('geomItemSet')
    if (geomItemSet) {
      // Note: for now leave the material and geom in place. Multiple
      // GeomItems can reference a given material/geom, so we simply wait
      // for them to be destroyed.
      geomItemSet.removeGeomItem(glgeomItem)
      geomItem.deleteMetadata('geomItemSet')
    }

    return true
  }

  /**
   * The removeMaterial method.
   * @param {any} material - The material value.
   */
  removeMaterial(material) {
    const glshaderMaterials = this.__glshadermaterials[material.hash]
    if (!glshaderMaterials || glshaderMaterials != material.getMetadata('glshaderMaterials')) {
      console.warn('Material not found in pass')
      return
    }

    const glmaterialGeomItemSets = material.getMetadata('glmaterialGeomItemSets')
    glshaderMaterials.removeMaterialGeomItemSets(glmaterialGeomItemSets)
  }

  /**
   * The __traverseTreeAndDraw method.
   * @param {any} renderstate - The renderstate value.
   * @private
   */
  __traverseTreeAndDraw(renderstate) {
    for (const shaderName in this.__glshadermaterials) {
      const glshaderMaterials = this.__glshadermaterials[shaderName]
      const glshader = glshaderMaterials.glshader
      if (this.bindShader(renderstate, glshader)) {
        const glmaterialGeomItemSets = glshaderMaterials.getMaterialGeomItemSets()
        for (const glmaterialGeomItemSet of glmaterialGeomItemSets) {
          if (glmaterialGeomItemSet.drawCount == 0) continue
          if (this.bindMaterial(renderstate, glmaterialGeomItemSet.getGLMaterial(), true)) {
            const glgeomitemsets = glmaterialGeomItemSet.getGeomItemSets()
            for (const gldrawitemset of glgeomitemsets) {
              gldrawitemset.draw(renderstate)
            }
          }
        }
      }
      glshader.unbind(renderstate)
    }

    if (renderstate.glgeom) {
      renderstate.glgeom.unbind(renderstate)
    }
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    if (this.newItemsReadyForLoading()) this.finalize()

    const gl = this.__gl
    gl.disable(gl.BLEND)

    if (true)
      // 2-sided rendering.
      gl.disable(gl.CULL_FACE)
    // 2-sided rendering.
    else {
      gl.enable(gl.CULL_FACE)
      gl.cullFace(gl.BACK)
    }

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    gl.depthMask(true)

    this.__traverseTreeAndDraw(renderstate)
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlightedGeoms(renderstate) {
    const gl = this.__gl
    gl.disable(gl.CULL_FACE) // 2-sided rendering.

    // for (let glshaderMaterials of this.__glshadermaterials) {
    for (const shaderName in this.__glshadermaterials) {
      const glshaderMaterials = this.__glshadermaterials[shaderName]
      if (!glshaderMaterials.glselectedshader) continue
      if (!this.bindShader(renderstate, glshaderMaterials.glselectedshader)) continue

      const glmaterialGeomItemSets = glshaderMaterials.getMaterialGeomItemSets()
      for (const glmaterialGeomItemSet of glmaterialGeomItemSets) {
        const glgeomitemsets = glmaterialGeomItemSet.getGeomItemSets()
        for (const gldrawitemset of glgeomitemsets) {
          gldrawitemset.drawHighlighted(renderstate)
        }
      }
    }

    if (renderstate.glgeom) {
      renderstate.glgeom.unbind(renderstate)
    }
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
  drawGeomData(renderstate) {
    if (this.newItemsReadyForLoading()) this.finalize()

    const gl = this.__gl
    gl.disable(gl.BLEND)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LESS)
    gl.depthMask(true)

    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glshadermaterials) {
      const glshaderMaterials = this.__glshadermaterials[shaderName]
      if (!glshaderMaterials.glgeomdatashader) continue
      if (!this.bindShader(renderstate, glshaderMaterials.glgeomdatashader)) continue

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

      const glmaterialGeomItemSets = glshaderMaterials.getMaterialGeomItemSets()
      for (const glmaterialGeomItemSet of glmaterialGeomItemSets) {
        if (glmaterialGeomItemSet.drawCount == 0) continue
        const material = glmaterialGeomItemSet.getGLMaterial().getMaterial()
        if (!material.visibleInGeomDataBuffer) continue
        // Sometimes materials contain params required for rendering.
        // e.g. PointSize.
        // Note: avoid generating warnings for missing uniforms.
        if (this.bindMaterial(renderstate, glmaterialGeomItemSet.getGLMaterial(), false)) {
          const glgeomitemsets = glmaterialGeomItemSet.getGeomItemSets()
          for (const gldrawitemset of glgeomitemsets) {
            gldrawitemset.draw(renderstate)
          }
        }
      }
    }

    if (renderstate.glgeom) {
      renderstate.glgeom.unbind(renderstate)
    }
  }
}

GLRenderer.registerPass(GLOpaqueGeomsPass, PassType.OPAQUE)

export { GLOpaqueGeomsPass }
