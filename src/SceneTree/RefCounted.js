import { Signal } from '../Utilities';

let counter = 0;

class RefCounted {
  constructor() {
    if (this.constructor.name == 'RefCounted') {
      throw 'RefCounted should not be instantiated directly.';
    }
    this.__id = ++counter;
    this.__refs = [];
    this.destructing = new Signal();
    this.__destroyed = false;
  }

  getId() {
    return this.__id;
  }

  numRefs() {
    return this.__refs.length;
  }

  addRef(referer) {
    if (!referer) throw 'Error in RefCounted.addRef: Must provide a referer';

    // Note: an object can be reffeed multiple times.
    // e.g. we can create a temporary ref while we re-attach a tree item to a new parent.
    this.__refs.push(referer);
    return true;
  }

  removeRef(referer) {
    if (!referer) throw 'Error in RefCounted.removeRef: Must provide a referer';
    // console.log(this.constructor.name + " removeRef:" + referer.constructor.name);
    const index = this.__refs.indexOf(referer);
    if (index == -1)
      throw 'Error in RefCounted.removeRef: referer not found in refs list.';

    this.__refs.splice(index, 1);
    if (this.__refs.length == 0) {
      this.destroy();
    }
  }

  getRefer(index) {
    return this.__refs[index];
  }

  getRefIndex(referer) {
    return this.__refs.indexOf(referer);
  }

  isDestroyed() {
    return this.__destroyed;
  }

  destroy() {
    this.__destroyed = true;
    // console.log(this.constructor.name + " destructing");
    this.destructing.emit(this);
  }
}
export { RefCounted };
