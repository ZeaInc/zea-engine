import { GLGeom } from './GLGeom.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing GL points.
 * @extends GLGeom
 * @private
 */
class GLPoints extends GLGeom {
  __numVertices: any;
  __vboState: any;
  /**
   * Create a GL point.
   * @param {any} gl - The gl value.
   * @param {any} points - The points value.
   */
  constructor(gl: any, points: any) {
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

    this.__numVertices = geomBuffers.numVertices
    this.__vboState = 2
  }

  /**
   * The updateBuffers method.
   * @param {any} opts - The opts value.
   */
  updateBuffers(opts: any) {
    const gl = this.__gl
    const geomBuffers = this.__geom.genBuffers()

    // Update the vertex attribute buffers
    const numVertsChanged = geomBuffers.numVertices != this.__numVertices
    for (const attrName in geomBuffers.attrBuffers) {
      const attrData = geomBuffers.attrBuffers[attrName]
      const glattr = this.__glattrbuffers[attrName]
      if (numVertsChanged) {
        gl.deleteBuffer(glattr.buffer)
        glattr.buffer = gl.createBuffer()
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, glattr.buffer)
      gl.bufferData(gl.ARRAY_BUFFER, attrData.values, gl.STATIC_DRAW)
    }

    // Cache the size so we know later if it changed (see below)
    this.__numVertices = geomBuffers.numVertices
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bind(renderstate: any) {
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
  // @ts-expect-error ts-migrate(2416) FIXME: Property 'draw' in type 'GLPoints' is not assignab... Remove this comment to see the full error message
  draw(renderstate: any) {
    const gl = this.__gl
    if (renderstate.unifs.PointSize) {
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, this.__numVertices)
    } else {
      gl.drawArrays(gl.POINTS, 0, this.__numVertices)
    }
  }

  /**
   * The drawInstanced method.
   * @param {any} instanceCount - The instanceCount value.
   */
  drawInstanced(instanceCount: any) {
    this.__gl.drawArraysInstanced(this.__gl.POINTS, 0, this.__numVertices, instanceCount)
  }
}
export { GLPoints }
// GLPoints;
