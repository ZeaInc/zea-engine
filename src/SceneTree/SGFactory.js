import { Registry } from '../Registry'

/**
 * @private
 */
const sgFactory = {
  registerClass: (blueprintName, blueprint) => {
    console.warn(`'sgFactory' is deprecated, Please use 'Registry.register'`)
    Registry.register(blueprintName, blueprint)
  },
  constructClass: (blueprintName, ...args) => {
    console.warn(`'sgFactory' is deprecated, Please use 'Registry.constructClass'`)
    Registry.constructClass(blueprintName, ...args)
  },
}

export { sgFactory }
