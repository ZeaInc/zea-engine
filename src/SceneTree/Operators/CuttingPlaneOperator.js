import { Vec4 } from '../../Math/Vec4'
import { Operator } from './Operator'
import { OperatorOutput } from './OperatorOutput'
import { OperatorInput } from './OperatorInput'

/** An operator that calculates the delta transform of the group since items were bound to it.
 * @extends Operator
 *
 */
class CuttingPlaneOperator extends Operator {
  /**
   * Create a GroupMemberXfoOperator operator.
   * @param {Parameter} groupGlobalXfoParam - The GlobalXfo param found on the Group.
   * @param {Parameter} cuttingPlaneParam - The parameter on the Group which defines the displacement to apply to the members.
   */
  constructor(groupGlobalXfoParam, cuttingPlaneParam) {
    super()
    this.addInput(new OperatorInput('GroupGlobalXfo')).setParam(groupGlobalXfoParam)
    this.addOutput(new OperatorOutput('CuttingPlane')).setParam(cuttingPlaneParam)
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const cuttingPlaneOutput = this.getOutput('CuttingPlane')
    const groupGlobalXfo = this.getInput('GroupGlobalXfo').getValue()

    const vec = groupGlobalXfo.ori.getZaxis()
    const dist = groupGlobalXfo.tr.dot(vec)

    cuttingPlaneOutput.setClean(new Vec4(vec.x, vec.y, vec.z, -dist))
  }
}

export { CuttingPlaneOperator }
