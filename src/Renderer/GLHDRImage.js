import { GLTexture2D } from './GLTexture2D.js'
import { UnpackHDRShader } from './Shaders/UnpackHDRShader.js'
import { GLFbo } from './GLFbo.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL high dynamic range (HDR) image.
 * @extends GLTexture2D
 * @private
 */
class GLHDRImage extends GLTexture2D {
  /**
   * Create a GL HDR image.
   * @param {any} gl - The gl value.
   * @param {any} hdrImage - The HDR image.
   */
  constructor(gl, hdrImage) {
    super(gl)

    this.__hdrImage = hdrImage
    this.__hdrImage.setMetadata('gltexture', this)
    const loadImage = () => {
      this.__unpackHDRImage(this.__hdrImage.getParams())
    }
    this.__hdrImage.on('updated', loadImage)
    if (this.__hdrImage.isLoaded()) {
      loadImage()
    } else {
      this.__hdrImage.on('loaded', loadImage)
    }
  }

  /**
   * The __unpackHDRImage method.
   * @param {any} hdrImageParams - The HDR image parameters.
   * @private
   */
  __unpackHDRImage(hdrImageParams) {
    const gl = this.__gl

    const ldr = hdrImageParams.data.ldr
    const cdm = hdrImageParams.data.cdm

    if (!this.__fbo) {
      // Note: iOS devices create FLOAT Fbox.
      // If we want better quality, we could unpack the texture in JavaScript.
      this.configure({
        format: 'RGBA',
        type: 'FLOAT',
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
      this.__srcCDMTex = new GLTexture2D(gl, {
        format: gl.name == 'webgl2' ? 'RED' : 'ALPHA',
        type: 'UNSIGNED_BYTE',
        width: ldr.width /* 8*/,
        height: ldr.height /* 8*/,
        filter: 'NEAREST',
        mipMapped: false,
        wrap: 'CLAMP_TO_EDGE',
        data: cdm,
      })

      this.__unpackHDRShader = new UnpackHDRShader(gl)
      const shaderComp = this.__unpackHDRShader.compileForTarget('GLHDRImage')
      this.__shaderBinding = generateShaderGeomBinding(
        gl,
        shaderComp.attrs,
        gl.__quadattrbuffers,
        gl.__quadIndexBuffer
      )
    } else {
      this.__srcLDRTex.bufferData(ldr)
      this.__srcCDMTex.bufferData(cdm)
    }

    this.__fbo.bindAndClear()

    const renderstate = {}
    this.__unpackHDRShader.bind(renderstate, 'GLHDRImage')
    this.__shaderBinding.bind(renderstate)

    const unifs = renderstate.unifs
    this.__srcLDRTex.bindToUniform(renderstate, unifs.ldrSampler)
    this.__srcCDMTex.bindToUniform(renderstate, unifs.cdmSampler)

    gl.uniform1f(unifs.exposure.location, 1)
    gl.uniform4fv(unifs.tint.location, this.__hdrImage.getHDRTint().asArray())
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

    // if (!this.__hdrImage.isStream()) {
    //     this.__fbo.destroy();
    //     this.__srcLDRTex.destroy();
    //     this.__srcCDMTex.destroy();
    //     this.__fbo = null;
    //     this.__srcLDRTex = null;
    //     this.__srcCDMTex = null;
    // }

    this.emit('updated', {})
  }

  /**
   * The bindToUniform method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} unif - The unif value.
   * @param {any} bindings - The bindings value.
   * @return {any} - The return value.
   */
  bindToUniform(renderstate, unif, bindings) {
    return super.bindToUniform(renderstate, unif, bindings)
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
      this.__srcCDMTex.destroy()
    }
    if (this.__unpackHDRShader) this.__unpackHDRShader.destroy()
    if (this.__shaderBinding) this.__shaderBinding.destroy()

    this.__hdrImage.loaded.disconnectScope(this)
    this.__hdrImage.updated.disconnectScope(this)
  }
}

export { GLHDRImage }
