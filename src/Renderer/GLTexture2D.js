import { Signal } from '../Utilities';
import { BaseImage, RefCounted } from '../SceneTree';
import { SystemDesc } from '../BrowserDetection.js';

class GLTexture2D extends RefCounted {
  constructor(gl, params) {
    super();
    this.__gl = gl;

    this.ready = new Signal(true);
    this.updated = new Signal();
    this.resized = new Signal();

    this.width = 0;
    this.height = 0;
    this.textureType = 1; // Default 2d 8 bit texture image texture.
    this.textureDesc = [0, 0, 0, 0]; // To be populated by derived classes.
    this.__loaded = false;
    this.__bound = false;
    const imageUpdated = () => {
      // this.bufferData(data);
      const params = this.__texture.getParams();
      const width = params.width;
      const height = params.height;
      const data = params.data;
      this.bufferData(data, width, height);
    };
    if (params != undefined) {
      if (params instanceof BaseImage) {
        this.__texture = params;
        this.__texture.setMetadata('gltexture', this);
        if (this.__texture.isLoaded()) {
          this.configure(this.__texture.getParams());
          this.__texture.updated.connect(imageUpdated);
        } else {
          this.__texture.loaded.connect(() => {
            this.configure(this.__texture.getParams());
            this.__texture.updated.connect(imageUpdated);
          });
        }
        this.__texture.destructing.connect(() => {
          console.log(this.__texture.getName() + ' destructing');
          this.destroy();
        });
      } else this.configure(params);
    }
  }

  isLoaded() {
    return this.__loaded;
  }
  getTexture() {
    return this.__texture;
  }

  getInternalFormat() {
    return this.__internalFormat;
  }
  getType() {
    return this.__typeParam;
  }
  getTypeID() {
    return this.__type;
  }
  getFormat() {
    return this.__formatParam;
  }
  getFormatID() {
    return this.__format;
  }
  getFilter() {
    return this.__filterParam;
  }
  getWrap() {
    return this.__wrapParam;
  }

  getMipMapped() {
    return this.__mipMapped;
  }

  configure(params, emit = true) {
    if (
      !('type' in params) ||
      !('format' in params) ||
      !('width' in params) ||
      !('height' in params)
    )
      throw 'Invalid texture params';

    const gl = this.__gl;
    const width = params.width;
    const height = params.height;
    const data = params.data;

    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (width <= 0 || width > maxSize || height <= 0 || height > maxSize) {
      throw new Error(
        'gl-texture2d: Invalid texture size. width:' +
          width +
          ' height:' +
          height +
          ' maxSize:' +
          maxSize
      );
    }

    const format = params.format;
    const type = params.type;
    let minFilter =
      'minFilter' in params
        ? params.minFilter
        : 'filter' in params
        ? params.filter
        : 'LINEAR';
    let magFilter =
      'magFilter' in params
        ? params.magFilter
        : 'filter' in params
        ? params.filter
        : 'LINEAR';
    const wrap = 'wrap' in params ? params.wrap : 'CLAMP_TO_EDGE';

    // if(format == 'ALPHA')
    //     throw("ALPHA textures are now deprecated. Please use RED instead.")

    // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    if (type == 'FLOAT') {
      this.textureType = 3; // Indicating an Float HDR image.

      if (gl.name == 'webgl2') {
        if (minFilter == 'LINEAR' && !gl.__ext_float_linear) {
          console.warn(
            'Floating point texture filtering not supported on this device'
          );
          minFilter = 'NEAREST';
        }
        if (magFilter == 'LINEAR' && !gl.__ext_float_linear) {
          console.warn(
            'Floating point texture filtering not supported on this device'
          );
          magFilter = 'NEAREST';
        }
      } else {
        if (gl.__ext_float) {
          if (minFilter == 'LINEAR' && !gl.__ext_float_linear) {
            console.warn(
              'Floating point texture filtering not supported on this device'
            );
            minFilter = 'NEAREST';
          }
          if (magFilter == 'LINEAR' && !gl.__ext_float_linear) {
            console.warn(
              'Floating point texture filtering not supported on this device'
            );
            magFilter = 'NEAREST';
          }
        } else {
          if (gl.__ext_half_float) {
            type = 'HALF_FLOAT';
            if (minFilter == 'LINEAR' && !gl.__ext_texture_half_float_linear) {
              console.warn(
                'Half Float texture filtering not supported on this device'
              );
              minFilter = 'NEAREST';
            }
            if (magFilter == 'LINEAR' && !gl.__ext_texture_half_float_linear) {
              console.warn(
                'Half Float texture filtering not supported on this device'
              );
              magFilter = 'NEAREST';
            }
          } else {
            throw 'OES_texture_half_float is not available';
          }
        }
      }
    } else if (type == 'HALF_FLOAT') {
      if (gl.name == 'webgl2') {
        // Half float linear filtering appears to be supported even without the extension.
        // if (filter == 'LINEAR' && !gl.__ext_texture_half_float_linear) {
        //     console.warn('Floating point texture filtering not supported on this device');
        //     filter = 'NEAREST';
        // }
      } else {
        if (!gl.supportUploadingHalfFloat && data != undefined) {
          throw 'Safari does not support uploading HALF_FLOAT texture data.';
        }
        if (gl.__ext_half_float) {
          if (minFilter == 'LINEAR' && !gl.__ext_texture_half_float_linear) {
            console.warn(
              'Half Float texture filtering not supported on this device'
            );
            minFilter = 'NEAREST';
          }
          if (magFilter == 'LINEAR' && !gl.__ext_texture_half_float_linear) {
            console.warn(
              'Half Float texture filtering not supported on this device'
            );
            magFilter = 'NEAREST';
          }
        } else {
          throw 'OES_texture_half_float is not available';
        }
        if (format == 'RGB') {
          throw 'OES_texture_half_float onlysupports RGBA textures';
        }
      }
    } else if (type == 'sRGB') {
      if (!gl.__ext_sRGB) throw 'EXT_sRGB is not available';
    }

    this.__formatParam = format;
    this.__typeParam = type;
    this.__minFilterParam = minFilter;
    this.__magFilterParam = magFilter;
    this.__wrapParam = wrap;

    this.__format = gl[format];
    this.__internalFormat =
      'internalFormat' in params ? gl[params.internalFormat] : this.__format;
    this.__type = gl[type];

    if (gl.name == 'webgl2') {
      if (!('internalFormat' in params)) {
        if (this.__type == gl.FLOAT) {
          if (this.__format == gl.RED) {
            this.__internalFormat = gl.R32F;
          } else if (this.__format == gl.RG) {
            this.__internalFormat = gl.RG32F;
          } else if (this.__format == gl.RGB) {
            this.__internalFormat = gl.RGB32F;
          } else if (this.__format == gl.RGBA) {
            this.__internalFormat = gl.RGBA32F;
          }
        } else if (this.__type == gl.HALF_FLOAT) {
          if (this.__format == gl.RED) {
            this.__internalFormat = gl.R16F;
          } else if (this.__format == gl.RG) {
            this.__internalFormat = gl.RG16F;
          } else if (this.__format == gl.RGB) {
            this.__internalFormat = gl.RGB16F;
          } else if (this.__format == gl.RGBA) {
            this.__internalFormat = gl.RGBA16F;
          }
        } else if (this.__type == gl.UNSIGNED_BYTE) {
          if (this.__format == gl.RED) {
            this.__internalFormat = gl.R8;
          }
          if (this.__format == gl.RG) {
            this.__internalFormat = gl.RG8;
          }
          if (this.__format == gl.RGB) {
            this.__internalFormat = gl.RGB8;
          } else if (this.__format == gl.RGBA) {
            this.__internalFormat = gl.RGBA8;
          }
        }
      }
    }
    this.__minFilter = gl[minFilter];
    this.__magFilter = gl[magFilter];
    this.__wrap = gl[wrap];
    this.__flipY = 'flipY' in params ? params.flipY : false;
    this.__mipMapped = 'mipMapped' in params ? params.mipMapped : false;
    this.invert = 'invert' in params ? params.invert : false;
    this.alphaFromLuminance =
      'alphaFromLuminance' in params ? params.alphaFromLuminance : false;
    this.textureDesc = [width, height, 0, 0];

    if (this.__gltex) {
      gl.deleteTexture(this.__gltex);
    }

    this.__gltex = gl.createTexture();
    this.__updateGLTexParams();
    if (data) {
      this.bufferData(data, width, height, false, false);
    } else {
      this.resize(width, height, false, false);
    }
    if (!this.__loaded) {
      this.ready.emit();
      this.__loaded = true;
    }
  }

  __updateGLTexParams() {
    const gl = this.__gl;

    // Load the image into the GPU for rendering.
    gl.bindTexture(gl.TEXTURE_2D, this.__gltex);

    // This parameter caused all images to be blank. Flipping in the pixel shader instead(by default)
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.__minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.__magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.__wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.__wrap);
  }

  bufferData(data, width = -1, height = -1, bind = true, emit = true) {
    const gl = this.__gl;
    if (bind) {
      gl.bindTexture(gl.TEXTURE_2D, this.__gltex);
    }
    if (data != undefined) {
      if (
        data instanceof Image ||
        data instanceof ImageData ||
        data instanceof HTMLCanvasElement ||
        data instanceof HTMLImageElement ||
        data instanceof HTMLVideoElement
      ) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          this.__internalFormat,
          this.__format,
          this.__type,
          data
        );
        this.width = data.width;
        this.height = data.height;
      } else {
        // if wieght and height not specified, assume they stay the same.
        if (width == -1) {
          width = this.width;
        }
        if (height == -1) {
          height = this.height;
        }
        // Note: data images must have an even size width/height to load correctly.
        // this doesn't mean they must be pot textures...
        const numPixels = width * height;
        let numChannels;
        switch (this.__format) {
          case gl.RED:
          case gl.RED_INTEGER:
          case gl.ALPHA:
          case gl.LUMINANCE:
          case gl.LUMINANCE_ALPHA:
            numChannels = 1;
            break;
          case gl.RG:
            numChannels = 2;
            break;
          case gl.RGB:
            numChannels = 3;
            break;
          case gl.RGBA:
            numChannels = 4;
            break;
        }
        if (data.length != numPixels * numChannels) {
          console.warn(
            'Invalid data for Image width:' +
              width +
              ' height:' +
              height +
              ' format:' +
              this.__formatParam +
              ' type:' +
              this.__typeParam +
              ' Data Length:' +
              data.length +
              ' Expected:' +
              numPixels * numChannels
          );
        }
        if (this.__type == gl.HALF_FLOAT && data instanceof Float32Array) {
          data = Math.convertFloat32ArrayToUInt16Array(data);
        }
        if (gl.name == 'webgl2') {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            this.__internalFormat,
            width,
            height,
            0,
            this.__format,
            this.__type,
            data,
            0
          );
        } else {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            this.__internalFormat,
            width,
            height,
            0,
            this.__format,
            this.__type,
            data
          );
        }
        // These values may not have changed....
        this.width = width;
        this.height = height;
      }

      if (this.__mipMapped) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this.__internalFormat,
        this.width,
        this.height,
        0,
        this.__format,
        this.__type,
        null
      );

      // simply resize the buffer.
      this.width = width;
      this.height = height;
    }

    if (emit) {
      this.updated.emit();
    }
  }

  clear() {
    const gl = this.__gl;
    const numPixels = this.width * this.height;
    let numChannels;
    switch (this.__format) {
      case gl.RED:
      case gl.RED_INTEGER:
      case gl.ALPHA:
      case gl.LUMINANCE:
      case gl.LUMINANCE_ALPHA:
        numChannels = 1;
        break;
      case gl.RG:
        numChannels = 2;
        break;
      case gl.RGB:
        numChannels = 3;
        break;
      case gl.RGBA:
        numChannels = 4;
        break;
      default:
        throw 'Invalid Format';
    }
    let data;
    switch (this.__type) {
      case gl.UNSIGNED_BYTE:
        data = new UInt8Array(numPixels * numChannels);
        break;
      case gl.HALF_FLOAT:
        data = new UInt16Array(numPixels * numChannels);
        break;
      case gl.FLOAT:
        data = new Float32Array(numPixels * numChannels);
        break;
      default:
        throw 'Invalid Type';
    }

    if (gl.name == 'webgl2') {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this.__internalFormat,
        this.width,
        this.height,
        0,
        this.__format,
        this.__type,
        data,
        0
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this.__internalFormat,
        this.width,
        this.height,
        0,
        this.__format,
        this.__type,
        data
      );
    }
  }

  resize(width, height, preserveData = false, emit = true) {
    const gl = this.__gl;
    const sizeChanged = this.width != width || this.height != height;
    if (sizeChanged) {
      const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (width < 0 || width > maxSize || height < 0 || height > maxSize) {
        throw new Error(
          'gl-texture2d: Invalid texture size. width:' +
            width +
            ' height:' +
            height +
            ' maxSize:' +
            maxSize
        );
      }

      if (preserveData) {
        const gltex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gltex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          this.__internalFormat,
          width,
          height,
          0,
          this.__format,
          this.__type,
          null
        );
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
          gl.FRAMEBUFFER,
          gl.COLOR_ATTACHMENT0,
          gl.TEXTURE_2D,
          this.__gltex,
          0
        );

        gl.bindTexture(gl.TEXTURE_2D, gltex); // Do we need this line?
        gl.copyTexImage2D(
          gl.TEXTURE_2D,
          0,
          this.__internalFormat,
          0,
          0,
          this.width,
          this.height,
          0
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.deleteFramebuffer(fbo);

        this.__gl.deleteTexture(this.__gltex);
        this.__gltex = gltex;
        this.__updateGLTexParams();
      } else {
        gl.bindTexture(gl.TEXTURE_2D, this.__gltex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          this.__internalFormat,
          width,
          height,
          0,
          this.__format,
          this.__type,
          null
        );
      }

      this.width = width;
      this.height = height;

      if (emit) {
        this.resized.emit(width, height);
      }
    }
  }

  getSize() {
    return [this.width, this.height];
  }

  get glTex() {
    return this.__gltex;
  }

  getTexHdl() {
    return this.__gltex;
  }

  bind(renderstate, unif) {
    console.warn("'bind' is deprecated. Please use 'bindToUniform'");
    return this.bindToUniform(renderstate, unif);
  }

  preBind(unif, unifs) {
    return {
      textureTypeUnif: unifs[unif.name + 'Type'],
      textureDescUnif: unifs[unif.name + 'Desc'],
    };
  }

  bindToUniform(renderstate, unif, bindings) {
    if (!this.__loaded) {
      return false;
    }
    if (!this.__gltex) {
      throw 'Unable to bind non-initialized or deleted texture.';
    }

    const unit = renderstate.boundTextures++;
    const texId = this.__gl.TEXTURE0 + unit;
    const gl = this.__gl;
    gl.activeTexture(texId);
    gl.bindTexture(gl.TEXTURE_2D, this.__gltex);
    gl.uniform1i(unif.location, unit);

    if (bindings) {
      if (bindings.textureTypeUnif) {
        gl.uniform1i(bindings.textureTypeUnif.location, this.textureType);
      }

      if (bindings.textureDescUnif) {
        this.__gl.uniform4fv(
          bindings.textureDescUnif.location,
          this.textureDesc
        );
      }
    }

    return true;
  }

  destroy() {
    super.destroy();
    if (this.__texture) {
      this.__texture.setMetadata('gltexture', undefined);
    }
    this.__gl.deleteTexture(this.__gltex);
    this.__gltex = undefined;
  }
}

export { GLTexture2D };
