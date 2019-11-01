import { StateAction } from './StateAction.js';

/** Class representing a state event. An event tiggers an action
 * that changes the state of the model.
 * @extends StateAction
 */
class StateEvent extends StateAction {
  /**
   * Create a state event.
   * @param {string} name - The name of the event.
   */
  constructor(name) {
    super();
    this.__name = name;
    // this.__childActions = [];
    this.__onEvent = this.__onEvent.bind(this);
  }

  /**
   * The __onEvent method.
   * @private
   */
  __onEvent() {
    this.__childActions.forEach(action => {
      action.activate();
    });
  }
}

export { StateEvent };
