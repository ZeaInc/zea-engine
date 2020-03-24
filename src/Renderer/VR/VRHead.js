import { Mat4, Xfo } from '../../Math/index'
import { TreeItem } from '../../SceneTree/index'

/** Class representing a VR head. */
class VRHead {
  /**
   * Create a VR head.
   * @param {any} vrviewport - The VR viewport.
   * @param {any} stageTreeItem - The stageTreeItem value.
   */
  constructor(vrviewport, stageTreeItem) {
    this.__vrviewport = vrviewport
    this.__treeItem = new TreeItem('VRHead')
    stageTreeItem.addChild(this.__treeItem)

    this.__mat4 = new Mat4()
    this.__localXfo = new Xfo()
  }

  /**
   * The update method.
   * @param {any} pose - The pose value.
   */
  update(pose) {
    // Old
    // this.__mat4.setDataArray(pose.poseModelMatrix);

    // New
    this.__mat4.setDataArray(pose.transform.matrix)

    this.__localXfo.fromMat4(this.__mat4)

    // const pos = pose.transform.position;
    // this.__localXfo.tr.set(pos.x, pos.y,pos.z);
    // const ori = pose.transform.orientation;
    // this.__localXfo.ori.set(ori.x, ori.y, ori.z, ori.x);

    this.__treeItem.setLocalXfo(this.__localXfo)
  }

  /**
   * The getTreeItem method.
   * @return {any} - The return value.
   */
  getTreeItem() {
    return this.__treeItem
  }

  /**
   * The getXfo method.
   * @return {Xfo} - The return value.
   */
  getXfo() {
    return this.__localXfo
  }
}

export { VRHead }
