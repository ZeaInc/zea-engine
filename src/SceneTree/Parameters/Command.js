import { Signal } from '../../Utilities';

const CommandFlags = {
  DISABLED: 1 << 2,
};

class Command {
  constructor(name, cb) {
    this.__name = name;
    this.__cb = cb;
    this.__flags = 0;
  }

  getName() {
    return this.__name;
  }

  getOwner() {
    // return this.__private.get('ownerItem');
    return this.__ownerItem;
  }

  setOwner(ownerItem) {
    // this.__private.set(ownerItem, ownerItem);
    if (this.__ownerItem !== ownerItem) {
      this.__ownerItem = ownerItem;
    }
  }

  getPath() {
    if (this.__ownerItem) {
      if (this.__ownerItem.getPath) {
        const path = this.__ownerItem.getPath().slice();
        path.push(this.__name);
        return path;
      } else {
        return [this.__ownerItem.getName(), this.__name];
      }
    }
    return [this.__name];
  }

  setEnabled(state) {
    if (state) this.__flags &= ~CommandFlags.DISABLED;
    else this.__flags |= ~CommandFlags.DISABLED;
  }
  isEnabled() {
    this.__flags & CommandFlags.DISABLED;
  }

  invoke() {
    this.__cb();
  }
}

export { Command };
