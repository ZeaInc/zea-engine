import { UInt8, SInt8, UInt16, SInt16, UInt32, SInt32, Float32 } from './Utilities/MathFunctions'

let _registeredBlueprints = {}
let _blueprintNames = {}
let _blueprints = []

/**
 * Registry is a static factory that handles registration/reconstruction of
 * persisted type of data, this includes classes and types.
 *
 * Note: blueprintName is required because on minification process
 * the name of classes change and we can't simply use '....constructor.name'.
 * So, we need a way of relating minified blueprint names to the one stored for persistency.
 * <br>
 * i.e.
 * ```javascript
 * // Import registry class
 * class Foo() {}
 *
 * Registry.register('Foo', Foo)
 * // In case 'Foo' class gets its name changed to 'c' on minification,
 * // and the persisted data type is 'Foo', we would know how to relate them.
 * ```
 *
 * @static
 * @class Registry
 */
const Registry = {
  /**
   * Registers a new blueprint in the factory.
   *
   * @param {string} blueprintName - Name of the registered blueprint(Class, type, etc)
   * @param {function|number|any} blueprint - Blueprint representation(Class function, type)
   */
  register: (blueprintName, blueprint) => {
    if (_registeredBlueprints[blueprintName]) throw new Error(`There's a class registered with '${blueprintName}' name`)
    _registeredBlueprints[blueprintName] = { blueprint, callbacks: [] }

    // Note: To provide backwards compatibility, same blueprint can be stored under multiple names.
    // Thats the reason behind using indexes instead of the blueprint.
    const blueprintIndex = _blueprints.length
    _blueprints.push(blueprint)
    _blueprintNames[blueprintIndex] = blueprintName
  },
  /**
   * Returns blueprint function/type by specifying its name.
   *
   * @param {string} blueprintName - Name of the registered blueprint(Class, type, etc)
   * @return {function|number|any} - Blueprint representation(Class function, type)
   */
  getBlueprint: (blueprintName) => {
    if (_registeredBlueprints[blueprintName]) return _registeredBlueprints[blueprintName].blueprint

    throw new Error(`${blueprintName} blueprint is not registered`)
  },
  /**
   * Returns class name using passing an instantiated object.
   * If it is not registered, the name in constructor is returned.
   *
   * @param {function|number|any|undefined} blueprintInstance - Blueprint representation(Class function, type)
   * @return {string} - Name of the registered blueprint(Class, type, etc)
   */
  getBlueprintName: (blueprintInstance) => {
    let blueprint = blueprintInstance
    let blueprintName = blueprintInstance

    if (typeof blueprintInstance === 'object') {
      blueprint = blueprintInstance.constructor
      blueprintName = blueprint.name
    }

    const blueprintId = _blueprints.indexOf(blueprint)
    if (blueprintId >= 0 && _blueprintNames[blueprintId]) return _blueprintNames[blueprintId]

    throw new Error(`${blueprintName} blueprint is not registered`)
  },
  /**
   * Accepting the class name and `N` number of arguments, instantiates a new object of the specified class.
   * If the class is not registered, then `null` is returned.
   * <br>
   * **Note:** Although the class arguments are not literally specified in the parameters,
   * you can pass them(As many as needed).
   *
   * @param {string} blueprintName - Name of the registered blueprint(Class, type, etc)
   * @return {object|null} - Instantiated object of the specified class
   */
  constructClass: (blueprintName, ...args) => {
    const blueprintData = _registeredBlueprints[blueprintName]
    if (!blueprintData) throw new Error(`${blueprintName} blueprint is not registered`)

    // eslint-disable-next-line new-cap
    return new blueprintData.blueprint(...args)
  },
  /**
   * For testing purpose only, never call this outside of the test scope.
   *
   * @private
   */
  flush: () => {
    _registeredBlueprints = {}
    _blueprintNames = {}
    _blueprints = []
  },
}

Registry.register('UInt8', UInt8)
Registry.register('SInt8', SInt8)
Registry.register('UInt16', UInt16)
Registry.register('SInt16', SInt16)
Registry.register('UInt32', UInt32)
Registry.register('SInt32', SInt32)
Registry.register('Float32', Float32)

export { Registry }
