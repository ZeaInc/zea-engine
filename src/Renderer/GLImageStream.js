import { RefCounted } from '../SceneTree/index'
import { GLTexture2D } from './GLTexture2D.js'

import './Shaders/GLSL/ImageStream.js'

/** Class representing a GL image stream.
 * @private
 */
class GLImageStream extends RefCounted {
  /**
   * Create a GL image stream.
   * @param {any} gl - The gl value.
   * @param {any} streamImage - The streamImage value.
   */
  constructor(gl, streamImage) {
    super()
    this.__gl = gl
    this.__streamImage = streamImage
    this.__descParam = this.__streamImage.getParameter('StreamAtlasDesc')
    this.__indexParam = this.__streamImage.getParameter('StreamAtlasIndex')
    this.__indexParam.on('valueChanged', () => {
      this.emit('updated', {})
    })

    // To support playing back the same image atlas through many different streams.
    // (e.g. the same Gif progress bar in many places)
    // The GLImageStream should own an instance of GLTexture2D instead of extending it.
    // this would enable multiple streams to share a reference.
    const configure = () => {
      const params = this.__streamImage.getParams()
      if (!params.data.__atlasTexture) {
        params.data.__atlasTexture = new GLTexture2D(gl, params)
      }
      this.__atlasTexture = params.data.__atlasTexture
      this.__atlasTexture.textureType = 2
      this.__atlasTexture.textureDesc = this.__descParam.getValue().asArray()
    }

    if (this.__streamImage.isLoaded()) {
      configure()
    } else {
      this.__indexParam.on('loaded', () => {
        configure()
      })
    }
  }

  /**
   * The preBind method.
   * @param {any} unif - The unif value.
   * @param {any} unifs - The unifs value.
   * @return {any} - The return value.
   */
  preBind(unif, unifs) {
    const res = this.__atlasTexture.preBind(unif, unifs)
    res.textureDescUnif = unifs[unif.name + 'Desc']
    res.textureIndexUnif = unifs[unif.name + 'Index']
    return res
  }

  /**
   * The bindToUniform method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} unif - The unif value.
   * @param {any} bindings - The bindings value.
   * @return {boolean} - The return value.
   */
  bindToUniform(renderstate, unif, bindings) {
    if (!this.__atlasTexture.bindToUniform(renderstate, unif, bindings)) {
      return false
    }

    if (bindings) {
      if (bindings.textureIndexUnif) {
        this.__gl.uniform1i(bindings.textureIndexUnif.location, this.__indexParam.getValue())
      }
    }

    return true
  }
}

export { GLImageStream }
