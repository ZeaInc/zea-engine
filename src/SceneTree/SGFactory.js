/** Class representing a SG factory. */
class SGFactory {
  /**
   * Create a SG factory.
   */
  constructor() {
    this.__registeredClasses = {};
    this.__classNames = {};
  }

  /**
   * The registerClass method.
   * @param {any} classname - The classname value.
   * @param {any} cls - The cls value.
   */
  registerClass(classname, cls) {
    this.__registeredClasses[classname] = {
      cls,
      callbacks: [],
    };
    this.__classNames[cls.name] = classname;
  }

  /**
   * The registerCallback method.
   * @param {any} classname - The classname value.
   * @param {any} callback - The callback value.
   */
  registerCallback(classname, callback) {
    const classData = this.__registeredClasses[classname];
    if (!classData) {
      console.warn('Factory not registered:' + classname);
      return;
    }
    classData.callbacks.push(callback);
  }

  /**
   * The getClass method.
   * @param {any} classname - The classname value.
   * @return {any} - The return value.
   */
  getClass(classname) {
    if (this.__registeredClasses[classname])
      return this.__registeredClasses[classname].cls;
  }

  /**
   * The getClassName method.
   * @param {any} inst - The inst value.
   * @return {any} - The return value.
   */
  getClassName(inst) {
    if (this.__classNames[inst.constructor.name])
      return this.__classNames[inst.constructor.name];
    return inst.constructor.name;
  }

  /**
   * The isConstructing method.
   * @return {any} - The return value.
   */
  isConstructing() {
    return this.__constructing;
  }

  /**
   * The constructClass method.
   * @param {any} classname - The classname value.
   * @return {any} - The return value.
   */
  constructClass(classname /* , ...args */) {
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

  /**
   * The invokeCallbacks method.
   * @param {any} inst - The inst value.
   */
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
