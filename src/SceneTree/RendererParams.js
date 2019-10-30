import { Color } from '../Math';
import { BaseItem } from './BaseItem.js';
import { ColorParameter, ImageParameter } from './Parameters';

/** Class representing renderer parameters.
 * @extends BaseItem
 */
class RendererParams extends BaseItem {
  /**
   * Create renderer parameters.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name);
    this.addParameter(
      new ColorParameter('BackgroundColor', new Color('#808080'))
    );
    this.addParameter(new ImageParameter('EnvMap'));
  }
}

export { RendererParams };
