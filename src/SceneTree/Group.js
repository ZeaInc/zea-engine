import { Vec3, Color, Xfo } from '../Math';
import { Signal } from '../Utilities';
import {
  ValueSetMode,
  BooleanParameter,
  NumberParameter,
  Vec3Parameter,
  ColorParameter,
  ItemSetParameter,
  MultiChoiceParameter,
} from './Parameters';
import { MaterialParameter } from './Parameters/MaterialParameter.js';
import { ItemFlags } from './BaseItem';
import { TreeItem } from './TreeItem';
import { BaseGeomItem } from './BaseGeomItem';
import { sgFactory } from './SGFactory.js';

const GROUP_INITIAL_XFO_MODES = {
  first: 0,
  average: 1,
  globalOri: 2,
};

/** Class representing a group in the scene tree.
 * @extends TreeItem
 */
class Group extends TreeItem {
  /**
   * Create a group.
   * @param {string} name - The name of the group.
   */
  constructor(name) {
    super(name);

    // Items which can be constructed by a user (not loaded in binary data).
    // Should always have this flag set.
    this.setFlag(ItemFlags.USER_EDITED);

    this.calculatingGroupXfo = false;
    this.propagatingXfoToItems = false;

    this.invGroupXfo = undefined;
    this.__initialXfos = [];
    this.__signalIndices = [];

    let pid = 0;
    this.__itemsParam = this.insertParameter(
      new ItemSetParameter('Items', item => item instanceof TreeItem),
      pid++
    );
    this.__itemsParam.itemAdded.connect((item, index) => {
      this.__bindItem(item, index);
    });
    this.__itemsParam.itemRemoved.connect((item, index) => {
      this.__unbindItem(item, index);
    });
    this.__itemsParam.valueChanged.connect(() => {
      this.calculatingGroupXfo = true;
      this._setGlobalXfoDirty();
      this._setBoundingBoxDirty();
    });

    this.__initialXfoModeParam = this.insertParameter(
      new MultiChoiceParameter(
        'InitialXfoMode',
        GROUP_INITIAL_XFO_MODES.average,
        ['first', 'average', 'global']
      ),
      pid++
    );
    this.__initialXfoModeParam.valueChanged.connect(() => {
      this.calculatingGroupXfo = true;
      this._setGlobalXfoDirty();
    });

    this.__highlightedParam = this.insertParameter(
      new BooleanParameter('Highlighted', false),
      pid++
    );
    this.__highlightedParam.valueChanged.connect(() => {
      this.__updateHighlight();
    });

    this.__updateHighlight = this.__updateHighlight.bind(this);
    const highlightColorParam = this.insertParameter(
      new ColorParameter('HighlightColor', new Color(0.5, 0.5, 1)),
      pid++
    );
    highlightColorParam.valueChanged.connect(this.__updateHighlight);
    const highlightFillParam = this.insertParameter(
      new NumberParameter('HighlightFill', 0.0, [0, 1]),
      pid++
    );
    highlightFillParam.valueChanged.connect(this.__updateHighlight);

    this.__materialParam = this.insertParameter(
      new MaterialParameter('Material'),
      pid++
    );
    this.__materialParam.valueChanged.connect(() => {
      this.__updateMaterial();
    });

    this.__updateCutaway = this.__updateCutaway.bind(this);
    this.insertParameter(
      new BooleanParameter('CutAwayEnabled', false),
      pid++
    ).valueChanged.connect(this.__updateCutaway);
    this.insertParameter(
      new Vec3Parameter('CutVector', new Vec3(1, 0, 0)),
      pid++
    ).valueChanged.connect(this.__updateCutaway);
    this.insertParameter(
      new NumberParameter('CutDist', 0.0),
      pid++
    ).valueChanged.connect(this.__updateCutaway);

    this.__globalXfoParam.valueChanged.connect(() => {
      this._propagateGroupXfoToItems();
    });

    this.mouseDownOnItem = new Signal();
  }

  /**
   * Getter for INITIAL_XFO_MODES.
   */
  static get INITIAL_XFO_MODES() {
    return GROUP_INITIAL_XFO_MODES;
  }

  /**
   * The __updateVisiblity method.
   * @return {boolean} - The return value.
   * @private
   */
  __updateVisiblity() {
    if (super.__updateVisiblity()) {
      const value = this.getVisible();
      Array.from(this.__itemsParam.getValue()).forEach(item => {
        if (item instanceof TreeItem)
          item.propagateVisiblity(this.__visible ? 1 : -1);
      });
      return true;
    }
    return false;
  }

  // /////////////////////////////

  /**
   * The __updateHighlight method.
   * @private
   */
  __updateHighlight() {
    let highlighted = false;
    let color;
    if (this.getParameter('Highlighted').getValue()) {
      highlighted = true;
      color = this.getParameter('HighlightColor').getValue();
      color.a = this.getParameter('HighlightFill').getValue();
    }

    const key = 'groupItemHighlight' + this.getId();
    Array.from(this.__itemsParam.getValue()).forEach(item => {
      if (item instanceof TreeItem) {
        if (highlighted) item.addHighlight(key, color, true);
        else item.removeHighlight(key, true);
      }
    });
  }

  /**
   * Returns a boolean indicating if this group is selectable.
   * @param {boolean} sel - Boolean indicating the new selection state.
   */
  setSelected(sel) {
    super.setSelected(sel);

    if (sel) {
      Array.from(this.__itemsParam.getValue()).forEach(item => {
        if (item instanceof TreeItem)
          item.addHighlight(
            'branchselected' + this.getId(),
            TreeItem.getBranchSelectionOutlineColor(),
            true
          );
      });
      // We want to re-apply the group hilight over the branch selection hilight.
      this.__updateHighlight();
    } else {
      this.removeHighlight('selected');
      Array.from(this.__itemsParam.getValue()).forEach(item => {
        if (item instanceof TreeItem)
          item.removeHighlight('branchselected' + this.getId(), true);
      });
    }
  }

  // ////////////////////////////////////////
  // Global Xfo

  /**
   * The _cleanGlobalXfo method.
   * @return {any} - The return value.
   * @private
   */
  _cleanGlobalXfo() {
    return this.calcGroupXfo();
  }

  /**
   * Calculate the group Xfo translate.
   * @return {Xfo} - Returns a new Xfo.
   */
  calcGroupXfo() {
    const items = Array.from(this.__itemsParam.getValue());
    if (items.length == 0) return new Xfo();
    this.calculatingGroupXfo = true;
    const initialXfoMode = this.__initialXfoModeParam.getValue();
    let xfo;
    if (initialXfoMode == GROUP_INITIAL_XFO_MODES.first) {
      xfo = items[0].getGlobalXfo();
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          this.__initialXfos[index] = item.getGlobalXfo();
        }
      });
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.average) {
      xfo = new Xfo();
      xfo.ori.set(0, 0, 0, 0);
      let numTreeItems = 0;
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          const itemXfo = item.getGlobalXfo();
          xfo.tr.addInPlace(itemXfo.tr);
          xfo.ori.addInPlace(itemXfo.ori);
          // xfo.sc.addInPlace(itemXfo.sc)
          this.__initialXfos[index] = itemXfo;
          numTreeItems++;
        }
      });
      xfo.tr.scaleInPlace(1 / numTreeItems);
      xfo.ori.normalizeInPlace();
      // xfo.sc.scaleInPlace(1/ numTreeItems);
    } else if (initialXfoMode == GROUP_INITIAL_XFO_MODES.globalOri) {
      xfo = new Xfo();
      let numTreeItems = 0;
      items.forEach((item, index) => {
        if (item instanceof TreeItem) {
          const itemXfo = item.getGlobalXfo();
          xfo.tr.addInPlace(itemXfo.tr);
          this.__initialXfos[index] = itemXfo;
          numTreeItems++;
        }
      });
      xfo.tr.scaleInPlace(1 / numTreeItems);
    } else {
      throw new Error('Invalid mode.');
    }

    this.invGroupXfo = xfo.inverse();
    this.calculatingGroupXfo = false;
    return xfo;
  }

  /**
   * The _propagateGroupXfoToItems method.
   * @private
   */
  _propagateGroupXfoToItems() {
    if (this.calculatingGroupXfo) return;

    const items = Array.from(this.__itemsParam.getValue());
    // Only after all the items are resolved do we have an invXfo and we can tranform our items.
    if (!this.calculatingGroupXfo && items.length > 0 && this.invGroupXfo) {
      let delta;
      this.propagatingXfoToItems = true;
      const xfo = this.__globalXfoParam.getValue();
      const setDirty = (item, initialXfo) => {
        const clean = () => {
          if (!delta) {
            // Compute the skinning transform that we can
            // apply to all the items in the group.
            delta = xfo.multiply(this.invGroupXfo);
          }
          return delta.multiply(initialXfo);
        };
        item.getParameter('GlobalXfo').setDirty(clean);
      };
      items.forEach((item, index) => {
        if (item instanceof TreeItem) setDirty(item, this.__initialXfos[index]);
      });
      this.propagatingXfoToItems = false;
    }
  }

  // ////////////////////////////////////////
  // Materials

  /**
   * The __updateMaterial method.
   * @private
   */
  __updateMaterial() {
    const material = this.getParameter('Material').getValue();

    Array.from(this.__itemsParam.getValue()).forEach(item => {
      item.traverse(treeItem => {
        if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
          const p = treeItem.getParameter('Material');
          if (material) {
            const m = p.getValue();
            if (m != material) {
              p.__backupMaterial = m;
              p.setValue(material);
            }
          } else if (p.__backupMaterial) {
            p.setValue(p.__backupMaterial);
          }
        }
      }, false);
    });
  }

  // ////////////////////////////////////////
  // Cutaways

  /**
   * The __updateCutaway method.
   * @private
   */
  __updateCutaway() {
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue();
    const cutAwayVector = this.getParameter('CutVector').getValue();
    const cutAwayDist = this.getParameter('CutDist').getValue();

    Array.from(this.__itemsParam.getValue()).forEach(item => {
      item.traverse(treeItem => {
        if (treeItem instanceof BaseGeomItem) {
          treeItem.setCutawayEnabled(cutEnabled);
          treeItem.setCutVector(cutAwayVector);
          treeItem.setCutDist(cutAwayDist);
        }
      }, true);
    });
  }

  // ////////////////////////////////////////
  // Items

  /**
   * This method is mostly used in our demos,
   * and should be removed from the interface
   * @param {any} paths - The paths value.
   */
  setPaths(paths) {
    this.clearItems(false);

    const searchRoot = this.getOwner();
    if (searchRoot == undefined) return;
    const items = [];
    paths.forEach(path => {
      const treeItem = searchRoot.resolvePath(path);
      if (treeItem) items.push(treeItem);
    });
    this.setItems(items);
  }

  /**
   * For backwards compatiblity.
   * @param {any} paths - The paths value.
   */
  resolveItems(paths) {
    this.setPaths(paths);
  }

  /**
   * The __bindItem method.
   * @param {any} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __bindItem(item, index) {
    if (!(item instanceof TreeItem)) return;

    const signalIndices = {};

    signalIndices.mouseDownIndex = item.mouseDown.connect(event => {
      this.mouseDown.emit(event);
      this.mouseDownOnItem.emit(event, item);
    });

    // ///////////////////////////////
    // Update the Material
    const material = this.getParameter('Material').getValue();
    if (material) {
      item.traverse(treeItem => {
        if (treeItem instanceof TreeItem && treeItem.hasParameter('Material')) {
          const p = treeItem.getParameter('Material');
          if (material) {
            const m = p.getValue();
            if (m != material) {
              p.__backupMaterial = m;
              p.setValue(material);
            }
          }
        }
      }, true);
    }

    // ///////////////////////////////
    // Update the highlight
    if (
      item instanceof TreeItem &&
      this.getParameter('Highlighted').getValue()
    ) {
      const color = this.getParameter('HighlightColor').getValue();
      color.a = this.getParameter('HighlightFill').getValue();
      item.addHighlight('groupItemHighlight' + this.getId(), color, true);
    }

    // ///////////////////////////////
    // Update the item cutaway
    const cutEnabled = this.getParameter('CutAwayEnabled').getValue();
    if (cutEnabled) {
      const cutAwayVector = this.getParameter('CutVector').getValue();
      const cutAwayDist = this.getParameter('CutDist').getValue();
      item.traverse(treeItem => {
        if (treeItem instanceof BaseGeomItem) {
          treeItem.setCutawayEnabled(cutEnabled);
          treeItem.setCutVector(cutAwayVector);
          treeItem.setCutDist(cutAwayDist);
        }
      }, true);
    }

    if (!this.getVisible()) {
      // Decrement the visiblity counter which might cause
      // this item to become invisible (or it might already be invisible).
      item.propagateVisiblity(-1);
    }

    // Higlight the new item with branch selection color.
    if (this.getSelected()) {
      if (item instanceof TreeItem)
        item.addHighlight(
          'branchselected' + this.getId(),
          TreeItem.getBranchSelectionOutlineColor(),
          true
        );
    }

    signalIndices.globalXfoChangedIndex = item.globalXfoChanged.connect(
      mode => {
        if (
          mode != ValueSetMode.OPERATOR_SETVALUE &&
          mode != ValueSetMode.OPERATOR_DIRTIED
        )
          this.__initialXfos[index] = item.getGlobalXfo();
      }
    );
    this.__initialXfos[index] = item.getGlobalXfo();

    signalIndices.bboxChangedIndex = item.boundingChanged.connect(
      this._setBoundingBoxDirty
    );

    this.__signalIndices[index] = signalIndices;
  }

  /**
   * The __unbindItem method.
   * @param {any} item - The item value.
   * @param {number} index - The index value.
   * @private
   */
  __unbindItem(item, index) {
    if (!(item instanceof TreeItem)) return;

    item.removeHighlight('branchselected' + this.getId(), true);
    if (this.getParameter('Highlighted').getValue()) {
      item.removeHighlight('groupItemHighlight' + this.getId(), true);
    }

    if (!this.getVisible()) {
      // Increment the visiblity counter which might cause
      // this item to become visible.
      // It will stay invisible if its parent is invisible, or if
      // multiple groups connect to it and say it is invisible.
      item.propagateVisiblity(1);
    }

    // ///////////////////////////////
    // Update the item cutaway
    item.traverse(treeItem => {
      if (treeItem instanceof BaseGeomItem) {
        treeItem.setCutawayEnabled(false);
      }
    }, true);

    item.mouseDown.disconnectId(this.__signalIndices[index].mouseDownIndex);
    item.globalXfoChanged.disconnectId(
      this.__signalIndices[index].globalXfoChangedIndex
    );
    item.boundingChanged.disconnectId(
      this.__signalIndices[index].bboxChangedIndex
    );
    this.__signalIndices.splice(index, 1);
    this.__initialXfos.splice(index, 1);
  }

  /**
   * Add an item to the group.
   * @param {any} item - The item value.
   * @param {any} emit - The emit value.
   */
  addItem(item, emit = true) {
    if (!item) {
      console.warn('Error adding item to group. Item is null');
      return;
    }
    this.__itemsParam.addItem(item, emit);
  }

  /**
   * Remove an item to the group.
   * @param {any} item - The item value.
   * @param {boolean} emit - The emit value.
   */
  removeItem(item, emit = true) {
    this.__itemsParam.removeItem(item, emit);
  }

  /**
   * Clear items from the group.
   * @param {boolean} emit - The emit value.
   */
  clearItems(emit = true) {
    // Note: Unbind reversed so that indices
    // do not get changed during the unbind.
    const items = Array.from(this.__itemsParam.getValue());
    for (let i = items.length - 1; i >= 0; i--) {
      this.__unbindItem(items[i], i);
    }
    this.__signalIndices = [];
    this.__initialXfos = [];
    this.__itemsParam.clearItems(emit);
  }

  /**
   * The getItems method.
   * @return {any} - The return value.
   */
  getItems() {
    return this.__itemsParam.getValue();
  }

  /**
   * The setItems method.
   * @param {any} items - The items value.
   */
  setItems(items) {
    this.clearItems(false);
    this.__itemsParam.setItems(items);
  }

  /**
   * The _cleanBoundingBox method.
   * @param {Box3} bbox - The bounding box value.
   * @return {any} - The return value.
   * @private
   */
  _cleanBoundingBox(bbox) {
    const result = super._cleanBoundingBox(bbox);
    const items = Array.from(this.__itemsParam.getValue());
    items.forEach(item => {
      if (item instanceof TreeItem) {
        if (item.getVisible() && !item.testFlag(ItemFlags.IGNORE_BBOX))
          bbox.addBox3(item.getBoundingBox());
      }
    });
    return bbox;
  }

  // ///////////////////////
  // Events

  /**
   * Occurs when a user presses a mouse button over an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - Returns false.
   */
  onMouseDown(event) {
    return false;
  }

  /**
   * Occurs when a user releases a mouse button over a element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - Returns false.
   */
  onMouseUp(event) {
    return false;
  }

  /**
   * Occur when the mouse pointer is moving while over an element.
   * @param {any} event - The event that occurs.
   * @return {boolean} - Returns false.
   */
  onMouseMove(event) {
    return false;
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    const items = Array.from(this.__itemsParam.getValue());
    const treeItems = [];
    items.forEach(p => {
      const path = p.getPath();
      treeItems.push(context ? context.makeRelative(path) : path);
    });
    j.treeItems = treeItems;
    return j;
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);

    // Note: JSON data is only used to store user edits, so
    // parameters loaed from JSON are considered user edited.
    this.setFlag(ItemFlags.USER_EDITED);

    if (!j.treeItems) {
      console.warn('Invalid Parameter JSON');
      return;
    }
    let count = j.treeItems.length;

    const addItem = path => {
      context.resolvePath(
        path,
        treeItem => {
          this.addItem(treeItem);
          count--;
          if (count == 0) {
            this.calculatingGroupXfo = true;
            this.setGlobalXfo(this.calcGroupXfo());
            this.calculatingGroupXfo = false;
          }
        },
        reason => {
          console.warn(
            "Group: '" + this.getName() + "'. Unable to load item:" + path
          );
        }
      );
    };
    for (const path of j.treeItems) {
      addItem(path);
    }
  }

  // ////////////////////////////////////////
  // Clone and Destroy

  /**
   * The clone method constructs a new group,
   * copies its values and returns it.
   * @param {number} flags - The flags value.
   * @return {Group} - Returns a new cloned group.
   */
  clone(flags) {
    const cloned = new Group();
    cloned.copyFrom(this, flags);
    return cloned;
  }

  /**
   * The copyFrom method.
   * @param {Group} src - The group to copy from.
   * @param {number} flags - The flags value.
   */
  copyFrom(src, flags) {
    super.copyFrom(src, flags);
  }

  /**
   * The destroy is called by the system to cause explicit resources cleanup.
   * Users should never need to call this method directly.
   */
  destroy() {
    super.destroy();
  }
}

sgFactory.registerClass('Group', Group);

export { Group };
