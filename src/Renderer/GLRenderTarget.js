import { Color } from '../Math/Color.js'
import { EventEmitter } from '../Utilities/index'
import { processTextureParams } from './processTextureParams.js'

/** Class representing a GL render target. */
class GLRenderTarget extends EventEmitter {
  /**
   * Create a GL render target.
   * @param {any} gl - The gl value.
   * @param {any} params - The params value.
   */
  constructor(gl, params) {
    super()
    this.__gl = gl
    this.textureTargets = []
    this.depthTexture = null

    if (params) {
      this.configure(params)
    }
  }

  /**
   * The configure method.
   * @param {any} params - The params param.
   */
  configure(params) {
    const gl = this.__gl

    const p = processTextureParams(gl, params)

    this.textureTargets.forEach((colorTexture) => {
      gl.deleteTexture(colorTexture)
    })
    this.textureTargets = []
    if (this.depthTexture) {
      gl.deleteTexture(this.depthTexture)
      this.depthTexture = null
    }
    if (this.frameBuffer) {
      gl.deleteFramebuffer(this.frameBuffer)
    }

    this.type = p.type
    this.format = p.format
    this.internalFormat = p.internalFormat
    this.filter = p.filter
    this.wrap = p.wrap
    this.flipY = p.flipY
    this.width = p.width
    this.height = p.height
    this.clearColor = new Color(0, 0, 0, 0)
    this.colorMask = [true, true, true, true]

    this.textureType = 1 // Default 2d 8 bit texture image texture.
    this.textureDesc = [this.width, this.height, 0, 0]

    // -- Initialize texture targets
    const numColorChannels =
      params.numColorChannels != undefined ? params.numColorChannels : p.format != undefined ? 1 : 0
    for (let i = 0; i < numColorChannels; i++) {
      gl.activeTexture(gl.TEXTURE0 + 1)
      const colorTexture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, colorTexture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, p.wrapS)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, p.wrapT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, p.minFilter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, p.magFilter)
      gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, p.width, p.height, 0, this.format, this.type, null)
      this.textureTargets.push(colorTexture)
    }

    if (p.depthFormat) {
      if (gl.name == 'webgl' && !gl.__ext_WEBGL_depth_texture)
        throw new Error('Depth textures not support on this device')
      // -- Initialize depth texture
      gl.activeTexture(gl.TEXTURE0)
      this.depthTexture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, p.wrapS)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, p.wrapT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, p.minFilter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, p.magFilter)

      // the proper texture format combination can be found here
      // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
      gl.texImage2D(gl.TEXTURE_2D, 0, p.depthInternalFormat, p.width, p.height, 0, p.depthFormat, p.depthType, null)
    }

    // -- Initialize frame buffer
    this.frameBuffer = gl.createFramebuffer()
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.frameBuffer)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)

    if (this.textureTargets.length > 0) {
      if (this.textureTargets.length > 1) {
        if (gl.name == 'webgl' && !gl.drawBuffers) {
          gl.__ext_draw_buffers = gl.getExtension('WEBGL_draw_buffers')
          gl.drawBuffers = gl.__ext_draw_buffers.drawBuffersWEBGL.bind(gl.__ext_draw_buffers)
          for (let i = 1; i < 14; i++) {
            gl['COLOR_ATTACHMENT' + i] = gl.__ext_draw_buffers['COLOR_ATTACHMENT' + i + '_WEBGL']
          }
          gl.MAX_COLOR_ATTACHMENTS = gl.__ext_draw_buffers.MAX_COLOR_ATTACHMENTS_WEBGL
          gl.MAX_DRAW_BUFFERS = gl.__ext_draw_buffers.MAX_DRAW_BUFFERS_WEBGL
        }
      }

      const bufferIds = []
      for (let i = 0; i < this.textureTargets.length; i++) {
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, this.textureTargets[i], 0)
        bufferIds.push(gl.COLOR_ATTACHMENT0 + i)
      }
      if (this.textureTargets.length > 1) {
        gl.drawBuffers(bufferIds)
      }
    }

    if (this.depthTexture) {
      gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0)
    }

    const status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER)
    if (status != gl.FRAMEBUFFER_COMPLETE) {
      switch (status) {
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
      return
    }
    this.unbind()
  }

  /**
   * The bindForWriting method.
   * @param {any} renderstate - The renderstate value.
   * @param {boolean} clear - The clear value.
   */
  bindForWriting(renderstate, clear = false) {
    if (renderstate) {
      this.__prevBoundFbo = renderstate.boundRendertarget
      renderstate.boundRendertarget = this.frameBuffer
    }
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.frameBuffer)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
    gl.viewport(0, 0, this.width, this.height) // Match the viewport to the texture size
    if (clear) this.clear()
  }

  /**
   * The unbindForWriting method.
   * @param {any} renderstate - The renderstate value.
   */
  unbindForWriting(renderstate) {
    if (renderstate) renderstate.boundRendertarget = this.__prevBoundFbo
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__prevBoundFbo)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.__prevBoundFbo)
  }

  /**
   * The clear method.
   * @param {boolean} clearDepth - The clearDepth value.
   */
  clear(clearDepth = true) {
    const gl = this.__gl
    gl.colorMask(...this.colorMask)
    gl.clearColor(...this.clearColor.asArray())
    let flags = 0
    if (this.textureTargets.length > 0) flags |= gl.COLOR_BUFFER_BIT
    if (this.depthTexture) flags |= gl.DEPTH_BUFFER_BIT
    gl.clear(flags)
  }

  /**
   * The bindForReading method.
   */
  bindForReading() {
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.frameBuffer)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
  }

  /**
   * The unbindForReading method.
   */
  unbindForReading() {
    const gl = this.__gl
    if (gl.name == 'webgl2') gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
    else gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  /**
   * The bindColorTexture method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} unif - The unif value.
   * @param {number} channelId - The channelId value.
   * @return {boolean} - The return value.
   */
  bindColorTexture(renderstate, unif, channelId = 0) {
    const gl = this.__gl
    const unit = renderstate.boundTextures++
    gl.uniform1i(unif.location, unit)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, this.textureTargets[channelId])
    return true
  }

  /**
   * The bindDepthTexture method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} unif - The unif value.
   * @return {boolean} - The return value.
   */
  bindDepthTexture(renderstate, unif) {
    const gl = this.__gl
    const unit = renderstate.boundTextures++
    gl.uniform1i(unif.location, unit)
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
    return true
  }

  /**
   * The unbind method.
   */
  unbind() {
    const gl = this.__gl
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
  }

  /**
   * The resize method.
   * @param {any} width - The width value.
   * @param {any} height - The height value.
   * @param {boolean} preserveData - The preserveData value.
   */
  resize(width, height, preserveData = false) {
    /*
    const gl = this.__gl;
    const sizeChanged = this.width != width || this.height != height;
    if (sizeChanged) {
      const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
      if (width < 0 || width > maxSize || height < 0 || height > maxSize) {
          throw new Error("gl-texture2d: Invalid texture size. width:" + width + " height:" + height + " maxSize:" + maxSize);
      }
      const gltex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, gltex);
      gl.texImage2D(gl.TEXTURE_2D, 0, this.__internalFormat, width, height, 0, this.__channels, this.__format, null);

      if (preserveData) {
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.__gltex, 0);

        gl.bindTexture(gl.TEXTURE_2D, gltex); // Do we need this line?
        gl.copyTexImage2D(gl.TEXTURE_2D, 0, this.__internalFormat, 0, 0, this.width, this.height, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.deleteFramebuffer(fbo)
      }

      this.width = width;
      this.height = height;

      this.__gl.deleteTexture(this.__gltex);
      this.__gltex = gltex;
      this.__updateGLTexParams();
      if (emit) {
        this.emit('resized' { width, height });
      }
    }

    if (gl.name == 'webgl2')
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.frameBuffer);
    else
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    // The color texture is destoryed and re-created when it is resized,
    // so we must re-bind it here..
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.__colorTexture.glTex, 0);
    if (this.depthChannel) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.__depthTexture);
      if (gl.name == 'webgl2'){
        // the proper texture format combination can be found here
        // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
      }
      else
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    }
    this.__checkFramebuffer();
    //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    */
  }

  /**
   * The bindToUniform method.
   * @param {any} renderstate - The renderstate param.
   * @param {any} unif - The unif param.
   * @param {any} bindings - The bindings param.
   * @return {any} - The return value.
   */
  bindToUniform(renderstate, unif, bindings) {
    // if (!this.__loaded) {
    //   return false
    // }
    // if (!this.__gltex) {
    //   throw new Error('Unable to bind non-initialized or deleted texture.')
    // }

    const unit = renderstate.boundTextures++
    const texId = this.__gl.TEXTURE0 + unit
    const gl = this.__gl
    gl.activeTexture(texId)
    gl.bindTexture(gl.TEXTURE_2D, this.textureTargets[0])
    gl.uniform1i(unif.location, unit)

    if (bindings) {
      if (bindings.textureTypeUnif) {
        gl.uniform1i(bindings.textureTypeUnif.location, this.textureType)
      }

      if (bindings.textureDescUnif) {
        this.__gl.uniform4fv(bindings.textureDescUnif.location, this.textureDesc)
      }
    }

    return true
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    const gl = this.__gl
    this.textureTargets.forEach((colorTexture) => {
      gl.deleteTexture(colorTexture)
    })
    this.textureTargets = []
    if (this.depthTexture) {
      gl.deleteTexture(this.depthTexture)
      this.depthTexture = null
    }
    if (this.frameBuffer) {
      gl.deleteFramebuffer(this.frameBuffer)
    }
  }
}
export { GLRenderTarget }
