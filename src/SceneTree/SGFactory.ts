import { Registry } from '../Registry'

/**
 * @private
 */
const sgFactory = {
  registerClass: (blueprintName: any, blueprint: any) => {
    console.warn(`'sgFactory' is deprecated, Please use 'Registry.register'`)
    Registry.register(blueprintName, blueprint)
  },
  // @ts-expect-error ts-migrate(7019) FIXME: Rest parameter 'args' implicitly has an 'any[]' ty... Remove this comment to see the full error message
  constructClass: (blueprintName: any, ...args) => {
    console.warn(`'sgFactory' is deprecated, Please use 'Registry.constructClass'`)
    Registry.constructClass(blueprintName, ...args)
  },
}

export { sgFactory }
