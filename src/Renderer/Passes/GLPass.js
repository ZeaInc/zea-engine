import { Signal } from '../../Utilities';

import { ParameterOwner } from '../../SceneTree/ParameterOwner.js';
import { ValueSetMode, BooleanParameter } from '../../SceneTree/Parameters';

const PassType = {
  OPAQUE: 0,
  TRANSPARENT: 1,
  OVERLAY: 2,
};

// This class abstracts the rendering of a collection of geometries to screen.
class GLPass extends ParameterOwner {
  constructor() {
    super();
    this.updated = new Signal();
    this.enabled = true;
    this.__passIndex = 0;

    const enabledParam = this.addParameter(
      new BooleanParameter('Enabled', true)
    );
    enabledParam.valueChanged.connect(
      mode => (this.enabled = enabledParam.getValue())
    );
  }

  __parameterValueChanged(param, mode) {
    super.__parameterValueChanged(param, mode);
    if (this.__renderer) this.__renderer.requestRedraw();
  }

  init(renderer, passIndex) {
    if (passIndex == undefined) throw 'Missing constructor argument.'; // Type checking. Seomthing that TypeScript will do for us.

    this.__gl = renderer.gl;
    this.__renderer = renderer;
    this.__passIndex = passIndex;
  }

  setPassIndex(passIndex) {
    this.__passIndex = passIndex;
  }

  startPresenting() {}

  stopPresenting() {}

  // ///////////////////////////////////
  // Rendering

  draw(renderstate) {}

  drawHighlightedGeoms(renderstate) {}

  drawGeomData(renderstate) {}

  getGeomItemAndDist(geomData) {}
}

export { GLPass, PassType };
// export default GLPass;
