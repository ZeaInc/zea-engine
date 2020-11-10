import { Vec2, Vec3 } from '../Math/index.js'
import { GLGeom } from './GLGeom.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'
import { GLTexture2D } from './GLTexture2D.js'

/** Class representing GL lines.
 * @extends GLGeom
 * @private
 */
class GLLines extends GLGeom {
  /**
   * Create a GL line.
   * @param {any} gl - The gl value.
   * @param {any} lines - The geom value.
   */
  constructor(gl, lines) {
    super(gl, lines)

    this.__numSegIndices = 0
    this.__numVertices = 0
    this.__buffersNeedUpload = true
  }

  /**
   * The genBuffers method.
   * @param {any} opts - The opts value.
   */
  genBuffers(opts) {
    this.genBufferOpts = opts
    this.__buffersNeedUpload = true
  }

  /**
   * The updateBuffers method.
   * @param {any} opts - The opts value.
   */
  updateBuffers(opts) {
    this.genBufferOpts = opts
    this.__buffersNeedUpload = true
  }

  /**
   * The clearBuffers method.
   */
  clearBuffers() {
    const gl = this.__gl
    gl.deleteBuffer(this.__indexBuffer)
    this.__indexBuffer = null

    if (this.fatBuffers && this.fatBuffers.positionsTexture) {
      if (this.fatBuffers.positionsTexture) {
        this.fatBuffers.positionsTexture.destroy()
        this.fatBuffers.positionsTexture = null
      }
      if (this.fatBuffers.glattrbuffers.segmentIndices.buffer) {
        gl.deleteBuffer(this.fatBuffers.glattrbuffers.segmentIndices.buffer)
        this.fatBuffers.glattrbuffers.segmentIndices = null
      }
    }

    super.clearBuffers()
  }

  /**
   * The genBuffers method.
   *
   * @param {*} fatLines
   * @memberof GLLines
   */
  genBuffersLazy(fatLines) {
    const gl = this.__gl
    const geomBuffers = this.__geom.genBuffers()
    const indices = geomBuffers.indices
    const numVertsChanged = geomBuffers.numVertices != this.__numVertices

    if (fatLines) {
      if (!gl.__quadVertexIdsBuffer) {
        gl.setupInstancedQuad()
      }
      if (!this.fatBuffers) {
        this.fatBuffers = { glattrbuffers: {} }
        this.fatBuffers.glattrbuffers.vertexIDs = gl.__quadattrbuffers.vertexIDs
      }

      this.fatBuffers.drawCount = indices.length / 2

      const vertexAttributes = this.__geom.getVertexAttributes()
      const positions = vertexAttributes.positions
      const lineThicknessAttr = vertexAttributes.lineThickness

      const stride = 4 // The number of floats per draw item.
      const dataArray = new Float32Array(positions.length * stride)
      for (let i = 0; i < positions.length; i++) {
        const pos = Vec3.createFromBuffer(dataArray.buffer, i * stride * 4)
        pos.setFromOther(positions.getValueRef(i))

        // The thickness of the line.
        if (lineThicknessAttr) dataArray[i * 4 + 3] = lineThicknessAttr.getFloat32Value(i)
        else dataArray[i * 4 + 3] = 1.0
      }
      if (numVertsChanged && this.fatBuffers.positionsTexture) {
        this.fatBuffers.positionsTexture.destroy()
        this.fatBuffers.positionsTexture = null
      }
      if (!this.fatBuffers.positionsTexture) {
        this.fatBuffers.positionsTexture = new GLTexture2D(gl, {
          format: 'RGBA',
          type: 'FLOAT',
          width: positions.length,
          /* each pixel has 4 floats*/
          height: 1,
          filter: 'NEAREST',
          wrap: 'CLAMP_TO_EDGE',
          data: dataArray,
          mipMapped: false,
        })
      } else {
        this.fatBuffers.positionsTexture.bufferData(dataArray, positions.length, 1)
      }

      const makeIndices = () => {
        const indexArray = new Float32Array(indices.length)
        for (let i = 0; i < indices.length; i++) {
          let seqentialIndex
          if (i % 2 == 0) {
            seqentialIndex = i > 0 ? indices[i] == indices[i - 1] : indices[i] == indices[indices.length - 1]
          } else {
            seqentialIndex = i < indices.length - 1 ? indices[i] == indices[i + 1] : indices[i] == indices[0]
          }
          // encode the flag into the indices values.
          // this flag is decoded in GLSL.
          indexArray[i] = (seqentialIndex ? 1 : 0) + indices[i] * 2
        }
        return indexArray
      }

      if (!this.fatBuffers.glattrbuffers.segmentIndices) {
        const indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, makeIndices(), gl.STATIC_DRAW)

        this.fatBuffers.glattrbuffers.segmentIndices = {
          buffer: indexBuffer,
          dimension: 2,
          dataType: Vec2,
        }
      } else {
        if (!this.genBufferOpts || (this.genBufferOpts && this.genBufferOpts.topologyChanged)) {
          gl.bindBuffer(gl.ARRAY_BUFFER, this.fatBuffers.glattrbuffers.segmentIndices.buffer)
          gl.bufferData(gl.ARRAY_BUFFER, makeIndices(), gl.STATIC_DRAW)
        }
      }
      this.__numSegIndices = indices.length
    } else {
      if (!this.__indexBuffer) {
        this.__indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
      } else {
        // Note: the topology can change without the number of vertices changing
        // and vice versa.
        if (!this.genBufferOpts || (this.genBufferOpts && this.genBufferOpts.topologyChanged)) {
          if (this.__numSegIndices != indices.length) {
            gl.deleteBuffer(this.__indexBuffer)
            this.__indexBuffer = gl.createBuffer()
          }
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.__indexBuffer)
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
          this.__numSegIndices = indices.length
        }
      }

      // eslint-disable-next-line guard-for-in
      for (const attrName in geomBuffers.attrBuffers) {
        const attrData = geomBuffers.attrBuffers[attrName]
        if (!this.__glattrbuffers[attrName]) {
          const attrBuffer = gl.createBuffer()
          gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer)
          gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW)

          this.__glattrbuffers[attrName] = {
            buffer: attrBuffer,
            dataType: attrData.dataType,
            normalized: attrData.normalized,
          }
        } else {
          const glattr = this.__glattrbuffers[attrName]
          if (numVertsChanged) {
            gl.deleteBuffer(glattr.buffer)
            glattr.buffer = gl.createBuffer()
          }
          gl.bindBuffer(gl.ARRAY_BUFFER, glattr.buffer)
          gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW)
        }
      }

      // Cache the size so we know later if it changed
      this.__numSegIndices = indices.length
      this.__numVertices = geomBuffers.numVertices
    }

    if (indices instanceof Uint8Array) this.__indexDataType = this.__gl.UNSIGNED_BYTE
    if (indices instanceof Uint16Array) this.__indexDataType = this.__gl.UNSIGNED_SHORT
    if (indices instanceof Uint32Array) this.__indexDataType = this.__gl.UNSIGNED_INT

    this.__buffersNeedUpload = false
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    const gl = this.__gl
    const unifs = renderstate.unifs
    if (unifs.LineThickness && gl.floatTexturesSupported) {
      if (this.__buffersNeedUpload) this.genBuffersLazy(true)
      // TODO: Provide a geomdata shader for thick lines.

      let shaderBinding = this.__shaderBindings[renderstate.shaderkey]
      if (!shaderBinding) {
        shaderBinding = generateShaderGeomBinding(
          gl,
          renderstate.attrs,
          this.fatBuffers.glattrbuffers,
          gl.__quadIndexBuffer
        )
        this.__shaderBindings[renderstate.shaderkey] = shaderBinding
      }
      shaderBinding.bind(renderstate)

      const usePositionsTexture = true
      if (usePositionsTexture) {
        if (unifs.positionsTexture) {
          this.fatBuffers.positionsTexture.bindToUniform(renderstate, unifs.positionsTexture)
          gl.uniform1i(unifs.positionsTextureSize.location, this.fatBuffers.positionsTexture.width)
        }
      }

      // gl.uniform1f(
      //   unifs.LineThickness.location,
      //   (this.__geom.lineThickness ? this.__geom.lineThickness : 1.0) * renderstate.viewScale
      // )
      return true
    } else {
      if (this.__buffersNeedUpload) this.genBuffersLazy(false)
      return super.bind(renderstate)
    }
  }

  // ////////////////////////////////
  // Drawing Lines Points.

  /**
   * The drawPoints method.
   */
  drawPoints() {
    this.__gl.drawArrays(this.__gl.POINTS, 0, this.__geom.numVertices())
  }

  // ////////////////////////////////
  // Regular Drawing.

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    const gl = this.__gl
    if (renderstate.unifs.LineThickness && gl.floatTexturesSupported) {
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, this.fatBuffers.drawCount)

      // Note: We don't have a solution for drawing fat lines to the geom data buffer.
    } else {
      gl.drawElements(this.__gl.LINES, this.__numSegIndices, this.__indexDataType, 0)
    }
  }

  /**
   * The drawInstanced method.
   * @param {any} instanceCount - The instanceCount value.
   */
  drawInstanced(instanceCount) {
    this.__gl.drawElementsInstanced(this.__gl.LINES, this.__numSegIndices, this.__indexDataType, 0, instanceCount)
  }
}

export { GLLines }
