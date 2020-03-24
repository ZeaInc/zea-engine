import { Signal } from '../Utilities/index'
import { RefCounted } from './RefCounted.js'
import { sgFactory } from './SGFactory.js'

// Explicit impport of files to avoid importing all the parameter types.
// Note: Soon these imports should be removed, once all code avoids calling
// 'addPArameter' without the parameter instance.
import { ParamFlags, ValueSetMode } from './Parameters/Parameter.js'


let counter = 0

/** Class representing a parameter owner in the scene tree.
 */
class ParameterOwner {
  /**
   * Create a parameter owner.
   */
  constructor() {
    this.__id = ++counter

    this.__params = []
    this.__paramMapping = {}
    this.__paramSignalIds = {}

    // Paramters are not intended to be dynamic.
    // Instead they are part of the mixin architecture.
    // Note: Materials add/remove paramters when the
    // shader name is changed.
    this.parameterAdded = new Signal()
    this.parameterRemoved = new Signal()
    this.parameterValueChanged = new Signal()
  }
  
  /**
   * Returns the unique id of the object. Every Object has a unique
   * identifier which is based on a counter that is incremented.
   * @return {any} - The return value.
   */
  getId() {
    return this.__id
  }

  // ////////////////////////////////////////
  // Params

  /**
   * The numParameters method.
   * @return {number} - The return value.
   */
  numParameters() {
    return this.__params.length
  }

  /**
   * The getParameters method.
   * @return {any} - The return value.
   */
  getParameters() {
    return this.__params
  }

  /**
   * The getParameterIndex method.
   * @param {string} paramName - The parameter name.
   * @return {any} - The return value.
   */
  getParameterIndex(paramName) {
    return this.__paramMapping[paramName]
  }

  /**
   * The getParameterByIndex method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getParameterByIndex(index) {
    return this.__params[index]
  }

  /**
   * The hasParameter method.
   * @param {string} paramName - The parameter name.
   * @return {any} - The return value.
   */
  hasParameter(paramName) {
    return paramName in this.__paramMapping
  }

  /**
   * The getParameter method.
   * @param {string} paramName - The parameter name.
   * @return {any} - The return value.
   */
  getParameter(paramName) {
    const index = this.__paramMapping[paramName]
    if (index == -1) return null
    return this.__params[index]
  }

  /**
   * This method can be overrridden in derived classes
   * to perform general updates (see GLPass or BaseItem).
   * @param {any} param - The param param.
   * @param {any} mode - The mode param.
   * @private
   */
  __parameterValueChanged(param, mode) {
    this.parameterValueChanged.emit(param, mode)
  }

  /**
   * Add a parameter.
   * @param {any} param - The paramater to add.
   * @return {any} - The return value.
   */
  addParameter(param) {
    const name = param.getName()
    if (this.__paramMapping[name] != undefined) {
      console.warn('Replacing Parameter:' + name)
      this.removeParameter(name)
    }
    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.__parameterValueChanged(param, mode)
    )
    this.__params.push(param)
    this.__paramMapping[name] = this.__params.length - 1
    this.parameterAdded.emit(name)
    return param
  }

  /**
   * Insert a parameter.
   * @param {any} param - The parameter to insert.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  insertParameter(param, index) {
    const name = param.getName()
    if (this.__paramMapping[name] != undefined) {
      console.warn('Replacing Parameter:' + name)
      this.removeParameter(name)
    }
    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.__parameterValueChanged(param, mode)
    )
    this.__params.splice(index, 0, param)

    const paramMapping = {}
    for (let i = 0; i < this.__params.length; i++) {
      paramMapping[this.__params[i].getName()] = i
    }
    this.__paramMapping = paramMapping
    this.parameterAdded.emit(name)
    return param
  }

  /**
   * Remove a parameter.
   * @param {string} paramName - The parameter name.
   */
  removeParameter(paramName) {
    if (this.__paramMapping[paramName] == undefined) {
      console.throw('Unable to Remove Parameter:' + paramName)
    }
    const index = this.__paramMapping[paramName]
    const param = this.__params[this.__paramMapping[paramName]]
    param.valueChanged.disconnectId(this.__paramSignalIds[paramName])
    this.__params.splice(index, 1)
    const paramMapping = {}
    for (let i = 0; i < this.__params.length; i++) {
      paramMapping[this.__params[i].getName()] = i
    }
    this.__paramMapping = paramMapping
    this.parameterRemoved.emit(paramName)
  }

  /**
   * Replace a parameter.
   * @param {any} param - The parameter to replace.
   * @return {any} - The return value.
   */
  replaceParameter(param) {
    const name = param.getName()
    const index = this.__paramMapping[name]
    const prevparam = this.__params[this.__paramMapping[name]]
    prevparam.valueChanged.disconnectId(this.__paramSignalIds[name])

    this.__paramSignalIds[name] = param.valueChanged.connect(mode =>
      this.__parameterValueChanged(param, mode)
    )
    this.__params[index] = param
    return param
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const paramsJSON = {}
    let savedParams = 0
    for (const param of this.__params) {
      if (!param.testFlag(ParamFlags.USER_EDITED)) continue
      if (param.numRefs() > 1 && param.getRefIndex(this) != 0) {
        paramsJSON[param.getName()] = {
          paramPath: context.makeRelative(param.getPath()),
        }
        savedParams++
      } else {
        const paramJSON = param.toJSON(context, flags)
        if (paramJSON) {
          paramsJSON[param.getName()] = paramJSON
          savedParams++
        }
      }
    }
    if (savedParams > 0) return { params: paramsJSON }
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.params) {
      for (const key in j.params) {
        const pj = j.params[key]
        const param = this.getParameter(key)
        if (!param) console.warn('Param not found:' + key)
        else {
          if (pj.paramPath) {
            context.resolvePath(
              pj.paramPath,
              param => {
                this.replaceParameter(param)
              },
              reason => {
                console.warn(
                  'Unable to resolve shared parameter:' + pj.paramPath
                )
              }
            )
          } else {
            param.fromJSON(pj, context)
          }
        }
      }
    }
  }

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    // TODO: make this work

    // if (context.version >= 3) {
    if (context.versions['zea-engine'].greaterOrEqualThan([0, 0, 3])) {
      const numProps = reader.loadUInt32()
      for (let i = 0; i < numProps; i++) {
        const propType = reader.loadStr()
        const propName = reader.loadStr()
        let param = this.getParameter(propName)
        if (!param) {
          param = sgFactory.constructClass(propType, propName)
          if (!param) {
            console.error(
              'Unable to construct prop:' + propName + ' of type:' + propType
            )
            continue
          }
          this.addParameter(param)
        }
        param.readBinary(reader, context)
      }
    }
  }

  /**
   * The toString method.
   * @return {any} - The return value.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The copyFrom method.
   * @param {ParameterOwner} src - The ParameterOwner copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    // Note: Loop over the parameters in reverse order,
    // this is because often, parameter depdenencies
    // are bottom to top (bottom params dependent on higher params).
    // This means that as a parameter is set with a new value
    // it will dirty the params below it.
    let i = src.numParameters()
    while (i--) {
      const srcParam = src.getParameterByIndex(i)
      const param = this.getParameter(srcParam.getName())
      if (param) {
        // Note: we are not cloning the values.
        param.setValue(srcParam.getValue(), ValueSetMode.OPERATOR_SETVALUE)
      } else {
        this.addParameter(srcParam.clone())
      }
    }
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    for (const param of this.__params) {
      param.destroy()
    }
    super.destroy()
  }
}

export { ParameterOwner }
