import { sgFactory } from '../../SceneTree/SGFactory.js';

import {
  Parameter,
  NumberParameter,
  StringParameter,
} from '../../SceneTree/Parameters';
import { OperatorOutput } from '../../SceneTree/Operators';

import { StateAction } from '../StateAction.js';

class SwitchState extends StateAction {
  constructor() {
    super();
    this.__targetStateParam = this.addParameter(
      new StringParameter('TargetState', '')
    );
  }

  activate() {
    this.__state
      .getStateMachine()
      .activateState(this.__targetStateParam.getValue());
  }
}

sgFactory.registerClass('SwitchState', SwitchState);
export { SwitchState };
