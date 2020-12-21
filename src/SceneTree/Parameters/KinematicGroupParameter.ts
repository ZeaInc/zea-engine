import { ListParameter } from './ListParameter.js'
import { TreeItemParameter } from './TreeItemParameter.js'

/** This class is deprecated. Use Groups instead.
 * Class representing a kinematic group parameter.
 * @extends ListParameter
 * @private
 */
class KinematicGroupParameter extends ListParameter {
  __cleanerFn: any;
  __dataType: any;
  __deltaXfos: any;
  __globalXfoParams: any;
  __initialXfos: any;
  __name: any;
  __value: any;
  /**
   * Create a kinematic group parameter.
   * @param {string} name - The name of the kinematic group parameter.
   */
  constructor(name: any) {
    console.error('This class is deprecated. Use Groups instead.')
    super(name, TreeItemParameter)
    this.__globalXfoParams = []
    this.__initialXfos = []
    this.__deltaXfos = []
    this.on('elementAdded', (event: any) => {
      const globaXfoParam = event.elem.getParameter('GlobalXfo')
      this.__globalXfoParams[event.index] = globaXfoParam
      this.__initialXfos[event.index] = globaXfoParam.getValue()
      if (event.index > 0)
        this.__deltaXfos[event.index] = this.__initialXfos[0].inverse().multiply(this.__initialXfos[event.index])
    })
    this.on('elementRemoved', (event: any) => {
      this.__globalXfoParams.splice(event.index, 1)
      this.__initialXfos.splice(event.index, 1)
      this.__deltaXfos.splice(event.index, 1)
    })
  }

  /**
   * The __filter method.
   * @param {any} item - The item value.
   * @return {any} - The return value.
   * @private
   */
  __filter(item: any) {
    // console.log(item.getPath())
    return !this.__value.includes(item)
  }

  /**
   * The getInitialXfo method.
   * @return {any} - The return value.
   */
  getInitialXfo() {
    if (this.__value.length > 0) return this.__initialXfos[0]
  }

  /**
   * The getXfo method.
   * @return {Xfo} - The xfo value.
   */
  getXfo() {
    if (this.__value.length > 0) return this.__value[0].getParameter('GlobalXfo').getValue()
  }

  /**
   * The getXfo method.
   * @param {any} xfo - The xfo value.
   */
  setXfo(xfo: any) {
    if (this.__value.length > 0) {
      this.__value[0].getParameter('GlobalXfo').setValue(xfo)
      for (let i = 1; i < this.__value.length; i++) {
        this.__value[i].getParameter('GlobalXfo').setValue(xfo.multiply(this.__deltaXfos[i]))
      }
    }
  }

  /**
   * The setDirty method.
   * @param {any} cleanerFn - The cleanerFn value.
   * @return {any} - The return value.
   */
  setDirty(cleanerFn: any) {
    this.__cleanerFn = cleanerFn
    for (const p of this.__globalXfoParams) {
      p.setDirty(cleanerFn)
    }
    return true
  }

  /**
   * The removeCleanerFn method.
   * @param {any} cleanerFn - The cleanerFn value.
   */
  removeCleanerFn(cleanerFn: any) {
    for (const p of this.__globalXfoParams) {
      p.removeCleanerFn(cleanerFn)
    }
    this.__cleanerFn = undefined
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  // @ts-expect-error ts-migrate(2416) FIXME: Property 'toJSON' in type 'KinematicGroupParameter... Remove this comment to see the full error message
  toJSON(context: any) {
    // return super.toJSON(context);
    const treeItems = []
    for (const p of this.__value) treeItems.push(context.makeRelative(p.getPath()))
    return {
      treeItems,
    }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j: any, context: any) {
    if (j.treeItems == undefined) {
      console.warn('Invalid Parameter JSON')
      return
    }

    for (let i = 0; i < j.treeItems.length; i++) {
      context.resolvePath(
        j.treeItems[i],
        (treeItem: any) => {
          this.__value.push(treeItem)
          this.emit('elementAdded', {
            elem: treeItem,
            index: this.__value.length - 1,
          })
        },
        () => {
          // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'pj'.
          console.warn('Unable to resolve Kinematic Group Member:' + pj.paramPath)
        }
      )
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new kinematic group parameter,
   * copies its values from this parameter and returns it.
   * @return {FilePathParameter} - Returns a new cloned kinematic group parameter.
   */
  // @ts-expect-error ts-migrate(2416) FIXME: Property 'clone' in type 'KinematicGroupParameter'... Remove this comment to see the full error message
  clone() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'clonedValue'.
    const clonedParam = new KinematicGroupParameter(this.__name, clonedValue, this.__dataType)
    return clonedParam
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    for (let i = 0; i < this.__value.length; i++) {
      this.removeElement(i)
    }
  }
}

export { KinematicGroupParameter }
