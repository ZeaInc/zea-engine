import { Signal } from '../Utilities/index'

let counter = 0

/** Class representing a ref counted object. RefCounted
 *  objects track ownership and allow explicit cleanup
 *  of resources. This is necessary when JavaScript
 *  objects own references to GPU resources that need to
 *  be cleaned up when the JavaScript object is destroyed.
 */
class RefCounted {
  /**
   * Create a ref counted object.
   */
  constructor() {
    if (this.constructor.name == 'RefCounted') {
      throw new Error('RefCounted should not be instantiated directly.')
    }
    this.__id = ++counter
    this.__refs = []
    this.destructing = new Signal()
    this.__destroyed = false
  }

  /**
   * Returns the unique id of the object. Every Object has a unique
   * identifier which is based on a counter that is incremented.
   * @return {any} - The return value.
   */
  getId() {
    return this.__id
  }

  /**
   * The numRefs method.
   * @return {number} - The return value.
   */
  numRefs() {
    return this.__refs.length
  }

  /**
   * The addRef method.
   * @param {any} referer - The referer value.
   * @return {boolean} - The return value.
   */
  addRef(referer) {
    if (!referer)
      throw new Error('Error in RefCounted.addRef: Must provide a referer')

    // Note: an object can be reffeed multiple times.
    // e.g. we can create a temporary ref while we re-attach a tree item to a new parent.
    this.__refs.push(referer)
    return true
  }

  /**
   * The removeRef method.
   * @param {any} referer - The referer value.
   */
  removeRef(referer) {
    if (!referer)
      throw new Error('Error in RefCounted.removeRef: Must provide a referer')
    // console.log(this.constructor.name + " removeRef:" + referer.constructor.name);
    const index = this.__refs.indexOf(referer)
    if (index == -1)
      throw new Error(
        'Error in RefCounted.removeRef: referer not found in refs list.'
      )

    this.__refs.splice(index, 1)
    if (this.__refs.length == 0) {
      this.destroy()
    }
  }

  /**
   * The getRefer method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getRefer(index) {
    return this.__refs[index]
  }

  /**
   * The getRefIndex method.
   * @param {any} referer - The referer value.
   * @return {any} - The return value.
   */
  getRefIndex(referer) {
    return this.__refs.indexOf(referer)
  }

  /**
   * Returns true if this object has already been destroyed.
   * @return {boolean} - Returns true or false.
   */
  isDestroyed() {
    return this.__destroyed
  }

  /**
   * The destroy method is invoked when the last owner
   * is removed from a RefCounted object. Derived objects can
   * override this method to perform explicit cleanup.
   * The destructing signal is triggered so observers can
   * respond to this objects destruction.
   */
  destroy() {
    this.__destroyed = true
    // console.log(this.constructor.name + " destructing");
    this.destructing.emit(this)
  }
}
export { RefCounted }
