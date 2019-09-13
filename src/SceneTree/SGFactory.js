class SGFactory {
  constructor() {
    this.__registeredClasses = {};
    this.__classNames = {};
  }

  registerClass(classname, cls) {
    this.__registeredClasses[classname] = {
      cls,
      callbacks: [],
    };
    this.__classNames[cls.name] = classname;
  }

  registerCallback(classname, callback) {
    const classData = this.__registeredClasses[classname];
    if (!classData) {
      console.warn('Factory not registered:' + classname);
      return;
    }
    classData.callbacks.push(callback);
  }

  getClass(classname) {
    if (this.__registeredClasses[classname])
      return this.__registeredClasses[classname].cls;
  }

  getClassName(inst) {
    if (this.__classNames[inst.constructor.name])
      return this.__classNames[inst.constructor.name];
    return inst.constructor.name;
  }

  isConstructing() {
    return this.__constructing;
  }

  constructClass(classname /* , ...args*/) {
    const classData = this.__registeredClasses[classname];
    if (!classData) {
      if (!classData) {
        console.warn('Factory not registered:' + classname);
        return null;
      }
    }
    this.__constructing = true;
    const args = Array.prototype.slice.call(arguments, 1);
    const inst = new classData.cls(...args);
    this.__constructing = false;
    this.invokeCallbacks(inst);
    return inst;
  }

  invokeCallbacks(inst) {
    if (this.__classNames[inst.constructor.name]) {
      const classData = this.__registeredClasses[
        this.__classNames[inst.constructor.name]
      ];
      for (const callback of classData.callbacks) callback(inst);
    }
  }
}

const sgFactory = new SGFactory();
export { sgFactory };
