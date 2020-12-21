const processTextureParams = function (gl: any, params: any) {
    if (!params.width || !params.height) {
        if (!params.width)
            throw new Error(`Invalid texture params. 'width' not provided`);
        if (!params.height)
            throw new Error(`Invalid texture params. 'height' not provided`);
    }
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (params.width <= 0 || params.width > maxSize || params.height <= 0 || params.height > maxSize) {
        throw new Error('GLTextureParams: Invalid texture size. width:' +
            params.width +
            ' height:' +
            params.height +
            ' maxSize:' +
            maxSize);
    }
    const result = {
        width: params.width,
        height: params.height,
    };
    const processParam = (name: any, defaultValue: any) => {
        if (name in params)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            result[name] = isNaN(params[name]) ? gl[params[name]] : params[name];
        else if (defaultValue)
            // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
            result[name] = defaultValue;
    };
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    processParam('format');
    processParam('internalFormat', (result as any).format);
    processParam('type', gl.UNSIGNED_BYTE);
    processParam('minFilter', gl.LINEAR);
    processParam('magFilter', gl.LINEAR);
    processParam('wrapS', gl.CLAMP_TO_EDGE);
    processParam('wrapT', gl.CLAMP_TO_EDGE);
    processParam('flipY', false);
    processParam('mipMapped', false);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    processParam('depthInternalFormat');
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    processParam('depthFormat');
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    processParam('depthType');
    // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    if ((result as any).format == gl.FLOAT) {
        if (gl.name == 'webgl2') {
            if ((result as any).filter == gl.LINEAR && !gl.__ext_float_linear) {
                console.warn('Floating point texture filtering not supported on result device');
                (result as any).filter = gl.NEAREST;
            }
        }
        else {
            if (gl.__ext_float) {
                if ((result as any).filter == gl.LINEAR && !gl.__ext_float_linear) {
                    console.warn('Floating point texture filtering not supported on result device');
                    (result as any).filter = gl.NEAREST;
                }
            }
            else {
                if (gl.__ext_half_float) {
                    (result as any).format = gl.HALF_FLOAT;
                    if ((result as any).filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
                        console.warn('Half Float texture filtering not supported on result device');
                        (result as any).filter = gl.NEAREST;
                    }
                }
                else {
                    throw new Error('OES_texture_half_float is not available');
                }
            }
        }
    }
    else if ((result as any).format == gl.HALF_FLOAT) {
        if (gl.name == 'webgl2') {
            // Half load linear filtering appears to be supported even without the extension.
            // if (result.filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
            //     console.warn('Floating point texture filtering not supported on result device');
            //     result.filter = 'NEAREST';
            // }
        }
        else {
            if (gl.__ext_half_float) {
                if ((result as any).filter == gl.LINEAR && !gl.__ext_texture_half_float_linear) {
                    console.warn('Half Float texture filtering not supported on result device');
                    (result as any).filter = gl.NEAREST;
                }
            }
            else
                throw new Error('OES_texture_half_float is not available');
            if ((result as any).channels == gl.RGB) {
                throw new Error('OES_texture_half_float onlysupports RGBA textures');
            }
        }
    }
    else if ((result as any).format == 'sRGB') {
        if (!gl.__ext_sRGB)
            throw new Error('EXT_sRGB is not available');
    }
    // ////////////////////////////////////////////////////
    // Format ... InternalFormat combos.
    // Setup the correct combos.
    // the proper texture format combination can be found here
    // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
    // Determine the internal format from mthe format and type.
    if ((result as any).format != undefined && gl.name == 'webgl2' && (result as any).internalFormat == (result as any).format) {
        if ((result as any).type == gl.FLOAT) {
            if ((result as any).format == gl.RED) {
                (result as any).internalFormat = gl.R32F;
            }
            else if ((result as any).format == gl.RED) {
                (result as any).internalFormat = gl.R32F;
            }
            else if ((result as any).format == gl.RG) {
                (result as any).internalFormat = gl.RG32F;
            }
            else if ((result as any).format == gl.RGBA) {
                (result as any).internalFormat = gl.RGBA32F;
            }
        }
        else if ((result as any).type == gl.HALF_FLOAT) {
            if ((result as any).format == gl.RED) {
                (result as any).internalFormat = gl.R16F;
            }
            else if ((result as any).format == gl.RGB) {
                (result as any).internalFormat = gl.RGB16F;
            }
            else if ((result as any).format == gl.RGBA) {
                (result as any).internalFormat = gl.RGBA16F;
            }
        }
        else if ((result as any).type == gl.UNSIGNED_BYTE) {
            if ((result as any).format == gl.RED) {
                (result as any).internalFormat = gl.R8;
            }
            if ((result as any).format == gl.RGB) {
                (result as any).internalFormat = gl.RGB8;
            }
            else if ((result as any).format == gl.RGBA) {
                (result as any).internalFormat = gl.RGBA8;
            }
        }
    }
    if ((result as any).depthFormat != undefined) {
        if (gl.name == 'webgl2') {
            if ((result as any).depthType == gl.UNSIGNED_SHORT) {
                (result as any).depthInternalFormat = gl.DEPTH_COMPONENT16;
            }
            else if ((result as any).depthType == gl.UNSIGNED_INT) {
                (result as any).depthInternalFormat = gl.UNSIGNED_INT;
            }
        }
        else {
            (result as any).depthInternalFormat = (result as any).depthFormat;
        }
    }
    return result;
};
export { processTextureParams };
