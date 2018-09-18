import {
    Xfo,
    Box3
} from '../Math';
import {
    Signal
} from '../Utilities';
import {
    sgFactory
} from './SGFactory.js';
import {
    ParamFlags,
    ValueSetMode,
    Parameter,
    BooleanParameter,
    NumberParameter,
    ColorParameter,
    Vec2Parameter,
    XfoParameter,
    ListParameter
} from './Parameters';
import {
    ItemFlags,
    BaseItem
} from './BaseItem.js';


// Defines used to explicity specify types for WebGL.
const LOADFLAGS_SKIP_CHILDREN = 1 << 0;
const LOADFLAGS_SKIP_MATERIALS = 1 << 2;
const LOADFLAGS_SKIP_GEOMETRIES = 1 << 3;
const LOADFLAGS_BUILDTREEFROMJSON = 1 << 4;

class TreeItem extends BaseItem {
    constructor(name) {
        super(name)

        this.__inheritedVisiblity = true;
        this.__selectable = true;

        this.__childItems = [];
        this.__childMapping = {};

        this.__components = [];
        this.__componentMapping = {};
        this.parentChanged = this.ownerChanged;
        this.childAdded = new Signal();
        this.childRemoved = new Signal();
        this.componentAdded = new Signal();
        this.componentRemoved = new Signal();

        this.mouseDown = new Signal();
        this.mouseUp = new Signal();
        this.mouseMove = new Signal();

        this.treeItemGlobalXfoChanged = new Signal();

        ///////////////////////////////////////
        // Add parameters.

        this.__visibleParam = this.addParameter(new BooleanParameter('Visible', true));
        this.__selectedParam = this.addParameter(new BooleanParameter('Selected', false));
        this.__selectedParam.valueChanged.connect((changeType) => {
            const value = this.__selectedParam.getValue();
            for (let childItemData of this.__childItems) {
                const param = childItemData.childItem.getParameter('Selected');
                if (param)
                    param.setValue(value);
            }
        });
        this.__cutawayParam = this.addParameter(new BooleanParameter('CutawayEnabled', false));
        this.__cutawayParam.valueChanged.connect((changeType) => {
            const value = this.__cutawayParam.getValue();
            for (let childItemData of this.__childItems) {
                const param = childItemData.childItem.getParameter('CutawayEnabled');
                if (param)
                    param.setValue(value);
            }
        });


        this.__localXfoParam = this.addParameter(new ListParameter('LocalXfo', Xfo));
        this.__globalXfoParam = this.addParameter(new ListParameter('GlobalXfo', Xfo));
        this.__boundingBoxParam = this.addParameter(new ListParameter('BoundingBox', Box3));

        // Bind handlers (havk to )
        this._setGlobalXfoDirty = this._setGlobalXfoDirty.bind(this);
        this._cleanBoundingBox = this._cleanBoundingBox.bind(this);
        this._setBoundingBoxDirty = this._setBoundingBoxDirty.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.__localXfoParam.valueChanged.connect(() => this._setGlobalXfoDirty(-1, -1));
        this.__localXfoParam.elementValueChanged.connect((ownerIndex, mode) => {
            if (mode == ValueSetMode.USER_SETVALUE)
                this._setGlobalXfoDirty(ownerIndex, -1, mode)
        });

        this.__globalXfoParam.elementValueChanged.connect((pathIndex, mode) => {
            if (mode == ValueSetMode.USER_SETVALUE) {
                const {
                    ownerIndex,
                    parentPathIndex
                } = this.__pathToParentIndex[pathIndex];
                const _cleanLocalXfo = () => {
                    const globalXfo = this.__globalXfoParam.getElementValue(ownerIndex);
                    if (this.__owners[ownerIndex] == undefined)
                        return globalXfo;
                    else {
                        const ownerItem = this.__owners[ownerIndex].ownerItem;
                        return ownerItem.getGlobalXfo(parentPathIndex).inverse().multiply(globalXfo);
                    }
                }
                // Note: both global and local cannot be dirty at the same time
                // because we need one clean to compute the other. If the global
                // Xfo is explicitly set, then it is now clean, so we can make local
                // dirty. 
                this.__localXfoParam.setElementDirty(ownerIndex, _cleanLocalXfo);
            }
            this._setBoundingBoxDirty(pathIndex);
        });

        this.__visibleParam.valueChanged.connect((mode) => {
            const visibile = this.getVisible();
            for (let childItem of this.__childItems)
                childItem.setInheritedVisiblity(visibile);
        });

        this.visibilityChanged = this.__visibleParam.valueChanged;
        this.selectedChanged = this.__selectedParam.valueChanged;
        this.localXfoChanged = this.__localXfoParam.elementValueChanged;
        this.globalXfoChanged = this.__globalXfoParam.elementValueChanged;
        this.boundingChanged = this.__boundingBoxParam.elementValueChanged;
    }

    destroy() {
        this.removeAllChildren();
        super.destroy();
    }

    clone() {
        const cloned = new TreeItem();
        this.copyTo(cloned);
        return cloned;
    }

    copyTo(cloned) {
        super.copyTo(cloned);
        // cloned.__visible = this.__visible;
        cloned.__selectable = this.__selectable;
        for (let childItem of this.__childItems)
            cloned.addChild(childItem.clone());
    }


    //////////////////////////////////////////
    // Parent Item

    addOwnerIndex() {
        const ownerIndex = super.addOwnerIndex()
        this.__localXfoParam.insertElement(ownerIndex, new Xfo())
        return ownerIndex;
    }

    setOwnerAtIndex(ownerIndex, ownerItem, childIndexWithinOwner) {
        if (ownerItem && childIndexWithinOwner == undefined) {
            childIndexWithinOwner = ownerItem.addChild(this, ownerIndex);
        }
        super.setOwnerAtIndex(ownerIndex, ownerItem, childIndexWithinOwner);
        if (ownerItem) {
            ownerItem.globalXfoChanged.connect((parentPathIndex, mode) => {
                this._setGlobalXfoDirty(ownerIndex, parentPathIndex)
            });
        }
    }

    removeOwner(ownerItem) {

        const ownerItemIndex = super.removeOwner(ownerItem);
        ownerItem.globalXfoChanged.disconnect(this._setGlobalXfoDirty);

        for (let i = ownerItemIndex; i < this.__ownerRefIds.length; i++)
            this._setGlobalXfoDirty(i);
    }

    __addPathIndex(pathIndex) {
        this.__globalXfoParam.insertElement(pathIndex, new Xfo())
        this.__boundingBoxParam.insertElement(pathIndex, new Box3())
        super.__addPathIndex(pathIndex);
    }

    __addPath(ownerIndex, parentPathIndex) {
        const pathIndex = super.__addPath(ownerIndex, parentPathIndex);
        this.__globalXfoParam.setElementDirty(pathIndex, this._cleanGlobalXfo.bind(this));
        this.__boundingBoxParam.setElementDirty(pathIndex, this._cleanBoundingBox.bind(this));

        // Push paths to children, or let children listen to signals?
        // for (let child of this.__childItems) {
        //     child.__addPath(i);
        // }

        return pathIndex;
    }

    getPath(pathIndex) {
        const {
            ownerIndex,
            parentPathIndex
        } = this.__pathToParentIndex[pathIndex];
        if (!this.__owners[ownerIndex])
            return [this.getName()]
        const {
            ownerItem,
            childIndexWithinOwner
        } = this.__owners[ownerIndex];
        const path = ownerItem.getPath(parentPathIndex);
        path.push(this.getName() + '#' + childIndexWithinOwner);
        return path;
    }


    //////////////////////////////////////////
    // Global Matrix

    get localXfo() {
        throw (("getter is deprectated. Please use 'getLocalXfo'"));
    }
    set localXfo(xfo) {
        throw (("setter is deprectated. Please use 'setLocalXfo'"));
    }
    get globalXfo() {
        throw (("getter is deprectated. Please use 'getGlobalXfo'"));
    }
    set globalXfo(xfo) {
        throw (("setter is deprectated. Please use 'setGlobalXfo'"));
    }

    getLocalXfo(parentIndex, mode) {
        if (parentIndex == undefined)
            throw ("parentIndex must be specified")
        return this.__localXfoParam.getElementValue(parentIndex, mode);
    }

    setLocalXfo(parentIndex, xfo, mode) {
        if (parentIndex == undefined)
            throw ("parentIndex must be specified")
        this.__localXfoParam.setElementValue(parentIndex, xfo, mode);
    }

    getGlobalXfo(pathIndex, mode) {
        if (pathIndex == undefined)
            throw ("pathIndex must be specified")
        return this.__globalXfoParam.getElementValue(pathIndex, mode);
    }

    setGlobalXfo(pathIndex, xfo, mode) {
        if (pathIndex == undefined)
            throw ("pathIndex must be specified")
        this.__globalXfoParam.setElementValue(pathIndex, xfo, mode);
    }

    _cleanGlobalXfo(pathIndex) {
        const {
            ownerIndex,
            parentPathIndex
        } = this.__pathToParentIndex[pathIndex];
        const localXfo = this.__localXfoParam.getElementValue(ownerIndex);
        if (!this.__owners[ownerIndex])
            return localXfo;

        const parentXfo = this.getOwner(ownerIndex).getGlobalXfo(parentPathIndex);
        // Each parent can have 1-many paths.
        // The __parentToPathIndex stores the start and count of each parents paths in this
        // items totale paths. For each path we store a global xfo.
        return parentXfo.multiply(localXfo);
    }

    _setGlobalXfoDirty(parentItemIndex = 0, parentPathIndex = -1, mode) {
        if (this.__owners.length == 0) {
            // this.__globalXfoParam.setElementDirty(()=>this.__localXfoParam.getValue(0));
            return;
        }


        const _setGlobalXfoDirty = (parentItemIndex, parentPathIndex) => {
            const pathIndex = this.__parentToPathIndices[parentItemIndex][parentPathIndex]
            this.__globalXfoParam.setElementDirty(pathIndex, this._cleanGlobalXfo.bind(this));
        }

        if (parentItemIndex == -1) {
            for (let i = 0; i < this.__parentToPathIndices.length; i++) {
                for (let j = 0; j < paths.length; j++) {
                    _setGlobalXfoDirty(i, j);
                }
            }
        } else {
            if (parentPathIndex == -1) {
                const paths = this.__parentToPathIndices[parentItemIndex]
                for (let j = 0; j < paths.length; j++) {
                    _setGlobalXfoDirty(parentItemIndex, j)
                }
            } else {
                _setGlobalXfoDirty(parentItemIndex, parentPathIndex)
            }
        }
    }

    //////////////////////////////////////////
    // Visibility

    getVisible() {
        return this.__inheritedVisiblity && this.__visibleParam.getValue();
    }

    setVisible(val) {
        this.__visibleParam.setValue(val);
    }

    setInheritedVisiblity(val) {
        if (this.__inheritedVisiblity != val) {
            let prev = this.getVisible();
            this.__inheritedVisiblity = val;
            let visibile = this.getVisible();
            if (prev != visibile) {
                for (let childItem of this.__childItems)
                    childItem.setInheritedVisiblity(visibile);
                this.visibilityChanged.emit(visibile);
            }
        }
    }

    //////////////////////////////////////////
    // Selectability and Selection

    getSelectable() {
        return this.__selectable;
    }

    setSelectable(val, propagateToChildren = true) {
        if (this.__selectable != val || propagateToChildren) {
            this.__selectable = val;
            for (let childItemData of this.__childItems)
                childItemData.childItem.setSelectable(this.__selectable, propagateToChildren);
        }
    }

    getSelected() {
        return this.__selectedParam.getValue();
    }

    setSelected(sel) {
        this.__selectedParam.setValue(sel);
    }

    //////////////////////////////////////////
    // BoundingBox

    get boundingBox() {
        console.warn(("getter is deprectated. Please use 'getBoundingBox'"));
        return this.getBoundingBox();
    }

    getBoundingBox(pathIndex = 0) {
        return this.__boundingBoxParam.getElementValue(pathIndex);
    }

    _cleanBoundingBox(pathIndex, bbox) {
        bbox.reset();
        for (let childItemData of this.__childItems) {
            const {
                childItem,
                childsOwnerIndex
            } = childItemData;
            const pathIndices = childItem.getOwnerPathIndices(childsOwnerIndex);
            const childPathIndex = pathIndices[pathIndex];
            if (childItem.getVisible(childPathIndex) && !childItem.testFlag(ItemFlags.IGNORE_BBOX))
                bbox.addBox3(childItem.getBoundingBox(childPathIndex));
        }
        return bbox;
    }

    _setBoundingBoxDirty(pathIndex) {
        if (pathIndex == -1) {
            for (let i = 0; i < this.getNumPaths(); i++) {
                this.__boundingBoxParam.setElementDirty(i, this._cleanBoundingBox);
            }
        } else {
            this.__boundingBoxParam.setElementDirty(pathIndex, this._cleanBoundingBox);
        }
    }

    _childFlagsChanged(flags) {
        if ((flags & ParamFlags.USER_EDITED) != 0)
            this.setFlag(ItemFlags.USER_EDITED);
    }

    //////////////////////////////////////////
    // Children

    getChildren() {
        // return this.__childItems;
        const childItems = [];
        for (let childItemData of this.__childItems) {
            const {
                childItem,
                childsOwnerIndex
            } = childItemData;
            childItems.push(childItem)
        }
        return childItems;
    }

    numChildren() {
        return this.__childItems.length;
    }

    insertChild(childItem, index, childsOwnerIndex) {

        // if (checkCollisions && this.getChildByName(childItem.getName()) !== null)
        //     throw ("Item '" + childItem.getName() + "' is already a child of :" + this.getPath());
        if (!(childItem instanceof TreeItem))
            throw ("Object is is not a tree item :" + childItem.constructor.name);

        // Note: this index is the index this item holds in the child's owner array.
        if (childsOwnerIndex == undefined) {
            childsOwnerIndex = childItem.addOwnerIndex();
            childItem.setOwnerAtIndex(childsOwnerIndex, this, false);
        }

        this.__childItems.splice(index, 0, {
            childItem,
            childsOwnerIndex
        });

        // let name = childItem.getName();
        // if (!this.__childMapping[name])
        //     this.__childMapping[name] = [];
        // this.__childMapping[name].push(childItem)


        if (childItem.testFlag(ItemFlags.USER_EDITED))
            this.setFlag(ItemFlags.USER_EDITED)

        childItem.setInheritedVisiblity(this.getVisible());
        childItem.setSelectable(this.getSelectable(), true);

        // Note: on big trees, where items are added as a child
        // many times (e.g. 20k times), then propagating dirty bbox changes up the tree
        // becomes costly. Because an item can have so many children, and heach child can
        // be the same item, then this signal gets fired for every child for every owner.
        // (see the MultipleInheirtance stress test for an example.)
        // childItem.boundingChanged.connect((pathIndex) => {
        //     const { ownerIndex, parentPathIndex } = childItem.getOwnerIndicesAtPath(pathIndex);
        //     if(ownerIndex == childsOwnerIndex)
        //         this._setBoundingBoxDirty(idxs.parentPathIndex)
        // });
        // childItem.visibilityChanged.connect((pathIndex) => {
        //     const { ownerIndex, parentPathIndex } = childItem.getOwnerIndicesAtPath(pathIndex);
        //     if(dirtyownerIndex == childsOwnerIndex)
        //         this._setBoundingBoxDirty(parentPathIndex)
        // });

        childItem.flagsChanged.connect(this._childFlagsChanged.bind(this));

        // Propagate mouse event up ths tree.
        // Modity the 3rd arg to specify which path the event is propagating up.
        childItem.mouseDown.connect((e, i, p) => {
            if (p.ownerIndex == childsOwnerIndex)
                this.mouseDown.emit(e, i, this.__pathToParentIndex[p.parentPathIndex])
        });
        childItem.mouseUp.connect((e, i, p) => {
            if (p.ownerIndex == childsOwnerIndex)
                this.mouseUp.emit(e, i, this.__pathToParentIndex[p.parentPathIndex])
        });
        childItem.mouseMove.connect((e, i, p) => {
            if (p.ownerIndex == childsOwnerIndex)
                this.mouseMove.emit(e, i, this.__pathToParentIndex[p.parentPathIndex])
        });

        this._setBoundingBoxDirty(-1);
        this.childAdded.emit(childItem, index);

        return childItem;
    }

    addChild(childItem, ownerIndex) {
        const childIndex = this.__childItems.length;
        this.insertChild(childItem, childIndex, ownerIndex);
        return childIndex;
    }

    getChild(index) {
        return this.__childItems[index].childItem;
    }

    getChildByName(name) {
        for (let item of this.__childItems) {
            if (item != null && item.childItem.getName() == name)
                return item.childItem;
        }
        return null;
    }

    removeChild(index, destroy = true) {
        const childItemData = this.__childItems[index];
        this.__childItems.splice(index, 1);

        childItemData.childItem.setParentItem(undefined);

        childItemData.childItem.boundingChanged.disconnect(this._setBoundingBoxDirty);
        childItemData.childItem.visibilityChanged.disconnect(this._setBoundingBoxDirty);

        // Propagate mouse event up ths tree.
        // childItemData.childItem.mouseDown.disconnect(this.onMouseDown);
        // childItemData.childItem.mouseUp.disconnect(this.onMouseUp);
        // childItemData.childItem.mouseMove.disconnect(this.onMouseMove);

        this.childRemoved.emit(childItemData.childItem, index);

        if (destroy)
            childItemData.childItem.destroy();
        this._setBoundingBoxDirty(-1);
    }

    removeChildByHandle(childItem, destroy = true) {
        const index = this.indexOfChild(childItem);
        if (index != -1) {
            return this.removeChild(index, destroy);
        }
        throw ("Error in removeChildByHandle. Child not found:" + childItem.getName());
    }

    removeAllChildren(destroy = true) {
        if (destroy)
            for (let childItemData of this.__childItems)
                childItemData.childItem.destroy();
        this.__childItems = [];
        this._setBoundingBoxDirty(-1);
    }

    indexOfChild(childItem) {
        for (let i = 0; i < this.__childItems.length; i++) {
            if (this.__childItems[i] != null && this.__childItems[i].childItem == childItem)
                return i;
        }
        return -1;
    }

    //////////////////////////////////////////
    // Components

    addComponent(component) {
        this.__components.push(component);
        this.__componentMapping[component.getName()] = this.__components.length - 1;

        component.setOwner(this);

        this.componentAdded.emit(component);
    }

    removeComponent(name) {
        const index = this.__componentMapping[name];
        if (index == undefined) {
            throw ("Component not found:" + name)
        }
        const component = this.__components[index];
        component.setOwner(undefined);
        this.__components.splice(index, 1);

        const componentMapping = {};
        for (let i = 0; i < this.__components.length; i++)
            componentMapping[this.__components[i].getName()] = i;
        this.__componentMapping = componentMapping;

        this.componentRemoved.emit(component, index);
        return component;
    }

    hasComponent(name) {
        return (name in this.__componentMapping)
    }

    getComponent(name) {
        if (!(name in this.__componentMapping)) {
            console.log("No component named '" + name + "' found.");
            return;
        }
        return this.__components[this.__componentMapping[name]];
    }


    //////////////////////////////////////////
    // Path Traversial

    resolvePath(path, index = 0) {

        if (path[index] == '.')
            index++;
        else if (path[index] == '..') {
            return this.__owners[parentIndex].resolvePath(path, index + 1);
        }

        if (index == path.length) {
            return this;
        }
        if (path[index] == ':' && path.lenth > index + 1) {
            if (this.hasComponent(path[index + 1])) {
                const component = this.getComponent(path[index + 1]);
                return component.resolvePath(path, index + 2);
            }
        }
        const key = path[index];
        const hashPos = key.lastIndexOf('#')
        if(hashPos != -1) {
            const childIndex = parseInt(key.substring(hashPos+1));
            let childItem = this.getChild(childIndex);
            if (childItem != undefined)
                return childItem.resolvePath(path, index + 1);
        }
        else {
            let childItem = this.getChildByName(childName);
            if (childItem != undefined)
                return childItem.resolvePath(path, index + 1);

            // Maybe the name is a component name.
            if (this.hasComponent(key)) {
                const component = this.getComponent(key);
                if (index == path.length) {
                    return component;
                } else {
                    return component.resolvePath(path, index + 1);
                }
            }

            // Maybe the name is a parameter name.
            const param = this.getParameter(key);
            if (param) {
                return param;
            }
        }

        //report("Unable to resolve path '"+"/".join(path)+"' after:"+this.getName());
        console.warn("Unable to resolve path :" + (path) + " after:" + this.getName() + "\nNo child, component or property called :" + key);
        return null;
    }

    // Traverse the tree structure from this point down
    // and fire the callback for each visited item
    traverse(callback) {
        const __c = (treeItem) => {
            const children = treeItem.getChildren();
            for (let childItemData of children) {
                __t(childItemData.childItem);
            }
        }
        const __t = (treeItem) => {
            if (callback(treeItem) == false)
                return false;
            __c(treeItem);
        }
        __c(this);
    }
    /////////////////////////
    // Events

    onMouseDown(event, intersectionData) {
        this.mouseDown.emit(event, intersectionData, this.__pathToParentIndex[intersectionData.pathIndex]);
        return false;
    }

    onMouseUp(event, intersectionData) {
        this.mouseUp.emit(event, intersectionData, this.__pathToParentIndex[intersectionData.pathIndex]);
        return false;
    }

    onMouseMove(event, intersectionData) {
        this.mouseMove.emit(event, intersectionData, this.__pathToParentIndex[intersectionData.pathIndex]);
        return false;
    }

    //////////////////////////////////////////
    // Persistence


    toJSON(context) {
        if (!this.testFlag(ItemFlags.USER_EDITED))
            return;

        let j = super.toJSON(context);

        const jcs = [];
        for (let c of this.__components)
            jcs.push(c.toJSON(context));
        if (jcs.length > 0)
            j.components = jcs;

        const childItemsJSON = {};
        for (let childItemData of this.__childItems) {
            const childItem = childItemData.childItem;
            const childJSON = childItem.toJSON(context);
            if (childJSON)
                childItemsJSON[childItem.getName()] = childJSON;
        }
        if (Object.keys(childItemsJSON).length > 0) {
            if (j) {
                j.children = childItemsJSON;
            } else {
                j = {
                    name: this.__name,
                    children: childItemsJSON
                }
            }
        }
        return j;
    }

    fromJSON(j, context) {
        super.fromJSON(j, context);

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
                for (let childJson of childrenJson) {
                    // Note: During loading of asset trees, we have an
                    // existing tree generated by loading a bin data file.
                    let childItem = this.getChildByName(childJson.name);
                    if (childItem) {
                        childItem.fromJSON(childJson, context);
                    } else if (childJson.type) {
                        childItem = sgFactory.constructClass(childJson.type);
                        if (childItem) {
                            this.addChild(childItem, false, false);
                            childItem.fromJSON(childJson, context);
                        }
                    } else {
                        console.warn("Warning loading JSON. Child not found:" + childJson.name + " of:" + this.getPath());
                    }
                }
            } else {
                for (let childName in childrenJson) {
                    const childJson = childrenJson[childName];
                    // Note: During loading of asset trees, we have an
                    // existing tree generated by loading a bin data file.
                    let childItem = this.getChildByName(childName);
                    if (childItem) {
                        childItem.fromJSON(childJson, context);
                    } else if (childJson.type) {
                        childItem = sgFactory.constructClass(childJson.type);
                        if (childItem) {
                            // Note: we add the chile now before loading. 
                            // This is because certain items. (e.g. Groups)
                            // Calculate thier global Xfo, and use it to modify 
                            // the transform of thier members. 
                            this.addChild(childItem, false, false);
                            childItem.fromJSON(childJson, context);
                        }
                    } else {
                        console.warn("Warning loading JSON. Child not found:" + childName);
                    }
                }
            }
        }


        if (j.components) {
            for (let cj of j.components) {
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

        let itemflags = reader.loadUInt8();

        const visibilityFlag = 1 << 1;
        // this.setVisible(itemflags&visibilityFlag);

        //this.setVisible(j.visibility);
        // Note: to save space, some values are skipped if they are identity values 
        const localXfoFlag = 1 << 2;
        if (itemflags & localXfoFlag) {
            let xfo = new Xfo();
            xfo.tr = reader.loadFloat32Vec3();
            xfo.ori = reader.loadFloat32Quat();
            xfo.sc.set(reader.loadFloat32());
            // console.log(this.getPath() + " TreeItem:" + xfo.toString());
            this.__localXfoParam.setValue(xfo, Visualive.ValueSetMode.DATA_LOAD);
        }

        const bboxFlag = 1 << 3;
        if (itemflags & bboxFlag)
            this.__boundingBoxParam.setValue(new Box3(reader.loadFloat32Vec3(), reader.loadFloat32Vec3()), Visualive.ValueSetMode.DATA_LOAD);

        const numChildren = reader.loadUInt32();
        if (numChildren > 0) {

            const toc = reader.loadUInt32Array(numChildren);
            for (let i = 0; i < numChildren; i++) {
                if (toc[i] in context.loadedItems) {
                    const childItem = context.loadedItems[toc[i]];
                    this.addChild(childItem, false, false);
                    continue;
                }

                reader.seek(toc[i]); // Reset the pointer to the start of the item data.

                const childType = reader.loadStr();
                // const childName = reader.loadStr();
                const childItem = sgFactory.constructClass(childType);
                if (!childItem) {
                    const childName = reader.loadStr();
                    console.warn("Unable to construct child:" + childName + " of type:" + childType);
                    continue;
                }

                reader.seek(toc[i]); // Reset the pointer to the start of the item data.
                childItem.readBinary(reader, context);
                this.addChild(childItem, false, false);
            }
        }
    }
};

sgFactory.registerClass('TreeItem', TreeItem);

export {
    LOADFLAGS_SKIP_CHILDREN,
    LOADFLAGS_SKIP_MATERIALS,
    LOADFLAGS_SKIP_GEOMETRIES
};
export {
    TreeItem
};