import { sgFactory } from '../SceneTree/SGFactory.js';
import { ParameterOwner } from '../SceneTree/ParameterOwner.js';

import { StateAction } from './StateAction.js';

class StateEvent extends StateAction {
  constructor(name) {
    super();
    this.__name = name;
    // this.__childActions = [];
    this.__onEvent = this.__onEvent.bind(this);
  }

  __onEvent() {
    this.__childActions.forEach(action => {
      action.activate();
    });
  }
}

export { StateEvent };
