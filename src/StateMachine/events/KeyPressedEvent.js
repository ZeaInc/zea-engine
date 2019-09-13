import { sgFactory } from '../../SceneTree/SGFactory.js';

import { Parameter, NumberParameter } from '../../SceneTree/Parameters';
import { StateEvent } from '../StateEvent.js';

class KeyPressedEvent extends StateEvent {
  constructor(name) {
    super(name);
    this.onKeyPressed = this.onKeyPressed.bind(this);
    this.__keyParam = this.addParameter(new Parameter('Key', ''));
  }

  onKeyPressed(event) {
    console.log(event.key);
    if (event.key == this.__keyParam.getValue()) {
      this.__onEvent();
    }
  }

  activate() {
    document.addEventListener('keydown', this.onKeyPressed);
  }

  deactivate() {
    document.removeEventListener('keydown', this.onKeyPressed);
  }
}

sgFactory.registerClass('KeyPressedEvent', KeyPressedEvent);

export { KeyPressedEvent };
