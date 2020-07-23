import { hammersley } from './hammersley.js'
import { GLTexture2D } from './GLTexture2D.js'
import { GLImageAtlas } from './GLImageAtlas.js'
import { ConvolverShader } from './Shaders/ConvolverShader.js'
import { GLFbo } from './GLFbo.js'
import { ImagePyramid } from './ImagePyramid.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL probe.
 * @extends GLImageAtlas
 * @private
 */
class GLProbe extends GLImageAtlas {
  /**
   * Create a GL probe.
   * @param {any} gl - The gl value.
   * @param {string} name - The name value.
   */
  constructor(gl, name) {
    super(gl, name)
    this.__gl = gl

    if (!gl.__quadVertexIdsBuffer) gl.setupInstancedQuad()

    this.__convolved = false
    this.__fbos = []
  }

  /**
   * The generateHammersleySamples method.
   * @param {any} numSamples - The numSamples value.
   * @return {any} - The return value.
   */
  generateHammersleySamples(numSamples) {
    const gl = this.__gl
    if (!gl['Hammersley' + numSamples]) {
      const dataArray = new Float32Array(numSamples * 3)
      for (let i = 0; i < numSamples; i++) {
        const Xi = hammersley(i, numSamples)
        const offset = i * 3
        dataArray[offset + 0] = Xi[0]
        dataArray[offset + 1] = Xi[1]
      }
      gl['Hammersley' + numSamples] = new GLTexture2D(gl, {
        format: 'RGB',
        type: 'FLOAT',
        filter: 'NEAREST',
        wrap: 'CLAMP_TO_EDGE',
        width: numSamples,
        height: 1,
        data: dataArray,
        mipMapped: false,
      })
    }
    return gl['Hammersley' + numSamples]
  }

  /**
   * The convolveProbe method.
   * @param {any} srcGLTex - The srcGLTex value.
   */
  convolveProbe(srcGLTex) {
    const gl = this.__gl

    // Compile and bind the convolver shader.
    const numSamples = 1024
    // const numSamples = 64;
    const hammersleyTexture = this.generateHammersleySamples(numSamples)

    if (!this.__convolved) {
      if (!this.__lodPyramid) {
        this.__lodPyramid = new ImagePyramid(gl, 'Probe Lods', srcGLTex, false)
        this.__lodPyramid.on('updated', () => {
          // If the image pyramid updates, we need to re-convolve.
          this.convolveProbe(srcGLTex)
        })
      }

      this.addSubImage(srcGLTex)

      let currRez = [srcGLTex.width / 2, srcGLTex.height / 2]

      const levels = 6 // this.__lodPyramid.numSubImages();
      for (let i = 0; i < levels; i++) {
        const level = new GLTexture2D(gl, {
          format: 'RGBA',
          type: 'FLOAT',
          filter: 'LINEAR',
          wrap: 'CLAMP_TO_EDGE',
          width: currRez[0],
          height: currRez[1],
        })
        this.addSubImage(level)

        const fbo = new GLFbo(gl, level)
        fbo.setClearColor([0, 1, 0, 0])
        this.__fbos.push(fbo)

        currRez = [currRez[0] / 2, currRez[1] / 2]
      }

      this.generateAtlasLayout()

      this.__convolverShader = new ConvolverShader(gl)
      const covolverShaderComp = this.__convolverShader.compileForTarget(
        'GLProbe',
        Object.assign(
          {
            repl: {
              NUM_SAMPLES: numSamples,
            },
          },
          gl.shaderopts
        )
      )
      this.__covolverShaderBinding = generateShaderGeomBinding(
        gl,
        covolverShaderComp.attrs,
        gl.__quadattrbuffers,
        gl.__quadIndexBuffer
      )
    }

    // TODO: Refactor this code.
    // We only need one target image for the probe. (not all these Fbos.)
    // Instead we can simply move the viewport around the target image atlas.
    const renderstate = {}
    this.__convolverShader.bind(renderstate, 'GLProbe')
    this.__covolverShaderBinding.bind(renderstate)
    const unifs = renderstate.unifs
    for (let i = 0; i < this.__fbos.length; i++) {
      this.__fbos[i].bindAndClear()

      // Note: we should not need to bind the texture every iteration.
      this.__lodPyramid.bindToUniform(renderstate, unifs.envMapPyramid)
      if ('hammersleyMap' in unifs) {
        hammersleyTexture.bindToUniform(renderstate, unifs.hammersleyMap)
      }

      // Set the roughness.
      if ('roughness' in unifs) {
        const roughness = (i + 1) / this.__fbos.length
        gl.uniform1f(unifs.roughness.location, roughness)
      }

      gl.drawQuad()
    }

    this.__convolved = true

    this.renderAtlas(false)
  }

  /**
   * The bindProbeToUniform method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} unif - The unif value.
   */
  bindProbeToUniform(renderstate, unif) {
    // this.__lodPyramid.getSubImage(3).bind(renderstate, unif);
    if (this.__convolved) super.bindToUniform(renderstate, unif)
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
    this.__convolverShader.destroy()

    for (const fbo of this.__fbos) {
      fbo.destroy()
    }
  }
}

export { GLProbe }
