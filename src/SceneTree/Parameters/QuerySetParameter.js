import { sgFactory } from '../SGFactory.js';
import { Parameter } from './Parameter.js';
import { QueryParameter } from './QueryParameter.js';

class QuerySet extends Parameter {
  constructor(name) {
    super(name, undefined, 'QueryParameter');
    this.__items = new Set();
  }

  clone(flags) {
    const clonedParam = new QuerySet(this.__name, this.__filterFn);
    return clonedParam;
  }

  getItem(index) {
    return Array.from(this.__items)[index];
  }

  addItem(item, emit = true) {
    if (this.__filterFn && !this.__filterFn(item)) return false;
    item.valueChanged.connect(this.valueChanged.emit);
    this.__items.add(item);
    if (emit) this.valueChanged.emit();
    return Array.from(this.__items).indexOf(item);
  }

  removeItem(item, emit = true) {
    const items = Array.from(this.__items);
    const index = items.indexOf(item);
    items[index].valueChanged.disconnect(this.valueChanged.emit);
    this.__items.delete(item);
    if (emit) this.valueChanged.emit();
    return index;
  }

  getNumItems() {
    return Array.from(this.__items).length;
  }

  getValue() {
    return this.__items;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    return {};
  }

  fromJSON(j, context, flags) {}
}

sgFactory.registerClass('QuerySet', QuerySet);

export { QuerySet };
