import { sgFactory } from '../SceneTree/SGFactory.js'

/** Class representing a state in a state machine. A model can only be
 * in one state at a time.
 * @private
 */
class State {
  /**
   * Create a state.
   * @param {string} name - The name of the state.
   */
  constructor(name) {
    this.__name = name ? name : sgFactory.getClassName(this)

    this.__stateEvents = []
    this.__activationActions = []
    this.__deactivationActions = []
  }

  /**
   * Getter for the name of the state.
   * @return {string} - Returns the name.
   */
  getName() {
    return this.__name
  }

  /**
   * Setter for the name of the state.
   * @param {string} name - The name of the state.
   */
  setName(name) {
    this.__name = name
  }

  /**
   * The setStateMachine method.
   * @param {any} stateMachine - The stateMachine value.
   */
  setStateMachine(stateMachine) {
    this.__stateMachine = stateMachine
  }

  /**
   * The getStateMachine method.
   * @return {any} - The return value.
   */
  getStateMachine() {
    return this.__stateMachine
  }

  /**
   * Activates the state.
   */
  activate() {
    this.__stateEvents.forEach((stateEvent) => {
      stateEvent.activate()
    })
    this.__activationActions.forEach((action) => {
      action.activate()
    })
  }

  /**
   * Deactivates the state.
   */
  deactivate() {
    this.__stateEvents.forEach((stateEvent) => {
      stateEvent.deactivate()
    })
    // Any activation actions that are still running should be stopped.
    // e.g. SetParameterValue.
    this.__activationActions.forEach((action) => {
      action.deactivate()
    })
    this.__deactivationActions.forEach((action) => {
      action.activate()
    })
  }

  /**
   * Add an event to the state.
   * @param {any} stateEvent - The event to add.
   */
  addStateEvent(stateEvent) {
    stateEvent.setState(this)
    this.__stateEvents.push(stateEvent)
  }

  /**
   * Getter for the state event.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getStateEvent(index) {
    return this.__stateEvents[index]
  }

  /**
   * The addActivationAction method.
   * @param {any} action - The action value.
   */
  addActivationAction(action) {
    action.setState(this)
    this.__activationActions.push(action)
  }

  /**
   * The getActivationAction method.
   * @param {number} index - The index value.
   * @return {any} - The return value.
   */
  getActivationAction(index) {
    return this.__activationActions[index]
  }

  /**
   * The getActivationAction method.
   * @param {any} action - The action value.
   */
  addDeactivationAction(action) {
    action.setState(this)
    this.__deactivationActions.push(action)
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
    const j = {
      name: this.__name,
      type: sgFactory.getClassName(this),
    }

    const stateEventsJson = []
    for (const stateEvent of this.__stateEvents) {
      stateEventsJson.push(stateEvent.toJSON(context, flags))
    }
    j.stateEvents = stateEventsJson

    const activationActionsJson = []
    for (const stateEvent of this.__activationActions) {
      activationActionsJson.push(stateEvent.toJSON(context, flags))
    }
    j.activationActions = activationActionsJson

    const deactivationActionsJson = []
    for (const stateEvent of this.__deactivationActions) {
      deactivationActionsJson.push(stateEvent.toJSON(context, flags))
    }
    j.deactivationActions = deactivationActionsJson

    return j
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    this.__name = j.name

    for (const stateEventJson of j.stateEvents) {
      const stateEvent = sgFactory.constructClass(stateEventJson.type)
      stateEvent.fromJSON(stateEventJson, context)
      this.addStateEvent(stateEvent)
    }
    for (const activationActionJson of j.activationActions) {
      const activationAction = sgFactory.constructClass(activationActionJson.type)
      activationAction.fromJSON(activationActionJson, context)
      this.addActivationAction(activationAction)
    }
    for (const deactivationActionJson of j.deactivationActions) {
      const deactivationAction = sgFactory.constructClass(deactivationActionJson.type)
      deactivationAction.fromJSON(deactivationActionJson, context)
      this.addDeactivationAction(deactivationAction)
    }
  }
}

sgFactory.registerClass('State', State)

export { State }
