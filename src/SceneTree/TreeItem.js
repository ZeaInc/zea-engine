import { Color, Xfo, Box3 } from '../Math';
import { Signal } from '../Utilities';
import { sgFactory } from './SGFactory.js';
import {
  ParamFlags,
  ValueSetMode,
  Parameter,
  BooleanParameter,
  NumberParameter,
  ColorParameter,
  Vec2Parameter,
  XfoParameter,
} from './Parameters';
import { ItemFlags, BaseItem } from './BaseItem.js';

// Defines used to explicity specify types for WebGL.
const SaveFlags = {
  SAVE_FLAG_SKIP_CHILDREN: 1 << 0,
};

const LoadFlags = {
  // When loading the values of a bin tree, as opposed
  // to loading a full json defined tree.
  LOAD_FLAG_LOADING_BIN_TREE_VALUES: 1 << 4,
};

const CloneFlags = {
  CLONE_FLAG_INSTANCED_TREE: 1 << 0,
};

const selectionOutlineColor = new Color('#03E3AC');
selectionOutlineColor.a = 0.1;
const branchSelectionOutlineColor = selectionOutlineColor.lerp(
  new Color('white'),
  0.5
);
branchSelectionOutlineColor.a = 0.1;

class TreeItem extends BaseItem {
  constructor(name) {
    super(name);

    this.__visibleCounter = 1; // Visible by Default.
    this.__visible = true;
    this.__selectable = true;
    this.__selected = false;
    this.__highlightMapping = {};
    this.__highlights = [];

    this.__childItems = [];
    this.__childItemsSignalIds = [];
    this.__childItemsMapping = {};

    this.__components = [];
    this.__componentMapping = {};

    this.mouseDown = new Signal();
    this.mouseUp = new Signal();
    this.mouseMove = new Signal();

    // /////////////////////////////////////
    // Add parameters.

    this.__visibleParam = this.addParameter(
      new BooleanParameter('Visible', true)
    );
    this.__localXfoParam = this.addParameter(
      new XfoParameter('LocalXfo', new Xfo())
    );
    this.__globalXfoParam = this.addParameter(
      new XfoParameter('GlobalXfo', new Xfo())
    );
    this.__boundingBoxParam = this.addParameter(
      new Parameter('BoundingBox', new Box3())
    );

    this.parentChanged = this.ownerChanged;
    this.childAdded = new Signal();
    this.childRemoved = new Signal();
    // this.componentAdded = new Signal();
    // this.componentRemoved = new Signal();
    this.highlightChanged = new Signal();
    this.visibilityChanged = new Signal();
    this.selectedChanged = new Signal();
    this.localXfoChanged = this.__localXfoParam.valueChanged;
    this.globalXfoChanged = this.__globalXfoParam.valueChanged;
    this.boundingChanged = this.__boundingBoxParam.valueChanged;

    // Bind handlers
    this._cleanGlobalXfo = this._cleanGlobalXfo.bind(this);
    this._setGlobalXfoDirty = this._setGlobalXfoDirty.bind(this);
    this._setBoundingBoxDirty = this._setBoundingBoxDirty.bind(this);
    this._cleanBoundingBox = this._cleanBoundingBox.bind(this);

    this.__localXfoParam.valueChanged.connect(this._setGlobalXfoDirty);

    const cleanLocalXfo = prevValue => {
      const globalXfo = this.__globalXfoParam.getValue();
      if (this.__ownerItem !== undefined)
        return this.__ownerItem
          .getGlobalXfo()
          .inverse()
          .multiply(globalXfo);
      else return globalXfo;
    };
    this.__globalXfoParam.valueChanged.connect(mode => {
      // Dirtiness propagates from Local to Global, but not vice versa.
      if (mode != ValueSetMode.OPERATOR_DIRTIED) {
        this.__localXfoParam.setDirty(cleanLocalXfo);
      }
      this._setBoundingBoxDirty();
    });

    this.__visibleParam.valueChanged.connect(mode => {
      this.__visibleCounter += this.__visibleParam.getValue() ? 1 : -1;
      this.__updateVisiblity();
    });
  }

  destroy() {
    this.removeAllChildren();
    super.destroy();
  }

  clone(flags) {
    const cloned = new TreeItem();
    cloned.copyFrom(this, flags);
    return cloned;
  }

  copyFrom(src, flags) {
    super.copyFrom(src, flags);

    // Share a local Xfo
    // Note: disabled for now.
    // When cloning instanced trees, the root item should
    // have a unique LocalXfoParam, as it must be re-set.
    // (The root of the tree is a cloned and attached to an Instance node that provides the transform)

    // if(flags& CloneFlags.CLONE_FLAG_INSTANCED_TREE)
    //     this.__localXfoParam = this.replaceParameter(src.getParameter('LocalXfo'));

    for (const srcChildItem of src.getChildren())
      if (srcChildItem) this.addChild(srcChildItem.clone(flags));
    // if(flags& CloneFlags.CLONE_FLAG_INSTANCED_TREE) {
    //     src.childAdded.connect((childItem, index)=>{
    //         this.addChild(childItem.clone(flags));
    //     })
    // }
  }

  // ////////////////////////////////////////
  // Flags

  _childFlagsChanged(flags) {
    if ((flags & ParamFlags.USER_EDITED) != 0)
      this.setFlag(ItemFlags.USER_EDITED);
  }

  setFlag(flag) {
    super.setFlag(flag);
    if (this.__ownerItem) this.__ownerItem._childFlagsChanged(flag);
  }

  // ////////////////////////////////////////
  // Parent Item

  setOwner(parentItem) {
    if (this.__ownerItem) {
      this.__ownerItem.globalXfoChanged.disconnect(this._setGlobalXfoDirty);

      // The effect of the invisible owner is removed.
      if (!this.__ownerItem.getVisible()) this.__visibleCounter++;
    }

    super.setOwner(parentItem);

    this._setGlobalXfoDirty();
    if (this.__ownerItem) {
      this.setSelectable(this.__ownerItem.getSelectable(), true);

      // The effect of the invisible owner is added.
      if (!this.__ownerItem.getVisible()) this.__visibleCounter--;

      this.__ownerItem.globalXfoChanged.connect(this._setGlobalXfoDirty);
    }

    this.__updateVisiblity();
  }

  __updatePath() {
    super.__updatePath();
    for (const childItem of this.__childItems) {
      if (childItem) childItem.__updatePath();
    }
    for (const component of this.__components) {
      if (component) component.__updatePath();
    }
  }

  getParentItem() {
    return this.getOwner();
  }

  setParentItem(parentItem) {
    this.setOwner(parentItem);
  }

  // ////////////////////////////////////////
  // Global Matrix

  getLocalXfo() {
    return this.__localXfoParam.getValue();
  }

  setLocalXfo(xfo) {
    this.__localXfoParam.setValue(xfo);
  }

  getGlobalXfo(mode) {
    return this.__globalXfoParam.getValue(mode);
  }

  setGlobalXfo(xfo, mode) {
    this.__globalXfoParam.setValue(xfo, mode);
  }

  _cleanGlobalXfo(prevValue) {
    const parentItem = this.getParentItem();
    if (parentItem !== undefined)
      return parentItem
        .getGlobalXfo()
        .multiply(this.__localXfoParam.getValue());
    else return this.__localXfoParam.getValue();
  }

  _setGlobalXfoDirty() {
    this.__globalXfoParam.setDirty(this._cleanGlobalXfo);
  }

  // ////////////////////////////////////////
  // Visibility

  getVisible() {
    // Should never be more than 1, but can be less than 0.
    return this.__visibleCounter > 0;
  }

  setVisible(val) {
    this.__visibleParam.setValue(val);
  }

  propagateVisiblity(val) {
    this.__visibleCounter += val;
    this.__updateVisiblity();
  }

  __updateVisiblity() {
    const visible = this.__visibleCounter > 0;
    if (visible != this.__visible) {
      this.__visible = visible;
      for (const childItem of this.__childItems) {
        childItem.propagateVisiblity(this.__visible ? 1 : -1);
      }
      this.visibilityChanged.emit(visible);
      return true;
    }
    return false;
  }

  // ////////////////////////////////////////
  // Selectability and Selection

  getSelectable() {
    return this.__selectable;
  }

  setSelectable(val, propagateToChildren = true) {
    if (this.__selectable != val || propagateToChildren) {
      this.__selectable = val;
      for (const childItem of this.__childItems)
        childItem.setSelectable(this.__selectable, propagateToChildren);
    }
  }

  isSelected() {
    return this.__selected;
  }
  getSelected() {
    return this.__selected;
  }

  setSelected(sel) {
    this.__selected = sel;
    if (sel) {
      this.addHighlight('selected', selectionOutlineColor, false);
      for (const childItem of this.__childItems)
        childItem.addHighlight(
          'branchselected' + this.getId(),
          branchSelectionOutlineColor,
          true
        );
    } else {
      this.removeHighlight('selected');
      for (const childItem of this.__childItems)
        childItem.removeHighlight('branchselected' + this.getId(), true);
    }
    this.selectedChanged.emit(this.__selected);
  }

  // ////////////////////////////////////////
  // Highlights

  addHighlight(name, color, propagateToChildren = false) {
    if (!(name in this.__highlightMapping)) {
      this.__highlights.push(name);
    }
    this.__highlightMapping[name] = color;
    this.highlightChanged.emit();

    if (propagateToChildren) {
      for (const childItem of this.__childItems)
        childItem.addHighlight(name, color, propagateToChildren);
    }
  }

  removeHighlight(name, propagateToChildren = false) {
    if (name in this.__highlightMapping) {
      const id = this.__highlights.indexOf(name);
      this.__highlights.splice(id, 1);
      delete this.__highlightMapping[name];
      this.highlightChanged.emit();
    }
    if (propagateToChildren) {
      for (const childItem of this.__childItems)
        childItem.removeHighlight(name, propagateToChildren);
    }
  }

  getHighlight() {
    if (this.__highlights.length > 0)
      return this.__highlightMapping[
        this.__highlights[this.__highlights.length - 1]
      ];
  }

  isHighlighted() {
    return this.__highlights.length > 0;
  }

  // ////////////////////////////////////////
  // BoundingBox

  get boundingBox() {
    console.warn("getter is deprectated. Please use 'getBoundingBox'");
    return this.getBoundingBox();
  }

  getBoundingBox() {
    return this.__boundingBoxParam.getValue();
  }

  _cleanBoundingBox(bbox) {
    bbox.reset();
    for (const childItem of this.__childItems) {
      if (childItem.getVisible() && !childItem.testFlag(ItemFlags.IGNORE_BBOX))
        bbox.addBox3(childItem.getBoundingBox());
    }
    return bbox;
  }

  _childBBoxChanged() {
    this._setBoundingBoxDirty();
  }

  _setBoundingBoxDirty() {
    if (this.__boundingBoxParam) {
      // Will cause boundingChanged to emit
      this.__boundingBoxParam.setDirty(this._cleanBoundingBox);
    }
  }

  // ////////////////////////////////////////
  // Children

  getChildren() {
    return this.__childItems;
  }

  numChildren() {
    return this.__childItems.length;
  }

  getNumChildren() {
    return this.__childItems.length;
  }

  generateUniqueName(name) {
    if (!(name in this.__childItemsMapping)) return name;

    let index = 1;
    if (
      name.length > 4 &&
      !Number.isNaN(parseInt(name.substring(name.length - 4)))
    )
      index = parseInt(name.substr(name.length - 4));
    else if (
      name.length > 3 &&
      !Number.isNaN(parseInt(name.substring(name.length - 3)))
    )
      index = parseInt(name.substr(name.length - 3));
    else if (
      name.length > 2 &&
      !Number.isNaN(parseInt(name.substring(name.length - 2)))
    )
      index = parseInt(name.substr(name.length - 2));

    const names = [];
    for (const c of this.__childItems) {
      // Sometimes we have an empty child slot.
      // We resize the child vector, and then populate it.
      if (c) {
        names.push(c.getName());
      }
    }

    let uniqueName = name;
    while (true) {
      let suffix = '' + index;
      while (suffix.length < 2) {
        suffix = '0' + suffix;
      }

      uniqueName = name + suffix;
      if (names.indexOf(uniqueName) == -1) break;
      index++;
    }
    return uniqueName;
  }

  __updateMapping(start) {
    // If a child has been added or removed from the
    // tree item, we need to update the acceleration structure.
    for (let i = start; i < this.__childItems.length; i++) {
      this.__childItemsMapping[this.__childItems[i].getName()] = i;
    }
  }

  insertChild(childItem, index, maintainXfo = false, checkCollisions = true) {
    if (checkCollisions && childItem.getName() in this.__childItemsMapping)
      throw "Item '" +
        childItem.getName() +
        "' is already a child of :" +
        this.getPath();
    if (!(childItem instanceof TreeItem))
      throw 'Object is is not a tree item :' + childItem.constructor.name;

    if (childItem.isDestroyed())
      throw 'childItem is destroyed:' + childItem.getPath();

    let newLocalXfo;
    if (maintainXfo)
      newLocalXfo = this.getGlobalXfo()
        .inverse()
        .multiply(childItem.getGlobalXfo());

    const signalIds = {};
    signalIds.nameChangedId = childItem.nameChanged.connect((name, oldName) => {
      // Update the acceleration structure.
      const index = this.__childItemsMapping[oldName];
      delete this.__childItemsMapping[oldName];
      this.__childItemsMapping[name] = index;
    });
    signalIds.bboxChangedId = childItem.boundingChanged.connect(
      this._setBoundingBoxDirty
    );
    signalIds.visChangedId = childItem.visibilityChanged.connect(
      this._setBoundingBoxDirty
    );

    this.__childItems.splice(index, 0, childItem);
    this.__childItemsSignalIds.splice(index, 0, signalIds);
    this.__childItemsMapping[childItem.getName()] = index;
    this.__updateMapping(index);

    childItem.setOwner(this);

    if (maintainXfo) childItem.setLocalXfo(newLocalXfo);

    if (childItem.testFlag(ItemFlags.USER_EDITED))
      this.setFlag(ItemFlags.USER_EDITED);

    this._setBoundingBoxDirty();
    this.childAdded.emit(childItem, index);

    return childItem;
  }

  addChild(childItem, maintainXfo = false, checkCollisions = true) {
    const index = this.__childItems.length;
    this.insertChild(childItem, index, maintainXfo, checkCollisions);
    return index;
  }

  getChild(index) {
    return this.__childItems[index];
  }

  getChildByName(name) {
    const index = this.__childItemsMapping[name];
    if (index != undefined) {
      return this.__childItems[index];
    }
    // for (let childItem of this.__childItems) {
    //   if (childItem != null && childItem.getName() == name) {
    //     return childItem;
    //   }
    // }
    return null;
  }

  getChildNames() {
    const names = [];
    for (let i = 0; i < this.__childItems.length; i++) {
      const childItem = this.__childItems[i];
      if (childItem != null) names[i] = childItem.getName();
    }
    return names;
  }

  removeChild(index) {
    const childItem = this.__childItems[index];
    if (childItem) {
      const signalIds = this.__childItemsSignalIds[index];
      childItem.nameChanged.disconnectId(signalIds.nameChangedId);
      childItem.boundingChanged.disconnectId(signalIds.bboxChangedId);
      childItem.visibilityChanged.disconnectId(signalIds.visChangedId);

      this.__childItems.splice(index, 1);
      this.__childItemsSignalIds.splice(index, 1);
      delete this.__childItemsMapping[childItem.getName()];
      this.__updateMapping(index);
      this._setBoundingBoxDirty();

      childItem.setParentItem(undefined);
      this.childRemoved.emit(childItem, index);
    }
  }

  removeChildByHandle(childItem) {
    const index = this.__childItems.indexOf(childItem);
    if (index == -1)
      throw 'Error in removeChildByHandle. Child not found:' +
        childItem.getName();
    return this.removeChild(index);
  }

  removeAllChildren() {
    let index = this.__childItems.length;
    while (index--) {
      this.removeChild(index);
    }
    this._setBoundingBoxDirty();
  }

  indexOfChild(childItem) {
    return this.__childItems.indexOf(childItem);
  }

  // ////////////////////////////////////////
  // Components

  addComponent(component) {
    this.__components.push(component);
    this.__componentMapping[component.getName()] = this.__components.length - 1;

    component.setOwner(this);

    // this.componentAdded.emit(component);
  }

  removeComponent(name) {
    const index = this.__componentMapping[name];
    if (index == undefined) {
      throw 'Component not found:' + name;
    }
    const component = this.__components[index];
    component.setOwner(undefined);
    this.__components.splice(index, 1);

    const componentMapping = {};
    for (let i = 0; i < this.__components.length; i++)
      componentMapping[this.__components[i].getName()] = i;
    this.__componentMapping = componentMapping;

    // this.componentRemoved.emit(component, index);
    return component;
  }

  hasComponent(name) {
    return name in this.__componentMapping;
  }

  getComponent(name) {
    if (!(name in this.__componentMapping)) {
      console.log("No component named '" + name + "' found.");
      return;
    }
    return this.__components[this.__componentMapping[name]];
  }

  // ////////////////////////////////////////
  // Path Traversial
  // Note: path resolution starts at the root of the
  // tree the path was generated from. (so index=1, because we don't resolve root).
  // Note: when a path is made relative to an item in its tree, the path
  // starts with the child elements.
  resolvePath(path, index = 0) {
    if (typeof path == 'string') path = path.split('/');

    if (index == 0) {
      if (path[0] == '.' || path[0] == this.__name) index++;
      else if (path[0] == '..') {
        return this.__ownerItem.resolvePath(path, index + 1);
      } else {
        // Note: new paths should be generated starting with the name of the root object.
        // Re-enable this to debug path issues.
        // console.warn("Paths should start with the name of the root item or '.'")
      }
    }

    if (index == path.length) {
      return this;
    }

    if (path[index] == '>' && index == path.length - 2) {
      if (this.hasComponent(path[index + 1])) {
        const component = this.getComponent(path[index + 1]);
        return component.resolvePath(path, index + 2);
      }
    }

    const childName = path[index];
    const childItem = this.getChildByName(childName);
    if (childItem == undefined) {
      // Maybe the name is a component name.
      if (this.hasComponent(path[index])) {
        const component = this.getComponent(path[index]);
        if (index == path.length) {
          return component;
        } else {
          return component.resolvePath(path, index + 1);
        }
      }

      // Maybe the name is a parameter name.
      const param = this.getParameter(path[index]);
      if (param) {
        return param;
      }

      // Note: consuming code should generate errors if necssary.
      // In some cases, this _should_ return null and errors messages ares imply distracting.
      // report("Unable to resolve path '"+"/".join(path)+"' after:"+this.getName());
      // console.warn("Unable to resolve path :" + (path) + " after:" + this.getName() + "\nNo child, component or property called :" + path[index]);
      return null;
    }
    return childItem.resolvePath(path, index + 1);
  }

  // Traverse the tree structure from this point down
  // and fire the callback for each visited item.
  // Note: depth only used by selection sets for now.
  traverse(callback, includeThis = true) {
    const __c = treeItem => {
      const children = treeItem.getChildren();
      for (const childItem of children) {
        if (childItem) __t(childItem);
      }
    };
    const __t = treeItem => {
      if (callback(treeItem) == false) return false;
      __c(treeItem);
    };
    if (includeThis) __t(this);
    else __c(this);
  }
  // ///////////////////////
  // Events

  onMouseDown(event) {
    this.mouseDown.emit(event);
    if (event.vleStopPropagation !== true && this.__ownerItem) {
      this.__ownerItem.onMouseDown(event);
    }
    return event.vleStopPropagation;
  }

  onMouseUp(event) {
    this.mouseUp.emit(event);
    if (event.vleStopPropagation !== true && this.__ownerItem) {
      this.__ownerItem.onMouseUp(event);
    }
    return event.vleStopPropagation;
  }

  onMouseMove(event) {
    this.mouseMove.emit(event);
    if (event.vleStopPropagation !== true && this.__ownerItem) {
      this.__ownerItem.onMouseMove(event);
    }
    return event.vleStopPropagation;
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    if (!this.testFlag(ItemFlags.USER_EDITED)) return;

    let j = super.toJSON(context, flags);

    const jcs = [];
    for (const c of this.__components) jcs.push(c.toJSON(context, flags));
    if (jcs.length > 0) j.components = jcs;

    // Some Items, such as the SliderSceneWidget do not need thier children
    // to be saved.
    if (!(flags & SaveFlags.SAVE_FLAG_SKIP_CHILDREN)) {
      const childItemsJSON = {};
      for (const childItem of this.__childItems) {
        if (childItem) {
          const childJSON = childItem.toJSON(context, flags);
          if (childJSON) childItemsJSON[childItem.getName()] = childJSON;
        }
      }
      if (Object.keys(childItemsJSON).length > 0) {
        if (j) {
          j.children = childItemsJSON;
        } else {
          j = {
            name: this.__name,
            children: childItemsJSON,
          };
        }
      }
    }
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);

    context.numTreeItems++;

    // Note: JSON data is only used to store user edits, so
    // parameters loaded from JSON are considered user edited.
    this.setFlag(ItemFlags.USER_EDITED);

    // if ('bbox' in j){
    //     let box = new Box3();
    //     box.fromJSON(j.bbox);
    //     this.__boundingBoxParam.setValue(box);
    // }

    if (j.children != null) {
      const childrenJson = j.children;
      if (Array.isArray(childrenJson)) {
        for (const childJson of childrenJson) {
          // Note: During loading of asset trees, we have an
          // existing tree generated by loading a bin data file.
          let childItem = this.getChildByName(childJson.name);
          if (childItem) {
            childItem.fromJSON(childJson, context, flags);
          } else {
            if (childJson.type) {
              childItem = sgFactory.constructClass(childJson.type);
              if (childItem) {
                this.addChild(childItem, false, false);
                childItem.fromJSON(childJson, context, flags);
              }
            } else {
              // Note: no need to log a warning. A child might not exist
              // if the binary tree has changed, and so the JSON data
              // can no longer be mapped.
              // console.warn("Child not found:", childName, " within ", this.getNumChildren() + " of:" + this.getPath())
            }
          }
        }
      } else {
        for (const childName in childrenJson) {
          const childJson = childrenJson[childName];
          // Note: During loading of asset trees, we have an
          // existing tree generated by loading a bin data file.
          let childItem = this.getChildByName(childName);
          if (childItem) {
            childItem.fromJSON(childJson, context, flags);
          } else if (childJson.type) {
            childItem = sgFactory.constructClass(childJson.type);
            if (childItem) {
              // Note: we add the child now before loading.
              // This is because certain items. (e.g. Groups)
              // Calculate thier global Xfo, and use it to modify
              // the transform of thier members.
              // Note: Groups bind to items in the scene which are
              // already added as children, and so have global Xfos.
              // We prefer to add a child afer its loaded, because sometimes
              // In the tree is asset items, who will only toggled as
              // unloaded once they are loaded(else they are considered inline assets.)
              childItem.fromJSON(childJson, context, flags);
              this.addChild(childItem, false, false);
            }
          } else {
            // Note: When saving a bin tree, we no longer save the 'type' value
            // so that those nodes can no longer be re-created by loading the JSON
            // file. We don't want the json tree
            // to re-instate ghost tree items that have been removed from the bin tree.
            //  (as has happened in testing.)
            // console.warn("Warning loading JSON. Child not found:" + childName);
          }
        }
      }
    }

    if (j.components) {
      for (const cj of j.components) {
        const component = sgFactory.constructClass(cj.type ? cj.type : cj.name);
        if (component) {
          component.fromJSON(cj, context);
          this.addComponent(component);
        }
      }
    }
  }

  readBinary(reader, context) {
    super.readBinary(reader, context);

    context.numTreeItems++;

    const itemflags = reader.loadUInt8();

    const visibilityFlag = 1 << 1;
    // this.setVisible(itemflags&visibilityFlag);

    // this.setVisible(j.visibility);
    // Note: to save space, some values are skipped if they are identity values
    const localXfoFlag = 1 << 2;
    if (itemflags & localXfoFlag) {
      const xfo = new Xfo();
      xfo.tr = reader.loadFloat32Vec3();
      xfo.ori = reader.loadFloat32Quat();
      xfo.sc.set(reader.loadFloat32());
      // console.log(this.getPath() + " TreeItem:" + xfo.toString());
      this.__localXfoParam.setValue(xfo, ValueSetMode.DATA_LOAD);
    }

    const bboxFlag = 1 << 3;
    if (itemflags & bboxFlag)
      this.__boundingBoxParam.setValue(
        new Box3(reader.loadFloat32Vec3(), reader.loadFloat32Vec3()),
        ValueSetMode.DATA_LOAD
      );

    const numChildren = reader.loadUInt32();
    if (numChildren > 0) {
      const toc = reader.loadUInt32Array(numChildren);
      for (let i = 0; i < numChildren; i++) {
        reader.seek(toc[i]); // Reset the pointer to the start of the item data.
        let childType = reader.loadStr();

        if (childType.startsWith('N') && childType.endsWith('E')) {
          // ///////////////////////////////////////
          // hack to work around a linux issue
          // untill we have a fix.
          const ppos = childType.indexOf('podium');
          if (ppos != -1) {
            if (parseInt(childType[ppos + 7]))
              childType = childType.substring(ppos + 8, childType.length - 1);
            else
              childType = childType.substring(ppos + 7, childType.length - 1);
          }
          const lnpos = childType.indexOf('livenurbs');
          if (lnpos != -1) {
            childType = childType.substring(
              childType.indexOf('CAD'),
              childType.length - 1
            );
          }
        }
        // const childName = reader.loadStr();
        const childItem = sgFactory.constructClass(childType);
        if (!childItem) {
          const childName = reader.loadStr();
          console.warn(
            'Unable to construct child:' + childName + ' of type:' + childType
          );
          continue;
        }
        reader.seek(toc[i]); // Reset the pointer to the start of the item data.
        childItem.readBinary(reader, context);

        // Flagging this node as a bin tree node. (A node generated from loading a binary file)
        childItem.setFlag(ItemFlags.BIN_NODE);

        this.addChild(childItem, false, false);
      }
    }
  }

  static get SaveFlags() {
    return SaveFlags;
  }
  static get LoadFlags() {
    return LoadFlags;
  }
  static get CloneFlags() {
    return CloneFlags;
  }

  static getSelectionOutlineColor() {
    return selectionOutlineColor;
  }
  static setSelectionOutlineColor(color) {
    selectionOutlineColor = color;
  }
  static getBranchSelectionOutlineColor() {
    return branchSelectionOutlineColor;
  }
  static setBranchSelectionOutlineColor(color) {
    branchSelectionOutlineColor = color;
  }
}

sgFactory.registerClass('TreeItem', TreeItem);

export { SaveFlags, LoadFlags, CloneFlags, TreeItem };
