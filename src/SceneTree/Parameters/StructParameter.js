import { ParamFlags, ValueSetMode, Parameter } from './Parameter.js';

class StructParameter extends Parameter {
  constructor(name) {
    super(name, {}, 'Struct');
    this.__members = [];
  }

  _addMember(parameter) {
    this.__value[parameter.getName()] = parameter.getValue();
    parameter.valueChanged.connect(() => {
      this.__value[parameter.getName()] = parameter.getValue();
    });
    this.__members.push(parameter);
    this.__flags |= ParamFlags.USER_EDITED;
    this.valueChanged.emit();
    return parameter;
  }

  getParameter(name) {
    for (const p of this.__members) {
      if (p.getName() == name) return p;
    }
  }
  getMember(name) {
    return this.getParameter(name);
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return;
    const members = [];
    for (const p of this.__members) members.push(p.toJSON(context, flags));
    return {
      members,
    };
  }

  fromJSON(j, context, flags) {
    if (j.members == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.__flags |= ParamFlags.USER_EDITED;

    for (let i = 0; i < j.members.length; i++) {
      if (j.members[i]) {
        this.__members[i].fromJSON(j.members[i], context);
      }
    }
  }

  destroy() {
    super.destroy();
    for (const p of this.__members) p.destroy();
  }
}

export { StructParameter };
