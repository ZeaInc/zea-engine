import { sgFactory } from '../SceneTree/SGFactory.js';

class State {
  constructor(name) {
    this.__name = name ? name : this.constructor.name;

    this.__stateEvents = [];
    this.__activationActions = [];
    this.__deactivationActions = [];
  }

  getName() {
    return this.__name;
  }
  setName(name) {
    this.__name = name;
  }

  setStateMachine(stateMachine) {
    this.__stateMachine = stateMachine;
  }

  getStateMachine() {
    return this.__stateMachine;
  }

  activate() {
    this.__stateEvents.forEach(stateEvent => {
      stateEvent.activate();
    });
    this.__activationActions.forEach(action => {
      action.activate();
    });
  }

  deactivate() {
    this.__stateEvents.forEach(stateEvent => {
      stateEvent.deactivate();
    });
    this.__deactivationActions.forEach(action => {
      action.activate();
    });
  }

  addStateEvent(stateEvent) {
    stateEvent.setState(this);
    this.__stateEvents.push(stateEvent);
  }
  getStateEvent(index) {
    return this.__stateEvents[index];
  }

  addActivationAction(action) {
    action.setState(this);
    this.__activationActions.push(action);
  }

  getActivationAction(index) {
    return this.__activationActions[index];
  }

  addDeactivationAction(action) {
    action.setState(this);
    this.__deactivationActions.push(action);
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = {
      name: this.__name,
      type: this.constructor.name,
    };

    const stateEventsJson = [];
    for (const stateEvent of this.__stateEvents) {
      stateEventsJson.push(stateEvent.toJSON(context, flags));
    }
    j.stateEvents = stateEventsJson;

    const activationActionsJson = [];
    for (const stateEvent of this.__activationActions) {
      activationActionsJson.push(stateEvent.toJSON(context, flags));
    }
    j.activationActions = activationActionsJson;

    const deactivationActionsJson = [];
    for (const stateEvent of this.__deactivationActions) {
      deactivationActionsJson.push(stateEvent.toJSON(context, flags));
    }
    j.deactivationActions = deactivationActionsJson;

    return j;
  }

  fromJSON(j, context, flags) {
    this.__name = j.name;

    for (const stateEventJson of j.stateEvents) {
      const stateEvent = sgFactory.constructClass(stateEventJson.type);
      stateEvent.fromJSON(stateEventJson, context);
      this.addStateEvent(stateEvent);
    }
    for (const activationActionJson of j.activationActions) {
      const activationAction = sgFactory.constructClass(
        activationActionJson.type
      );
      activationAction.fromJSON(activationActionJson, context);
      this.addActivationAction(activationAction);
    }
    for (const deactivationActionJson of j.deactivationActions) {
      const deactivationAction = sgFactory.constructClass(
        deactivationActionJson.type
      );
      deactivationAction.fromJSON(deactivationActionJson, context);
      this.addDeactivationAction(deactivationAction);
    }
  }
}

sgFactory.registerClass('State', State);

export { State };
