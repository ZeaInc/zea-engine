import { sgFactory } from '../../SceneTree/SGFactory.js'

import { NumberParameter } from '../../SceneTree/Parameters/index'
import { StateEvent } from '../StateEvent.js'

/** Triggers an state machine event to occur after a certain time has passed.
 * @extends StateEvent
 */
class TimedWait extends StateEvent {
  /**
   * Create a timed wait.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.__waitTimeParam = this.addParameter(new NumberParameter('WaitTime', 1))
  }

  /**
   * The activate method.
   */
  activate() {
    const timerCallback = () => {
      delete this.__timeoutId
      this.__onEvent()
    }
    this.__timeoutId = window.setTimeout(
      timerCallback,
      this.__waitTimeParam.getValue() * 1000
    ) // Sample at 50fps.
  }

  /**
   * The deactivate method.
   */
  deactivate() {
    if (this.__timeoutId) {
      window.clearTimeout(this.__timeoutId)
    }
  }
}

sgFactory.registerClass('TimedWait', TimedWait)
export { TimedWait }
