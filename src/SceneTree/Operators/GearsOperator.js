import { Vec3, Quat } from '../../Math/index'
import { Operator } from './Operator.js'
import { XfoOperatorOutput } from './OperatorOutput.js'
import {
  StructParameter,
  NumberParameter,
  Vec3Parameter,
  ListParameter,
  Parameter,
} from '../Parameters/index'
import { sgFactory } from '../SGFactory.js'

/** Class representing a gear parameter.
 * @extends StructParameter
 */
class GearParameter extends StructParameter {
  /**
   * Create a gear parameter.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)

    this.__ratioParam = this._addMember(new NumberParameter('Ratio', 1.0))
    this.__offsetParam = this._addMember(new NumberParameter('Offset', 0.0))
    this.__axisParam = this._addMember(
      new Vec3Parameter('Axis', new Vec3(1, 0, 0))
    )
    this.__output = new XfoOperatorOutput('Gear')
  }

  /**
   * The getOutput method.
   * @return {any} - The return value.
   */
  getOutput() {
    return this.__output
  }

  /**
   * Getter for the gear ratio.
   * @return {number} - Returns the ratio.
   */
  getRatio() {
    return this.__ratioParam.getValue()
  }

  /**
   * getter for the gear offset.
   * @return {number} - Returns the offset.
   */
  getOffset() {
    return this.__offsetParam.getValue()
  }

  /**
   * The getAxis method.
   * @return {any} - The return value.
   */
  getAxis() {
    return this.__axisParam.getValue()
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
    if (j) {
      j.output = this.__output.toJSON(context, flags)
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
    super.fromJSON(j, context, flags)
    if (j.output) {
      this.__output.fromJSON(j.output, context)
    }
  }
}

/** Class representing a gears operator.
 * @extends Operator
 */
class GearsOperator extends Operator {
  /**
   * Create a gears operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)

    this.__revolutionsParam = this.addParameter(
      new NumberParameter('Revolutions', 0.0)
    )
    const rpmParam = this.addParameter(new NumberParameter('RPM', 0.0)) // revolutions per minute
    this.__timeoutId
    rpmParam.on('valueChanged', () => {
      const rpm = rpmParam.getValue()
      if (Math.abs(rpm) > 0.0) {
        if (!this.__timeoutId) {
          const timerCallback = () => {
            const rpm = rpmParam.getValue()
            const revolutions = this.__revolutionsParam.getValue()
            this.__revolutionsParam.setValue(
              revolutions + rpm * (1 / (50 * 60))
            )
            this.__timeoutId = setTimeout(timerCallback, 20) // Sample at 50fps.
          }
          timerCallback()
        }
      } else {
        clearTimeout(this.__timeoutId)
        this.__timeoutId = undefined
      }
    })
    this.__gearsParam = this.addParameter(
      new ListParameter('Gears', GearParameter)
    )
    this.__gearsParam.on('elementAdded', event => {
      this.addOutput(event.elem.getOutput())
    })
    this.__gearsParam.on('elementRemoved', event => {
      this.removeOutput(event.index)
    })

    this.__gears = []
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const revolutions = this.__revolutionsParam.getValue()
    const gears = this.__gearsParam.getValue()
    const len = gears.length
    for (const gear of gears) {
      const output = gear.getOutput()
      const initialxfo = output.getInitialValue()
      if (!initialxfo) {
        // Note: we have cases where we have interdependencies.
        // Operator A Writes to [A, B, C]
        // Operator B Writes to [A, B, C].
        // During the load of operator B.C, we trigger an evaluation
        // of Opeator A, which causes B to evaluate (due to B.A already connected)
        // Now operator B is evaluating will partially setup.
        // See SmartLoc: Exploded Parts and Gears read/write the same set of
        // params.
        return
      }

      const rot = revolutions * gear.getRatio() + gear.getOffset()

      const quat = new Quat()
      quat.setFromAxisAndAngle(gear.getAxis(), rot * Math.PI * 2.0)
      // const initialxfo = output.getInitialValue().clone();
      const xfo = output.getValue()
      xfo.ori = quat.multiply(initialxfo.ori)
      output.setClean(xfo)
    }
  }

  /**
   * The detach method.
   */
  detach() {
    super.detach()
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = null
    }
  }

  /**
   * The reattach method.
   */
  reattach() {
    super.reattach()

    // Restart the operator.
    this.getParameter('RPM').emit('valueChanged', { mode: Parameter.ValueSetMode.USER_SETVALUE })
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    if (this.__timeoutId) {
      clearTimeout(this.__timeoutId)
      this.__timeoutId = null
    }
    super.destroy()
  }
}

sgFactory.registerClass('GearsOperator', GearsOperator)

export { GearsOperator }
