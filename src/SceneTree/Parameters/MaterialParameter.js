import { Signal } from '../../Utilities';
import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js';
import { materialLibraryManager } from '../MaterialLibraryManager.js';

class MaterialParameter extends Parameter {
  constructor(name, value) {
    super(name, value, 'Material');
    this.valueParameterValueChanged = new Signal();
  }

  clone(flags) {
    const clonedParam = new MaterialParameter(this.__name, this.__value);
    return clonedParam;
  }

  setValue(material, mode = ValueSetMode.USER_SETVALUE) {
    // 0 == normal set. 1 = changed via cleaner fn, 2=change by loading/cloning code.
    if (this.__value !== material) {
      if (this.__value) {
        this.__value.parameterValueChanged.disconnect(
          this.valueParameterValueChanged.emit
        );
        this.__value.removeRef(this);
      }
      this.__value = material;
      if (this.__value) {
        this.__value.addRef(this);
        this.__value.parameterValueChanged.connect(
          this.valueParameterValueChanged.emit
        );
      }
      if (mode == ValueSetMode.USER_SETVALUE)
        this.__flags |= ParamFlags.USER_EDITED;

      // During the cleaning process, we don't want notifications.
      if (mode != ValueSetMode.OPERATOR_SETVALUE) this.valueChanged.emit(mode);
    }
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return;
    return {
      value: this.__value.getPath(),
    };
  }

  fromJSON(j, context, flags) {
    if (j.value == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    const materialPath = j.value;

    const material = materialLibraryManager.resolveMaterialFromPath(
      materialPath
    );
    if (material) this.setValue(material);
    this.__flags |= ParamFlags.USER_EDITED;
  }

  destroy() {
    // Note: some parameters hold refs to geoms/materials,
    // which need to be explicitly cleaned up.
    // e.g. freeing GPU Memory.

    if (this.__value) {
      this.__value.parameterValueChanged.disconnect(
        this.valueParameterValueChanged.emit
      );
      this.__value.removeRef(this);
    }
  }
}

export { MaterialParameter };
