import { GLTexture2D } from '../GLTexture2D.js'
import { EventEmitter, MathFunctions, Allocator1D } from '../../Utilities/index'
import { GLMaterial } from './GLMaterial.js'

/** Class representing a GL CAD material library.
 * @ignore
 */
class GLMaterialLibrary extends EventEmitter {
  /**
   * Create a GL CAD material library.
   * @param {GLBaseRenderer} renderer - The renderer object
   */
  constructor(renderer) {
    super()
    this.renderer = renderer
    this.materials = []
    this.materialIndices = {}
    this.glMaterials = {}
    this.freeIndices = []
    this.dirtyIndices = new Set()
    this.materialsAllocator = new Allocator1D()

    this.materialsAllocator.on('dataReallocated', (event) => {
      // during allocation, a defragment might occur, which means
      // we need to re-upload some of our data.
      const id = event.id
      this.dirtyIndices.add(id)
    })
  }

  /**
   * The addMaterial method.
   * @param {Material} material - The material object.
   * @return {number} - The index of GLMaterial
   */
  addMaterial(material) {
    let index = this.materialIndices[material.getId()]
    if (index != undefined) {
      // TODO: Track ref counts. Increment the ref count for the GLGeom
      return index
    }

    if (this.freeIndices.length) {
      index = this.freeIndices.pop()
    } else {
      index = this.materials.length
    }

    this.materials[index] = material
    this.materialIndices[material.getId()] = index

    const matData = material.getShaderClass().getPackedMaterialData(material)
    const allocation = this.materialsAllocator.allocate(index, matData.length / 4)
    material.setMetadata('glmaterialcoords', { x: allocation.start, y: allocation.size })

    const parameterValueChanged = () => {
      this.dirtyIndices.add(index)
      this.emit('updated')
    }
    material.on('parameterValueChanged', parameterValueChanged)

    // const transparencyChanged = () => {
    //   material.off('parameterValueChanged', parameterValueChanged)
    //   material.off('transparencyChanged', transparencyChanged)
    //   this.removeMaterial(material)
    // }
    // material.on('transparencyChanged', transparencyChanged)

    this.dirtyIndices.add(index)

    return index
  }

  /**
   * Given a material, generates a GLMaterial that manages the GPU state for the material.
   * @param {Material} material - The material value.
   * @return {GLMaterial} - The constructed GLMaterial.
   */
  getGLMaterial(material) {
    if (this.glMaterials[material.getId()]) {
      return this.glMaterials[material.getId()]
    }

    const glShader = this.renderer.getOrCreateShader(material.getShaderName())
    const gl = this.renderer.gl
    const glMaterial = new GLMaterial(gl, material, glShader)
    glMaterial.on('updated', () => {
      this.renderer.requestRedraw()
    })
    material.setMetadata('glMaterial', glMaterial)

    this.glMaterials[material.getId()] = glMaterial

    return glMaterial
  }

  getMaterialAllocation(material) {
    const index = this.materialIndices[material.getId()]
    if (index != undefined) {
      return this.materialsAllocator.getAllocation(index)
    }
  }

  /**
   * The removeMaterial method.
   * @param {Material} material - The material object.
   */
  removeMaterial(material) {
    // if (!material.getMetadata('glmaterialcoords')) {
    //   throw new Error('Material not managed by this GLMaterialLibrary')
    // }
    material.deleteMetadata('glmaterialcoords')
    const index = this.materials.indexOf(material)
    this.freeIndices.push(index)
    this.materialsAllocator.deallocate(index)
    this.materials[index] = null
    delete this.materialIndices[material.getId()]

    if (this.dirtyIndices.has(index)) {
      this.dirtyIndices.delete(index)
    }
  }

  /**
   * The uploadMaterials method.
   * @param {object} renderstate - The render state for the current draw traversal
   */
  uploadMaterials(renderstate) {
    const gl = this.renderer.gl

    const materialsTextureSize = MathFunctions.nextPow2(Math.ceil(Math.sqrt(this.materialsAllocator.reservedSpace)))
    const unit = renderstate.boundTextures++
    gl.activeTexture(gl.TEXTURE0 + unit)

    if (!this.materialsTexture) {
      this.materialsTexture = new GLTexture2D(gl, {
        format: 'RGBA',
        type: 'FLOAT',
        width: materialsTextureSize,
        height: materialsTextureSize,
        filter: 'NEAREST',
        wrap: 'CLAMP_TO_EDGE',
        mipMapped: false,
      })
      this.materialsTexture.clear()
    } else if (this.materialsTexture.width < materialsTextureSize) {
      this.materialsTexture.resize(materialsTextureSize, materialsTextureSize)

      for (let i = 0; i < this.materials.length; i++) {
        if (this.materialsAllocator.getAllocation(i)) {
          this.dirtyIndices.add(i)
        }
      }
    }

    const tex = this.materialsTexture
    const texWidth = this.materialsTexture.width
    gl.bindTexture(gl.TEXTURE_2D, tex.glTex)
    this.dirtyIndices.forEach((index) => {
      const allocation = this.materialsAllocator.getAllocation(index)
      const material = this.materials[index]
      const matData = material.getShaderClass().getPackedMaterialData(material)

      const level = 0
      const xoffset = allocation.start % texWidth
      const height = 1
      const rows = Math.ceil((xoffset + allocation.size) / texWidth)

      let consumed = 0
      let remaining = allocation.size
      let rowStart = xoffset
      for (let i = 0; i < rows; i++) {
        let width
        if (rowStart + remaining > texWidth) {
          width = texWidth - rowStart
          rowStart = 0
        } else {
          width = remaining
        }
        const x = (allocation.start + consumed) % texWidth
        const y = Math.floor((allocation.start + consumed) / texWidth)
        const data = matData.subarray(consumed * 4, (consumed + width) * 4)
        gl.texSubImage2D(gl.TEXTURE_2D, level, x, y, width, height, tex.__format, tex.__type, data)
        consumed += width
        remaining -= width
      }
    })
    this.dirtyIndices = new Set()
    gl.bindTexture(gl.TEXTURE_2D, null)
    renderstate.boundTextures--
  }

  /**
   * Updates the GPU state if any update is needed.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  update(renderstate) {
    if (this.dirtyItemIndices.length > 0) this.uploadGeomItems(renderstate)
    renderstate.drawItemsTexture = this.glGeomItemsTexture
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate param.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    if (this.dirtyIndices.size > 0) {
      this.uploadMaterials(renderstate)
    }

    if (!this.materialsTexture) return

    const { materialsTexture, materialsTextureSize } = renderstate.unifs
    if (materialsTexture) {
      this.materialsTexture.bindToUniform(renderstate, materialsTexture)
      if (materialsTextureSize) {
        const gl = this.renderer.gl
        gl.uniform2i(materialsTextureSize.location, this.materialsTexture.width, this.materialsTexture.height)
      }
    }

    return true
  }
}
export { GLMaterialLibrary }
