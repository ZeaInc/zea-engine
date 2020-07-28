import { Vec3, Quat, Xfo } from '../../Math/index'
import { Operator } from './Operator.js'
import { OperatorOutput, OperatorOutputMode } from './OperatorOutput.js'
import { NumberParameter, Vec3Parameter, StructParameter, ListParameter } from '../Parameters/index'
import MathFunctions from '../../Utilities/MathFunctions'

import { sgFactory } from '../SGFactory.js'

/** Class representing a piston parameter.
 * @extends StructParameter
 */
class PistonParameter extends StructParameter {
  /**
   * Create a piston parameter.
   * @param {string} name - The name value.
   */
  constructor() {
    super('Piston')

    // this.__pistonAxisParam = this._addMember(new Vec('Axis', 0));
    this.__pistonAngleParam = this._addMember(new NumberParameter('PistonAngle', 0))
    this.__camPhaseParam = this._addMember(new NumberParameter('CamPhase', 0))
    this.__camLengthParam = this._addMember(new NumberParameter('CamLength', 3))
    this.__rodLengthParam = this._addMember(new NumberParameter('RodLength', 3))

    // The first RodItem added causes the rodOffset to be computed.
    this.__rodOutput = new OperatorOutput('Rod', OperatorOutputMode.OP_READ_WRITE)
    this.__capOutput = new OperatorOutput('Cap', OperatorOutputMode.OP_READ_WRITE)

    this.__pistonAngleParam.on('valueChanged', this.init.bind(this))
    this.__camPhaseParam.on('valueChanged', this.init.bind(this))
    this.__camLengthParam.on('valueChanged', this.init.bind(this))
    this.__rodLengthParam.on('valueChanged', this.init.bind(this))

    this.__bindXfos = {}
  }

  /**
   * The getRodOutput method.
   * @return {any} - The return value.
   */
  getRodOutput() {
    return this.__rodOutput
  }

  /**
   * The getCapOutput method.
   * @return {any} - The return value.
   */
  getCapOutput() {
    return this.__capOutput
  }

  /**
   * The setCrankXfo method.
   * @param {Xfo} baseCrankXfo - The baseCrankXfo value.
   */
  setCrankXfo(baseCrankXfo) {
    this.__baseCrankXfo = baseCrankXfo
    this.init()
  }

  /**
   * The init method.
   */
  init() {
    if (!this.__baseCrankXfo) return

    const camPhase = this.__camPhaseParam.getValue()
    const camLength = this.__camLengthParam.getValue()
    const rodLength = this.__rodLengthParam.getValue()
    const pistonAngle = this.__pistonAngleParam.getValue()
    const crankVec = new Vec3(
      Math.sin(MathFunctions.degToRad(pistonAngle)),
      Math.cos(MathFunctions.degToRad(pistonAngle)),
      0.0
    )
    this.__pistonAxis = this.__baseCrankXfo.ori.rotateVec3(crankVec)

    this.__camVec = this.__baseCrankXfo.ori.rotateVec3(
      new Vec3(Math.sin(camPhase * 2.0 * Math.PI) * camLength, Math.cos(camPhase * 2.0 * Math.PI) * camLength, 0.0)
    )

    const camAngle = camPhase * 2.0 * Math.PI
    const bigEndOffset = Math.sin(camAngle) * camLength
    const headOffset = Math.sqrt(rodLength * rodLength - bigEndOffset * bigEndOffset) + Math.cos(camAngle) * camLength
    this.__pistonOffset = headOffset
  }

  /**
   * The evaluate method.
   * @param {Quat} quat - The quat value.
   * @param {any} crankAxis - The crankAxis value.
   * @param {any} revolutions - The revolutions value.
   */
  evaluate(quat, crankAxis, revolutions) {
    const camPhase = this.__camPhaseParam.getValue()
    const camLength = this.__camLengthParam.getValue()
    const rodLength = this.__rodLengthParam.getValue()
    const camAngle = (camPhase + revolutions) * 2.0 * Math.PI

    const bigEndOffset = Math.sin(camAngle) * camLength
    const rodAngle = Math.asin(bigEndOffset / rodLength)
    const headOffset = Math.sqrt(rodLength * rodLength - bigEndOffset * bigEndOffset) + Math.cos(camAngle) * camLength

    if (this.__rodOutput.isConnected()) {
      const rodXfo = this.__rodOutput.getValue()
      const axisPos = rodXfo.tr.subtract(this.__baseCrankXfo.tr).dot(crankAxis)

      const rotRotation = new Quat()
      rotRotation.setFromAxisAndAngle(crankAxis, -rodAngle)

      rodXfo.tr = this.__baseCrankXfo.tr.add(quat.rotateVec3(this.__camVec))
      rodXfo.tr.addInPlace(crankAxis.scale(axisPos))
      rodXfo.ori = rotRotation.multiply(rodXfo.ori)
      this.__rodOutput.setValue(rodXfo)
    }

    if (this.__capOutput.isConnected()) {
      const headXfo = this.__capOutput.getValue()
      headXfo.tr = headXfo.tr.add(this.__pistonAxis.scale(headOffset - this.__pistonOffset))
      this.__capOutput.setValue(headXfo)
    }
  }

  /**
   * The setOwner method.
   * @param {any} owner - The owner value.
   */
  setOwner(owner) {
    this.__owner = owner
  }

  /**
   * The getOwner method.
   * @return {any} - The return value.
   */
  getOwner() {
    return this.__owner
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
  }

  // ////////////////////////////////////////
  // Clone

  /**
   * The clone method constructs a new pistom parameter, copies its values
   * from this parameter and returns it.
   * @param {number} flags - The flags value.
   * @return {PistonParameter} - Returns a new cloned piston parameter.
   */
  clone(flags) {
    const clonedParam = new PistonParameter(this.__name, this.__value)
    return clonedParam
  }
}

/** Class representing a piston operator.
 * @extends Operator
 */
class PistonOperator extends Operator {
  /**
   * Create a piston operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)

    this.__revolutionsParam = this.addParameter(new NumberParameter('Revolutions', 0.0, [0, 1]))
    const rpmParam = this.addParameter(new NumberParameter('RPM', 0.0)) // revolutions per minute
    const fps = 50
    const sampleTime = 1000 / fps
    const anglePerSample = 1 / (fps * 60)
    rpmParam.on('valueChanged', () => {
      let rpm = rpmParam.getValue()
      if (rpm > 0.0) {
        if (!this.__timeoutId) {
          const timerCallback = () => {
            rpm = rpmParam.getValue()
            const revolutions = this.__revolutionsParam.getValue()
            this.__revolutionsParam.setValue(revolutions + rpm * anglePerSample)
            this.__timeoutId = setTimeout(timerCallback, sampleTime) // Sample at 50fps.
          }
          timerCallback()
        }
      } else {
        clearTimeout(this.__timeoutId)
        this.__timeoutId = undefined
      }
    })

    // this.__crankParam = this.addParameter(new KinematicGroupParameter('Crank'));
    this.__crankOutput = this.addOutput(new OperatorOutput('Crank', OperatorOutputMode.OP_READ_WRITE))
    this.__crankOutput.on('paramSet', this.init.bind(this))
    this.__crankAxisParam = this.addParameter(new Vec3Parameter('CrankAxis', new Vec3(1, 0, 0)))
    this.__crankAxisParam.on('valueChanged', () => {
      // this.__baseCrankXfo.ori.setFromAxisAndAngle(this.__crankAxisParam.getValue(), 0.0);
      this.__baseCrankXfo.ori.setFromDirectionAndUpvector(this.__crankAxisParam.getValue(), new Vec3(0, 0, 1))
      this.init()
    })
    this.__pistonsParam = this.addParameter(new ListParameter('Pistons', PistonParameter))
    this.__pistonsParam.on('elementAdded', event => {
      event.elem.setCrankXfo(this.__baseCrankXfo)

      this.addOutput(event.elem.getRodOutput())
      this.addOutput(event.elem.getCapOutput())
    })
    this.__pistonsParam.on('elementRemoved', event => {
      this.removeOutput(event.elem.getRodOutput())
      this.removeOutput(event.elem.getCapOutput())
    })

    this.__baseCrankXfo = new Xfo()
    this.__pistons = []
  }

  /**
   * The setOwner method.
   * @param {any} ownerItem - The ownerItem value.
   */
  setOwner(ownerItem) {
    super.setOwner(ownerItem)
  }

  /**
   * The getCrankOutput method.
   * @return {any} - The return value.
   */
  getCrankOutput() {
    return this.__crankOutput
  }

  /**
   * The init method.
   */
  init() {
    const pistons = this.__pistonsParam.getValue()
    for (const piston of pistons) piston.setCrankXfo(this.__baseCrankXfo)

    if (this.__crankOutput.isConnected())
      this.__crankOffset = this.__baseCrankXfo.inverse().multiply(this.__crankOutput.getValue())
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const revolutions = this.__revolutionsParam.getValue()
    const crankAxis = this.__crankAxisParam.getValue()
    const quat = new Quat()
    quat.setFromAxisAndAngle(crankAxis, revolutions * Math.PI * 2.0)

    if (this.__crankOutput.isConnected()) {
      const crankXfo = this.__crankOutput.getValue()
      crankXfo.ori = quat.multiply(crankXfo.ori)
      this.__crankOutput.setValue(crankXfo)
    }

    const pistons = this.__pistonsParam.getValue()
    const len = pistons.length
    for (let i = 0; i < len; i++) {
      const piston = pistons[i]
      piston.evaluate(quat, crankAxis, revolutions)
    }

    this.emit('postEval', {})
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistence.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return super.toJSON(context, flags)
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags)
    if (j.crankOutput) {
      this.__crankOutput.fromJSON(j.crankOutput, context)
    }
    this.init()
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    clearTimeout(this.__timeoutId)
    super.destroy()
  }
}

sgFactory.registerClass('PistonOperator', PistonOperator)

export { PistonOperator }
