import { Xfo } from '../Math';
import { Signal } from '../Utilities';
import { FilePathParameter } from './Parameters';
import { TreeItem, CloneFlags } from './TreeItem.js';
import { loadTextfile } from './Utils.js';
import { sgFactory } from './SGFactory.js';

/** Class representing an instance item in a scene tree.
 * @extends TreeItem
 */
class InstanceItem extends TreeItem {
  /**
   * Create an instance item.
   * @param {string} name - The name of the instance item.
   */
  constructor(name) {
    super(name);
  }

  /**
   * The setSrcTree method.
   * @param {any} treeItem - The treeItem value.
   */
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

  /**
   * The getSrcTree method.
   * @return {any} - The return value.
   */
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

  /**
   * The readBinary method.
   * @param {object} reader - The reader value.
   * @param {object} context - The context value.
   */
  readBinary(reader, context = {}) {
    super.readBinary(reader, context);

    // console.log("numTreeItems:", context.numTreeItems, " numGeomItems:", context.numGeomItems)
    const path = reader.loadStrArray();
    // console.log("InstanceItem of:", path)
    context.resolvePath(path, treeItem => {
      this.setSrcTree(treeItem);
    });
  }

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context = {}, flags = 0) {
    const j = super.toJSON(context, flags);
    return j;
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @param {any} onDone - The onDone value.
   */
  fromJSON(j, context = {}, flags = 0, onDone) {}
}

sgFactory.registerClass('InstanceItem', InstanceItem);

export { InstanceItem };
