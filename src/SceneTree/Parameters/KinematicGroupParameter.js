import { ParamFlags, ValueSetMode } from './Parameter.js';

import { ListParameter } from './ListParameter.js';
import { TreeItemParameter } from './TreeItemParameter.js';

// This class is deprecated. Use Groups instead
class KinematicGroupParameter extends ListParameter {
  constructor(name) {
    console.error('This class is deprecated. Use Groups instead.');
    super(name, TreeItemParameter);
    this.__globalXfoParams = [];
    this.__initialXfos = [];
    this.__deltaXfos = [];
    this.elementAdded.connect((elem, index) => {
      const globaXfoParam = elem.getParameter('GlobalXfo');
      this.__globalXfoParams[index] = globaXfoParam;
      this.__initialXfos[index] = globaXfoParam.getValue();
      if (index > 0)
        this.__deltaXfos[index] = this.__initialXfos[0]
          .inverse()
          .multiply(this.__initialXfos[index]);
    });
    this.elementRemoved.connect((elem, index) => {
      this.__globalXfoParams.splice(index, 1);
      this.__initialXfos.splice(index, 1);
      this.__deltaXfos.splice(index, 1);
    });
  }

  __filter(item) {
    // console.log(item.getPath())
    return this.__value.indexOf(item) == -1;
  }

  getInitialXfo() {
    if (this.__value.length > 0) return this.__initialXfos[0];
  }

  getXfo(mode = 0) {
    if (this.__value.length > 0)
      return this.__value[0].getGlobalXfo((mode = 0));
  }

  setXfo(xfo, mode) {
    if (this.__value.length > 0) {
      this.__value[0].setGlobalXfo(xfo, mode);
      for (let i = 1; i < this.__value.length; i++) {
        this.__value[i].setGlobalXfo(xfo.multiply(this.__deltaXfos[i]), mode);
      }
    }
  }

  setDirty(cleanerFn) {
    this.__cleanerFn = cleanerFn;
    for (const p of this.__globalXfoParams) {
      p.setDirty(cleanerFn);
    }
    return true;
  }

  removeCleanerFn(cleanerFn) {
    for (const p of this.__globalXfoParams) {
      p.removeCleanerFn(cleanerFn);
    }
    this.__cleanerFn = undefined;
  }

  clone(flags) {
    const clonedParam = new KinematicGroupParameter(
      this.__name,
      clonedValue,
      this.__dataType
    );
    return clonedParam;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    // return super.toJSON(context, flags);
    if ((this.__flags & ParamFlags.USER_EDITED) == 0) return;
    const treeItems = [];
    for (const p of this.__value)
      treeItems.push(context.makeRelative(p.getPath()));
    return {
      treeItems,
    };
  }

  fromJSON(j, context, flags) {
    if (j.treeItems == undefined) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.__flags |= ParamFlags.USER_EDITED;

    for (let i = 0; i < j.treeItems.length; i++) {
      context.resolvePath(
        j.treeItems[i],
        treeItem => {
          this.__value.push(treeItem);
          this.elementAdded.emit(treeItem, this.__value.length - 1);
        },
        reason => {
          console.warn(
            'Unable to resolve Kinematic Group Member:' + pj.paramPath
          );
        }
      );
    }
  }

  destroy() {
    for (let i = 0; i < this.__value.length; i++) {
      this.removeElement(i);
    }
  }
}

export { KinematicGroupParameter };
