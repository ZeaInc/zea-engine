import { SystemDesc } from '../BrowserDetection.js'
import '../Math/index'

/** This class abstracts the rendering of a collection of geometries to screen. */
class GLFbo {
  /**
   * Create a GLFbo.
   * @param {any} gl - The gl value.
   * @param {any} colorTexture - The colorTexture value.
   * @param {boolean} createDepthTexture - The createDepthTexture value.
   */
  constructor(gl, colorTexture, createDepthTexture = false) {
    if (
      SystemDesc.isIOSDevice &&
      (colorTexture.getType() == 'FLOAT' ||
        colorTexture.getType() == 'HALF_FLOAT')
    ) {
      // So iOS simply refuses to bind aything to a render target except a UNSIGNED_BYTE texture.
      // See the subtle error message here: "floating-point render targets not supported -- this is legal"
      // https://www.khronos.org/registry/webgl/conformance-suites/1.0.2/conformance/extensions/oes-texture-float.html
      console.error('IOS devices are unable to render to float textures.')
    }

    this.__gl = gl
    this.__colorTexture = colorTexture
    this.__createDepthTexture = createDepthTexture
    this.__clearColor = [0, 0, 0, 0]
    this.__depthTexture = undefined

    this.setup = this.setup.bind(this)
    this.resize = this.resize.bind(this)

    if (this.__colorTexture) this.__colorTexture.resized.connect(this.resize)

    this.setup()
  }

  /**
   * The setClearColor method.
   * @param {any} clearColor - The clearColor value.
   */
  setClearColor(clearColor) {
    this.__clearColor = clearColor
  }

  /**
   * The getWidth method.
   * @return {any} - The return value.
   */
  getWidth() {
    return this.__colorTexture.width
  }

  /**
   * The getHeight method.
   * @return {any} - The return value.
   */
  getHeight() {
    return this.__colorTexture.height
  }

  /**
   * The getSize method.
   * @return {any} - The return value.
   */
  getSize() {
    return [this.__colorTexture.width, this.__colorTexture.height]
  }

  /**
   * The getColorTexture method.
   * @return {any} - The return value.
   */
  getColorTexture() {
    return this.__colorTexture
  }

  /**
   * The getDepthTextureGL method.
   * @return {any} - The return value.
   */
  getDepthTextureGL() {
    return this.__depthTexture
  }

  /**
   * Getter for width.
   */
  get width() {
    return this.__colorTexture.width
  }

  /**
   * Getter for height.
   */
  get height() {
    return this.__colorTexture.height
  }

  /**
   * Getter for size.
   */
  get size() {
    return [this.__colorTexture.width, this.__colorTexture.height]
  }

  /**
   * Getter for colorTexture.
   */
  get colorTexture() {
    return this.__colorTexture
  }

  /**
   * The setColorTexture method.
   * @param {any} colorTexture - The colorTexture value.
   */
  setColorTexture(colorTexture) {
    this.__colorTexture = colorTexture
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.__colorTexture.glTex,
      0
    )
  }

  /**
   * Getter for depthTextureGL.
   */
  get depthTextureGL() {
    return this.__depthTexture
  }

  /**
   * The setup method.
   */
  setup() {
    const gl = this.__gl

    this.__fbo = gl.createFramebuffer()
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo)

    // TOSO: Migrate to using GLRenderTarget... This system is a mess.
    // if(gl.name == 'webgl2'){
    //     if (this.__colorTexture && this.__colorTexture.getType() == 'FLOAT' && this.__colorTexture.getFilter() == 'LINEAR') {
    //         if (!gl.__ext_float_linear)
    //             throw ("Unable to use filtering on floating point textures");
    //     }
    // }
    // else {
    //     if (this.__colorTexture.getType() == 'FLOAT') {
    //         if(gl.__ext_float){
    //             if (this.__colorTexture.getFilter() == 'LINEAR') {
    //                 if (!gl.__ext_float_linear)
    //                     throw ("Unable to use filtering on floating point textures");
    //             }
    //         }
    //         else if(gl.__ext_half_float){
    //             if (this.__colorTexture.getFilter() == 'LINEAR') {
    //                 if (!gl.__ext_texture_half_float_linear)
    //                     throw ("Unable to use filtering on half-floating point textures");
    //             }
    //         }
    //         else{
    //             throw("floating point textures unsupported.");
    //         }
    //     }
    // }

    if (this.__colorTexture) {
      if (gl.name == 'webgl2')
        gl.framebufferTexture2D(
          gl.DRAW_FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          this.__colorTexture.glTex,
          0
        )
      else
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          this.__colorTexture.glTex,
          0
        )
    }

    // Create the depth texture
    if (this.__createDepthTexture) {
      if (gl.name != 'webgl2' && !gl.__ext_WEBGL_depth_texture) {
        // Create the depth buffer
        const depthBuffer = gl.createRenderbuffer()
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          gl.DEPTH_COMPONENT16,
          this.width,
          this.height
        )
        gl.framebufferRenderbuffer(
          gl.FRAMEBUFFER,
          gl.DEPTH_ATTACHMENT,
          gl.RENDERBUFFER,
          depthBuffer
        )
      } else {
        gl.activeTexture(gl.TEXTURE0)
        this.__depthTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.__depthTexture)
        // TODO: Copy params from the color image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        if (gl.name == 'webgl2') {
          // the proper texture format combination can be found here
          // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
          // https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/fbo_rtt_depth_texture.html
          // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT24,
            this.width,
            this.height,
            0,
            gl.DEPTH_COMPONENT,
            gl.UNSIGNED_INT,
            null
          )
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.__depthTexture,
            0
          )
        } else {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT,
            this.width,
            this.height,
            0,
            gl.DEPTH_COMPONENT,
            gl.UNSIGNED_INT,
            null
          )
          gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.__depthTexture,
            0
          )
        }
      }
    }

    this.__checkFramebuffer()

    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  /**
   * Triggered Automatically when the texture resizes.
   * TODO: fbos should manage the textures assigned to them
   * E.g. resizing and preserving data.
   */
  resize() {
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo)

    // The color texture is destoryed and re-created when it is resized,
    // so we must re-bind it here.
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.__colorTexture.glTex,
      0
    )
    if (this.__depthTexture) {
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, this.__depthTexture)
      if (gl.name == 'webgl2') {
        // the proper texture format combination can be found here
        // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.DEPTH_COMPONENT24,
          this.width,
          this.height,
          0,
          gl.DEPTH_COMPONENT,
          gl.UNSIGNED_INT,
          null
        )
      } else
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.DEPTH_COMPONENT,
          this.width,
          this.height,
          0,
          gl.DEPTH_COMPONENT,
          gl.UNSIGNED_INT,
          null
        )
    }
    this.__checkFramebuffer()
  }

  /**
   * The __checkFramebuffer method.
   * @private
   */
  __checkFramebuffer() {
    const gl = this.__gl

    let check
    if (gl.name == 'webgl2')
      check = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER)
    else check = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    if (check !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindTexture(gl.TEXTURE_2D, null)
      if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
      else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      console.warn(
        'Error creating Fbo width:',
        this.width,
        ', height:',
        this.height,
        ' Texture Type:',
        this.__colorTexture.getType()
      )
      switch (check) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          throw new Error(
            'The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.'
          )
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          throw new Error('There is no attachment.')
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          throw new Error(
            'Height and width of the attachment are not the same.'
          )
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
   * The bindForWriting method.
   * @param {any} renderstate - The renderstate value.
   */
  bindForWriting(renderstate) {
    if (renderstate) {
      this.__prevBoundFbo = renderstate.boundRendertarget
      renderstate.boundRendertarget = this.__fbo
    }
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo)
    gl.viewport(0, 0, this.width, this.height) // Match the viewport to the texture size
  }

  /**
   * The unbindForWriting method.
   * @param {any} renderstate - The renderstate value.
   */
  unbindForWriting(renderstate) {
    if (renderstate) renderstate.boundRendertarget = this.__prevBoundFbo
    const gl = this.__gl
    if (gl.name == 'webgl2')
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__prevBoundFbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__prevBoundFbo)
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   */
  bind(renderstate) {
    this.bindForWriting(renderstate)
  }

  /**
   * The unbind method.
   * @param {any} renderstate - The renderstate value.
   */
  unbind(renderstate) {
    this.unbindForWriting(renderstate)
  }

  /**
   * The bindForReading method.
   * @param {any} renderstate - The renderstate value.
   */
  bindForReading() {
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.__fbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo)
  }

  /**
   * The unbindForReading method.
   * @param {any} renderstate - The renderstate value.
   */
  unbindForReading() {
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  /**
   * The clear method.
   */
  clear() {
    const gl = this.__gl
    gl.colorMask(true, true, true, true) // Don't write to the color channels at all
    gl.clearColor(...this.__clearColor)
    if (this.__createDepthTexture) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    } else {
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
  }

  /**
   * The bindAndClear method.
   * @param {any} renderstate - The renderstate value.
   */
  bindAndClear(renderstate) {
    this.bind(renderstate)
    this.clear(renderstate)
  }

  /**
   * The unbind method.
   */
  unbind() {
    const gl = this.__gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    const gl = this.__gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.deleteFramebuffer(this.__fbo)
    this.__fbo = null
    this.__colorTexture.resized.disconnect(this.resize)
  }
}

export { GLFbo }
