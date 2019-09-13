import { Signal } from '../../Utilities';
import {
  ParamFlags,
  ValueSetMode,
  Parameter,
  ListParameter,
} from './Parameter.js';

class TreeItemParameter extends Parameter {
  constructor(name, filterFn = undefined) {
    super(name, undefined, 'TreeItem');
    this.__filterFn = filterFn;
    this.treeItemGlobalXfoChanged = new Signal();
  }

  clone(flags) {
    const clonedParam = new TreeItemParameter(this.__name, this.__filterFn);
    return clonedParam;
  }

  setOwner(owner) {
    this.__owner = owner;
  }

  getOwner() {
    return this.__owner;
  }

  setFilterFn(flterFn) {
    this.__filterFn = filterFn;
  }

  getFilterFn() {
    return this.__filterFn;
  }

  setValue(treeItem, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
    if (this.__filterFn && !this.__filterFn(treeItem)) return false;
    if (this.__value !== treeItem) {
      if (this.__value) {
        this.__value.globalXfoChanged.disconnect(
          this.treeItemGlobalXfoChanged.emit
        );
        this.__value.removeRef(this);
      }
      this.__value = treeItem;
      if (this.__value) {
        this.__value.addRef(this);
        this.__value.globalXfoChanged.connect(
          this.treeItemGlobalXfoChanged.emit
        );
      }
      if (mode == ValueSetMode.USER_SETVALUE)
        this.__flags |= ParamFlags.USER_EDITED;
      this.valueChanged.emit(mode);
    }
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return;
    return {
      value: context.makeRelative(this.__value.getPath()),
    };
  }

  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    context.resolvePath(
      j.value,
      treeItem => {
        this.setValue(treeItem);
      },
      reason => {
        console.warn(
          'Unable to resolve tree item parameter value:' + pj.paramPath
        );
      }
    );
    this.__flags |= ParamFlags.USER_EDITED;
  }

  destroy() {
    if (this.__value) {
      this.__value.parameterValueChanged.disconnect(
        this.valueParameterValueChanged.emit
      );
      this.__value.removeRef(this);
    }
  }
}

export { TreeItemParameter /* ,
  TreeItemListParameter*/ };
