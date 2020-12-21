import { Color } from '../Math/index'
import { BaseItem } from './BaseItem.js'
import { BooleanParameter, NumberParameter, ColorParameter, ImageParameter } from './Parameters/index'

/**
 * `BaseItem` type of class
 *
 * **Parameters**
 * * **BackgroundColor(`ColorParameter`):** Changes background color of the scene
 * * **EnvMap(`ImageParameter`):** _todo_
 * * **Display(`BooleanParameter`):** _todo_
 * * **EnvMapLOD(`NumberParameter`):** _todo_
 * @extends BaseItem
 */
class SceneSettings extends BaseItem {
  /**
   * Create scene settings.
   * @param {string} name - The name of the scene settings item.
   */
  constructor(name: any) {
    super(name)
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '"#eeeeee"' is not assignable to ... Remove this comment to see the full error message
    this.addParameter(new ColorParameter('BackgroundColor', new Color('#eeeeee')))
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    this.addParameter(new ImageParameter('EnvMap'))
    this.addParameter(new BooleanParameter('Display EnvMap', false))
    this.addParameter(new NumberParameter('EnvMapLOD', 0))
  }
}

export { SceneSettings }
