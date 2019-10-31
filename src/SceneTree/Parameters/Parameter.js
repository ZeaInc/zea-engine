import { Signal } from '../../Utilities';
import { RefCounted } from '../RefCounted';
import { sgFactory } from '../SGFactory';

const ValueGetMode = {
  NORMAL: 0,
  OPERATOR_GETVALUE: 1,
};

// Note: In some cases we want the parameter to emit a notification
// and cause the update of the scene during evaluation (like statemachine updates).
// But we also don't want the parameter value to then
// be considered modified so it is saved to the JSON file. I'm not sure how to address this.
// We need to check what happens if a parameter emits a 'valueChanged' during cleaning (maybe it gets ignored).
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

/** Class representing a base parameter.
 * @extends RefCounted
 */
class BaseParameter extends RefCounted {
  /**
   * Create a base parameter.
   * @param {string} name - The name of the base parameter.
   */
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

  /**
   * Getter for the base parameter name.
   * @return {string} - Returns the name.
   */
  getName() {
    return this.__name;
  }

  /**
   * Setter for the base parameter name.
   * @param {string} name - The base parameter name.
   */
  setName(name) {
    if (name != this.__name) {
      const prevName = this.__name;
      this.__name = name;
      this.nameChanged.emit(this.__name, prevName);
    }
  }

  /**
   * Getter for the owner of the parameter.
   * @return {any} - The return value.
   */
  getOwner() {
    return this.getRefer(0);
  }

  /**
   * Adds the owner of the parameter.
   * @param {any} ownerItem - The ownerItem value.
   */
  addOwner(ownerItem) {
    this.addRef(ownerItem);
  }

  /**
   * Getter for the parameter path.
   * @return {any} - The return value.
   */
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

  /**
   * The setFlag method.
   * @param {number} flag - The flag value.
   */
  setFlag(flag) {
    this.__flags |= flag;
  }

  /**
   * The clearFlag method.
   * @param {number} flag - The flag value.
   */
  clearFlag(flag) {
    this.__flags &= ~flag;
  }

  /**
   * Returns true if the flag if set, otherwise returns false.
   * @param {number} flag - The flag to test.
   * @return {boolean} - Returns a boolean indicating if the flag is set.
   */
  testFlag(flag) {
    return (this.__flags & flag) != 0;
  }

  /**
   * The getValue method (TODO).
   */
  getValue() {
    // TODO
  }

  /**
   * The getValue method (TODO).
   * @param {any} value - The value param.
   */
  setValue(value) {
    // TODO
  }

  /**
   * The setDirty method.
   * @param {any} cleanerFn - The cleanerFn value.
   * @return {boolean} - The return value.
   */
  setDirty(cleanerFn) {
    // If already dirty, simply return.
    if (this.__cleanerFns.indexOf(cleanerFn) != -1) {
      return false;
    }
    this.__cleanerFns.push(cleanerFn);

    this.valueChanged.emit(ValueSetMode.OPERATOR_DIRTIED); // changed via cleaner fn
    return true;
  }

  /**
   * The setEnabled method.
   * @param {any} state - The state value.
   */
  setEnabled(state) {
    if (state) this.setFlag(ParamFlags.DISABLED);
    else this.clearFlag(ParamFlags.DISABLED);
  }

  /**
   * The isEnabled method.
   */
  isEnabled() {
    this.testFlag(ParamFlags.DISABLED);
  }

  /**
   * The isDirty method.
   * @return {boolean} - Returns a boolean.
   */
  isDirty() {
    return this.__cleanerFns.length > 0;
  }

  /**
   * The _clean method.
   * @private
   */
  _clean() {
    // Clean the param before we start evaluating the connected op.
    // This is so that operators can read from the current value
    // to compute the next.
    const fns = this.__cleanerFns;
    this.__cleanerFns = [];
    for (const fn of fns) {
      const res = fn(this.__value);
      if (res != undefined) this.__value = res;
    }
  }

  /**
   * The removeCleanerFn method.
   * @param {any} cleanerFn - The cleanerFn value.
   * @return {number} - The return value.
   */
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

  /**
   * The clone method.
   * @param {number} flags - The flags value.
   */
  clone(flags) {
    console.error('TOOD: implment me');
  }

  /**
   * The destroy method.
   */
  destroy() {
    // Note: Some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // E.g. freeing GPU Memory.
  }
}

/** Class representing a parameter.
 * @extends BaseParameter
 */
class Parameter extends BaseParameter {
  /**
   * Create a parameter.
   * @param {string} name - The name of the parameter.
   * @param {any} value - The value of the parameter.
   * @param {any} dataType - The data type of the parameter.
   */
  constructor(name, value, dataType) {
    super(name);
    this.__value = value;
    this.__dataType = dataType ? dataType : value.constructor.name;
  }

  /**
   * The getDataType method.
   * @return {any} - The return value.
   */
  getDataType() {
    return this.__dataType;
  }

  /**
   * The getValue method.
   * @param {number} mode - The mode value.
   * @return {any} - The return value.
   */
  getValue(mode = ValueGetMode.NORMAL) {
    if (mode == ValueGetMode.NORMAL && this.__cleanerFns.length > 0)
      this._clean();
    return this.__value;
  }

  /**
   * The getValue method.
   * @param {any} value - The value param.
   * @param {number} mode - The mode param.
   */
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

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    if (this.__value.toJSON)
      return { value: this.__value.toJSON(context, flags) };
    else return { value: this.__value };
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
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

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    console.error('TODO');
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {Parameter} - Returns a new cloned parameter.
   */
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
}

export { ParamFlags, ValueGetMode, ValueSetMode, BaseParameter, Parameter };
