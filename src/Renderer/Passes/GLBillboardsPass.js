import { Vec3, Vec4 } from '../../Math/index'
import { BillboardItem } from '../../SceneTree/index'
import { BillboardShader } from '../Shaders/BillboardShader.js'
import { GLPass, PassType } from './GLPass.js'
import { GLImageAtlas } from '../GLImageAtlas.js'
import { GLTexture2D } from '../GLTexture2D.js'
import { generateShaderGeomBinding } from '../GeomShaderBinding.js'
import { GLRenderer } from '../GLRenderer.js'

const pixelsPerItem = 5 // The number of pixels per draw item.

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
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)

    this.__billboards = []
    this.__freeIndices = []
    this.__drawCount = 0
    this.__threshold = 0.0
    this.__updateRequested = false

    this.__prevSortCameraPos = new Vec3()

    this.__atlas = new GLImageAtlas(
      this.__renderer.gl,
      'Billboards',
      'RGBA',
      'UNSIGNED_BYTE',
      [1, 1, 1, 0]
    )
    const emitUpdated = event => this.emit('updated', event)
    this.__atlas.on('loaded', emitUpdated)
    this.__atlas.on('updated', emitUpdated)

    this.__renderer.registerPass(
      treeItem => {
        if (treeItem instanceof BillboardItem) {
          this.addBillboard(treeItem)
          return true
        }
        return false
      },
      treeItem => {
        if (treeItem instanceof BillboardItem) {
          this.removeBillboard(treeItem)
          return true
        }
        return false
      }
    )
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
    if (this.__freeIndices.length > 0) index = this.__freeIndices.pop()
    else index = this.__billboards.length

    const imageIndex = this.__atlas.addSubImage(image)
    billboard.setMetadata('GLBillboardsPass_Index', index)

    const visibilityChanged = () => {
      if (billboard.getVisible()) {
        this.__drawCount++
        // The billboard Xfo might have changed while it was 
        // not visible. We need to update here.
        this.__updateBillboard(index)
      } else this.__drawCount--
      this.__reqUpdateIndexArray()
    }
    billboard.on('visibilityChanged', visibilityChanged)

    const xfoChanged = () => {
      if (billboard.getVisible()) {
        this.__updateBillboard(index)
        this.emit('updated', {})
      }
    }
    billboard.getParameter('GlobalXfo').on('valueChanged', xfoChanged)

    const alphaChanged = () => {
      if (billboard.getVisible()) {
        this.__updateBillboard(index)
        this.emit('updated', {})
      }
    }
    billboard.getParameter('Alpha').on('valueChanged', alphaChanged)

    if (billboard.getVisible())
      this.__drawCount++

    this.__billboards[index] = {
      billboard,
      imageIndex,
      visibilityChanged,
      xfoChanged,
      alphaChanged,
    }

    this.indexArrayUpdateNeeded = true
    this.__requestUpdate()
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
    const billboardData = this.__billboards[index]

    // Currently we are getting errors when trying to re-generate the Fbo
    // after removing and then adding images back to the atlas.
    // I don't have time to figure it out, so simply adding images
    // to the atlas. (for the Zahner demo)
    // Eventually we need to clean up the atlas, so debug this using the
    // survey-point-calibration 190528_Dummy_Srvy_Data.vlexe test
    const image = billboardData.billboard.getParameter('Image').getValue();
    this.__atlas.removeSubImage(image)

    billboard.off('visibilityChanged', billboardData.visibilityChanged)
    billboard.getParameter('GlobalXfo').off('valueChanged', billboardData.xfoChanged)
    billboard.getParameter('Alpha').off('valueChanged', billboardData.alphaChanged)

    this.__billboards[index] = null
    this.__freeIndices.push(index)
    
    if (billboard.getVisible()) this.__drawCount--

    this.indexArrayUpdateNeeded = true
    this.__requestUpdate()
  }

  /**
   * The __populateBillboardDataArray method.
   * @param {any} billboardData - The billboardData value.
   * @param {number} index - The index value.
   * @param {any} dataArray - The dataArray value.
   * @private
   */
  __populateBillboardDataArray(billboardData, index, dataArray) {
    const billboard = billboardData.billboard
    const mat4 = billboard.getGlobalXfo().toMat4()
    const ppm = billboard.getParameter('PixelsPerMeter').getValue()
    const scale = 1 / ppm
    let flags = 0
    if (billboard.getParameter('AlignedToCamera').getValue()) flags |= 1 << 2
    if (billboard.getParameter('DrawOnTop').getValue()) flags |= 1 << 3
    const alpha = billboard.getParameter('Alpha').getValue()
    const color = billboard.getParameter('Color').getValue()
    const offset = index * pixelsPerItem * 4
    const col0 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset)
    const col1 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 4)
    const col2 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 8)
    const col3 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 12)
    col0.set(mat4.xAxis.x, mat4.yAxis.x, mat4.zAxis.x, mat4.translation.x)
    col1.set(mat4.xAxis.y, mat4.yAxis.y, mat4.zAxis.y, mat4.translation.y)
    col2.set(mat4.xAxis.z, mat4.yAxis.z, mat4.zAxis.z, mat4.translation.z)
    col3.set(scale, flags, billboardData.imageIndex, alpha)

    const col4 = Vec4.createFromFloat32Buffer(dataArray.buffer, offset + 16)
    col4.set(color.r, color.g, color.b, color.a)
  }

  /**
   * The __requestUpdate method.
   * @private
   */
  __requestUpdate() {
    if (!this.__updateRequested) {
      this.__updateRequested = true
      setTimeout(() => {
        this.__updateBillboards()
      }, 100)
    }
  }

  /**
   * The __reqUpdateIndexArray method.
   * @private
   */
  __reqUpdateIndexArray() {
    if (this.indexArrayUpdateNeeded) return
    this.indexArrayUpdateNeeded = true
    this.updateIndexArrayId = setTimeout(() => {
      // Another update or a draw might have occured
      // since the request was made.
      if (!this.indexArrayUpdateNeeded) return
      this.__updateIndexArray()
      this.emit('updated', {})
    }, 1)
  }

  // eslint-disable-next-line require-jsdoc
  __updateIndexArray() {
    const gl = this.__gl
    // Note: When the camera moves, this array is sorted and re-upload.
    if (this.__indexArray && this.__indexArray.length != this.__drawCount) {
      gl.deleteBuffer(this.__instanceIdsBuffer)
      this.__instanceIdsBuffer = null
    }

    this.__indexArray = new Float32Array(this.__drawCount)
    let offset = 0
    for (let i = 0; i < this.__billboards.length; i++) {
      if (this.__billboards[i] && this.__billboards[i].billboard.getVisible()) {
        this.__indexArray[offset] = i
        offset++
      }
    }
    if (!this.__instanceIdsBuffer) this.__instanceIdsBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.__indexArray, gl.STATIC_DRAW)
    this.indexArrayUpdateNeeded = false
  }

  /**
   * The __updateBillboards method.
   * @private
   */
  __updateBillboards() {

    const doIt = () => {

      if (this.indexArrayUpdateNeeded)
        this.__updateIndexArray()

      const gl = this.__gl
      if (!this.__glshader) {
        if (!gl.__quadVertexIdsBuffer) {
          gl.setupInstancedQuad()
        }
        this.__glshader = new BillboardShader(gl)
        const shaderComp = this.__glshader.compileForTarget(
          'GLBillboardsPass',
          this.__renderer.getShaderPreproc()
        )
        this.__shaderBinding = generateShaderGeomBinding(
          gl,
          shaderComp.attrs,
          gl.__quadattrbuffers,
          gl.__quadIndexBuffer
        )
      }

      // Note: Maybe the atlas is alreadu up to date. It should
      // maintain its own coherencey by listening to the sub images.
      this.__atlas.renderAtlas()

      if (!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
        this.__modelMatrixArray = []
        this.__billboardDataArray = []
        this.__tintColorArray = []
        this.__indexArray.forEach((index) => {
          // if (index == -1) return;
          const billboardData = this.__billboards[index]
          const billboard = billboardData.billboard
          const mat4 = billboard.getGlobalXfo().toMat4()
          const ppm = billboard.getParameter('PixelsPerMeter').getValue()
          const scale = 1 / ppm
          let flags = 0
          if (billboard.getParameter('AlignedToCamera').getValue()) flags |= 1 << 2
          const alpha = billboard.getParameter('Alpha').getValue()
          const color = billboard.getParameter('Color').getValue()

          this.__modelMatrixArray[index] = mat4.asArray()
          this.__billboardDataArray[index] = [
            scale,
            flags,
            billboardData.imageIndex,
            alpha,
          ]
          this.__tintColorArray[index] = [color.r, color.g, color.b, color.a]
        })
        this.__updateRequested = false
        return
      }

      let size = Math.round(
        Math.sqrt((this.__billboards.length - this.__freeIndices.length) * pixelsPerItem) + 0.5
      )
      // Note: the following few lines need a cleanup.
      // We should be using power of 2 textures. The problem is that pot texture sizes don't
      // align with the 6 pixels per draw item. So we need to upload a slightly bigger teture
      // but upload the 'usable' size.

      // Only support power 2 textures. Else we get strange corruption on some GPUs
      // in some scenes.
      // Size should be a multiple of pixelsPerItem, so each geom item is always contiguous
      // in memory. (makes updating a lot easier. See __updateItemInstanceData below)
      // size = Math.nextPow2(size);

      if (size % pixelsPerItem != 0)
        size += pixelsPerItem - (size % pixelsPerItem)

      this.__width = size
      // if((this.__width % pixelsPerItem) != 0)
      //     this.__width -= (this.__width % pixelsPerItem);

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
      } else {
        this.__drawItemsTexture.resize(size, size)
      }

      this.__indexArray.forEach(index => {
        if (index != -1) this.__updateBillboard(index)
      })

      this.__updateRequested = false
    }

    if (this.__atlas.isLoaded()) {
      doIt()
    } else {
      this.__atlas.on('loaded', doIt)
    }
  }

  /**
   * The __updateBillboards method.
   * @param {number} index - The index value.
   * @private
   */
  __updateBillboard(index) {
    if (this.__drawCount == 0 || !this.__drawItemsTexture) {
      return
    }

    const billboardData = this.__billboards[index]
    if (!billboardData.billboard.getVisible()) return

    const gl = this.__gl

    const dataArray = new Float32Array(pixelsPerItem * 4)
    this.__populateBillboardDataArray(billboardData, 0, dataArray)

    gl.bindTexture(gl.TEXTURE_2D, this.__drawItemsTexture.glTex)
    const xoffset = (index * pixelsPerItem) % this.__width
    const yoffset = Math.floor((index * pixelsPerItem) / this.__width)

    const width = pixelsPerItem
    const height = 1
    // console.log("xoffset:" + xoffset + " yoffset:" + yoffset +" width:" + width + " dataArray:" + dataArray.length);
    // gl.texSubImage2D(gl.TEXTURE_2D, 0, xoffset, yoffset, width, height, gl.RGBA, gl.FLOAT, dataArray);

    const type = this.__drawItemsTexture.getType()
    const format = this.__drawItemsTexture.getFormat()

    if (type == 'FLOAT') {
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        xoffset,
        yoffset,
        width,
        height,
        gl[format],
        gl[type],
        dataArray
      )
    } else {
      const unit16s = Math.convertFloat32ArrayToUInt16Array(dataArray)
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        xoffset,
        yoffset,
        width,
        height,
        gl[format],
        gl[type],
        unit16s
      )
    }
  }

  /**
   * The sort method.
   * @param {any} cameraPos - The cameraPos value.
   */
  sort(cameraPos) {
    for (const billboardData of this.__billboards) {
      const { billboard } = billboardData
      if (billboard && billboard.getVisible()) {
        const xfo = billboard.getGlobalXfo()
        billboardData.dist = xfo.tr.distanceTo(cameraPos)
      }
    }
    this.__indexArray.sort((a, b) => {
      if (a == -1) return 1
      if (b == -1) return -1
      return this.__billboards[a].dist > this.__billboards[b].dist
        ? -1
        : this.__billboards[a].dist < this.__billboards[b].dist
        ? 1
        : 0
    })

    const gl = this.__gl
    if (gl.floatTexturesSupported && this.__instanceIdsBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, this.__indexArray, gl.STATIC_DRAW)
    }
  }

  /**
   * The sort method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    if (
      this.__drawCount == 0 ||
      !this.__atlas.isReady() ||
      this.__updateRequested
    ) {
      return
    }

    if (this.indexArrayUpdateNeeded) this.__updateIndexArray()

    const gl = this.__gl

    gl.disable(gl.CULL_FACE)
    gl.enable(gl.BLEND)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const cameraPos = renderstate.viewXfo.tr
    const dist = cameraPos.distanceTo(this.__prevSortCameraPos)
    // Avoid sorting if the camera did not move more than 3 meters.
    if (dist > this.__threshold) {
      this.sort(cameraPos)
      this.__prevSortCameraPos = cameraPos.clone()
      if (this.__drawCount > 1) {
        const v0 = this.__billboards[
          this.__indexArray[0]
        ].billboard.getGlobalXfo().tr
        const v1 = this.__billboards[
          this.__indexArray[1]
        ].billboard.getGlobalXfo().tr
        this.__threshold = v0.distanceTo(v1)
      } else {
        this.__threshold = 9999
      }
    }

    this.__glshader.bind(renderstate)
    this.__shaderBinding.bind(renderstate)

    const unifs = renderstate.unifs
    this.__atlas.bindToUniform(renderstate, unifs.atlasBillboards)

    const inVR = renderstate.vrPresenting == true
    gl.uniform1i(unifs.inVR.location, inVR)

    if (!gl.floatTexturesSupported || !gl.drawElementsInstanced) {
      const len = this.__indexArray.length
      for (let i = 0; i < len; i++) {
        // this.__drawItems[i].bind(renderstate);
        // this.__glgeom.draw();

        gl.uniformMatrix4fv(
          unifs.modelMatrix.location,
          false,
          this.__modelMatrixArray[i]
        )
        gl.uniform4fv(
          unifs.billboardData.location,
          this.__billboardDataArray[i]
        )
        gl.uniform4fv(unifs.tintColor.location, this.__tintColorArray[i])
        gl.uniform4fv(
          unifs.layoutData.location,
          this.__atlas.getLayoutData(this.__billboards[i].imageIndex)
        )

        renderstate.bindViewports(unifs, () => {
          gl.drawQuad()
        })
      }
    } else {
      this.__drawItemsTexture.bindToUniform(renderstate, unifs.instancesTexture)
      gl.uniform1i(unifs.instancesTextureSize.location, this.__width)

      {
        // The instance transform ids are bound as an instanced attribute.
        const location = renderstate.attrs.instanceIds.location
        gl.enableVertexAttribArray(location)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.__instanceIdsBuffer)
        gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 4, 0)
        gl.vertexAttribDivisor(location, 1) // This makes it instanced
      }

      renderstate.bindViewports(unifs, () => {
        gl.drawElementsInstanced(
          gl.TRIANGLES,
          6,
          gl.UNSIGNED_SHORT,
          0,
          this.__drawCount
        )
      })
    }

    gl.disable(gl.BLEND)
  }
}

GLRenderer.registerPass(GLBillboardsPass, PassType.TRANSPARENT)

export { GLBillboardsPass }
