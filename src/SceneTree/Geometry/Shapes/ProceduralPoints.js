import { Points } from '../Points'

/**
 * Class representing points with a special serialization by removing computed values.
 *
 * @extends {Points}
 */
class ProceduralPoints extends Points {
  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    if (!context) context = {}
    context.skipTopology = true
    context.skipAttributes = ['positions', 'normals', 'texCoords']

    const j = super.toJSON(context)

    context.skipTopology = false
    context.skipAttributes = []
    return j
  }
}

export { ProceduralPoints }
