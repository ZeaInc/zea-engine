import { sgFactory } from '../../SceneTree/SGFactory.js'

import { TreeItemParameter } from '../../SceneTree/Parameters/index'
import { StateEvent } from '../StateEvent.js'

/** Triggers an state machine event to occur when geometry is clicked.
 * @extends StateEvent
 */
class GeomClicked extends StateEvent {
  /**
   * Create a geom clicked.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.__geomParam = this.addParameter(new TreeItemParameter('TreeItem'))
    this.__geomParam.valueChanged.connect(() => {
      this.__geom = this.__geomParam.getValue()
    })
  }

  /**
   * The __geomClicked method.
   * @param {any} event - The event that occurs.
   * @private
   */
  __geomClicked(event) {
    event.stopPropagation()
    this.__onEvent()
  }

  /**
   * The activate method.
   */
  activate() {
    if (this.__geom) {
      this.__geom.mouseDown.connect(this.__geomClicked.bind(this))
    }
  }

  /**
   * The deactivate method.
   */
  deactivate() {
    if (this.__geom) {
      this.__geom.mouseDown.disconnect(this.__geomClicked.bind(this))
    }
  }
}

sgFactory.registerClass('GeomClicked', GeomClicked)

export { GeomClicked }
