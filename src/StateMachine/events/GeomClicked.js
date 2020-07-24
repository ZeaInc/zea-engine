import { sgFactory } from '../../SceneTree/SGFactory.js'

import { TreeItemParameter } from '../../SceneTree/Parameters/index'
import { StateEvent } from '../StateEvent.js'

/** Triggers an state machine event to occur when geometry is clicked.
 * @extends StateEvent
 * @private
 */
class GeomClicked extends StateEvent {
  /**
   * Create a geom clicked.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)
    this.__geomParam = this.addParameter(new TreeItemParameter('TreeItem'))
    this.__geomParam.on('valueChanged', () => {
      if (this.__geom && this.__activated) {
        this.__geom.off('mouseDown', this.__geomClicked)
      }
      this.__geom = this.__geomParam.getValue()
      if (this.__geom && this.__activated) {
        this.__geom.on('mouseDown', this.__geomClicked)
      }
    })
    this.__geomClicked = this.__geomClicked.bind(this)
    this.__activated = false
    this.__geomClickedBindId = -1

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
      this.__geom.on('mouseDown', this.__geomClicked)
    }
    this.__activated = true
  }

  /**
   * The deactivate method.
   */
  deactivate() {
    if (this.__geom) {
      this.__geom.off('mouseDown', this.__geomClicked)
    }
    this.__activated = false
    super.deactivate()
  }
}

sgFactory.registerClass('GeomClicked', GeomClicked)

export { GeomClicked }
