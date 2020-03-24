import { sgFactory } from '../../SceneTree/SGFactory.js'

import { StringParameter } from '../../SceneTree/Parameters/index'

import { StateAction } from '../StateAction.js'

/** A state machine action that switches between states.
 * @extends StateAction
 */
class SwitchState extends StateAction {
  /**
   * Create a switch state.
   */
  constructor() {
    super()
    this.__targetStateParam = this.addParameter(
      new StringParameter('TargetState', '')
    )
  }

  /**
   * Activate the action.
   */
  activate() {
    this.__state
      .getStateMachine()
      .activateState(this.__targetStateParam.getValue())
  }
}

sgFactory.registerClass('SwitchState', SwitchState)
export { SwitchState }
