import { AttrValue } from '../Math/index'
import { ScreenQuadShader } from './Shaders/ScreenQuadShader.js'
import { generateShaderGeomBinding } from './GeomShaderBinding.js'

/** Class representing a GL screen quad. */
class GLScreenQuad {
  /**
   * Create a GL screen quad.
   * @param {any} gl - The gl value.
   * @param {any} preproc - The preproc value.
   */
  constructor(gl, preproc) {
    this.__gl = gl

    this.__pos = [0.0, 0.0]
    this.__size = [1.0, 1.0]
    this.flipY = true
    this.__glshader = new ScreenQuadShader(gl)

    if (!gl.__quadVertexIdsBuffer) gl.setupInstancedQuad()

    const shaderComp = this.__glshader.compileForTarget('GLScreenQuad', preproc)
    this.__quadBinding = generateShaderGeomBinding(
      gl,
      shaderComp.attrs,
      gl.__quadattrbuffers,
      gl.__quadIndexBuffer
    )

    this.ready = true
  }

  /**
   * The bind method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} texture - The texture pavalueram.
   * @param {any} pos - The pos value.
   * @param {any} size - The size value.
   */
  bind(renderstate, texture, pos = undefined, size = undefined) {
    const unifs = renderstate.unifs
    texture.bindToUniform(renderstate, renderstate.unifs.image)

    const gl = this.__gl
    {
      const unif = unifs.pos
      if (unif) {
        gl.uniform2fv(
          unif.location,
          pos ? (pos instanceof AttrValue ? pos.asArray() : pos) : this.__pos
        )
      }
    }
    {
      const unif = unifs.size
      if (unif) {
        gl.uniform2fv(
          unif.location,
          size
            ? size instanceof AttrValue
              ? size.asArray()
              : size
            : this.__size
        )
      }
    }
    // if ('flipY' in unifs)
    //     gl.uniform1i(unifs.flipY.location, this.flipY ? 1 : 0);

    // if ('textureDim' in unifs)
    //     gl.uniform2fv(unifs.textureDim.location, [texture.width, texture.height]);

    this.__quadBinding.bind(renderstate)
  }

  /**
   * The bindShader method.
   * @param {any} renderstate - The renderstate value.
   * @return {any} - The return value.
   */
  bindShader(renderstate) {
    return this.__glshader.bind(renderstate, 'GLScreenQuad')
  }

  /**
   * The draw method.
   * @param {any} renderstate - The renderstate value.
   * @param {any} texture - The texture value.
   * @param {any} pos - The pos value.
   * @param {any} size - The size value.
   */
  draw(renderstate, texture, pos = undefined, size = undefined) {
    this.bind(renderstate, texture, pos, size)

    this.__gl.drawQuad()
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {}
}

export { GLScreenQuad }
