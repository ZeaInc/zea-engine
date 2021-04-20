import { Vec3, Vec4 } from '../../Math/index'
import { BillboardItem } from '../../SceneTree/index'
import { BillboardShader } from '../Shaders/BillboardShader.js'
import { GLPass, PassType } from './GLPass.js'
import { GLImageAtlas } from '../GLImageAtlas.js'
import { GLTexture2D } from '../GLTexture2D.js'
import { GLRenderer } from '../GLRenderer.js'
import { generateShaderGeomBinding, GLMesh } from '../Drawing/index'
import { MathFunctions } from '../../Utilities/MathFunctions'

const pixelsPerItem = 6 // The number of pixels per draw item.

/** Class representing a GL billboards pass.
 * @extends GLPass
 * @private
 */
class GLBillboardsPass extends GLPass {
  /**
   * Create a GL billboards pass.
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

    this.billboards = []
    this.dirtyBillboards = new Set()
    this.freeIndices = []
    this.drawCount = 0
    this.threshold = 0.0
    this.updateRequested = false

    this.prevSortCameraPos = new Vec3()

    this.atlas = new GLImageAtlas(this.renderer.gl, 'Billboards', 'RGBA', 'UNSIGNED_BYTE', [1, 1, 1, 0])
    const emitUpdated = (event) => this.emit('updated', event)
    this.atlas.on('loaded', emitUpdated)
    this.atlas.on('updated', emitUpdated)
  }

  /**
   * Returns the pass type. OPAQUE passes are always rendered first, followed by TRANSPARENT passes, and finally OVERLAY.
   * @return {number} - The pass type value.
   */
  getPassType() {
    return PassType.TRANSPARENT
  }

  /**
   * The itemAddedToScene method is called on each pass when a new item
   * is added to the scene, and the renderer must decide how to render it.
   * It allows Passes to select geometries to handle the drawing of.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * The object contains a parameter 'continueInSubTree', which can be set to false,
   * so the subtree of this node will not be traversed after this node is handled.
   * @return {Boolean} - The return value.
   */
  itemAddedToScene(treeItem, rargs) {
    if (treeItem instanceof BillboardItem) {
      this.addBillboard(treeItem)
      return true
    }
    return false
  }

  /**
   * The itemRemovedFromScene method is called on each pass when aa item
   * is removed to the scene, and the pass must handle cleaning up any resources.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * @return {Boolean} - The return value.
   */
  itemRemovedFromScene(treeItem, rargs) {
    if (treeItem instanceof BillboardItem) {
      this.removeBillboard(treeItem)
      return true
    }
    return false
  }

  // ///////////////////////////////////
  // Bind to Render Tree

  /**
   * The filterRenderTree method.
   */
  filterRenderTree() {}

  /**
   * The addBillboard method.
   * @param {any} billboard - The billboard value.
   */
  addBillboard(billboard) {
    const imageParam = billboard.getParameter('Image')
    const image = imageParam.getValue()
    if (!image) {
      imageParam.on('valueChanged', () => this.addBillboard(billboard))
      return
    }
    let index
    if (this.freeIndices.length > 0) index = this.freeIndices.pop()
    else index = this.billboards.length

    const imageIndex = this.atlas.addSubImage(image)
    billboard.setMetadata('GLBillboardsPass_Index', index)

    const visibilityChanged = () => {
      if (billboard.isVisible()) {
        this.drawCount++
        // The billboard Xfo might have changed while it was
        // not visible. We need to update here.
        this.dirtyBillboards.add(index)
      } else this.drawCount--
      this.reqUpdateIndexArray()
    }
    billboard.on('visibilityChanged', visibilityChanged)

    const xfoChanged = () => {
      if (billboard.isVisible()) {
        this.dirtyBillboards.add(index)
        this.emit('updated', {})
      }
    }
    billboard.getParameter('GlobalXfo').on('valueChanged', xfoChanged)

    const alphaChanged = () => {
      if (billboard.isVisible()) {
        this.dirtyBillboards.add(index)
        this.emit('updated', {})
      }
    }
    billboard.getParameter('Alpha').on('valueChanged', alphaChanged)

    if (billboard.isVisible()) this.drawCount++

    this.billboards[index] = {
      billboard,
      imageIndex,
      visibilityChanged,
      xfoChanged,
      alphaChanged,
    }

    this.indexArrayUpdateNeeded = true
    this.requestUpdate()
  }

  /**
   * The removeBillboard method.
   * @param {any} billboard - The billboard value.
   */
  removeBillboard(billboard) {
    const index = billboard.getMetadata('GLBillboardsPass_Index')
    if (index == -1) {
      console.warn('Billboard already removed.')
      return
    }
    const billboardData = this.billboards[index]

    // Currently we are getting errors when trying to re-generate the Fbo
    // after removing and then adding images back to the atlas.
    // I don't have time to figure it out, so simply adding images
    // to the atlas. (for the Zahner demo)
    // Eventually we need to clean up the atlas, so debug this using the
    // survey-point-calibration 190528_Dummy_Srvy_Data.vlexe test
    const image = billboardData.billboard.getParameter('Image').getValue()
    this.atlas.removeSubImage(image)

    billboard.off('visibilityChanged', billboardData.visibilityChanged)
    billboard.getParameter('GlobalXfo').off('valueChanged', billboardData.xfoChanged)
    billboard.getParameter('Alpha').off('valueChanged', billboardData.alphaChanged)

    this.billboards[index] = null
    this.freeIndices.push(index)

    if (billboard.isVisible()) this.drawCount--

    this.indexArrayUpdateNeeded = true
    this.requestUpdate()
  }

  /**
   * The populateBillboardDataArray method.
   * @param {any} billboardData - The billboardData value.
   * @param {number} index - The index value.
   * @param {any} dataArray - The dataArray value.
   * @private
   */
  populateBillboardDataArray(billboardData, index, dataArray) {
    const billboard = billboardData.billboard
    const mat4 = billboard.getParameter('GlobalXfo').getValue().toMat4()
    const ppm = billboard.getParameter('PixelsPerMeter').getValue()
    const pivot = billboard.getParameter('Pivot').getValue()
    const scale = 1 / ppm

    // Until webgl2 is standard, we will avoid using bit flags.
    // instead, we will use decimals.
    let flags = 0
    if (billboard.getParameter('AlignedToCamera').getValue()) flags |= 1 << 2
    if (billboard.getParameter('DrawOnTop').getValue()) flags |= 1 << 3
    if (billboard.getParameter('FixedSizeOnscreen').getValue()) flags |= 1 << 4
    const alpha = billboard.getParameter('Alpha').getValue()
    const color = billboard.getParameter('Color').getValue()
    const offset = index * pixelsPerItem * 4
    const col0 = Vec4.createFromBuffer(dataArray.buffer, offset * 4)
    const col1 = Vec4.createFromBuffer(dataArray.buffer, (offset + 4) * 4)
    const col2 = Vec4.createFromBuffer(dataArray.buffer, (offset + 8) * 4)
    const col3 = Vec4.createFromBuffer(dataArray.buffer, (offset + 12) * 4)
    col0.set(mat4.xAxis.x, mat4.yAxis.x, mat4.zAxis.x, mat4.translation.x)
    col1.set(mat4.xAxis.y, mat4.yAxis.y, mat4.zAxis.y, mat4.translation.y)
    col2.set(mat4.xAxis.z, mat4.yAxis.z, mat4.zAxis.z, mat4.translation.z)
    col3.set(scale, flags, billboardData.imageIndex, alpha)

    const col4 = Vec4.createFromBuffer(dataArray.buffer, (offset + 16) * 4)
    col4.set(pivot.x, pivot.y, 0, 0)

    const col5 = Vec4.createFromBuffer(dataArray.buffer, (offset + 20) * 4)
    col5.set(color.r, color.g, color.b, color.a)
  }

  /**
   * The requestUpdate method.
   * @private
   */
  requestUpdate() {
    if (!this.updateRequested) {
      this.updateRequested = true
      this.emit('updated')
    }
  }

  /**
   * The reqUpdateIndexArray method.
   * @private
   */
  reqUpdateIndexArray() {
    if (this.indexArrayUpdateNeeded) return
    this.indexArrayUpdateNeeded = true
    this.emit('updated')
  }

  // eslint-disable-next-line require-jsdoc
  updateIndexArray() {
    const gl = this.__gl
    // Note: When the camera moves, this array is sorted and re-upload.
    if (this.indexArray && this.indexArray.length != this.drawCount) {
      gl.deleteBuffer(this.instanceIdsBuffer)
      this.instanceIdsBuffer = null
    }

    this.indexArray = new Float32Array(this.drawCount)
    let offset = 0
    for (let i = 0; i < this.billboards.length; i++) {
      if (this.billboards[i] && this.billboards[i].billboard.isVisible()) {
        this.indexArray[offset] = i
        offset++
      }
    }
    if (!this.instanceIdsBuffer) this.instanceIdsBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW)
    this.indexArrayUpdateNeeded = false
  }

  /**
   * The updateBillboards method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @private
   */
  updateBillboards(renderstate) {
    const doIt = () => {
      if (this.indexArrayUpdateNeeded) this.updateIndexArray()

      const gl = this.__gl
      if (!this.glshader) {
        if (!gl.__quadVertexIdsBuffer) {
          gl.setupInstancedQuad()
        }
        this.glshader = new BillboardShader(gl)
        const shaderComp = this.glshader.compileForTarget('GLBillboardsPass', renderstate.shaderopts)

        this.shaderBinding = generateShaderGeomBinding(gl, shaderComp.attrs, gl.__quadattrbuffers, gl.__quadIndexBuffer)
      }

      // Note: Maybe the atlas is alreadu up to date. It should
      // maintain its own coherencey by listening to the sub images.
      this.atlas.renderAtlas()

      if (!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
        this.modelMatrixArray = []
        this.billboardDataArray = []
        this.tintColorArray = []
        this.indexArray.forEach((index) => {
          // if (index == -1) return;
          const billboardData = this.billboards[index]
          const billboard = billboardData.billboard
          const mat4 = billboard.getParameter('GlobalXfo').getValue().toMat4()
          const ppm = billboard.getParameter('PixelsPerMeter').getValue()
          const scale = 1 / ppm
          let flags = 0
          if (billboard.getParameter('AlignedToCamera').getValue()) flags |= 1 << 2
          if (billboard.getParameter('DrawOnTop').getValue()) flags |= 1 << 3
          if (billboard.getParameter('FixedSizeOnscreen').getValue()) flags |= 1 << 4
          const alpha = billboard.getParameter('Alpha').getValue()
          const color = billboard.getParameter('Color').getValue()

          this.modelMatrixArray[index] = mat4.asArray()
          this.billboardDataArray[index] = [scale, flags, billboardData.imageIndex, alpha]
          this.tintColorArray[index] = [color.r, color.g, color.b, color.a]
        })
        this.updateRequested = false
        return
      }

      let size = Math.round(Math.sqrt((this.billboards.length - this.freeIndices.length) * pixelsPerItem) + 0.5)
      // Note: the following few lines need a cleanup.
      // We should be using power of 2 textures. The problem is that pot texture sizes don't
      // align with the 6 pixels per draw item. So we need to upload a slightly bigger texture
      // but upload the 'usable' size.

      // Only support power 2 textures. Else we get strange corruption on some GPUs
      // in some scenes.
      // Size should be a multiple of pixelsPerItem, so each geom item is always contiguous
      // in memory. (makes updating a lot easier. See __updateItemInstanceData below)
      // size = Math.nextPow2(size);

      if (size % pixelsPerItem != 0) size += pixelsPerItem - (size % pixelsPerItem)

      this.width = size
      // if((this.width % pixelsPerItem) != 0)
      //     this.width -= (this.width % pixelsPerItem);

      if (!this.drawItemsTexture) {
        this.drawItemsTexture = new GLTexture2D(gl, {
          format: 'RGBA',
          type: 'FLOAT',
          width: size,
          height: size,
          filter: 'NEAREST',
          wrap: 'CLAMP_TO_EDGE',
          mipMapped: false,
        })
        this.drawItemsTexture.clear()
      } else {
        this.drawItemsTexture.resize(size, size)
      }

      this.indexArray.forEach((index) => {
        if (index != -1) this.updateBillboard(index)
      })

      this.updateRequested = false
    }

    if (this.atlas.isLoaded()) {
      doIt()
    } else {
      this.atlas.on('loaded', doIt)
    }
  }

  /**
   * The updateBillboard method.
   * @param {number} index - The index of the Billboard to update .
   * @private
   */
  updateBillboard(index) {
    if (this.drawCount == 0 || !this.drawItemsTexture) {
      return
    }

    const billboardData = this.billboards[index]
    if (!billboardData.billboard.isVisible()) return

    const gl = this.__gl

    const dataArray = new Float32Array(pixelsPerItem * 4)
    this.populateBillboardDataArray(billboardData, 0, dataArray)

    gl.bindTexture(gl.TEXTURE_2D, this.drawItemsTexture.glTex)
    const xoffset = (index * pixelsPerItem) % this.width
    const yoffset = Math.floor((index * pixelsPerItem) / this.width)

    const width = pixelsPerItem
    const height = 1
    // console.log("xoffset:" + xoffset + " yoffset:" + yoffset +" width:" + width + " dataArray:" + dataArray.length);
    // gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, gl.FLOAT, dataArray);

    const type = this.drawItemsTexture.getType()
    const format = this.drawItemsTexture.getFormat()

    if (type == 'FLOAT') {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl[format], gl[type], dataArray)
    } else {
      const unit16s = MathFunctions.convertFloat32ArrayToUInt16Array(dataArray)
      gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl[format], gl[type], unit16s)
    }
  }

  /**
   * The sort method.
   * @param {any} cameraPos - The cameraPos value.
   */
  sort(cameraPos) {
    for (const billboardData of this.billboards) {
      const { billboard } = billboardData
      if (billboard && billboard.isVisible()) {
        const xfo = billboard.getParameter('GlobalXfo').getValue()
        billboardData.dist = xfo.tr.distanceTo(cameraPos)
      }
    }
    this.indexArray.sort((a, b) => {
      if (a == -1) return 1
      if (b == -1) return -1
      return this.billboards[a].dist > this.billboards[b].dist
        ? -1
        : this.billboards[a].dist < this.billboards[b].dist
        ? 1
        : 0
    })

    const gl = this.__gl
    if (gl.floatTexturesSupported && this.instanceIdsBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceIdsBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW)
    }
  }

  /**
   * The sort method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  draw(renderstate) {
    if (this.drawCount == 0) return
    if (this.updateRequested) {
      this.updateBillboards(renderstate)
    }

    if (this.dirtyBillboards.size > 0) {
      this.dirtyBillboards.forEach((index) => {
        this.updateBillboard(index)
      })
      this.dirtyBillboards.clear()
    }

    if (this.indexArrayUpdateNeeded) this.updateIndexArray()

    if (!this.glshader) return

    const gl = this.__gl

    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const cameraPos = renderstate.viewXfo.tr
    const dist = cameraPos.distanceTo(this.prevSortCameraPos)
    // Avoid sorting if the camera did not move more than 3 meters.
    if (dist > this.threshold) {
      this.sort(cameraPos)
      this.prevSortCameraPos = cameraPos.clone()
      if (this.drawCount > 1) {
        const v0 = this.billboards[this.indexArray[0]].billboard.getParameter('GlobalXfo').getValue().tr
        const v1 = this.billboards[this.indexArray[1]].billboard.getParameter('GlobalXfo').getValue().tr
        this.threshold = v0.distanceTo(v1)
      } else {
        this.threshold = 9999
      }
    }

    this.glshader.bind(renderstate)
    this.shaderBinding.bind(renderstate)

    const unifs = renderstate.unifs
    this.atlas.bindToUniform(renderstate, unifs.atlasBillboards)

    const inVR = renderstate.vrPresenting == true
    gl.uniform1i(unifs.inVR.location, inVR)

    if (!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
      const len = this.indexArray.length
      for (let i = 0; i < len; i++) {
        gl.uniformMatrix4fv(unifs.modelMatrix.location, false, this.modelMatrixArray[i])
        gl.uniform4fv(unifs.billboardData.location, this.billboardDataArray[i])
        gl.uniform4fv(unifs.tintColor.location, this.tintColorArray[i])
        gl.uniform4fv(unifs.layoutData.location, this.atlas.getLayoutData(this.billboards[i].imageIndex))

        renderstate.bindViewports(unifs, () => {
          gl.drawQuad()
        })
      }
    } else {
      this.drawItemsTexture.bindToUniform(renderstate, unifs.instancesTexture)
      gl.uniform1i(unifs.instancesTextureSize.location, this.width)

      {
        // The instance transform ids are bound as an instanced attribute.
        const location = renderstate.attrs.instanceIds.location
        gl.enableVertexAttribArray(location)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceIdsBuffer)
        gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 4, 0)
        gl.vertexAttribDivisor(location, 1) // This makes it instanced
      }

      renderstate.bindViewports(unifs, () => {
        gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, this.drawCount)
      })
    }

    gl.disable(gl.BLEND)
  }
}

GLRenderer.registerPass(GLBillboardsPass, PassType.TRANSPARENT)

export { GLBillboardsPass }
