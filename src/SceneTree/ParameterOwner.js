import { Vec2, Vec3, Color } from '../Math';
import { Signal } from '../Utilities';

import { RefCounted } from './RefCounted.js';

import { sgFactory } from './SGFactory.js';

// Explicit impport of files to avoid importing all the parameter types.
// Note: soon these imports should be removed, once all code avoids calling
// 'addPArameter' without the parameter instance.
import { Parameter, ParamFlags } from './Parameters/Parameter.js';
import { NumberParameter } from './Parameters/NumberParameter.js';
import { Vec2Parameter } from './Parameters/Vec2Parameter.js';
import { Vec3Parameter } from './Parameters/Vec3Parameter.js';
import { ColorParameter } from './Parameters/ColorParameter.js';

class ParameterOwner extends RefCounted {
  constructor() {
    super();

    this.__params = [];
    this.__paramMapping = {};
    this.__paramSignalIds = {};

    // Paramters are not intended to be dynamic.
    // Instead they are part of the mixin architecture.
    // Note: Materials add/remove paramters when the
    // shader name is changed.
    this.parameterAdded = new Signal();
    this.parameterRemoved = new Signal();
    this.parameterValueChanged = new Signal();
  }

  copyFrom(src, flags) {
    // Note: Loop over the parameters in reverse order,
    // this is because often, parameter depdenencies
    // are bottom to top. (bottom params dependent on higher params)
    // This means that as a parameter is set with a new value
    // it will dirty the params below it.
    let i = src.numParameters();
    while (i--) {
      const srcParam = src.getParameterByIndex(i);
      const param = this.getParameter(srcParam.getName());
      if (param) {
        // Note: we are not cloning the values.
        param.setValue(srcParam.getValue(), 2);
      } else {
        this.addParameter(srcParam.clone());
      }
    }
  }

  // ////////////////////////////////////////
  // Params

  numParameters() {
    return this.__params.length;
  }

  getParameters() {
    return this.__params;
  }

  getParameterIndex(paramName) {
    return this.__paramMapping[paramName];
  }

  getParameterByIndex(index) {
    return this.__params[index];
  }

  hasParameter(paramName) {
    return paramName in this.__paramMapping;
  }

  getParameter(paramName) {
    const index = this.__paramMapping[paramName];
    if (index == -1) return null;
    return this.__params[index];
  }

  // This method can be overrridden in derived classes
  // to perform general updates. (see GLPass)
  __parameterValueChanged(param, mode) {
    this.parameterValueChanged.emit(param, mode);
  }

  addParameter(param) {
    const name = param.getName();
    if (this.__paramMapping[name] != undefined) {
      console.warn('Replacing Parameter:' + name);
      this.removeParameter(name);
    }
    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.__parameterValueChanged(param, mode)
    );
    param.addRef(this);
    this.__params.push(param);
    this.__paramMapping[name] = this.__params.length - 1;
    this.parameterAdded.emit(name);
    return param;
  }

  insertParameter(param, index) {
    const name = param.getName();
    if (this.__paramMapping[name] != undefined) {
      console.warn('Replacing Parameter:' + name);
      this.removeParameter(name);
    }
    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.__parameterValueChanged(param, mode)
    );
    param.addRef(this);
    this.__params.splice(index, 0, param);

    const paramMapping = {};
    for (let i = 0; i < this.__params.length; i++) {
      paramMapping[this.__params[i].getName()] = i;
    }
    this.__paramMapping = paramMapping;
    this.parameterAdded.emit(name);
    return param;
  }

  removeParameter(name) {
    if (this.__paramMapping[name] == undefined) {
      console.throw('Unable to Remove Parameter:' + name);
    }
    const index = this.__paramMapping[name];
    const param = this.__params[this.__paramMapping[name]];
    param.removeRef(this);
    param.valueChanged.disconnectId(this.__paramSignalIds[name]);
    this.__params.splice(index, 1);
    const paramMapping = {};
    for (let i = 0; i < this.__params.length; i++) {
      paramMapping[this.__params[i].getName()] = i;
    }
    this.__paramMapping = paramMapping;
    this.parameterRemoved.emit(name);
  }

  replaceParameter(param) {
    const name = param.getName();
    const index = this.__paramMapping[name];
    const prevparam = this.__params[this.__paramMapping[name]];
    prevparam.removeRef(this);
    prevparam.valueChanged.disconnectId(this.__paramSignalIds[name]);

    param.addRef(this);
    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.parameterValueChanged.emit(param, mode)
    );
    this.__params[index] = param;
    return param;
  }

  // _removeAllParameters(){
  //     for (let i=this.__params.length-1; i>=0; i--) {
  //         this.removeParameter(i);
  //     }
  // }

  addCommand(command) {
    const name = command.getName();
    command.setOwner(this);
    this.__params.push(command);
    this.__paramMapping[name] = this.__params.length - 1;
    return command;
  }
  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const paramsJSON = {};
    let savedParams = 0;
    for (const param of this.__params) {
      if (!param.testFlag(ParamFlags.USER_EDITED)) continue;
      if (param.numRefs() > 1 && param.getRefIndex(this) != 0) {
        paramsJSON[param.getName()] = {
          paramPath: context.makeRelative(param.getPath()),
        };
        savedParams++;
      } else {
        const paramJSON = param.toJSON(context, flags);
        if (paramJSON) {
          paramsJSON[param.getName()] = paramJSON;
          savedParams++;
        }
      }
    }
    if (savedParams > 0) return { params: paramsJSON };
  }

  fromJSON(j, context, flags) {
    if (j.params) {
      for (const key in j.params) {
        const pj = j.params[key];
        const param = this.getParameter(key);
        if (!param) console.warn('Param not found:' + key);
        else {
          if (pj.paramPath) {
            context.resolvePath(
              pj.paramPath,
              param => {
                this.replaceParameter(param);
              },
              reason => {
                console.warn(
                  'Unable to resolve shared parameter:' + pj.paramPath
                );
              }
            );
          } else {
            param.fromJSON(pj, context);
          }
        }
      }
    }
  }

  readBinary(reader, context) {
    // TODO: make this work

    if (context.version >= 3) {
      const numProps = reader.loadUInt32();
      for (let i = 0; i < numProps; i++) {
        const propType = reader.loadStr();
        const propName = reader.loadStr();
        let param = this.getParameter(propName);
        if (!param) {
          param = sgFactory.constructClass(propType, propName);
          if (!param) {
            console.error(
              'Unable to construct prop:' + propName + ' of type:' + propType
            );
            continue;
          }
          this.addParameter(param);
        }
        param.readBinary(reader, context);
      }
    }
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  destroy() {
    for (const param of this.__params) {
      param.destroy();
    }
    super.destroy();
  }
}

export { ParameterOwner };
