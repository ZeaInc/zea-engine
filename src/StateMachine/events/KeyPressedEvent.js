import { sgFactory } from '../../SceneTree/SGFactory.js'

import { StringParameter } from '../../SceneTree/Parameters/index'
import { StateEvent } from '../StateEvent.js'

/** Triggers an state machine event to occur when a key is pressed.
 * @extends StateEvent
 */
class KeyPressedEvent extends StateEvent {
  /**
   * Create a key pressed event.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.onKeyPressed = this.onKeyPressed.bind(this)
    this.__keyParam = this.addParameter(new StringParameter('Key', ''))
  }

  /**
   * Causes an event to occur when a key is pressed.
   * @param {any} event - The event that occurs.
   */
  onKeyPressed(event) {
    console.log(event.key)
    if (event.key == this.__keyParam.getValue()) {
      this.__onEvent()
    }
  }

  /**
   * The activate method.
   */
  activate() {
    document.addEventListener('keydown', this.onKeyPressed)
  }

  /**
   * The deactivate method.
   */
  deactivate() {
    document.removeEventListener('keydown', this.onKeyPressed)
  }
}

sgFactory.registerClass('KeyPressedEvent', KeyPressedEvent)

export { KeyPressedEvent }
