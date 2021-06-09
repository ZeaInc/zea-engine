import { PassType } from './GLPass.js'
import { GLStandardGeomsPass } from './GLStandardGeomsPass.js'
import { GLRenderer } from '../GLRenderer.js'
import { Registry } from '../../Registry'

import { MathFunctions } from '../../Utilities/MathFunctions'
import { Points, Lines, PointsProxy, LinesProxy } from '../../SceneTree/index'
import { GLShaderMaterials } from '../Drawing/GLShaderMaterials.js'
import { GLShaderGeomSets } from '../Drawing/GLShaderGeomSets.js'

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
    this.__glShaderGeomSets = {}
  }

  /**
   * The init method.
   * @param {GLBaseRenderer} renderer - The renderer value.
   * @param {number} passIndex - The index of the pass in the GLBAseRenderer
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)
  }

  /**
   * Returns the pass type. OPAQUE passes are always rendered first, followed by TRANSPARENT passes, and finally OVERLAY.
   * @return {number} - The pass type value.
   */
  getPassType() {
    return PassType.OPAQUE
  }

  // ///////////////////////////////////
  // Bind to Render Tree

  /**
   * The filterGeomItem method.
   * @param {GeomItem} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  filterGeomItem(geomItem) {
    const material = geomItem.getParameter('Material').getValue()
    return this.checkMaterial(material)
  }

  /**
   * Checks the material to see if it is not transparent.
   * @param {Material} material - The geomItem value.
   * @return {boolean} - The return value.
   */
  checkMaterial(material) {
    return !material.isTransparent()
  }

  /**
   * Removes the GeomITem from this pass, and then asks the renderer to re-add it.
   * @param {GeomItem} geomItem - The geomItem value.
   */
  removeAndReAddGeomItem(geomItem) {
    this.removeGeomItem(geomItem)
    this.__renderer.assignTreeItemToGLPass(geomItem)
  }

  /**
   * The addGeomItem method.
   * @param {GeomItem} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  addGeomItem(geomItem) {
    const materialParam = geomItem.getParameter('Material')
    const material = materialParam.getValue()

    if (!material.isTextured()) {
      const shaderName = material.getShaderName()
      const shader = Registry.getBlueprint(shaderName)
      if (shader.supportsInstancing() && shader.getPackedMaterialData) {
        let glShaderGeomSets = this.__glShaderGeomSets[shaderName]
        if (!glShaderGeomSets) {
          const shaders = this.constructShaders(shaderName)
          glShaderGeomSets = new GLShaderGeomSets(this, this.__gl, shaders)
          glShaderGeomSets.on('updated', () => {
            this.__renderer.requestRedraw()
          })
          this.__glShaderGeomSets[shaderName] = glShaderGeomSets
        }

        // const glGeomItem = this.constructGLGeomItem(geomItem)
        const glGeomItem = this.renderer.glGeomItemLibrary.getGLGeomItem(geomItem)
        glShaderGeomSets.addGLGeomItem(glGeomItem)

        glGeomItem.GLShaderGeomSets = glShaderGeomSets
        this.emit('updated')
        return true
      }
    }

    const glGeom = this.renderer.glGeomLibrary.constructGLGeom(geomItem.getParameter('Geometry').getValue())
    const glGeomItem = this.renderer.glGeomItemLibrary.getGLGeomItem(geomItem)

    // ////////////////////////////////////
    // Tracking Material Transparency changes...
    // In the case that a geometry material changes, we may need to
    // select a different pass. e.g. if the new material is transparent.

    const materialChanged = () => {
      this.removeGeomItem(geomItem)
      this.__renderer.assignTreeItemToGLPass(geomItem)
    }
    materialParam.on('valueChanged', materialChanged)
    glGeomItem.materialChanged = materialChanged

    // ////////////////////////////////////
    // Shaders
    const shaderName = material.getShaderName()
    const glMaterial = this.renderer.glMaterialLibrary.getGLMaterial(material)

    let glshaderMaterials = this.__glshadermaterials[shaderName]
    if (!glshaderMaterials) {
      const shaders = this.constructShaders(shaderName)
      glshaderMaterials = new GLShaderMaterials(this.__gl, this, shaders)
      this.__glshadermaterials[shaderName] = glshaderMaterials

      glshaderMaterials.on('updated', () => {
        this.__renderer.requestRedraw()
      })
    }

    glshaderMaterials.addGLGeomItem(glGeomItem, glGeom, glMaterial)

    return true
  }

  /**
   * The removeGeomItem method.
   * @param {GeomItem} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  removeGeomItem(geomItem) {
    const glGeomItem = this.renderer.glGeomItemLibrary.getGLGeomItem(geomItem)

    if (glGeomItem.GLShaderGeomSets) {
      const glShaderGeomSets = glGeomItem.GLShaderGeomSets
      glShaderGeomSets.removeGLGeomItem(glGeomItem)
      glGeomItem.GLShaderGeomSets = null
      return true
    }

    const materialParam = geomItem.getParameter('Material')
    const materialChanged = glGeomItem.materialChanged
    if (materialParam && materialChanged) {
      materialParam.off('valueChanged', materialChanged)
      glGeomItem.materialChanged = null
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

    const glMaterialGeomItemSets = material.getMetadata('glMaterialGeomItemSets')
    glshaderMaterials.removeMaterialGeomItemSets(glMaterialGeomItemSets)
  }

  /**
   * The __traverseTreeAndDraw method.
   * @param {object} renderstate - The renderstate value.
   * @private
   */
  __traverseTreeAndDraw(renderstate) {
    // renderstate.drawItemsTexture = this.__drawItemsTexture

    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glShaderGeomSets) {
      this.__glShaderGeomSets[shaderName].draw(renderstate)
    }
    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glshadermaterials) {
      this.__glshadermaterials[shaderName].draw(renderstate)
    }

    if (renderstate.glGeom) {
      renderstate.glGeom.unbind(renderstate)
    }
  }

  /**
   * The draw method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  draw(renderstate) {
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
    gl.depthFunc(gl.LEQUAL)
    gl.depthMask(true)

    this.__traverseTreeAndDraw(renderstate)

    renderstate.viewport.drawSilhouettes(renderstate)
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawHighlightedGeoms(renderstate) {
    const gl = this.__gl
    gl.disable(gl.CULL_FACE) // 2-sided rendering.

    renderstate.drawItemsTexture = this.__drawItemsTexture

    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glShaderGeomSets) {
      this.__glShaderGeomSets[shaderName].drawHighlightedGeoms(renderstate)
    }
    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glshadermaterials) {
      const glshaderMaterials = this.__glshadermaterials[shaderName]
      glshaderMaterials.drawHighlightedGeoms(renderstate)
    }

    if (renderstate.glGeom) {
      renderstate.glGeom.unbind(renderstate)
    }
  }

  /**
   * The drawGeomData method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawGeomData(renderstate) {
    renderstate.passIndex = this.passIndex

    const gl = this.__gl
    gl.disable(gl.BLEND)
    gl.disable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.depthMask(true)

    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glShaderGeomSets) {
      this.__glShaderGeomSets[shaderName].drawGeomData(renderstate)
    }
    // eslint-disable-next-line guard-for-in
    for (const shaderName in this.__glshadermaterials) {
      const glshaderMaterials = this.__glshadermaterials[shaderName]
      glshaderMaterials.drawGeomData(renderstate)
    }

    if (renderstate.glGeom) {
      renderstate.glGeom.unbind(renderstate)
    }
  }
}

GLRenderer.registerPass(GLOpaqueGeomsPass, PassType.OPAQUE)

export { GLOpaqueGeomsPass }
