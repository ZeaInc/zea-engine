import { Registry } from '../../Registry'
import { Parameter } from './Parameter.js'

/**
 * A Parameter for storing list(array) values.
 *
 * i.e.:
 * ```javascript
 * const listParam = new ListParameter('MyList', GearParameter)
 * //'myParameterOwnerItem' is an instance of a 'ParameterOwner' class.
 * // Remember that only 'ParameterOwner' and classes that extend from it can host 'Parameter' objects.
 * myParameterOwnerItem.addParameter(listParam)
 * ```
 *
 * **Events**
 * * **valueChanged:** Triggered when setting a value changes in the array(insert, add, remove).
 * * **elementAdded:** Triggered when an element is added to the array(add, insert).
 * * **elementRemoved:** Triggered when an element is removed from the array
 *
 * @extends Parameter
 */
class ListParameter extends Parameter {
  /**
   * Create a list parameter.
   * @param {string} name - The name of the list parameter.
   * @param {string|Parameter} dataType - The dataType value.
   */
  constructor(name, dataType) {
    super(name, [])
    this.__dataType = dataType
  }

  /**
   * The __filter method.
   * @param {string|Parameter} item - The item value.
   * @return {boolean} - The return value.
   *
   * @private
   */
  __filter(item) {
    return true
  }

  /**
   * Returns the count of items in the array.
   *
   * @return {number} - The return value.
   */
  getCount() {
    return this.__value.length
  }

  /**
   * Returns value from the array in the specified index.
   *
   * @param {number} index - The index value.
   * @return {Parameter|string} - The return value.
   */
  getElement(index) {
    return this.__value[index]
  }

  /**
   * Sets a value in the specified array's index.
   *
   * @param {number} index - The index value.
   * @param {string|Parameter} value - The value value.
   */
  setElement(index, value) {
    this.__value[index] = value
    this.emit('valueChanged', {})
  }

  /**
   * Adds a new element at the end of the array pile.
   *
   * @param {string|Parameter} elem - The elem value.
   * @return {string|Parameter} - The return value.
   */
  addElement(elem) {
    if (elem == undefined) elem = new this.__dataType()
    else {
      if (!this.__filter(elem)) return
    }

    this.__value.push(elem)
    this.emit('elementAdded', { elem, index: this.__value.length - 1 })
    this.emit('valueChanged', {})
    return elem
  }

  /**
   * Removes an array element from the specified index
   *
   * @param {number} index - The index value.
   */
  removeElement(index) {
    const elem = this.__value[index]
    this.__value.splice(index, 1)
    this.emit('elementRemoved', { elem, index })
    this.emit('valueChanged', {})
  }

  /**
   * Inserts a new element in the specified index.
   *
   * @param {number} index - The index value.
   * @param {string|Parameter} elem - The elem value.
   */
  insertElement(index, elem) {
    if (!this.__filter(elem)) return
    this.__value.splice(index, 0, elem)
    // this.setValue(this.__value);
    this.emit('elementAdded', { elem, index })
    this.emit('valueChanged', {})
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
    const items = []
    for (const p of this.__value) {
      if (typeof this.__dataType === 'string') items.push(p)
      else items.push(p.toJSON(context))
    }
    return {
      items,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.items == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }

    this.__value = []
    for (let i = 0; i < j.items.length; i++) {
      let elem
      if (typeof this.__dataType === 'string') {
        elem = j.items[i]
      } else {
        console.log(this.__dataType)
        elem = new this.__dataType()
        elem.fromJSON(j.items[i], context)
      }
      this.__value.push(elem)
      this.emit('elementAdded', { elem, index: this.__value.length - 1 })
    }
    this.emit('valueChanged', { mode: 0 })
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new list parameter, copies its values
   * from this parameter and returns it.
   *
   * @return {ListParameter} - Returns a new list parameter.
   */
  clone() {
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

Registry.register('ListParameter', ListParameter)

export { ListParameter }
