import { Signal } from '../../Utilities';
import { RefCounted } from '../RefCounted';
import { sgFactory } from '../SGFactory';

const ValueGetMode = {
  NORMAL: 0,
  OPERATOR_GETVALUE: 1,
};

// Note: In some cases we want the parameter to emit a notification
// and cause the update of the scene during evaluation. (like statemahcine updates).
// But we also don't want the parameter value to then
// be considered modified so it is saved to the JSON file. I'm not sure how to address this.
// We need to check what happens if a parameter emits a 'valueChanged' during cleaning. (maybe it gets ignored)
const ValueSetMode = {
  USER_SETVALUE: 0,
  OPERATOR_SETVALUE: 1 /* No events*/,
  SILENT: 1,
  DATA_LOAD: 2 /* Generate events, but don't flag the parameter as user edited*/,
  OPERATOR_DIRTIED: 3 /* Generate events, but don't flag the parameter as user edited*/,
  STATEMACHINE_SETVALUE: 4 /* Generate events, but don't flag the parameter as user edited*/,
};
const ParamFlags = {
  USER_EDITED: 1 << 1,
  DISABLED: 1 << 2,
};

class BaseParameter extends RefCounted {
  constructor(name) {
    super();
    this.__name = name;
    this.__cleanerFns = [];
    this.__flags = 0;

    this.valueChanged = new Signal();
    this.nameChanged = new Signal();

    this.getName = this.getName.bind(this);
    this.setName = this.setName.bind(this);
    this.getValue = this.getValue.bind(this);
    this.setValue = this.setValue.bind(this);
  }

  getName() {
    return this.__name;
  }

  setName(name) {
    if (name != this.__name) {
      const prevName = this.__name;
      this.__name = name;
      this.nameChanged.emit(this.__name, prevName);
    }
  }

  getOwner() {
    return this.getRefer(0);
  }

  addOwner(ownerItem) {
    this.addRef(ownerItem);
  }

  getPath() {
    const owner = this.getOwner();
    if (owner && owner.getName) {
      if (owner.getPath) {
        const path = owner.getPath().slice();
        path.push(this.__name);
        return path;
      } else {
        return [owner.getName(), this.__name];
      }
    }
    return [this.__name];
  }

  setFlag(flag) {
    this.__flags |= flag;
  }

  clearFlag(flag) {
    this.__flags &= ~flag;
  }

  testFlag(flag) {
    return (this.__flags & flag) != 0;
  }

  getValue() {
    // TODO
  }

  setValue(value) {
    // TODO
  }

  setDirty(cleanerFn) {
    // If already dirty, simply return.
    if (this.__cleanerFns.indexOf(cleanerFn) != -1) {
      return false;
    }
    this.__cleanerFns.push(cleanerFn);

    this.valueChanged.emit(ValueSetMode.OPERATOR_DIRTIED); // changed via cleaner fn
    return true;
  }

  setEnabled(state) {
    if (state) this.setFlag(ParamFlags.DISABLED);
    else this.clearFlag(ParamFlags.DISABLED);
  }

  isEnabled() {
    this.testFlag(ParamFlags.DISABLED);
  }

  isDirty() {
    return this.__cleanerFns.length > 0;
  }

  _clean() {
    // Clean the param before we start evaluating the connected op.
    // this is so that operators can read from the current value
    // to compute the next.
    const fns = this.__cleanerFns;
    this.__cleanerFns = [];
    for (const fn of fns) {
      const res = fn(this.__value);
      if (res != undefined) this.__value = res;
    }
  }

  removeCleanerFn(cleanerFn) {
    const index = this.__cleanerFns.indexOf(cleanerFn);
    if (index == -1) {
      // Note: when a getValue is called, first the cleaners array is reset
      // and then the cleaners are called (see above)
      // When an operator is applied to multiple outputs, then one of the outputs
      // already has its cleaners array reset.
      // Due to the asynchronous nature of evaluate, multiple cleanings might occur
      // throw ("Error. Cleaner Fn not applied to this parameter:" + cleanerFn.name);

      return 0;
    }
    this.__cleanerFns.splice(index, 1);
  }

  clone(flags) {
    console.error('TOOD: implment me');
  }

  destroy() {
    // Note: some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // e.g. freeing GPU Memory.
  }
}

class Parameter extends BaseParameter {
  constructor(name, value, dataType) {
    super(name);
    this.__value = value;
    this.__dataType = dataType ? dataType : value.constructor.name;
  }

  getDataType() {
    return this.__dataType;
  }

  getValue(mode = ValueGetMode.NORMAL) {
    if (mode == ValueGetMode.NORMAL && this.__cleanerFns.length > 0)
      this._clean();
    return this.__value;
  }

  setValue(value, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
    if (this.__cleanerFns.length > 0) {
      // Note: This message has not highlighted any real issues, and has become verbose.
      // Enable if suspicious of operators being trampled by setValues.
      // if(mode==0){
      //     let cleanerNames = [];
      //     for(let fn of this.__cleanerFns) {
      //         cleanerNames.push(fn.name);
      //     }
      //     console.warn("Error setting "+this.__name + " value when cleaner is assigned:"+ cleanerNames);
      // }
      this.__cleanerFns = [];
    }

    // if (value == undefined) {
    //     throw ("Invalud valu for setvalue.");
    // }

    if (!value.fromJSON) {
      // Note: equality tests on anything but simple values is going to be suer expenseive.
      if (this.__value == value) return;
    }
    this.__value = value;
    if (mode == ValueSetMode.USER_SETVALUE)
      this.setFlag(ParamFlags.USER_EDITED);

    // During the cleaning process, we don't want notifications.
    if (mode != ValueSetMode.OPERATOR_SETVALUE) this.valueChanged.emit(mode);
  }

  clone(flags) {
    const clonedValue = this.__value;
    if (clonedValue.clone) clonedValue = clonedValue.clone();
    const clonedParam = new Parameter(
      this.__name,
      clonedValue,
      this.__dataType
    );
    return clonedParam;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if (this.__value.toJSON)
      return { value: this.__value.toJSON(context, flags) };
    else return { value: this.__value };
  }

  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.setFlag(ParamFlags.USER_EDITED);

    if (j.value.type && this.__value == undefined) {
      this.__value = sgFactory.constructClass(j.value.type);
    }
    if (this.__value == undefined || !this.__value.fromJSON)
      this.setValue(j.value, ValueSetMode.DATA_LOAD);
    else {
      this.__value.fromJSON(j.value, context);
      this.valueChanged.emit(ValueSetMode.DATA_LOAD);
    }
  }

  readBinary(reader, context) {
    console.error('TODO');
  }
}

export { ParamFlags, ValueGetMode, ValueSetMode, BaseParameter, Parameter };
