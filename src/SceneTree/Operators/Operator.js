import { Signal } from '../../Utilities';
import { ValueGetMode, ValueSetMode } from '../Parameters';
import { sgFactory } from '../SGFactory';

import { BaseItem } from '../BaseItem.js';

class OperatorOutput {
  constructor(name, filterFn) {
    this.__name = name;
    this.__filterFn = filterFn;
    this._param = undefined;

    this.paramSet = new Signal();
  }

  getName() {
    return this.__name;
  }

  getFilterFn() {
    return this.__filterFn;
  }

  isConnected() {
    return this._param != undefined;
  }

  getParam() {
    return this._param;
  }

  setParam(param) {
    this._param = param;
    this.paramSet.emit();
  }

  getValue(mode = ValueSetMode.OPERATOR_GETVALUE) {
    if (this._param) return this._param.getValue(mode);
  }

  // Note: sometimes outputs are used in places like statemachines, where we would want the change to cause an event.
  setValue(value, mode = ValueSetMode.OPERATOR_SETVALUE) {
    if (this._param) {
      this._param.setValue(value, mode);
    }
  }

  setDirty(fn) {
    if (this._param) {
      this._param.setDirty(fn);
    }
  }

  removeCleanerFn(fn) {
    if (this._param) this._param.removeCleanerFn(fn);
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    return {
      type: this.constructor.name,
      paramPath: this._param
        ? context.makeRelative
          ? context.makeRelative(this._param.getPath())
          : this._param.getPath()
        : false,
    };
  }

  fromJSON(j, context, flags) {
    if (j.paramPath) {
      // Note: the tree should have fully loaded by the time we are loading operators
      // even new items and groups should have been created. Operators and state machines
      // are loaded last.
      context.resolvePath(
        j.paramPath,
        param => {
          this.setParam(param);
        },
        reason => {
          console.warn(
            "Operator Output: '" +
              this.getName() +
              "'. Unable to load item:" +
              j.paramPath
          );
        }
      );
    }
  }
}
sgFactory.registerClass('OperatorOutput', OperatorOutput);

class XfoOperatorOutput extends OperatorOutput {
  constructor(name) {
    super(name, p => p.getDataType() == 'Xfo');
  }

  getInitialValue() {
    return this._initialParamValue;
  }

  setParam(param) {
    // Note: sometimes the param value is changed after binding.
    // e.g. The group Xfo is updated after the operator
    // that binds to it is loaded. It could also change if a user
    // Is adding items to the group using the UI. Therefore, the
    // initial Xfo needs to be updated.
    const init = () => {
      this._initialParamValue = param.getValue();
      if (this._initialParamValue.clone)
        this._initialParamValue = this._initialParamValue.clone();

      if (this._initialParamValue == undefined) throw 'wTF?';
    };
    init();
    param.valueChanged.connect(mode => {
      if (mode == ValueSetMode.USER_SETVALUE || mode == ValueSetMode.DATA_LOAD)
        init();
    });

    this._param = param;
    this.paramSet.emit();
  }
}
sgFactory.registerClass('XfoOperatorOutput', XfoOperatorOutput);

class Operator extends BaseItem {
  constructor(name) {
    super(name);

    this.__outputs = [];
    this.__evalOutput = this.__evalOutput.bind(this);
    this.__opInputChanged = this.__opInputChanged.bind(this);
    this.parameterValueChanged.connect(this.__opInputChanged);

    this.postEval = new Signal();
  }

  addOutput(output) {
    this.__outputs.push(output);
    output.paramSet.connect(() => {
      output.setDirty(this.__evalOutput);
    });
    return output;
  }

  removeOutput(output) {
    this.__outputs.splice(this.__outputs.indexOf(output), 1);
  }

  getOutput(index) {
    return this.__outputs[index];
  }

  getOutputByName(name) {
    for (const o of this.__outputs) {
      if (o.getName() == name) return o;
    }
  }

  __evalOutput(cleanedParam /* value, getter*/) {
    for (const o of this.__outputs) {
      o.removeCleanerFn(this.__evalOutput);
    }
    this.evaluate();

    // Why does the cleaner need to return a value?
    // Usually operators are connected to multiple outputs.
    // return getter(1);
  }

  __opInputChanged() {
    // For each output, install a function to evalate the operator
    // Note: when the operator evaluates, it will remove the cleaners
    // on all outputs. This means that after the first operator to
    // cause an evaluation, all outputs are considered clean.
    for (const o of this.__outputs) o.setDirty(this.__evalOutput);
  }

  evaluate() {
    throw 'Not yet implemented';
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    j.type = sgFactory.getClassName(this);

    const oj = [];
    for (const o of this.__outputs) {
      oj.push(o.toJSON(context, flags));
    }

    j.outputs = oj;
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);

    if (j.outputs) {
      for (let i = 0; i < this.__outputs.length; i++) {
        const output = this.__outputs[i];
        output.fromJSON(j.outputs[i], context);
      }

      // Force an evaluation of the operator as soon as loading is done.
      context.addPLCB(() => {
        this.__opInputChanged();
      });
    }
  }

  destroy() {
    super.destroy();
    this.__outputs = [];
  }
}

export { Operator, OperatorOutput, XfoOperatorOutput };
// export default AssetItem;
