import { Xfo } from '../../Math/Xfo'
import { Operator } from './Operator'
import { OperatorOutput, OperatorOutputMode } from './OperatorOutput'
import { OperatorInput } from './OperatorInput'

/** An operator for aiming items at targets.
 * @extends Operator
 *
 */
class GroupTransformXfoOperator extends Operator {
  /**
   * Create a GroupMemberXfoOperator operator.
   * @param {Parameter} groupGlobalXfoParam - The GlobalXfo param found on the Group.
   * @param {Parameter} groupTransformXfoParam - The parameter on the Group which defines the displacement to apply to the members.
   */
  constructor(groupGlobalXfoParam, groupTransformXfoParam) {
    super()
    this.addInput(new OperatorInput('GroupGlobalXfo')).setParam(groupGlobalXfoParam)
    this.addOutput(new OperatorOutput('GroupTransformXfo')).setParam(groupTransformXfoParam)
  }

  /**
   * Create a GroupMemberXfoOperator operator.
   * @param {Xfo} bindXfo - The Bind Xfo calculated from the initial Transforms of the Group Members.
   */
  setBindXfo(bindXfo) {
    this.bindXfo = bindXfo
    this.invBindXfo = bindXfo.inverse()
    this.setDirty()
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const groupTransformOutput = this.getOutput('GroupTransformXfo')
    if (this.invBindXfo) {
      const groupGlobalXfo = this.getInput('GroupGlobalXfo').getValue()
      groupTransformOutput.setClean(groupGlobalXfo.multiply(this.invBindXfo))
    } else {
      groupTransformOutput.setClean(new Xfo())
    }
  }
}

/** An operator for modifying group members by the groups Xfo
 * @private
 * @extends Operator
 *
 */
class GroupMemberXfoOperator extends Operator {
  /**
   * Create a GroupMemberXfoOperator operator.
   * @param {Parameter} groupTransformXfoParam - The parameter on the Group which defines the displacement to apply to the members.
   * @param {Parameter} memberXfoGlobalParam - The GlobalXfo param found on the Member.
   */
  constructor(groupTransformXfoParam, memberXfoGlobalParam) {
    super()
    this.addInput(new OperatorInput('GroupTransformXfo')).setParam(groupTransformXfoParam)
    this.addOutput(new OperatorOutput('MemberGlobalXfo', OperatorOutputMode.OP_READ_WRITE)).setParam(
      memberXfoGlobalParam
    )

    this._enabled = true
  }

  disable() {
    this._enabled = false
    this.setDirty()
  }

  enable() {
    this._enabled = true
    this.setDirty()
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const memberGlobalXfoOutput = this.getOutput('MemberGlobalXfo')
    const memberGlobalXfo = memberGlobalXfoOutput.getValue()
    if (this._enabled) {
      const groupTransformXfo = this.getInput('GroupTransformXfo').getParam().getValue()
      memberGlobalXfoOutput.setClean(groupTransformXfo.multiply(memberGlobalXfo))
    } else {
      memberGlobalXfoOutput.setClean(memberGlobalXfo)
    }
  }
}

export { GroupTransformXfoOperator, GroupMemberXfoOperator }
