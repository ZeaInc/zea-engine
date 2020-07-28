import { GLGeom } from './GLGeom.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing GL points.
 * @extends GLGeom
 * @private
 */
class GLPoints extends GLGeom {
  /**
   * Create a GL point.
   * @param {any} gl - The gl value.
   * @param {any} points - The points value.
   */
  constructor(gl, points) {
    super(gl, points)
    this.genBuffers()
  }

  /**
   * The genBuffers method.
   */
  genBuffers() {
    super.genBuffers()

    const gl = this.__gl

    const geomBuffers = this.__geom.genBuffers()

    for (const attrName in geomBuffers.attrBuffers) {
      const attrData = geomBuffers.attrBuffers[attrName]

      const attrBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW)

      this.__glattrbuffers[attrName] = {
        buffer: attrBuffer,
        dataType: attrData.dataType,
        normalized: attrData.normalized,
      }
    }

    this.__numVerts = geomBuffers.numVertices
    this.__vboState = 2
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate) {
    if (renderstate.unifs.PointSize) {
      const gl = this.__gl
      let shaderBinding = this.__shaderBindings[renderstate.shaderkey]
      if (!shaderBinding) {
        if (!gl.__quadVertexIdsBuffer) gl.setupInstancedQuad()

        // Merge the points attrs with the quad attrs.
        const attrbuffers = Object.assign(this.__glattrbuffers, gl.__quadattrbuffers)

        shaderBinding = generateShaderGeomBinding(gl, renderstate.attrs, attrbuffers, gl.__quadIndexBuffer)
        this.__shaderBindings[renderstate.shaderkey] = shaderBinding
      }
      shaderBinding.bind(renderstate)
      return true
    } else {
      return super.bind(renderstate)
    }
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    const gl = this.__gl
    if (renderstate.unifs.PointSize) {
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, this.__numVerts)
    } else {
      gl.drawArrays(gl.POINTS, 0, this.__numVerts)
    }
  }

  /**
   * The drawInstanced method.
   * @param {any} instanceCount - The instanceCount value.
   */
  drawInstanced(instanceCount) {
    this.__gl.drawArraysInstanced(this.__gl.POINTS, 0, this.__numVerts, instanceCount)
  }
}
export { GLPoints }
// GLPoints;
