import { sgFactory } from '../SGFactory.js';
import { Parameter } from './Parameter.js';
import { QueryParameter } from './QueryParameter.js';

/** Class representing a query set parameter.
 * @extends Parameter
 */
class QuerySet extends Parameter {
  /**
   * Create a query set parameter.
   * @param {string} name - The name of the query set parameter.
   */
  constructor(name) {
    super(name, undefined, 'QueryParameter');
    this.__items = new Set();
  }

  /**
   * The getItem method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getItem(index) {
    return Array.from(this.__items)[index];
  }

  /**
   * The addItem method.
   * @param {any} item - The item value.
   * @param {boolean} emit - The emit value.
   * @return {any} - The return value.
   */
  addItem(item, emit = true) {
    if (this.__filterFn && !this.__filterFn(item)) return false;
    item.valueChanged.connect(this.valueChanged.emit);
    this.__items.add(item);
    if (emit) this.valueChanged.emit();
    return Array.from(this.__items).indexOf(item);
  }

  /**
   * The removeItem method.
   * @param {any} item - The item value.
   * @param {boolean} emit - The emit value.
   * @return {any} - The return value.
   */
  removeItem(item, emit = true) {
    const items = Array.from(this.__items);
    const index = items.indexOf(item);
    items[index].valueChanged.disconnect(this.valueChanged.emit);
    this.__items.delete(item);
    if (emit) this.valueChanged.emit();
    return index;
  }

  /**
   * The getNumItems method.
   * @return {any} - The return value.
   */
  getNumItems() {
    return Array.from(this.__items).length;
  }

  /**
   * The getValue method.
   * @return {any} - The return value.
   */
  getValue() {
    return this.__items;
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {any} - The return value.
   */
  toJSON(context, flags) {
    return {};
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {}

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new query set parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {QuerySet} - Returns a new query set parameter.
   */
  clone(flags) {
    const clonedParam = new QuerySet(this.__name, this.__filterFn);
    return clonedParam;
  }
}

sgFactory.registerClass('QuerySet', QuerySet);

export { QuerySet };
