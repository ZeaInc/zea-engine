import { Signal } from '../../Utilities';

const CommandFlags = {
  DISABLED: 1 << 2,
};

/** Class representing a command. */
class Command {
  /**
   * Create a command.
   * @param {string} name - The name value.
   * @param {any} cb - The cb value.
   */
  constructor(name, cb) {
    this.__name = name;
    this.__cb = cb;
    this.__flags = 0;
  }

  /**
   * The getName method.
   * @return {any} - The return value.
   */
  getName() {
    return this.__name;
  }

  /**
   * The getOwner method.
   * @return {any} - The return value.
   */
  getOwner() {
    // return this.__private.get('ownerItem');
    return this.__ownerItem;
  }

  /**
   * The setOwner method.
   * @param {any} ownerItem - The ownerItem value.
   */
  setOwner(ownerItem) {
    // this.__private.set(ownerItem, ownerItem);
    if (this.__ownerItem !== ownerItem) {
      this.__ownerItem = ownerItem;
    }
  }

  /**
   * The getPath method.
   * @return {any} - The return value.
   */
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

  /**
   * The setEnabled method.
   * @param {any} state - The state value.
   */
  setEnabled(state) {
    if (state) this.__flags &= ~CommandFlags.DISABLED;
    else this.__flags |= ~CommandFlags.DISABLED;
  }

  /**
   * The isEnabled method.
   */
  isEnabled() {
    this.__flags & CommandFlags.DISABLED;
  }

  /**
   * The invoke method.
   */
  invoke() {
    this.__cb();
  }
}

export { Command };
