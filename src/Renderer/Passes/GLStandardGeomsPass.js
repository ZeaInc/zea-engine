import { GLPass } from './GLPass'

import { Vec4 } from '../../Math/index'

import { GeomItem, Points, Lines, Mesh, PointsProxy, LinesProxy, MeshProxy } from '../../SceneTree/index'
import { GLPoints, GLLines, GLMesh, GLMaterial, GLGeomItemChangeType, GLGeomItem } from '../Drawing/index.js'
import { GLTexture2D } from '../GLTexture2D.js'
import { MathFunctions } from '../../Utilities/MathFunctions'

/** This class abstracts the rendering of a collection of geometries to screen.
 * @extends GLPass
 */
class GLStandardGeomsPass extends GLPass {
  /**
   * Create a GL pass.
   */
  constructor() {
    super()
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
   * The itemAddedToScene method is called on each pass when a new item
   * is added to the scene, and the renderer must decide how to render it.
   * It allows Passes to select geometries to handle the drawing of.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * The object contains a parameter 'continueInSubTree', which can be set to false,
   * so the subtree of this node will not be traversed after this node is handled.
   * @return {Boolean} - Returns true if the item is now added to the pass.
   */
  itemAddedToScene(treeItem, rargs) {
    if (treeItem instanceof GeomItem) {
      const geomItem = treeItem
      {
        {
          if (this.filterGeomItem(geomItem)) {
            this.addGeomItem(geomItem)

            geomItem.setMetadata('glpass', this)
            return true
          } else {
            return false
          }
        }
      }
    } else {
      return false
    }
  }

  /**
   * The itemRemovedFromScene method is called on each pass when aa item
   * is removed to the scene, and the pass must handle cleaning up any resources.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * @return {Boolean} - The return value.
   */
  itemRemovedFromScene(treeItem, rargs) {
    if (treeItem instanceof GeomItem && treeItem.getMetadata('glpass') == this) {
      return this.removeGeomItem(treeItem)
    }
    return false
  }

  /**
   * The filterGeomItem method.
   * @param {GeomItem} geomItem - The geomItem value.
   * @return {any} - The return value.
   */
  filterGeomItem(geomItem) {
    return true
  }

  /**
   * The constructShaders method.
   * Given a material, generate the various shaders required to render objects
   * using this material. There should always be at least a single glShader
   * and optionally a glgeomdatashader for rendering the goem data buffer
   * and a glselectedshader for rendering selection hilghlights
   * @param {string} shaderName - The name of the base shader.
   * @return {object} - The object containing the shader instances.
   */
  constructShaders(shaderName) {
    let glgeomdatashader
    let glselectedshader

    const glShader = this.__renderer.getOrCreateShader(shaderName)
    if (glShader.constructor.getGeomDataShaderName()) {
      glgeomdatashader = this.__renderer.getOrCreateShader(glShader.constructor.getGeomDataShaderName())
    }
    if (glShader.constructor.getSelectedShaderName()) {
      glselectedshader = this.__renderer.getOrCreateShader(glShader.constructor.getSelectedShaderName())
    }
    return {
      glShader,
      glgeomdatashader,
      glselectedshader,
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

    const geomItem = this.renderer.glGeomItemLibrary.getGeomItem(itemId)
    if (geomItem) {
      return {
        geomItem,
        dist,
      }
    }
  }
}

export { GLStandardGeomsPass }
