/* eslint-disable guard-for-in */
import { EventEmitter } from '../../Utilities/index'
import { GeomItem, Points, Lines, Mesh, PointsProxy, LinesProxy, MeshProxy } from '../../SceneTree/index'
import { GLLinesItemSet } from '../Drawing/GLLinesItemSet.js'
import { GLPointsItemSet } from '../Drawing/GLPointsItemSet.js'
import { GLMeshItemSet } from '../Drawing/GLMeshItemSet.js'

/** Class representing GL shader materials.
 * @private
 */
class GLShaderGeomSets extends EventEmitter {
  /**
   * Create a GL shader material.
   * @param {GLPass} pass - The pass that owns this object.
   * @param {WebGL2RenderingContext} gl - The glShader value.
   * @param {object} shaders - The shader value.
   */
  constructor(pass, gl, shaders) {
    super()
    this.pass = pass
    this.gl = gl
    // this.shaderAttrSpec = {}
    this.glShader = shaders.glShader
    this.glGeomDataShader = shaders.glgeomdatashader ? shaders.glgeomdatashader : shaders.glShader
    this.glHighlightShader = shaders.glselectedshader ? shaders.glselectedshader : shaders.glShader
    this.glGeomItemSets = {}

    this.glShaderKey = shaders.glShader.getId() + 'multidraw-draw'

    if (this.glGeomDataShader) this.glGeomDataShaderKey = this.glGeomDataShader.getId() + 'multidraw-geomdata'
    if (this.glHighlightShader) this.glHighlightShaderKey = this.glHighlightShader.getId() + 'multidraw-highlight'
  }

  /**
   * Given a GeomItem, constructs the GLGeomItemSet that handles drawing that type of geometry.
   * @param {BaseGeom} geom - The geomitem value.
   * @return {GLGeomItemSet} - The return value.
   * */
  getOrCreateGLGeomItemSet(geom) {
    let glGeomItemSet
    if (geom instanceof Mesh || geom instanceof MeshProxy) {
      if (this.glGeomItemSets['GLMesh']) return this.glGeomItemSets['GLMesh']
      glGeomItemSet = new GLMeshItemSet(this.pass.renderer)
      this.glGeomItemSets['GLMesh'] = glGeomItemSet
    } else if (geom instanceof Lines || geom instanceof LinesProxy) {
      if (this.glGeomItemSets['GLLines']) return this.glGeomItemSets['GLLines']
      glGeomItemSet = new GLLinesItemSet(this.pass.renderer)
      this.glGeomItemSets['GLLines'] = glGeomItemSet
    } else if (geom instanceof Points || geom instanceof PointsProxy) {
      if (this.glGeomItemSets['GLPoints']) return this.glGeomItemSets['GLPoints']
      glGeomItemSet = new GLPointsItemSet(this.pass.renderer)
      this.glGeomItemSets['GLPoints'] = glGeomItemSet
    } else {
      throw new Error('Unsupported geom type:' + geom.constructor.name)
    }

    glGeomItemSet.on('updated', () => {
      this.emit('updated')
    })
    return glGeomItemSet
  }

  /**
   * The addGLGeomItem method.
   * @param {GLGeomItem} glGeomItem - The glGeomItem value.
   */
  addGLGeomItem(glGeomItem) {
    const geomItem = glGeomItem.geomItem
    const geom = geomItem.getParameter('Geometry').getValue()
    const material = glGeomItem.geomItem.getParameter('Material').getValue()
    this.pass.renderer.glMaterialLibrary.addMaterial(material)

    const geomItemParamChanged = (event) => {
      this.pass.removeGeomItem(geomItem)
      this.pass.__renderer.assignTreeItemToGLPass(geomItem)
    }
    material.on('transparencyChanged', geomItemParamChanged)
    geomItem.getParameter('Material').on('valueChanged', geomItemParamChanged)
    geomItem.getParameter('Geometry').on('valueChanged', geomItemParamChanged)

    const glGeomItemSet = this.getOrCreateGLGeomItemSet(geom)
    glGeomItem.material = material
    glGeomItem.GLGeomItemSet = glGeomItemSet
    glGeomItem.geomItemParamChanged = geomItemParamChanged
    glGeomItemSet.addGLGeomItem(glGeomItem)
  }

  /**
   *  Called by the GLPass to remove an item from this GLShaderGeomSets object.
   * @param {GLGeomItem} glGeomItem - The glGeomItem value.
   */
  removeGLGeomItem(glGeomItem) {
    const geomItem = glGeomItem.geomItem
    const material = glGeomItem.material
    const geomItemParamChanged = glGeomItem.geomItemParamChanged
    material.off('transparencyChanged', geomItemParamChanged)
    geomItem.getParameter('Material').off('valueChanged', geomItemParamChanged)
    geomItem.getParameter('Geometry').off('valueChanged', geomItemParamChanged)
    glGeomItem.material = null
    glGeomItem.geomItemParamChanged = null

    const glGeomItemSet = glGeomItem.GLGeomItemSet
    glGeomItemSet.removeGLGeomItem(glGeomItem)
    glGeomItem.GLGeomItemSet = null
  }

  /**
   * Binds one of its shaders for rendering, and also the other textures and values needed.
   * @param {object} glShader - The shader to bind
   * @param {object} renderstate - The render state for the current draw traversal
   * @param {string} key - The key to use to cache the shader binding.
   * @private
   */
  bindShader(glShader, renderstate, key) {
    if (!glShader.isCompiledForTarget(key)) {
      if (this.gl.multiDrawElements) {
        renderstate.shaderopts.directives.push('#define ENABLE_MULTI_DRAW\n#extension GL_ANGLE_multi_draw : enable')
      } else {
        renderstate.shaderopts.directives.push('#define ENABLE_MULTI_DRAW')
      }
      glShader.compileForTarget(key, renderstate.shaderopts)
      renderstate.shaderopts.directives.pop()
    }

    if (!glShader.bind(renderstate, key)) {
      throw new Error('Unable to bind shader:' + glShader)
    }

    this.pass.renderer.glGeomItemLibrary.bind(renderstate)
    this.pass.renderer.glGeomLibrary.bind(renderstate)
    this.pass.renderer.glMaterialLibrary.bind(renderstate)
  }

  /**
   * Draws all elements, binding the shader and continuing into the GLGLGeomSetGeomItemSets
   * @param {object} renderstate - The render state for the current draw traversal
   */
  draw(renderstate) {
    this.bindShader(this.glShader, renderstate, this.glShaderKey)

    for (const elementType in this.glGeomItemSets) {
      this.glGeomItemSets[elementType].draw(renderstate)
    }

    this.glShader.unbind(renderstate)
  }

  /**
   * The drawHighlightedGeoms method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawHighlightedGeoms(renderstate) {
    if (!this.glHighlightShader) return
    this.bindShader(this.glHighlightShader, renderstate, this.glHighlightShaderKey)

    for (const elementType in this.glGeomItemSets) {
      this.glGeomItemSets[elementType].drawHighlighted(renderstate)
    }
    this.glHighlightShader.unbind(renderstate)
  }

  /**
   * The drawGeomData method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawGeomData(renderstate) {
    this.bindShader(this.glGeomDataShader, renderstate, this.glGeomDataShaderKey)

    const gl = renderstate.gl
    const unifs = renderstate.unifs
    if (unifs.floatGeomBuffer) {
      gl.uniform1i(unifs.floatGeomBuffer.location, 1)
    }
    if (unifs.passId) {
      gl.uniform1i(unifs.passId.location, renderstate.passIndex)
    }

    for (const elementType in this.glGeomItemSets) {
      this.glGeomItemSets[elementType].draw(renderstate)
    }

    this.glGeomDataShader.unbind(renderstate)
  }

  /**
   * Sorts the drawn items in order furthest to nearest when rendering transparent objects.
   * @param {Vec3} viewPos - The position of the camera that we are sorting relative to.
   */
  sortItems(viewPos) {
    // Note: sorting here will not sort geometries of different types.
    // this is a flawed solution that only sorts geomemtries of the same
    // time and same shader against each other. Given that this is the data 99% o
    // of the time, this is an acceptable tradeoff
    for (const elementType in this.glGeomItemSets) {
      this.glGeomItemSets[elementType].sortItems(viewPos)
    }
  }
}

export { GLShaderGeomSets }
