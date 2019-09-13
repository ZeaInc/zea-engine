import { Signal } from '../../Utilities';
import { ValueSetMode, ParamFlags, Parameter } from './Parameter.js';

class ListParameter extends Parameter {
  constructor(name, dataType) {
    super(name, []);
    this.__dataType = dataType;
    this.elementAdded = new Signal();
    this.elementRemoved = new Signal();
  }

  __filter(item) {
    return true;
  }

  getCount() {
    return this.__value.length;
  }

  getElement(index) {
    return this.__value[index];
  }

  setElement(index, value) {
    this.__value[index] = value;
    this.valueChanged.emit(ValueSetMode.USER_SETVALUE);
  }

  addElement(elem) {
    if (elem == undefined) elem = new this.__dataType();
    else {
      if (!this.__filter(elem)) return;
    }

    this.__value.push(elem);
    // this.setValue(this.__value);
    this.__flags |= ParamFlags.USER_EDITED;
    this.elementAdded.emit(elem, this.__value.length - 1);
    // this.valueChanged.emit(ValueSetMode.USER_SETVALUE);
    return elem;
  }

  removeElement(index) {
    const elem = this.__value[index];
    this.__value.splice(index, 1);
    // this.setValue(this.__value)
    this.__flags |= ParamFlags.USER_EDITED;
    this.elementRemoved.emit(elem, index);
    // this.valueChanged.emit(ValueSetMode.USER_SETVALUE);
  }

  insertElement(index, elem) {
    if (!this.__filter(elem)) return;
    this.__value.splice(index, 0, elem);
    // this.setValue(this.__value);
    this.__flags |= ParamFlags.USER_EDITED;
    this.elementAdded.emit(elem, index);
    // this.valueChanged.emit(ValueSetMode.USER_SETVALUE);
  }

  clone(flags) {
    const clonedValue = this.__value.slice(0);
    const clonedParam = new ListParameter(this.__name, this.__dataType);
    return clonedParam;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return;
    const items = [];
    for (const p of this.__value) {
      if (typeof this.__dataType === 'string') items.push(p);
      else items.push(p.toJSON(context, flags));
    }
    return {
      items,
    };
  }

  fromJSON(j, context, flags) {
    if (j.items == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.__flags |= ParamFlags.USER_EDITED;

    this.__value = [];
    for (let i = 0; i < j.items.length; i++) {
      let elem;
      if (typeof this.__dataType === 'string') {
        elem = j.items[i];
      } else {
        elem = new this.__dataType();
        elem.fromJSON(j.items[i], context);
      }
      this.__value.push(elem);
      this.elementAdded.emit(elem, this.__value.length - 1);
    }
    this.valueChanged.emit(ValueSetMode.DATA_LOAD);
  }

  destroy() {
    for (let i = 0; i < this.__value.length; i++) {
      if (this.__value[i] instanceof Parameter) this.__value[i].destroy();
      this.removeElement(i);
    }
  }
}

export { ListParameter };
