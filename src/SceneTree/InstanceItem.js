import { Xfo } from '../Math';
import { Signal } from '../Utilities';
import { FilePathParameter } from './Parameters';
import { TreeItem, CloneFlags } from './TreeItem.js';
import { loadTextfile } from './Utils.js';
import { sgFactory } from './SGFactory.js';

class InstanceItem extends TreeItem {
  constructor(name) {
    super(name);
  }

  setSrcTree(treeItem) {
    this.__srcTree = treeItem;

    const numChildren = this.__srcTree.getNumChildren();
    if (numChildren == 0) {
      const child = this.__srcTree.clone(CloneFlags.CLONE_FLAG_INSTANCED_TREE);
      child.setLocalXfo(new Xfo());
      this.addChild(child);
    } else {
      for (let i = 0; i < this.__srcTree.getNumChildren(); i++) {
        this.addChild(
          this.__srcTree.getChild(i).clone(CloneFlags.CLONE_FLAG_INSTANCED_TREE)
        );
      }
    }

    // this.__srcTree.childAdded.connect((child)=>{
    //     this.addChild(child.clone(CloneFlags.CLONE_FLAG_INSTANCED_TREE))
    // })
  }

  getSrcTree() {
    return this.__srcTree;
  }

  // ////////////////////////////////////////
  // Children

  // getChildren() {
  //     return this.__srcTree.getChildren();
  // }

  // numChildren() {
  //     return this.__childItems.length;
  // }

  // getNumChildren() {
  //     return this.__srcTree.getNumChildren();
  // }

  // getChild(index) {
  //     return this.__srcTree.getChild(index);
  // }

  // getChildByName(name) {
  //     return this.__srcTree.getChildByName(name);
  // }

  // ////////////////////////////////////////
  // Persistence

  readBinary(reader, context = {}) {
    super.readBinary(reader, context);

    // console.log("numTreeItems:", context.numTreeItems, " numGeomItems:", context.numGeomItems)
    const path = reader.loadStrArray();
    // console.log("InstanceItem of:", path)
    context.resolvePath(path, treeItem => {
      this.setSrcTree(treeItem);
    });
  }

  toJSON(context = {}, flags = 0) {
    const j = super.toJSON(context, flags);
    return j;
  }

  fromJSON(j, context = {}, flags = 0, onDone) {}
}

sgFactory.registerClass('InstanceItem', InstanceItem);

export { InstanceItem };
