import { Mat4, Vec3, Quat, Xfo, Color } from '../../Math';
import { TreeItem } from '../../SceneTree';

class VRHead {
  constructor(vrviewport, stageTreeItem) {
    this.__vrviewport = vrviewport;
    this.__treeItem = new TreeItem('VRHead');
    stageTreeItem.addChild(this.__treeItem);

    this.__mat4 = new Mat4();
    this.__localXfo = new Xfo();
  }

  update(pose) {
    // Old
    // this.__mat4.setDataArray(pose.poseModelMatrix);

    // New
    this.__mat4.setDataArray(pose.transform.matrix);

    this.__localXfo.fromMat4(this.__mat4);

    // const pos = pose.transform.position;
    // this.__localXfo.tr.set(pos.x, pos.y,pos.z);
    // const ori = pose.transform.orientation;
    // this.__localXfo.ori.set(ori.x, ori.y, ori.z, ori.x);

    this.__treeItem.setLocalXfo(this.__localXfo);
  }

  getTreeItem() {
    return this.__treeItem;
  }

  getXfo() {
    return this.__localXfo;
  }
}

export { VRHead };
// export default VRHead;
