import { sgFactory } from '../../SceneTree/SGFactory.js';

import { TreeItemParameter } from '../../SceneTree/Parameters';
import { StateEvent } from '../StateEvent.js';

class GeomClicked extends StateEvent {
  constructor(name) {
    super(name);
    this.__geomParam = this.addParameter(new TreeItemParameter('TreeItem'));
    this.__geomParam.valueChanged.connect(() => {
      this.__geom = this.__geomParam.getValue();
    });
  }

  __geomClicked(event) {
    event.vleStopPropagation = true;
    this.__onEvent();
  }

  activate() {
    if (this.__geom) {
      this.__geom.mouseDown.connect(this.__geomClicked.bind(this));
    }
  }

  deactivate() {
    if (this.__geom) {
      this.__geom.mouseDown.disconnect(this.__geomClicked.bind(this));
    }
  }
}

sgFactory.registerClass('GeomClicked', GeomClicked);

export { GeomClicked };
