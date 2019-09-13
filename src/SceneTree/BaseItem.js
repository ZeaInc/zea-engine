import { Vec2, Vec3, Color } from '../Math';
import { Signal } from '../Utilities';
import { sgFactory } from './SGFactory.js';

import { ValueSetMode } from './Parameters/Parameter.js';
import { ParameterOwner } from './ParameterOwner.js';

const ItemFlags = {
  USER_EDITED: 1 << 1,
  IGNORE_BBOX: 1 << 2,
  BIN_NODE: 1 << 3, // This node was generated when loading a binary file.
};
let numBaseItems = 0;

class BaseItem extends ParameterOwner {
  constructor(name) {
    super();
    if (name == undefined) name = sgFactory.getClassName(this);
    this.__name = name;
    this.__path = [name];
    this.__ownerItem = undefined; // TODO: will create a circular ref. Figure out and use weak refs
    this.__flags = 0;

    this.__metaData = {};

    this.nameChanged = new Signal();
    // this.flagsChanged = new Signal();

    this.parameterValueChanged.connect((param, mode) => {
      if (mode == ValueSetMode.USER_SETVALUE) {
        this.setFlag(ItemFlags.USER_EDITED);
      }
    });

    numBaseItems++;
  }

  destroy() {
    super.destroy();
  }

  clone(flags) {
    throw this.constructor.name + ' does not implment its clone method';
  }

  copyFrom(src, flags) {
    super.copyFrom(src, flags);
    this.setName(src.getName());
  }

  // ////////////////////////////////////////
  // Name and Path

  getName() {
    return this.__name;
  }

  setName(name) {
    if (this.__name != name) {
      const oldName = this.__name;
      this.__name = name;
      this.__updatePath();
      this.nameChanged.emit(name, oldName);
    }
  }

  __updatePath() {
    if (this.__ownerItem == undefined) this.__path = [this.__name];
    else {
      this.__path = this.__ownerItem.getPath().slice();
      this.__path.push(this.__name);
    }
  }

  getPath() {
    return this.__path;
  }

  // ////////////////////////////////////////
  // Flags

  setFlag(flag) {
    this.__flags |= flag;
    // this.flagsChanged.emit(this.__flags);
  }

  testFlag(flag) {
    return (this.__flags & flag) != 0;
  }

  // ////////////////////////////////////////
  // Path Traversial

  resolvePath(path, index) {
    if (index == path.length) {
      return this;
    }
    if (path[index] == '>' && index == path.length - 1) {
      return this.getParameter(path[index + 1]);
    }

    // Maybe the name is a parameter name.
    const param = this.getParameter(path[index]);
    if (param) {
      return param;
    }
    throw 'Invalid path:' + path + ' member not found';
  }

  // ////////////////////////////////////////
  // Owner Item

  getOwner() {
    // return this.__private.get('ownerItem');
    return this.__ownerItem;
  }

  setOwner(ownerItem) {
    // this.__private.set(ownerItem, ownerItem);
    if (this.__ownerItem !== ownerItem) {
      // Note: to avoid having no owners for a moment
      // we add the new owner first, then remove the previous
      // So we have 2 owners for brief moment.
      const prevOwner = this.__ownerItem;

      this.__ownerItem = ownerItem;
      if (this.__ownerItem) {
        this.addRef(this.__ownerItem);
      }
      if (prevOwner) {
        this.removeRef(prevOwner);
      }
      this.__updatePath();
    }
  }

  // ////////////////////////////////////////
  // Metadata

  getMetadata(key) {
    return this.__metaData[key];
  }

  hasMetadata(key) {
    return key in this.__metaData;
  }

  setMetadata(key, metaData) {
    this.__metaData[key] = metaData;
  }

  deleteMetadata(key) {
    delete this.__metaData[key];
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    let j = super.toJSON(context, flags);
    if (!j && this.testFlag(ItemFlags.USER_EDITED)) j = {};
    if (j) {
      j.name = this.__name;

      // Binary Tree nodes should only be re-created
      // by loading binary data. The JSON tree just stores
      // modifications to those items, and if, when loading
      // the node no longer exists, then the json loader
      // simply keeps going. (no errors).
      if (!this.testFlag(ItemFlags.BIN_NODE))
        j.type = sgFactory.getClassName(this);
    }
    return j;
  }

  fromJSON(j, context, flags) {
    if (j.name) this.__name = j.name;
    super.fromJSON(j, context, flags);
    // Note: JSON data is only used to store user edits, so
    // parameters loaded from JSON are considered user edited.
    this.__flags |= ItemFlags.USER_EDITED;
  }

  readBinary(reader, context) {
    const type = reader.loadStr();
    this.setName(reader.loadStr());

    // Note: parameters follow name...
    super.readBinary(reader, context);
  }

  toString() {
    return JSON.stringify(this.toJSON(), null, 2);
  }

  getNumBaseItems() {
    return numBaseItems;
  }
}

export { ItemFlags, BaseItem };
