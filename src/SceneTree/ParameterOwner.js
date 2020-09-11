/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
import { EventEmitter } from '../Utilities/EventEmitter'
import { Registry } from '../Registry'

// Explicit import of files to avoid importing all the parameter types.
// Note: Soon these imports should be removed, once all code avoids calling
// 'addParameter' without the parameter instance.

let counter = 0

/**
 * Class that allows other classes to be parameterized by `Parameter` type of objects.
 * Not only hosting parameters, but their events.
 *
 * @extends {EventEmitter}
 */
class ParameterOwner extends EventEmitter {
  /**
   * Creates an instance of ParameterOwner by initializing parameter hosting mappings and events.
   * <br>
   * Every Object has a unique identifier which is based on a counter that is incremented.
   */
  constructor() {
    super()
    this.__id = ++counter

    this.__params = []
    this.__paramMapping = {}
    this.__paramEventHandlers = {}
  }

  /**
   * Returns the unique id of the object.
   * @private
   * @return {number} - The Id of the ParameterOwner object.
   */
  getId() {
    return this.__id
  }

  // --- Params ---

  /**
   * @deprecated
   * Returns the number of parameters current object has.
   *
   * @return {number} - Amount of parameters in current object.
   */
  numParameters() {
    console.warn('Deprecated. Use #getNumParameters instead.')
    return this.getNumParameters()
  }

  /**
   * Returns the number of parameters current object has.
   *
   * @return {number} - Amount of parameters in current object.
   */
  getNumParameters() {
    return this.__params.length
  }

  /**
   * Returns all the parameters of the object.
   *
   * @return {array} - Parameter List
   */
  getParameters() {
    return this.__params
  }

  /**
   * Returns the index of a parameter in parameter list.
   *
   * @param {string} paramName - Name of the parameter.
   * @return {number} - Position in the array
   */
  getParameterIndex(paramName) {
    return this.__paramMapping[paramName]
  }

  /**
   * Returns `Parameter` object in a given index
   *
   * @param {number} index - Position of the parameter in the array
   * @return {Parameter} - Parameter object value
   */
  getParameterByIndex(index) {
    return this.__params[index]
  }

  /**
   * Validates if the specified parameter exists in the object.
   *
   * @param {string} paramName - The parameter name.
   * @return {boolean} - The return value.
   */
  hasParameter(paramName) {
    return paramName in this.__paramMapping
  }

  /**
   * Returns `Parameter` object using the given name
   *
   * @param {string} paramName - The parameter name.
   * @return {Parameter} - Parameter object value
   */
  getParameter(paramName) {
    const index = this.__paramMapping[paramName]
    if (index == -1) return null
    return this.__params[index]
  }

  /**
   * This method can be overridden in derived classes
   * to perform general updates (see GLPass or BaseItem).
   * @param {object} event - The event object emitted by the parameter.
   * @private
   */
  __parameterValueChanged(event) {
    this.emit('parameterValueChanged', event)
  }

  /**
   * Adds `Parameter` object to the owner's parameter list.
   *
   * @emits `parameterAdded` with the name of the param.
   * @param {Parameter} param - The parameter to add.
   * @return {Parameter} - With `owner` and `valueChanged` event set.
   */
  addParameter(param) {
    return this.insertParameter(param, this.__params.length)
  }

  /**
   * Adds `Parameter` object to the owner's parameter list using the index.
   * It replaces the event in the specified index.
   *
   *
   * @emits `parameterAdded` with the name of the param.
   * @param {Parameter} param - The parameter to insert.
   * @param {number} index - The index value.
   * @return {Parameter} - With `owner` and `valueChanged` event set.
   */
  insertParameter(param, index) {
    const name = param.getName()
    if (this.__paramMapping[name] != undefined) {
      console.warn('Replacing Parameter:' + name)
      this.removeParameter(name)
    }
    param.setOwner(this)
    const paramChangedHandler = (event) => this.__parameterValueChanged({ ...event, param })
    param.on('valueChanged', paramChangedHandler)
    this.__paramEventHandlers[name] = paramChangedHandler
    this.__params.splice(index, 0, param)

    for (let i = index; i < this.__params.length; i++) {
      this.__paramMapping[this.__params[i].getName()] = i
    }
    this.emit('parameterAdded', { name })
    return param
  }

  /**
   * Removes `Parameter` from owner, by using parameter's name.
   * @emits `parameterRemoved` with the name of the param.
   * @param {string} name - The parameter name.
   */
  removeParameter(name) {
    if (this.__paramMapping[name] == undefined) {
      throw new Error('Unable to remove Parameter:' + name)
    }
    const index = this.__paramMapping[name]
    const param = this.__params[this.__paramMapping[name]]

    param.off('valueChanged', this.__paramEventHandlers[name])
    this.__params.splice(index, 1)

    delete this.__paramMapping[name]
    for (let i = index; i < this.__params.length; i++) {
      this.__paramMapping[this.__params[i].getName()] = i
    }

    this.emit('parameterRemoved', { name })
  }

  /**
   * Replaces old `Parameter` by passing a new one with the same name.
   *
   * @param {Parameter} param - The parameter to replace.
   * @return {Parameter} - `Parameter` with `valueChanged` event set.
   */
  replaceParameter(param) {
    const name = param.getName()
    if (this.__paramMapping[name] == undefined) {
      throw new Error('Unable to replace Parameter:' + paramName)
    }
    const index = this.__paramMapping[name]
    this.removeParameter(name)
    this.insertParameter(param, index)
    return param
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   *
   * @param {object} context - The context value.
   * @return {object} - Returns the json object.
   */
  toJSON(context) {
    const json = {}
    const paramsJSON = {}
    let savedParams = 0
    for (const param of this.__params) {
      const paramJSON = param.toJSON(context)
      if (paramJSON) {
        paramsJSON[param.getName()] = paramJSON
        savedParams++
      }
    }
    if (savedParams > 0) json.params = paramsJSON
    return json
  }

  /**
   * The fromJSON method decodes a json object for this type.
   *
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   */
  fromJSON(j, context) {
    if (j.params) {
      for (const key in j.params) {
        const pj = j.params[key]
        const param = this.getParameter(key)
        if (!param) console.warn('Param not found:' + key)
        else {
          if (pj.paramPath) {
            context.resolvePath(
              pj.paramPath,
              (param) => {
                this.replaceParameter(param)
              },
              (reason) => {
                console.warn('Unable to resolve shared parameter:' + pj.paramPath)
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
   * Uses passed in BinReader object(containing an Int32 array with all the parameters) to reconstruct all parameters state.
   * <br>
   * In each iteration of the array, propType and propName are extracted and
   * used to build the right `Parameter` class. Then all of them are added to the object.
   *
   * @emits `parameterAdded` with the name of the param.
   * @param {BinReader} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context) {
    // TODO: make this work

    if (context.versions['zea-engine'].compare([0, 0, 3]) >= 0) {
      const numProps = reader.loadUInt32()
      for (let i = 0; i < numProps; i++) {
        const propType = reader.loadStr()
        const propName = reader.loadStr()
        let param = this.getParameter(propName)
        if (!param) {
          param = Registry.constructClass(propType, propName)
          if (!param) {
            console.error('Unable to construct prop:' + propName + ' of type:' + propType)
            continue
          }
          this.addParameter(param)
        }
        param.readBinary(reader, context)
      }
    }
  }

  /**
   * Converts object's JSON value and converts it to a string.
   *
   * @return {string} - String of object's parameter list state.
   */
  toString() {
    return JSON.stringify(this.toJSON(), null, 2)
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * Copies Parameters from another `ParameterOwner` to current object.
   *
   * @param {ParameterOwner} src - The ParameterOwner copy from.
   */
  copyFrom(src) {
    // Note: Loop over the parameters in reverse order,
    // this is because often, parameter dependencies
    // are bottom to top (bottom params dependent on higher params).
    // This means that as a parameter is set with a new value
    // it will dirty the params below it.
    let i = src.getNumParameters()
    while (i--) {
      const srcParam = src.getParameterByIndex(i)
      const param = this.getParameter(srcParam.getName())
      if (param) {
        // Note: we are not cloning the values.
        param.loadValue(srcParam.getValue())
      } else {
        this.addParameter(srcParam.clone())
      }
    }
  }
}

export { ParameterOwner }
