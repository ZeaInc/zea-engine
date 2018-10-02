
import {
    SystemDesc
} from '../BrowserDetection.js';
import '../Math';

// This class abstracts the rendering of a collection of geometries to screen.
class GLFbo {
    constructor(gl, colorTexture, createDepthTexture = false) {
        if(SystemDesc.isIOSDevice && (colorTexture.getType() == 'FLOAT' || colorTexture.getType() == 'HALF_FLOAT')) {
            console.error("IOS devices are unable to render to float textures.")
        }

        this.__gl = gl;
        this.__colorTexture = colorTexture;
        this.__createDepthTexture = createDepthTexture;
        this.__clearColor = [0, 0, 0, 0];
        this.__depthTexture = undefined;

        this.setup = this.setup.bind(this);
        this.resize = this.resize.bind(this);

        if(this.__colorTexture)
            this.__colorTexture.resized.connect(this.resize);

        this.setup();

    }

    setClearColor(clearColor) {
        this.__clearColor = clearColor;
    }

    getWidth() {
        return this.__colorTexture.width;
    }

    getHeight() {
        return this.__colorTexture.height;
    }

    getSize(){
        return [this.__colorTexture.width, this.__colorTexture.height];
    }

    getColorTexture() {
        return this.__colorTexture;
    }
    
    getDepthTextureGL() {
        return this.__depthTexture;
    }
    get width() {
        return this.__colorTexture.width;
    }

    get height() {
        return this.__colorTexture.height;
    }

    get size(){
        return [this.__colorTexture.width, this.__colorTexture.height];
    }

    get colorTexture() {
        return this.__colorTexture;
    }

    setColorTexture(colorTexture) {
        this.__colorTexture = colorTexture;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.__colorTexture.glTex, 0);
    }

    get depthTextureGL() {
        return this.__depthTexture;
    }

    setup() {
        const gl = this.__gl;

        this.__fbo = gl.createFramebuffer();
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo);

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

        if(this.__colorTexture)
            gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.__colorTexture.glTex, 0);

        // Create the depth texture
        if (this.__createDepthTexture) {
            if (gl.name != 'webgl2' && !gl.__ext_WEBGL_depth_texture) {
                // Create the depth buffer
                var depthBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
            } else {
                gl.activeTexture(gl.TEXTURE0);
                this.__depthTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.__depthTexture);
                // TODO: Copy params from the color image.
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (gl.name == 'webgl2'){
                    // the proper texture format combination can be found here
                    // https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
                    // https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/fbo_rtt_depth_texture.html
                    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
                    gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.__depthTexture, 0);
                }
                else {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.__depthTexture, 0);
                }

            }
        }

        this.__checkFramebuffer();

        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    }

    // Triggered Automatically when the texture reizes.
    // TODO: fbos should manage the textures assigned to them
    // e.g. resixzing and preserving data.
    resize(/*width, height, preserve*/) {
        const gl = this.__gl;
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo);

        // The coolor texture is destoryed and re-created when it is resized,
        // so we must re-bind it here..
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.__colorTexture.glTex, 0);
        if (this.__depthTexture) {
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
    }

    __checkFramebuffer() {
        const gl = this.__gl;

        let check;
        if (gl.name == 'webgl2')
            check = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
        else
            check = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (check !== gl.FRAMEBUFFER_COMPLETE) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, null);
            if (gl.name == 'webgl2')
                gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
            else
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            console.warn("Error creating Fbo width:", this.width, ", height:", this.height, " Texture Type:", this.__colorTexture.getType());
            switch(check){
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                throw ("The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.");
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                throw ("There is no attachment.");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw ("Height and width of the attachment are not the same.");
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                throw ("The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.");
            case 36061: //gl.GL_FRAMEBUFFER_UNSUPPORTED:
                throw ("The framebuffer is unsupported");
            default:
                throw ("Incomplete Frambuffer");
            }
        }

    }


    bindForWriting(renderstate) {
        if(renderstate) {
            this.__prevBoundFbo = renderstate.boundRendertarget;
            renderstate.boundRendertarget = this.__fbo;
        }
        const gl = this.__gl;
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__fbo);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo);
        gl.viewport(0, 0, this.width, this.height); // Match the viewport to the texture size
    }

    unbindForWriting(renderstate) {
        if(renderstate)
            renderstate.boundRendertarget = this.__prevBoundFbo;
        const gl = this.__gl;
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.__prevBoundFbo);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.__prevBoundFbo);
    }

    bind(renderstate) {
        this.bindForWriting(renderstate);
    }
    unbind(renderstate){
        this.unbindForWriting(renderstate);
    }

    bindForReading() {
        const gl = this.__gl;
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.__fbo);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.__fbo);
    }

    unbindForReading() {
        const gl = this.__gl;
        if (gl.name == 'webgl2')
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        else
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    clear() {
        const gl = this.__gl;
        gl.colorMask(true, true, true, true); // Don't write to the color channels at all
        gl.clearColor(...this.__clearColor);
        if (this.__createDepthTexture) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        } else {
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
    }

    bindAndClear(renderstate) {
        this.bind(renderstate);
        this.clear(renderstate);
    }

    unbind() {
        const gl = this.__gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    destroy() {
        const gl = this.__gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(this.__fbo);
        this.__fbo = null;
        this.__colorTexture.resized.disconnect(this.resize);
    }
};

export {
    GLFbo
};
// export default GLFbo;
