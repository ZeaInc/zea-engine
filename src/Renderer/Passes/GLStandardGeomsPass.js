import { GLPass } from './GLPass'

import { Vec4 } from '../../Math/index'

import { GeomItem, Points, Lines, Mesh, PointsProxy, LinesProxy, MeshProxy } from '../../SceneTree/index'

import { GLPoints } from '../GLPoints.js'
import { GLLines } from '../GLLines.js'
import { GLMesh } from '../GLMesh.js'
import { GLMaterial } from '../GLMaterial.js'
import { GLGeomItemChangeType, GLGeomItem } from '../GLGeomItem.js'
import { GLTexture2D } from '../GLTexture2D.js'
import { MathFunctions } from '../../Utilities/MathFunctions'

const pixelsPerItem = 6 // The number of RGBA pixels per draw item.

/** This class abstracts the rendering of a collection of geometries to screen.
 * @extends GLPass
 */
class GLStandardGeomsPass extends GLPass {
  /**
   * Create a GL pass.
   */
  constructor() {
    super()

    this.__drawItems = [undefined]
    this.__drawItemsIndexFreeList = []
    this.__dirtyItemIndices = []
  }

  /**
   * The init method.
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)

    this.__renderer.registerPass(
      (treeItem) => {
        if (treeItem instanceof GeomItem) {
          const geomItem = treeItem
          if (!geomItem.getMetadata('glgeomItem')) {
            const checkGeom = (geomItem) => {
              if (this.filterGeomItem(geomItem)) {
                const geomParam = geomItem.getParameter('Geometry')
                if (geomParam.getValue() == undefined) {
                  // we will add this geomItem once it receives its geom.
                  // TODO: what happens if the item is removed from the tree
                  // and then geom assigned? (maybe impossible with our tools)
                  // e.g. a big asset loaded, added to the tree, then removed again
                  // The geoms will get assigned after the tree is removed.
                  const geomAssigned = () => {
                    this.addGeomItem(geomItem)
                    geomParam.off('valueChanged', geomAssigned)
                  }
                  geomParam.on('valueChanged', geomAssigned)
                } else {
                  this.addGeomItem(geomItem)
                }
                return true
              } else {
                return false
              }
            }

            if (geomItem.getParameter('Material').getValue() == undefined) {
              console.warn('Scene item :' + geomItem.getPath() + ' has no material')
              // TODO: listen for when the material is assigned.(like geoms below)
              return false
            } else {
              return checkGeom(geomItem)
            }
          } else {
            return false
          }
        } else {
          return false
        }
      },
      (treeItem) => {
        if (treeItem instanceof GeomItem && treeItem.getMetadata('glgeomItem')) {
          return this.removeGeomItem(treeItem)
        }
        return false
      }
    )
  }

  /**
   * The filterGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {any} - The return value.
   */
  filterGeomItem(geomItem) {
    return true
  }

  /**
   * The addShader method.
   * @param {any} material - The material value.
   * @return {any} - The return value.
   */
  addShader(material) {
    return this.__renderer.getOrCreateShader(material.getShaderName())
  }

  /**
   * The constructShaders method.
   * Given a material, generate the various shaders required to render objects
   * using this material. There should always be at least a single glshader
   * and optionally a glgeomdatashader for rendering the goem data buffer
   * and a glselectedshader for rendering selection hilghlights
   * @param {string} shaderName - The name of the base shader.
   * @return {object} - The object containing the shader instances.
   */
  constructShaders(shaderName) {
    let glgeomdatashader
    let glselectedshader

    const glshader = this.__renderer.getOrCreateShader(shaderName)
    if (glshader.constructor.getGeomDataShaderName()) {
      glgeomdatashader = this.__renderer.getOrCreateShader(glshader.constructor.getGeomDataShaderName())
    }
    if (glshader.constructor.getSelectedShaderName()) {
      glselectedshader = this.__renderer.getOrCreateShader(glshader.constructor.getSelectedShaderName())
    }
    return {
      glshader,
      glgeomdatashader,
      glselectedshader,
    }
  }

  /**
   * The addMaterial method.
   * @param {any} material - The material value.
   * @return {any} - The return value.
   */
  addMaterial(material) {
    let glmaterial = material.getMetadata('glmaterial')
    if (glmaterial) {
      return glmaterial
    }
    const glshader = this.__renderer.getOrCreateShader(material.getShaderName())
    glmaterial = new GLMaterial(this.__gl, material, glshader)
    glmaterial.on('updated', () => {
      this.__renderer.requestRedraw()
    })
    material.setMetadata('glmaterial', glmaterial)

    return glmaterial
  }

  /**
   * The addGeom method.
   * @param {any} geom - The geom value.
   * @return {any} - The return value.
   */
  addGeom(geom) {
    let glgeom = geom.getMetadata('glgeom')
    if (glgeom) {
      glgeom.addRef(this)
      return glgeom
    }
    const gl = this.__gl
    if (geom instanceof Mesh || geom instanceof MeshProxy) {
      glgeom = new GLMesh(gl, geom)
    } else if (geom instanceof Lines || geom instanceof LinesProxy) {
      glgeom = new GLLines(gl, geom)
    } else if (geom instanceof Points || geom instanceof PointsProxy) {
      glgeom = new GLPoints(gl, geom)
    } else {
      throw new Error('Unsupported geom type:' + geom.constructor.name)
    }
    geom.setMetadata('glgeom', glgeom)
    glgeom.on('updated', () => {
      this.__renderer.requestRedraw()
    })
    glgeom.addRef(this)
    return glgeom
  }

  /**
   * The removeGeom method.
   * @param {any} geom - The geom value.
   */
  removeGeom(geom) {
    let glgeom = geom.getMetadata('glgeom')
    if (glgeom) {
      glgeom.removeRef(this) // Should result in a destroy
      return glgeom
    }
  }

  /**
   * The addGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {any} - The return value.
   */
  addGeomItem(geomItem) {
    // const material = geomItem.getParameter('Material').getValue()
    // let glmaterialGeomItemSets = this.addMaterial(material);
    // if (!glmaterialGeomItemSets)
    //     return;
    const glgeom = this.addGeom(geomItem.getParameter('Geometry').getValue())

    const flags = 1
    let index
    // Use recycled indices if there are any available...
    if (this.__drawItemsIndexFreeList.length > 0) {
      index = this.__drawItemsIndexFreeList.pop()
    } else {
      index = this.__drawItems.length
      this.__drawItems.push(null)
    }
    this.__dirtyItemIndices.push(index)

    const gl = this.__gl
    const glgeomItem = new GLGeomItem(gl, geomItem, glgeom, index, flags)
    geomItem.setMetadata('glgeomItem', glgeomItem)

    glgeomItem.on('updated', (event) => {
      switch (event.type) {
        case GLGeomItemChangeType.GEOMITEM_CHANGED:
          if (this.__dirtyItemIndices.indexOf(index) != -1) return
          this.__dirtyItemIndices.push(index)
          break
        case GLGeomItemChangeType.GEOM_CHANGED:
        case GLGeomItemChangeType.VISIBILITY_CHANGED:
          break
        case GLGeomItemChangeType.HIGHLIGHT_CHANGED:
          if (this.__dirtyItemIndices.indexOf(index) != -1) return
          this.__dirtyItemIndices.push(index)
          this.__renderer.requestRedraw()
          return
      }
      this.__renderer.drawItemChanged()
    })

    this.__drawItems[index] = glgeomItem

    // Note: before the renderer is disabled, this is a  no-op.
    this.__renderer.requestRedraw()

    geomItem.setMetadata('glpass', this)
    return glgeomItem
  }

  /**
   * The removeGeomItem method.
   * @param {any} geomItem - The geomItem value.
   * @return {any} - The return value.
   */
  removeGeomItem(geomItem) {
    if (geomItem.getMetadata('glpass') != this) return

    // TODO: Finish of ref counting GLGeoms.
    // I'm not sure if we ever clean up the renderer properly
    // when geoms are removed. (Run Instancing test and see if
    // GLGeom is ever destoryed when instance counts drop to zero.)
    // this.removeGeom(geomItem.getParameter('Geometry').getValue())

    const glgeomItem = geomItem.getMetadata('glgeomItem')

    const index = glgeomItem.getId()
    this.__drawItems[index] = null
    this.__drawItemsIndexFreeList.push(index)

    // TODO: review signal disconnections
    // glgeomItem.transformChanged.disconnectScope(this);

    // this.emit('renderTreeUpdated', {});
    this.__renderer.requestRedraw()

    geomItem.getMetadata('glpass')
    geomItem.deleteMetadata('glgeomItem')

    return glgeomItem
  }

  // removeMaterial(material) {
  //     const glshaderMaterials = this.__glshadermaterials[material.hash];
  //     if (!glshaderMaterials || glshaderMaterials != material.getMetadata('glshaderMaterials')) {
  //         console.warn("Material not found in pass");
  //         return;
  //     }

  //     const glmaterialGeomItemSets = material.getMetadata('glmaterialGeomItemSets');
  //     glshaderMaterials.removeMaterialGeomItemSets(glmaterialGeomItemSets);
  // };

  /**
   * The removeGLGeom method.
   * @param {any} geomItemMapping - The geomItemMapping value.
   * @param {any} materialGeomMapping - The materialGeomMapping value.
   */
  removeGLGeom(geomItemMapping, materialGeomMapping) {
    const index = materialGeomMapping.geomItemMappings.indexOf(geomItemMapping)
    materialGeomMapping.geomItemMappings.splice(index, 1)

    // Note: the GLMAterial cleans up iself now...
    // if(materialGeomMapping.geomItemMappings.length == 0 && !this.__explicitShader){
    //     this.removeMaterialGeomMapping(materialGeomMapping.glmaterial);
    // }
  }

  // ////////////////////////////////////////////////////////
  // / GeomItem IDs

  /**
   * The getGeomItem method.
   * @param {any} id - The id value.
   * @return {any} - The return value.
   */
  getGeomItem(id) {
    if (id >= this.__drawItems.length) {
      console.warn('Invalid Draw Item id:' + id + ' NumItems:' + (this.__drawItems.length - 1))
      return undefined
    }
    return this.__drawItems[id]
  }

  // ////////////////////////////////////////////////
  // Data Uploading

  /**
   * The __populateDrawItemDataArray method.
   * @param {any} geomItem - The geomItem value.
   * @param {number} index - The index value.
   * @param {any} dataArray - The dataArray value.
   * @private
   */
  __populateDrawItemDataArray(geomItem, index, dataArray) {
    const stride = pixelsPerItem * 4 // The number of floats per draw item.
    const offset = index * stride

    // /////////////////////////
    // Geom Item Params
    const materialId = 0
    let flags = 0
    if (geomItem.isCutawayEnabled()) {
      const GEOMITEM_FLAG_CUTAWAY = 1 // 1<<0;
      flags |= GEOMITEM_FLAG_CUTAWAY
    }

    const pix0 = Vec4.createFromBuffer(dataArray.buffer, (offset + 0) * 4)
    pix0.set(flags, materialId, 0, 0)

    // /////////////////////////
    // Geom Matrix
    const mat4 = geomItem.getGeomMat4()
    const pix1 = Vec4.createFromBuffer(dataArray.buffer, (offset + 4) * 4)
    const pix2 = Vec4.createFromBuffer(dataArray.buffer, (offset + 8) * 4)
    const pix3 = Vec4.createFromBuffer(dataArray.buffer, (offset + 12) * 4)
    pix1.set(mat4.xAxis.x, mat4.yAxis.x, mat4.zAxis.x, mat4.translation.x)
    pix2.set(mat4.xAxis.y, mat4.yAxis.y, mat4.zAxis.y, mat4.translation.y)
    pix3.set(mat4.xAxis.z, mat4.yAxis.z, mat4.zAxis.z, mat4.translation.z)

    // /////////////////////////
    // Hilight
    const pix4 = Vec4.createFromBuffer(dataArray.buffer, (offset + 16) * 4)
    if (geomItem.isHighlighted()) {
      const highlight = geomItem.getHighlight()
      pix4.set(highlight.r, highlight.g, highlight.b, highlight.a)
    }

    // /////////////////////////
    // Cutaway
    const pix5 = Vec4.createFromBuffer(dataArray.buffer, (offset + 20) * 4)
    if (geomItem.isCutawayEnabled()) {
      const cutAwayVector = geomItem.getCutVector()
      const cutAwayDist = geomItem.getCutDist()
      // console.log(geomItem.getName(), geomItem.isCutawayEnabled(), flags, pix0.toString())
      pix5.set(cutAwayVector.x, cutAwayVector.y, cutAwayVector.z, cutAwayDist)
    }
  }

  /**
   * The newItemsReadyForLoading method.
   * @return {any} - The return value.
   */
  newItemsReadyForLoading() {
    return this.__dirtyItemIndices.length > 0
  }

  /**
   * The uploadGeomItems method.
   */
  uploadGeomItems() {
    const gl = this.__gl
    if (!gl.floatTexturesSupported) {
      // Pull on the GeomXfo params. This will trigger the lazy evaluation of the operators in the scene.
      const len = this.__dirtyItemIndices.length
      for (let i = 0; i < len; i++) {
        const drawItem = this.__drawItems[this.__dirtyItemIndices[i]]
        if (drawItem) {
          drawItem.updateGeomMatrix()
        }
      }
      this.__dirtyItemIndices = []
      // this.emit('renderTreeUpdated', {});
      return
    }

    let size = Math.round(Math.sqrt(this.__drawItems.length * pixelsPerItem) + 0.5)
    // Only support power 2 textures. Else we get strange corruption on some GPUs
    // in some scenes.
    size = MathFunctions.nextPow2(size)
    // Size should be a multiple of pixelsPerItem, so each geom item is always contiguous
    // in memory. (makes updating a lot easier. See __updateItemInstanceData below)
    if (size % pixelsPerItem != 0) size += pixelsPerItem - (size % pixelsPerItem)

    if (!this.__drawItemsTexture) {
      this.__drawItemsTexture = new GLTexture2D(gl, {
        format: 'RGBA',
        type: 'FLOAT',
        width: size,
        height: size,
        filter: 'NEAREST',
        wrap: 'CLAMP_TO_EDGE',
        mipMapped: false,
      })
      this.__drawItemsTexture.clear()
    } else if (this.__drawItemsTexture.width != size) {
      this.__drawItemsTexture.resize(size, size)
      this.__dirtyItemIndices = Array((size * size) / pixelsPerItem)
        .fill()
        .map((v, i) => i)
    }

    gl.bindTexture(gl.TEXTURE_2D, this.__drawItemsTexture.glTex)
    const typeId = this.__drawItemsTexture.getTypeID()

    for (let i = 0; i < this.__dirtyItemIndices.length; i++) {
      const indexStart = this.__dirtyItemIndices[i]
      const yoffset = Math.floor((indexStart * pixelsPerItem) / size)
      let indexEnd = indexStart + 1
      for (let j = i + 1; j < this.__dirtyItemIndices.length; j++) {
        const index = this.__dirtyItemIndices[j]
        if (Math.floor((index * pixelsPerItem) / size) != yoffset) {
          break
        }
        if (index != indexEnd) {
          break
        }
        indexEnd++
      }

      // TODO: for contiguous blcoks, we create larger arrays and populate
      // and upload them in one step.
      const uploadCount = indexEnd - indexStart
      const xoffset = (indexStart * pixelsPerItem) % size
      const width = pixelsPerItem * uploadCount
      const height = 1
      const dataArray = new Float32Array(pixelsPerItem * 4 * uploadCount) // 4==RGBA pixels.

      for (let j = indexStart; j < indexEnd; j++) {
        const glgeomItem = this.__drawItems[j]
        // When an item is deleted, we allocate its index to the free list
        // and null this item in the array. skip over null items.
        if (!glgeomItem) continue
        this.__populateDrawItemDataArray(glgeomItem.getGeomItem(), j - indexStart, dataArray)
      }

      if (typeId == gl.FLOAT) {
        this.__drawItemsTexture.populate(dataArray, width, height, xoffset, yoffset, false)
      } else {
        const unit16s = MathFunctions.convertFloat32ArrayToUInt16Array(dataArray)
        this.__drawItemsTexture.populate(unit16s, width, height, xoffset, yoffset, false)
      }

      i += uploadCount - 1
    }

    this.__dirtyItemIndices = []
  }

  /**
   * The finalize method.
   */
  finalize() {
    if (this.__dirtyItemIndices.length == 0) return
    this.uploadGeomItems()
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    const gl = this.__gl
    const unifs = renderstate.unifs
    if (this.__drawItemsTexture && unifs.instancesTexture) {
      this.__drawItemsTexture.bindToUniform(renderstate, unifs.instancesTexture)
      gl.uniform1i(unifs.instancesTextureSize.location, this.__drawItemsTexture.width)
    }
    return true
  }

  /**
   * The bindShader method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} glshader - The glshader value.
   * @return {any} - The return value.
   */
  bindShader(renderstate, glshader) {
    if (!glshader.bind(renderstate)) return false
    if (!this.bind(renderstate)) return false
    return true
  }

  /**
   * The bindMaterial method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} glmaterial - The glmaterial value.
   * @param {any} warnMissingUnifs - The warnMissingUnifs value.
   * @return {any} - The return value.
   */
  bindMaterial(renderstate, glmaterial, warnMissingUnifs) {
    return glmaterial.bind(renderstate, warnMissingUnifs)
  }
}

export { GLStandardGeomsPass }
