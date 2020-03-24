import { Signal } from '../../Utilities/index'
import { ValueSetMode, ParamFlags, Parameter } from './Parameter.js'

/** Class representing a list parameter.
 * @extends Parameter
 */
class ListParameter extends Parameter {
  /**
   * Create a list parameter.
   * @param {string} name - The name of the list parameter.
   * @param {any} dataType - The dataType value.
   */
  constructor(name, dataType) {
    super(name, [])
    this.__dataType = dataType
    this.elementAdded = new Signal()
    this.elementRemoved = new Signal()
  }

  /**
   * The __filter method.
   * @param {any} item - The item value.
   * @return {boolean} - The return value.
   * @private
   */
  __filter(item) {
    return true
  }

  /**
   * The getCount method.
   * @return {any} - The return value.
   */
  getCount() {
    return this.__value.length
  }

  /**
   * The getElement method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getElement(index) {
    return this.__value[index]
  }

  /**
   * The setElement method.
   * @param {number} index - The index value.
   * @param {any} value - The value value.
   */
  setElement(index, value) {
    this.__value[index] = value
    this.valueChanged.emit(ValueSetMode.USER_SETVALUE)
  }

  /**
   * The addElement method.
   * @param {any} elem - The elem value.
   * @return {any} - The return value.
   */
  addElement(elem) {
    if (elem == undefined) elem = new this.__dataType()
    else {
      if (!this.__filter(elem)) return
    }

    this.__value.push(elem)
    this.__flags |= ParamFlags.USER_EDITED
    this.elementAdded.emit(elem, this.__value.length - 1)
    this.valueChanged.emit(ValueSetMode.USER_SETVALUE)
    return elem
  }

  /**
   * The removeElement method.
   * @param {number} index - The index value.
   */
  removeElement(index) {
    const elem = this.__value[index]
    this.__value.splice(index, 1)
    this.__flags |= ParamFlags.USER_EDITED
    this.elementRemoved.emit(elem, index)
    this.valueChanged.emit(ValueSetMode.USER_SETVALUE)
  }

  /**
   * The insertElement method.
   * @param {any} index - The index value.
   * @param {any} elem - The elem value.
   */
  insertElement(index, elem) {
    if (!this.__filter(elem)) return
    this.__value.splice(index, 0, elem)
    // this.setValue(this.__value);
    this.__flags |= ParamFlags.USER_EDITED
    this.elementAdded.emit(elem, index)
    this.valueChanged.emit(ValueSetMode.USER_SETVALUE)
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return
    const items = []
    for (const p of this.__value) {
      if (typeof this.__dataType === 'string') items.push(p)
      else items.push(p.toJSON(context, flags))
    }
    return {
      items,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.items == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }
    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.__flags |= ParamFlags.USER_EDITED

    this.__value = []
    for (let i = 0; i < j.items.length; i++) {
      let elem
      if (typeof this.__dataType === 'string') {
        elem = j.items[i]
      } else {
        elem = new this.__dataType()
        elem.fromJSON(j.items[i], context)
      }
      this.__value.push(elem)
      this.elementAdded.emit(elem, this.__value.length - 1)
    }
    this.valueChanged.emit(ValueSetMode.DATA_LOAD)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new list parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {ListParameter} - Returns a new list parameter.
   */
  clone(flags) {
    const clonedValue = this.__value.slice(0)
    const clonedParam = new ListParameter(this.__name, this.__dataType)
    clonedParam.setValue(clonedValue)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    for (let i = 0; i < this.__value.length; i++) {
      if (this.__value[i] instanceof Parameter) this.__value[i].destroy()
      this.removeElement(i)
    }
  }
}

export { ListParameter }
