const processTextureParams = function (gl, params) {
  if (!params.width || !params.height) {
    if (!params.width) throw new Error(`Invalid texture params. 'width' not provided`)
    if (!params.height) throw new Error(`Invalid texture params. 'height' not provided`)
  }

  const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
  if (params.width <= 0 || params.width > maxSize || params.height <= 0 || params.height > maxSize) {
    throw new Error(
      'GLTextureParams: Invalid texture size. width:' +
        params.width +
        ' height:' +
        params.height +
        ' maxSize:' +
        maxSize
    )
  }

  const result = {
    width: params.width,
    height: params.height,
  }
  const getGLConst = (nameOrValue) => {
    return isNaN(nameOrValue) ? gl[nameOrValue] : nameOrValue
  }
  const processParam = (name, defaultValue) => {
    if (name in params) result[name] = getGLConst(params[name])
    else if (defaultValue) result[name] = getGLConst(defaultValue)
  }
  processParam('format')
  processParam('internalFormat', result.format)
  processParam('type', gl.UNSIGNED_BYTE)
  processParam('minFilter', params.filter ? params.filter : gl.LINEAR)
  processParam('magFilter', params.filter ? params.filter : gl.LINEAR)
  processParam('wrapS', params.wrap ? params.wrap : gl.CLAMP_TO_EDGE)
  processParam('wrapT', params.wrap ? params.wrap : gl.CLAMP_TO_EDGE)
  processParam('flipY', false)
  processParam('mipMapped', false)

  processParam('depthInternalFormat')
  processParam('depthFormat')
  processParam('depthType')

  // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
  if (result.type == gl.FLOAT) {
    if (gl.name == 'webgl2') {
      if (result.filter == gl.LINEAR && !gl.__ext_float_linear) {
        console.warn('Floating point texture filtering not supported on result device')
        result.filter = gl.NEAREST
      }
    } else {
      if (gl.__ext_float) {
        if (result.filter == gl.LINEAR && !gl.__ext_float_linear) {
          console.warn('Floating point texture filtering not supported on result device')
          result.filter = gl.NEAREST
        }
      } else {
        if (gl.__ext_half_float) {
          result.type = gl.HALF_FLOAT
          if (result.filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
            console.warn('Half Float texture filtering not supported on result device')
            result.filter = gl.NEAREST
          }
        } else {
          throw new Error('OES_texture_half_float is not available')
        }
      }
    }
  } else if (result.type == gl.HALF_FLOAT) {
    if (gl.name == 'webgl2') {
      // Half load linear filtering appears to be supported even without the extension.
      // if (result.filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
      //     console.warn('Floating point texture filtering not supported on result device');
      //     result.filter = 'NEAREST';
      // }
    } else {
      if (gl.__ext_half_float) {
        if (result.filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
          console.warn('Half Float texture filtering not supported on result device')
          result.filter = gl.NEAREST
        }
      } else throw new Error('OES_texture_half_float is not available')
      if (result.channels == gl.RGB) {
        throw new Error('OES_texture_half_float onlysupports RGBA textures')
      }
    }
  } else if (result.format == 'sRGB') {
    if (!gl.__ext_sRGB) throw new Error('EXT_sRGB is not available')
  }

  // ////////////////////////////////////////////////////
  // Format ... InternalFormat combos.
  // Setup the correct combos.
  // the proper texture format combination can be found here
  // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
  // Determine the internal format from mthe format and type.
  if (result.format != undefined && gl.name == 'webgl2' && result.internalFormat == result.format) {
    if (result.type == gl.FLOAT) {
      if (result.format == gl.RED) {
        result.internalFormat = gl.R32F
      } else if (result.format == gl.RED) {
        result.internalFormat = gl.R32F
      } else if (result.format == gl.RG) {
        result.internalFormat = gl.RG32F
      } else if (result.format == gl.RGBA) {
        result.internalFormat = gl.RGBA32F
      }
    } else if (result.type == gl.HALF_FLOAT) {
      if (result.format == gl.RED) {
        result.internalFormat = gl.R16F
      } else if (result.format == gl.RGB) {
        result.internalFormat = gl.RGB16F
      } else if (result.format == gl.RGBA) {
        result.internalFormat = gl.RGBA16F
      }
    } else if (result.type == gl.UNSIGNED_BYTE) {
      if (result.format == gl.RED) {
        result.internalFormat = gl.R8
      }
      if (result.format == gl.RGB) {
        result.internalFormat = gl.RGB8
      } else if (result.format == gl.RGBA) {
        result.internalFormat = gl.RGBA8
      }
    }
  }

  if (result.depthFormat != undefined) {
    if (gl.name == 'webgl2') {
      if (result.depthType == gl.UNSIGNED_SHORT) {
        result.depthInternalFormat = gl.DEPTH_COMPONENT16
      } else if (result.depthType == gl.UNSIGNED_INT) {
        result.depthInternalFormat = gl.UNSIGNED_INT
      }
    } else {
      result.depthInternalFormat = result.depthFormat
    }
  }

  return result
}

export { processTextureParams }
