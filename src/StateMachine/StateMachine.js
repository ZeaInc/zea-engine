import { Signal } from '../Utilities';
import { BaseItem, ItemFlags, sgFactory } from '../SceneTree';

class StateMachine extends BaseItem {
  constructor(name) {
    super(name);
    this.__states = {};
    this.__currentState;
    this.__initialStateName;

    this.stateChanged = new Signal();

    // Always save state machines.
    // Then never come as part of the binary data.
    this.setFlag(ItemFlags.USER_EDITED);

    // Manually invoke the callbacks for cases where the StateMAchine
    // is not beingn constructed by the SGFactory.
    if (!sgFactory.isConstructing()) {
      sgFactory.invokeCallbacks(this);
    }
  }

  addState(state) {
    state.setStateMachine(this);
    this.__states[state.getName()] = state;

    if (
      Object.keys(this.__states).length == 1 &&
      this.__initialStateName == undefined
    ) {
      this.__initialStateName = state.getName();
    }
  }

  getState(name) {
    return this.__states[name];
  }

  activateState(name) {
    // console.log("StateMachine.activateState:" + name)
    if (!this.__states[name]) throw 'Invalid state transtion:' + name;
    if (this.__currentState == this.__states[name]) return;
    if (this.__currentState) this.__currentState.deactivate();
    this.__currentState = this.__states[name];
    this.__currentState.activate();

    this.stateChanged.emit(name);
  }

  getActiveState() {
    return this.__currentState;
  }

  getActiveStateName() {
    return this.__currentState.constructor.name;
  }

  getInitialState() {
    return this.__initialStateName;
  }
  setInitialState(name) {
    this.__initialStateName = name;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    j.initialStateName = this.__initialStateName;

    const statesj = {};
    for (const key in this.__states) {
      statesj[key] = this.__states[key].toJSON(context, flags);
    }
    j.states = statesj;
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    this.__initialStateName = j.initialStateName;

    context.stateMachine = this;

    for (const key in j.states) {
      const statejson = j.states[key];
      const state = sgFactory.constructClass(statejson.type);
      if (state) {
        state.fromJSON(statejson, context);
        this.addState(state);
      } else {
        throw 'Invalid type:' + statejson.type;
      }
    }
    context.addPLCB(() => {
      // Disabling for now.
      // We can have state machines that are not active at all.
      // e.g. in the 850 E-Tec project.
      // this.activateState(this.__initialStateName);
    });
  }
}

sgFactory.registerClass('StateMachine', StateMachine);

export { StateMachine };
