import { PassType } from './GLPass.js'
import { GLOpaqueGeomsPass } from './GLOpaqueGeomsPass.js'
import { GLRenderer } from '../GLRenderer.js'
import { GLTexture2D } from '../GLTexture2D.js'
import { Lines, LinesProxy, Points, PointsProxy } from '../../SceneTree/index'
import { FattenLinesShader } from '../Shaders/FattenLinesShader.js'
import { Plane } from '../../SceneTree/index'
import { GLMesh } from '../Drawing/GLMesh.js'

/** Class representing a GL opaque geoms pass.
 * @extends GLOpaqueGeomsPass
 * @private
 */
class GLLinesPass extends GLOpaqueGeomsPass {
  /**
   * Create a GL opaque geoms pass.
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
   * The filterGeomItem method.
   * @param {GeomItem} geomItem - The geomItem value.
   * @return {boolean} - The return value.
   */
  filterGeomItem(geomItem) {
    const geom = geomItem.getParameter('Geometry').getValue()
    if (geom instanceof Lines || geom instanceof LinesProxy || geom instanceof Points || geom instanceof PointsProxy) {
      return true
    }
  }

  /**
   * The __checkFramebuffer method.
   * @private
   */
  __checkFramebuffer(renderstate) {
    const gl = this.__gl

    let check
    if (gl.name == 'webgl2') check = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER)
    else check = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (check !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindTexture(gl.TEXTURE_2D, null)
      if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
      else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      console.warn('Error creating Fbo width:', renderstate.width, ', height:', renderstate.height)
      switch (check) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          throw new Error(
            'The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.'
          )
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          throw new Error('There is no attachment.')
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          throw new Error('Height and width of the attachment are not the same.')
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          throw new Error(
            'The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.'
          )
        case 36061: // gl.GL_FRAMEBUFFER_UNSUPPORTED:
          throw new Error('The framebuffer is unsupported')
        default:
          throw new Error('Incomplete Frambuffer')
      }
    }
  }

  /**
   * The draw method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  draw(renderstate) {
    const gl = this.__gl

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.depthMask(true)

    this.__traverseTreeAndDraw(renderstate)

    gl.disable(gl.BLEND)
  }
  /**
   * The drawGeomData method.
   * @param {object} renderstate - The object tracking the current state of the renderer
   */
  drawGeomData(renderstate) {
    const gl = this.__gl
    //  Note: lines in VR are not fattened...
    if (renderstate.geomDataFbo) {
      if (!this.linesGeomDataBuffer) {
        this.linesGeomDataBuffer = new GLTexture2D(gl, {
          type: 'FLOAT',
          format: 'RGBA',
          filter: 'NEAREST',
          width: 1,
          height: 2,
        })
        this.fattenLinesShader = new FattenLinesShader(gl)
        this.quad = new GLMesh(gl, new Plane(1, 1))
      }

      const geomDataFbo = renderstate.geomDataFbo
      const width = geomDataFbo.width
      const height = geomDataFbo.height

      if (this.linesGeomDataBuffer.width != width || this.linesGeomDataBuffer.height != height) {
        if (this.fbo) {
          gl.deleteFramebuffer(this.fbo)
          this.fbo = null
        }

        this.linesGeomDataBuffer.resize(width, height)

        this.fbo = gl.createFramebuffer()

        const colorTex = this.linesGeomDataBuffer.glTex
        const depthBuffer = geomDataFbo.__depthTexture // Share the existing depth buffer.
        if (gl.name == 'webgl2') {
          gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fbo)
          gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0)
          gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthBuffer, 0)
        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0)
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthBuffer, 0)
        }
        this.__checkFramebuffer(renderstate)
      } else {
        if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fbo)
        else gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
      }

      gl.colorMask(true, true, true, true)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    super.drawGeomData(renderstate)

    if (renderstate.geomDataFbo) {
      renderstate.geomDataFbo.bindForWriting(renderstate)

      this.fattenLinesShader.bind(renderstate)

      const { colorTexture, screenSize } = renderstate.unifs
      this.linesGeomDataBuffer.bindToUniform(renderstate, colorTexture)

      const geomDataFbo = renderstate.geomDataFbo
      gl.uniform2f(screenSize.location, geomDataFbo.width, geomDataFbo.height)

      this.quad.bindAndDraw(renderstate)
    }
  }
}

GLRenderer.registerPass(GLLinesPass, PassType.OPAQUE)

export { GLLinesPass }
