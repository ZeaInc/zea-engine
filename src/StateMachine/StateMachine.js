import { Signal } from '../Utilities/index'
import { BaseItem, ItemFlags, sgFactory } from '../SceneTree/index'

/** A state machine is a mathematical model that describes the behavior of
 * a system that can be in only one state at a time. For example, a door with
 * two states can be "open" and "closed", but it cannot be both open and closed
 * at the same time.
 * @extends BaseItem
 */
class StateMachine extends BaseItem {
  /**
   * Create a state machine.
   * @param {string} name - The name of the state machine.
   */
  constructor(name) {
    super(name)
    this.__states = {}
    this.__currentState
    this.__initialStateName

    this.stateChanged = new Signal()

    // Always save state machines.
    // Then never come as part of the binary data.
    this.setFlag(ItemFlags.USER_EDITED)

    // Manually invoke the callbacks for cases where the StateMAchine
    // is not beingn constructed by the SGFactory.
    if (!sgFactory.isConstructing()) {
      sgFactory.invokeCallbacks(this)
    }
  }

  /**
   * The addState method.
   * @param {any} state - The state value.
   */
  addState(state) {
    state.setStateMachine(this)
    this.__states[state.getName()] = state

    if (
      Object.keys(this.__states).length == 1 &&
      this.__initialStateName == undefined
    ) {
      this.__initialStateName = state.getName()
    }
  }

  /**
   * The getState method.
   * @param {string} name - The name value.
   * @return {any} - The return value.
   */
  getState(name) {
    return this.__states[name]
  }

  /**
   * The activateState method.
   * @param {string} name - The name value.
   */
  activateState(name) {
    // console.log("StateMachine.activateState:" + name)
    if (!this.__states[name]) throw new Error('Invalid state transtion:' + name)
    if (this.__currentState == this.__states[name]) return
    if (this.__currentState) this.__currentState.deactivate()
    this.__currentState = this.__states[name]
    this.__currentState.activate()

    this.stateChanged.emit(name)
  }

  /**
   * The getActiveState method.
   * @return {any} - The return value.
   */
  getActiveState() {
    return this.__currentState
  }

  /**
   * Getter for the currently active state's name.
   * @return {any} - The return value.
   */
  getActiveStateName() {
    return this.__currentState.constructor.name
  }

  /**
   * Getter for the initial state of the state machine.
   * @return {any} - The return value.
   */
  getInitialState() {
    return this.__initialStateName
  }

  /**
   * Setter for the initial state of the state machine.
   * @param {string} name - The name value.
   */
  setInitialState(name) {
    this.__initialStateName = name
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
    j.initialStateName = this.__initialStateName

    const statesj = {}
    for (const key in this.__states) {
      statesj[key] = this.__states[key].toJSON(context, flags)
    }
    j.states = statesj
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
    this.__initialStateName = j.initialStateName

    context.stateMachine = this

    for (const key in j.states) {
      const statejson = j.states[key]
      const state = sgFactory.constructClass(statejson.type)
      if (state) {
        state.fromJSON(statejson, context)
        this.addState(state)
      } else {
        throw new Error('Invalid type:' + statejson.type)
      }
    }
    context.addPLCB(() => {
      // Disabling for now.
      // We can have state machines that are not active at all.
      // E.g. in the 850 E-Tec project.
      // this.activateState(this.__initialStateName);
    })
  }
}

sgFactory.registerClass('StateMachine', StateMachine)

export { StateMachine }
