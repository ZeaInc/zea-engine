import { Registry } from '../../Registry'
import { Parameter } from './Parameter.js'

/**
 * Represents a specific type of parameter, that stores multiple parameters in object format.
 *
 * i.e.:
 * ```javascript
 * const structParam = new StructParameter('MyStructParam')
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(structParam)
 * ```
 *
 * **Events**
 * * **valueChanged:** Triggered whenever parameter's value changes.
 *
 * @extends Parameter
 */
class StructParameter extends Parameter {
  /**
   * Create a struct parameter.
   * @param {string} name - The name of the struct parameter.
   */
  constructor(name) {
    super(name, {}, 'Struct')
    this.__members = []
  }

  /**
   * The _addMember method.
   * @param {Parameter} parameter - The parameter value.
   * @return {Parameter} - The return value.
   * @private
   */
  _addMember(parameter) {
    this.__value[parameter.getName()] = parameter.getValue()
    parameter.on('valueChanged', () => {
      this.__value[parameter.getName()] = parameter.getValue()
    })
    this.__members.push(parameter)
    this.emit('valueChanged', {})
    return parameter
  }

  /**
   * The getParameter method.
   *
   * @private
   * @param {string} name - The parameter name.
   * @return {Parameter} - The return value.
   */
  getParameter(name) {
    for (const p of this.__members) {
      if (p.getName() == name) return p
    }
  }

  /**
   * Looks for a member parameter with the specified name and returns it.
   *
   * @param {string} name - The parameter name.
   * @return {Parameter} - The return value.
   */
  getMember(name) {
    return this.getParameter(name)
  }

  /**
   * Returns the name of all parameters in StructParameter.
   *
   * @return {array} - The return value.
   */
  getMemberNames() {
    const names = []
    for (let i = 0; i < this.__members.length; i++) {
      const member = this.__members[i]
      if (member != null) names[i] = member.getName()
    }
    return names
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const members = []
    for (const p of this.__members) members.push(p.toJSON(context))
    return {
      members,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.members == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }

    for (let i = 0; i < j.members.length; i++) {
      if (j.members[i]) {
        this.__members[i].fromJSON(j.members[i], context)
      }
    }
  }

  // ////////////////////////////////////////
  // Destroy

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy()
    for (const p of this.__members) p.destroy()
  }
}

Registry.register('StructParameter', StructParameter)

export { StructParameter }
