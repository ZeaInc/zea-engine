import { GLGeomItemSetMultiDraw } from './GLGeomItemSetMultiDraw.js'
import '../../SceneTree/Geometry/Mesh.js'

/** Class representing a GL mesh.
 * @extends GLGeom
 * @private
 */
class GLPointsItemSet extends GLGeomItemSetMultiDraw {
  /**
   * Draw an item to screen.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @param {number} count - the element count for this draw call.
   * @param {number} offset - the element offset for this draw call.
   */
  singleDraw(renderstate, count, offset) {
    const gl = this.gl
    gl.drawArrays(gl.POINTS, offset, count)
  }

  /**
   * Draw an item to screen.
   * @param {object} renderstate - The object tracking the current state of the renderer
   * @param {Int32Array} counts - the counts for each element drawn in by this draw call.
   * @param {Int32Array} offsets - the offsets for each element drawn in by this draw call.
   */
  multiDraw(renderstate, counts, offsets) {
    const gl = this.gl
    if (gl.multiDrawArrays) {
      gl.multiDrawArrays(gl.POINTS, offsets, 0, counts, 0, counts.length)
    } else {
      const { drawId } = renderstate.unifs
      for (let i = 0; i < counts.length; i++) {
        gl.uniform1i(drawId.location, i)
        gl.drawArrays(gl.TRIANGLES, offsets[i], counts[i])
      }
    }
  }
}

export { GLPointsItemSet }
