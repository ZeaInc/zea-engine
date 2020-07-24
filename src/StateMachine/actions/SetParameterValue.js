import { sgFactory } from '../../SceneTree/SGFactory.js'

import { NumberParameter } from '../../SceneTree/Parameters/index'

import { StateAction } from '../StateAction.js'

/** A state machine action that sets parameter values.
 * @extends StateAction
 * @private
 */
class SetParameterValue extends StateAction {
  /**
   * Create a set parameter value.
   */
  constructor() {
    super()
    this.__interpTimeParam = this.addParameter(new NumberParameter('InterpTime', 1.0))

    // Note: if the update frequency here can be faster than the renderer, it means each
    // rendered frame there is an updated values. This keeps movement smooth.
    // This is very apparent when moving the camera, while changing other values. If the 2 changes
    // are slower than rendering, then we see juddering.
    this.__updateFrequencyParam = this.addParameter(new NumberParameter('UpdateFrequency', 100))
  }

  /**
   * Sets the Parameter object to be controlled by this StateAction.
   * @param {Paramter} param - The Parameter object.
   * @return {object} - Returns the json object.
   */
  setParam(param) {
    this.__outParam = param
    if ((param && !this.__valueParam) || param.getDataType() != this.__valueParam.getDataType()) {
      const valueParam = param.clone()
      valueParam.setName('Value')
      valueParam.setValue(param.getValue())
      this.__valueParam = this.addParameter(valueParam)
    }
    return param
  }

  /**
   * Activate the action.
   */
  activate() {
    if (this.__outParam) {
      const interpTime = this.__interpTimeParam.getValue()
      if (interpTime > 0.0) {
        const updateFrequency = this.__updateFrequencyParam.getValue()
        const paramValueStart = this.__outParam.getValue()
        const paramValueEnd = this.__valueParam.getValue()
        let step = 0
        const steps = Math.round(interpTime / (1.0 / updateFrequency))
        const timerCallback = () => {
          step++
          if (step < steps) {
            const t = step / steps
            const smoothT = Math.smoothStep(0.0, 1.0, t)
            const newVal = Math.lerp(paramValueStart, paramValueEnd, smoothT)
            // Note: In this case, we want the parameter to emit a notification
            // and cause the update of the scene. But we also don't want the parameter value to then
            // be considered modified so it is saved to the JSON file. I'm not sure how to address this.
            // We need to check what happens if a parameter emits a 'valueChanged' during cleaning. (maybe it gets ignored)
            this.__outParam.setValue(newVal)
            this.__timeoutId = window.setTimeout(timerCallback, 1000 / updateFrequency)
          } else {
            this.__outParam.setValue(this.__valueParam.getValue())
            this.__timeoutId = undefined
            this.__onDone()
          }
        }
        timerCallback()
      } else {
        this.__outParam.setValue(this.__valueParam.getValue())
        this.__onDone()
      }
    }
  }

  /**
   * The deactivate method.
   */
  deactivate() {
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = undefined
    }
    super.deactivate()
  }

  /**
   * The cancel the action.
   */
  cancel() {
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = undefined
    }
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
    const j = super.toJSON(context, flags)
    if (this.__valueParam) {
      j.valueParamType = sgFactory.getClassName(this.__valueParam)
    }
    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    if (j.valueParamType) {
      const param = sgFactory.constructClass(j.valueParamType, 'Value')
      if (param) this.__valueParam = this.addParameter(param)
    }
    super.fromJSON(j, context, flags)
  }
}

sgFactory.registerClass('SetParameterValue', SetParameterValue)
export { SetParameterValue }
