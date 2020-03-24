import { Signal } from '../../Utilities/index'
import { RefCounted } from '../RefCounted.js'

/** Class representing a procedural sky.
 * @extends RefCounted
 */
class ProceduralSky extends RefCounted {
  /**
   * Create a procedural sky.
   * @param {any} params - The params value.
   */
  constructor(params = {}) {
    super()

    this.updated = new Signal()
  }
}
export { ProceduralSky }
