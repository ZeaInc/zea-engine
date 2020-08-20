import Lines from '../Lines'

/**
 * Class representing lines with a special serialization by removing computed values.
 *
 * @extends {Lines}
 */
class ProceduralLines extends Lines {
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

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    super.fromJSON(j, context)
  }
}

export default ProceduralLines
export { ProceduralLines }
