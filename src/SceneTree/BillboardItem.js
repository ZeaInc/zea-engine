import { Color } from '../Math/index'
import { BooleanParameter, NumberParameter, ColorParameter, ImageParameter } from './Parameters/index'
import { TreeItem } from './TreeItem.js'
import { Registry } from '../Registry'

/**
 * A special type of TreeItem(Item with hierarchical abilities) class that represents a banner in a 2D dimension.
 * Can own any type of `BaseImage`.
 * <br>
 * <br>
 * **Parameters**
 * * **Image(`ImageParameter`):** Is the BaseImage you want to display on the board.
 * * **PixelsPerMeter(`NumberParameter`):** Quality and Size of the board. The bigger the number, the smaller the board.
 * * **Alpha(`NumberParameter`):** Transparency of the board, from 0 to 1.
 * * **AlignedToCamera(`BooleanParameter`):** Faces or not the board to the camera at all time(Moves with camera movement).
 * * **DrawOnTop(`BooleanParameter`):** The billboards are rendered overlaid on the scene.
 * * **FixedSizeOnscreen(`BooleanParameter`):** The billboards are rendered at a fixed size on screen, regardless of the distance to the billboard.
 *
 * @extends TreeItem
 */
class BillboardItem extends TreeItem {
  /**
   * Creates a billboard item.
   *
   * @param {string} name - The name of the billboard item.
   * @param {BaseImage} image - The image value.
   */
  constructor(name, image) {
    super(name)
    const imageParam = this.addParameter(new ImageParameter('Image'))
    if (image) imageParam.setValue(image) // Note: this dirties the param and will ensure it is saved to JSON
    this.addParameter(new NumberParameter('PixelsPerMeter', 1000.0))
    this.addParameter(new NumberParameter('Alpha', 1.0))
    this.addParameter(new ColorParameter('Color', new Color(1.0, 1.0, 1.0)))
    this.addParameter(new BooleanParameter('AlignedToCamera', false))
    this.addParameter(new BooleanParameter('DrawOnTop', false))
    this.addParameter(new BooleanParameter('FixedSizeOnscreen', false))
  }
}

Registry.register('BillboardItem', BillboardItem)

export { BillboardItem }
