import { Async } from '../Utilities/index'
import { GLTexture2D } from './GLTexture2D.js'
import { GLHDRImage } from './GLHDRImage.js'
import { ImageMixerShader } from './Shaders/ImageMixerShader.js'
import { GLFbo } from './GLFbo.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL lightmap mixer.
 * @extends GLTexture2D
 */
class GLLightmapMixer extends GLTexture2D {
  /**
   * Create a GL lightmap mixer.
   * @param {any} gl - The gl value.
   * @param {any} lightmapMixer - The lightmapMixer value.
   */
  constructor(gl, lightmapMixer) {
    super(gl)

    this.__lightmapMixer = lightmapMixer

    this.configure({
      format: 'RGBA',
      type: 'FLOAT',
      filter: 'LINEAR',
      wrap: 'CLAMP_TO_EDGE',
      width: this.__lightmapMixer.width,
      height: this.__lightmapMixer.height,
    })
    this.__fbo = new GLFbo(gl, this)

    this.__decompAndMixShader = new ImageMixerShader(gl)
    const shaderComp = this.__decompAndMixShader.compileForTarget(
      'ImageMixerShader'
    )
    this.__shaderBinding = generateShaderGeomBinding(
      gl,
      shaderComp.attrs,
      gl.__quadattrbuffers,
      gl.__quadIndexBuffer
    )

    this.__srcTextures = []

    const async = new Async()
    // increment the count, so its not zero.
    // (so an already loaded image doesn't trigger the ready signal)
    async.incAsyncCount()
    const genGLTex = index => {
      const image = this.__lightmapMixer.getSubImage(index)
      let gltexture = image.getMetadata('gltexture')
      if (!gltexture) {
        if (image.type === 'FLOAT') {
          gltexture = new GLHDRImage(gl, image)
        } else {
          gltexture = new GLTexture2D(gl, image)
        }
      }
      this.__srcTextures[index] = gltexture
      async.incAsyncCount()
      gltexture.ready.connect(async.decAsyncCount)
    }

    for (let i = 0; i < this.__lightmapMixer.numSubImages(); i++) {
      genGLTex(i)
    }

    this.__lightmapMixer.lightmapAdded.connect(index => {
      genGLTex(index)
    })

    async.ready.connect(this.__renderTgtImage.bind(this))
    async.decAsyncCount()

    this.__lightmapMixer.lightmapResourceChanged.connect(() => {
      this.__renderTgtImage()
    })
    this.__lightmapMixer.lightmapWeightChanged.connect(() => {
      this.__renderTgtImage()
    })
  }

  /**
   * The __renderTgtImage method.
   * @private
   */
  __renderTgtImage() {
    const gl = this.__gl
    this.__fbo.bindAndClear()

    const renderstate = {}
    this.__decompAndMixShader.bind(renderstate, 'ImageMixerShader')
    this.__shaderBinding.bind(renderstate)

    const unifs = renderstate.unifs
    for (let i = 0; i < this.__srcTextures.length; i++) {
      this.__srcTextures[i].bind(renderstate, unifs['sampler' + i].location)
      gl.uniform1f(
        unifs['weight' + i].location,
        this.__lightmapMixer.getSubImageWeight(i)
      )
    }

    gl.drawQuad()

    // // Debug a block of pixels.
    // gl.finish();
    // let numPixels = 4;
    // let pixels = new Float32Array(4 * numPixels);
    // gl.readPixels(this.width / 4, this.height/4, numPixels, 1, gl.RGBA, gl.FLOAT, pixels);
    // console.log(pixels);

    this.__fbo.unbind()

    if (!this.__lightmapMixer.isStream()) {
      this.__fbo.destroy()
      for (let i = 0; i < this.__srcTextures.length; i++) {
        this.__srcTextures[i].destroy()
      }
      this.__fbo = null
      this.__srcTextures = []
    }

    this.updated.emit()
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
    if (this.__fbo) {
      this.__fbo.destroy()
      for (let i = 0; i < this.__srcTextures.length; i++) {
        this.__srcTextures[i].destroy()
      }
    }
    this.__decompAndMixShader.destroy()
    this.__shaderBinding.destroy()

    this.__lightmapMixer.loaded.disconnectScope(this)
    this.__lightmapMixer.updated.disconnectScope(this)
  }
}

export { GLLightmapMixer }
