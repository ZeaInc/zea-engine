import { GLTexture2D } from './GLTexture2D.js'
import { GLFbo } from './GLFbo.js'
import { GLImageAtlas } from './GLImageAtlas.js'

// import './Shaders/GLSL/ImagePyramid.js'

const Math_log2 = function (value) {
  // IE11 doesn't support Math.log2.
  return Math.log2(value)
  // return Math.log( value ) / Math.log( 2 ) - 2;
}

/** Class representing an image pyramid.
 * @extends GLImageAtlas
 * @private
 */
class ImagePyramid extends GLImageAtlas {
  /**
   * Create an image pyramid.
   * @param {WebGLRenderingContext} gl - The webgl rendering context.
   * @param {string} name - The name value.
   * @param {any} srcGLTex - The srcGLTex value.
   * @param {boolean} destroySrcImage - The destroySrcImage value.
   * @param {number} minTileSize - The minTileSize value.
   */
  constructor(gl, name, srcGLTex, destroySrcImage = true, minTileSize = 16) {
    super(gl, name)

    this.__srcGLTex = srcGLTex
    this.__fbos = []

    srcGLTex.on('updated', () => {
      this.renderAtlas(destroySrcImage)
    })
    if (this.__srcGLTex.isLoaded()) {
      this.generateAtlasLayout(minTileSize)
      this.renderAtlas(destroySrcImage)
    } else {
      this.__srcGLTex.on('updated', () => {
        this.generateAtlasLayout(minTileSize)
        this.renderAtlas(destroySrcImage)
      })
    }
    srcGLTex.on('destructing', () => {
      console.log(this.__srcGLTex.getName() + ' ImagePyramid destructing')
      this.destroy()
    })
  }

  /**
   * The generateAtlasLayout method.
   * @param {any} minTileSize - The minTileSize value.
   */
  generateAtlasLayout(minTileSize) {
    const gl = this.__gl

    this.size = this.__srcGLTex.height
    const aspectRatio = this.__srcGLTex.width / this.__srcGLTex.height

    this.addSubImage(this.__srcGLTex)
    const numLevels = Math.round(Math_log2(this.size)) - 1 // compute numLevels-1 levels(because we use the source image as the base level);
    for (let i = numLevels; i >= 0; --i) {
      const size = Math.pow(2, i)
      if (size < minTileSize) break
      // Create a target texture for this level of the pyramid.
      // and then render to it using the base level as a source image.
      const level = new GLTexture2D(gl, {
        format: this.__srcGLTex.getFormat(),
        type: this.__srcGLTex.getType(),
        width: size * aspectRatio,
        height: size,
        filter: 'LINEAR',
        wrap: 'CLAMP_TO_EDGE',
      })
      this.addSubImage(level)
      this.__fbos.push(new GLFbo(gl, level))
    }

    super.generateAtlasLayout()
  }

  /**
   * The renderAtlas method.
   * @param {boolean} cleanup - The cleanup value.
   */
  renderAtlas(cleanup = true) {
    const gl = this.__gl
    const renderstate = {}
    gl.screenQuad.bindShader(renderstate)

    for (let i = 0; i < this.__fbos.length; i++) {
      this.__fbos[i].bindAndClear()
      gl.screenQuad.draw(renderstate, this.getSubImage(i)) // Note: we are binding the previous image. (we have 1 more images than fbos.)
    }

    super.renderAtlas(cleanup)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
    for (const fbo of this.__fbos) {
      fbo.destroy()
    }
  }
}

export { ImagePyramid }
