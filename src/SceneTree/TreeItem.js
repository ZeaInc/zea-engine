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
    XfoParameter
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
            for (let childItem of this.__childItems) {
                const param = childItem.getParameter('Selected');
                if (param)
                    param.setValue(value);
            }
        });
        this.__cutawayParam = this.addParameter(new BooleanParameter('CutawayEnabled', false));
        this.__cutawayParam.valueChanged.connect((changeType) => {
            const value = this.__cutawayParam.getValue();
            for (let childItem of this.__childItems) {
                const param = childItem.getParameter('CutawayEnabled');
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

        this.__localXfoParam.valueChanged.connect(this._setGlobalXfoDirty);
        this.__localXfoParam.elementValueChanged.connect(this._setGlobalXfoDirty);

        this.__globalXfoParam.elementValueChanged.connect((mode, pathIndex) => {
            if (mode == ValueSetMode.USER_SETVALUE) {
                const _cleanLocalXfo = () => {
                    const parentIndex = this.__pathToParentIndex[pathIndex];
                    const globalXfo = this.__globalXfoParam.getValue(parentIndex);
                    if (this.__ownerItem !== undefined)
                        this.__localXfoParam.setElementValue(parentIndex, this.__ownerItem.getGlobalXfo(parentIndex).inverse().multiply(globalXfo));
                    else
                        this.__localXfoParam.setElementValue(parentIndex, globalXfo);
                }
                // Note: both global and local cannot be dirty at the same time
                // because we need one clean to compute the other. If the global
                // Xfo is explicitly set, then it is now clean, so we can make local
                // dirty. 
                this.__localXfoParam.setDirty(_cleanLocalXfo);
            }
            this._setBoundingBoxDirty();
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
        this.boundingChanged = this.__boundingBoxParam.valueChanged;
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

    addOwner(parentItem) {

        const ownerIndex = super.addOwner(parentItem);

        const parentglobalXfo = parentItem.getGlobalXfo();
        const currglobalXfo = this.getGlobalXfo();
        const newLocalXfo = currglobalXfo.inverse().multiply(parentglobalXfo)
        this.__localXfoParam.insertElement(newLocalXfo, ownerIndex)

        if (this.__ownerItem) {
            this.__ownerItem.globalXfoChanged.connect((mode, index) => this._setGlobalXfoDirty(ownerIndex, index));
        }
    }

    removeOwner(parentItem) {


        const parentItemIndex = super.removeOwner(parentItem);
        parentItem.globalXfoChanged.disconnect(this._setGlobalXfoDirty);

        for (let i = parentItemIndex; i < this.__ownerRefIds.length; i++)
            this._setGlobalXfoDirty(i);
    }

    __addPath(parentIndex, parentPathIndex) {
        super.__addPath(parentItem);
        const globalXfoIndex = this.__parentToPathIndex[parentIndex] + parentPathIndex;

        this.__globalXfoParam.insertElement(new Xfo(), globalXfoIndex)
    }

    // __updatePath() {
    //     super.__updatePath();
    //     for (let childItem of this.__childItems)
    //         childItem.__updatePath();
    //     for (let component of this.__components)
    //         component.__updatePath();
    // }


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


    _setGlobalXfoDirty(parentItemIndex = 0, parentPathIndex = -1) {
        if (this.__parentToPathIndex.length == 0) {
            this.__globalXfoParam.setElementDirty(()=>this.__localXfoParam.getValue(0));
            return;
        }

        const _setGlobalXfoDirty = (parentItemIndex, parentPathIndex)=>{
            const cleanGlobalXfo = () => {
                const parentXfo = this.getParentItem(parentItemIndex).getGlobalXfo(parentPathIndex);
                const localXfo = this.__localXfoParam.getElementValue(parentItemIndex);

                // Each parent can have 1-many paths.
                // The __parentToPathIndex stores the start and count of each parents paths in this
                // items totale paths. For each path we store a global xfo.
                const globalXfoIndex = this.__parentToPathIndex[parentItemIndex * 2] + parentPathIndex;
                this.__globalXfoParam.setElementValue(globalXfoIndex, parentXfo.multiply(localXfo));
            }
            this.__globalXfoParam.setElementDirty(cleanGlobalXfo);
        }
        if (parentPathIndex == -1) {
            const count = this.__parentToPathIndex[(parentItemIndex * 2) + 1]
            for (let i = 0; i < count; i++) {
                _setGlobalXfoDirty(parentItemIndex, i);
            }
        }
        else {
            _setGlobalXfoDirty(parentItemIndex, parentPathIndex);
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
            for (let childItem of this.__childItems)
                childItem.setSelectable(this.__selectable, propagateToChildren);
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

    getBoundingBox() {
        return this.__boundingBoxParam.getValue();
    }

    _cleanBoundingBox(bbox) {
        bbox.reset();
        for (let childItem of this.__childItems) {
            if (childItem.getVisible() && !childItem.testFlag(ItemFlags.IGNORE_BBOX))
                bbox.addBox3(childItem.getBoundingBox());
        }
        return bbox;
    }

    _setBoundingBoxDirty() {
        this.__boundingBoxParam.setDirty(this._cleanBoundingBox);
    }

    _childFlagsChanged(flags) {
        if ((flags & ParamFlags.USER_EDITED) != 0)
            this.setFlag(ItemFlags.USER_EDITED);
    }

    //////////////////////////////////////////
    // Children

    getChildren() {
        return this.__childItems;
    }

    numChildren() {
        return this.__childItems.length;
    }

    insertChild(childItem, index, maintainXfo = true, checkCollisions = true) {

        if (checkCollisions && this.getChildByName(childItem.getName()) !== null)
            throw ("Item '" + childItem.getName() + "' is already a child of :" + this.getPath());
        if (!(childItem instanceof TreeItem))
            throw ("Object is is not a tree item :" + childItem.constructor.name);

        let newLocalXfo;
        if (maintainXfo)
            newLocalXfo = this.getGlobalXfo().inverse().multiply(childItem.getGlobalXfo());
        this.__childItems.splice(index, 0, childItem);
        childItem.setOwner(this);

        if (maintainXfo)
            childItem.setLocalXfo(newLocalXfo);

        if (childItem.testFlag(ItemFlags.USER_EDITED))
            this.setFlag(ItemFlags.USER_EDITED)

        childItem.setInheritedVisiblity(this.getVisible());
        childItem.setSelectable(this.getSelectable(), true);

        childItem.boundingChanged.connect(this._setBoundingBoxDirty);
        childItem.visibilityChanged.connect(this._setBoundingBoxDirty);
        childItem.flagsChanged.connect(this._childFlagsChanged.bind(this));

        // Propagate mouse event up ths tree.
        childItem.mouseDown.connect(this.onMouseDown);
        childItem.mouseUp.connect(this.onMouseUp);
        childItem.mouseMove.connect(this.onMouseMove);

        this._setBoundingBoxDirty();
        this.childAdded.emit(childItem, index);

        return childItem;
    }

    addChild(childItem, maintainXfo = true, checkCollisions = true) {
        return this.insertChild(childItem, this.__childItems.length, maintainXfo, checkCollisions);
    }

    getChild(index) {
        return this.__childItems[index];
    }

    getChildByName(name) {
        for (let childItem of this.__childItems) {
            if (childItem != null && childItem.getName() == name)
                return childItem;
        }
        return null;
    }

    getChildByID(id) {
        for (let childItem of this.__childItems) {
            if (childItem != null && childItem.getId() == id)
                return childItem;
        }
        return null;
    }

    removeChild(index, destroy = true) {
        const childItem = this.__childItems[index];
        this.__childItems.splice(index, 1);

        childItem.setParentItem(undefined);

        childItem.boundingChanged.disconnect(this._setBoundingBoxDirty);
        childItem.visibilityChanged.disconnect(this._setBoundingBoxDirty);

        // Propagate mouse event up ths tree.
        childItem.mouseDown.disconnect(this.onMouseDown);
        childItem.mouseUp.disconnect(this.onMouseUp);
        childItem.mouseMove.disconnect(this.onMouseMove);

        this.childRemoved.emit(childItem, index);

        if (destroy)
            childItem.destroy();
        this._setBoundingBoxDirty();
    }

    removeChildByHandle(childItem, destroy = true) {
        let index = this.__childItems.indexOf(childItem);
        if (index == -1)
            throw ("Error in removeChildByHandle. Child not found:" + childItem.getName());
        return this.removeChild(index, destroy);
    }

    removeAllChildren(destroy = true) {
        if (destroy)
            for (let childItem of this.__childItems)
                childItem.destroy();
        this.__childItems = [];
        this._setBoundingBoxDirty();
    }

    indexOfChild(childItem) {
        return this.__childItems.indexOf(childItem);
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
            return this.__ownerItem.resolvePath(path, index + 1);
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

        const childName = path[index];
        let childItem = this.getChildByName(childName);
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

            //report("Unable to resolve path '"+"/".join(path)+"' after:"+this.getName());
            console.warn("Unable to resolve path :" + (path) + " after:" + this.getName() + "\nNo child, component or property called :" + path[index]);
            return null;
        }
        return childItem.resolvePath(path, index + 1);
    }

    // Traverse the tree structure from this point down
    // and fire the callback for each visited item
    traverse(callback) {
        const __c = (treeItem) => {
            const children = treeItem.getChildren();
            for (let childItem of children) {
                __t(childItem);
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

    onMouseDown(mousePos, event) {
        this.mouseDown.emit(mousePos, event);
        return false;
    }

    onMouseUp(mousePos, event) {
        this.mouseUp.emit(mousePos, event);
        return false;
    }

    onMouseMove(mousePos, event) {
        this.mouseMove.emit(mousePos, event);
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
        for (let childItem of this.__childItems) {
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
                if(toc[i] in context.loadedItems) {
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