import { GLTexture2D } from './GLTexture2D.js'
import { UnpackLDRAlphaImageShader } from './Shaders/UnpackLDRAlphaImageShader.js'
import { GLFbo } from './GLFbo.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL (low dynamic range) LDR alpha image.
 * @extends GLTexture2D
 * @private
 */
class GLLDRAlphaImage extends GLTexture2D {
  /**
   * Create a GL LDR alpha image.
   * @param {any} gl - The gl value.
   * @param {any} hdrImage - The hdrImage value.
   */
  constructor(gl, hdrImage) {
    super(gl)

    this.__hdrImage = hdrImage
    this.__hdrImage.on('updated', () => {
      this.__unpackLDRAlpha(this.__hdrImage.getParams())
    })
    if (this.__hdrImage.isLoaded()) {
      this.__unpackLDRAlpha(this.__hdrImage.getParams())
    } else {
      this.__hdrImage.on('loaded', () => {
        this.__unpackLDRAlpha(this.__hdrImage.getParams())
      })
    }
  }

  /**
   * The __unpackLDRAlpha method.
   * @param {any} hdrImageParams - The hdrImageParams param.
   * @private
   */
  __unpackLDRAlpha(hdrImageParams) {
    const gl = this.__gl

    const ldr = hdrImageParams.data.ldr
    const alpha = hdrImageParams.data.alpha

    if (!this.__fbo) {
      this.configure({
        format: 'RGBA',
        type: 'UNSIGNED_BYTE',
        width: ldr.width,
        height: ldr.height,
        filter: 'LINEAR',
        wrap: 'CLAMP_TO_EDGE',
      })
      this.__fbo = new GLFbo(gl, this)
      this.__fbo.setClearColor([0, 0, 0, 0])

      this.__srcLDRTex = new GLTexture2D(gl, {
        format: 'RGB',
        type: 'UNSIGNED_BYTE',
        width: ldr.width,
        height: ldr.height,
        filter: 'NEAREST',
        mipMapped: false,
        wrap: 'CLAMP_TO_EDGE',
        data: ldr,
      })
      this.__srcAlphaTex = new GLTexture2D(gl, {
        format: 'RGB',
        type: 'UNSIGNED_BYTE',
        width: ldr.width,
        height: ldr.height,
        filter: 'NEAREST',
        mipMapped: false,
        wrap: 'CLAMP_TO_EDGE',
        data: alpha,
      })
      this.__unpackLDRAlphaShader = new UnpackLDRAlphaImageShader(gl)
      const shaderComp = this.__unpackLDRAlphaShader.compileForTarget()
      this.__shaderBinding = generateShaderGeomBinding(gl, shaderComp.attrs, gl.__quadattrbuffers, gl.__quadIndexBuffer)
    } else {
      this.__srcLDRTex.bufferData(ldr)
      this.__srcAlphaTex.bufferData(alpha)
    }

    this.__fbo.bindAndClear()

    const renderstate = {}
    this.__unpackLDRAlphaShader.bind(renderstate, 'GLLDRAlphaImage')
    this.__shaderBinding.bind(renderstate)

    const unifs = renderstate.unifs
    this.__srcLDRTex.bind(renderstate, unifs.ldrSampler.location)
    this.__srcAlphaTex.bind(renderstate, unifs.alphaSampler.location)

    gl.drawQuad()

    // // Debug a block of pixels.
    // console.log(this.__hdrImage.getName());
    // gl.finish();
    // let numPixels = 4;
    // let pixels = new Float32Array(4 * numPixels);
    // gl.readPixels(ldr.width / 4, ldr.height/4, numPixels, 1, gl.RGBA, gl.FLOAT, pixels);
    // console.log(pixels);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.__fbo.unbind()

    if (!this.__hdrImage.isStream()) {
      this.__fbo.destroy()
      this.__srcLDRTex.destroy()
      this.__srcAlphaTex.destroy()
      this.__fbo = null
      this.__srcLDRTex = null
      this.__srcAlphaTex = null
    }

    this.emit('updated', {})
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
    if (this.__fbo) {
      this.__fbo.destroy()
      this.__srcLDRTex.destroy()
      this.__srcAlphaTex.destroy()
    }
    this.__unpackLDRAlphaShader.destroy()
    this.__shaderBinding.destroy()

    this.__hdrImage.loaded.disconnectScope(this)
    this.__hdrImage.updated.disconnectScope(this)
  }
}

export { GLLDRAlphaImage }
