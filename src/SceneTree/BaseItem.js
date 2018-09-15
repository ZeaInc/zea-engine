import {
    Vec2,
    Vec3,
    Color,
    hashStr
} from '../Math';
import {
    Signal
} from '../Utilities';
import {
    sgFactory
} from './SGFactory.js';

import {
    ValueSetMode
} from './Parameters/Parameter.js';
import {
    ParameterOwner
} from './ParameterOwner.js';


const ItemFlags = {
    USER_EDITED: 1 << 1,
    IGNORE_BBOX: 1 << 2
};

class BaseItem extends ParameterOwner {
    constructor(name) {
        super();
        if (this.constructor.name == 'BaseItem') {
            throw ("BaseItem should not be instantiated directly.");
        }
        if (name == undefined)
            name = this.constructor.name;
        this.__name = name;
        this.__owners = [];
        this.__paths = [];
        this.__parentToPathIndex = [];
        this.__pathToParentIndex = [];
        this.__flags = 0;

        this.__metaData = new Map();

        this.nameChanged = new Signal();
        this.ownerChanged = new Signal();
        this.pathAdded = new Signal();
        this.pathRemoved = new Signal();
        this.flagsChanged = new Signal();

        this.parameterValueChanged.connect((param, mode) => {
            if (mode == ValueSetMode.USER_SETVALUE) {
                this.setFlag(ItemFlags.USER_EDITED);
            }
        });

        // this.__addOwnerIndex(0);
        // this.__addPathIndex(0);
    }

    destroy() {
        super.destroy();
    }

    clone() {
        throw (this.constructor.name + " does not implment its clone method");
    }

    copyTo(cloned) {
        super.copyTo(cloned)
        cloned.setName(this.__name);
    }

    //////////////////////////////////////////
    // Name and Path

    getName() {
        return this.__name;
    }

    setName(name) {
        this.__name = name;
        // this.__updatePath();
        this.nameChanged.emit(name);
    }

    //////////////////////////////////////////
    // Flags

    setFlag(flag) {
        this.__flags |= flag;
        this.flagsChanged.emit(this.__flags);
    }

    testFlag(flag) {
        return (this.__flags & flag) != 0;
    }


    //////////////////////////////////////////
    // Path Traversial

    resolvePath(path, index) {
        if (index == path.length) {
            return this;
        }
        if (path[index] == '>' && path.lenth == index + 2) {
            return this.getParameter(path[index + 1]);
        }

        // Maybe the name is a parameter name.
        const param = this.getParameter(path[index]);
        if (param) {
            return param;
        }
        throw ("Invalid path:" + path + " member not found");
    }


    //////////////////////////////////////////
    // Owner Item

    getOwner(index = 0) {
        return this.getRefer(index);
    }

    addOwner(ownerItem) {
        this.addRef(ownerItem);
        const ownerIndex = this.__owners.length;
        this.__owners.push(ownerItem);

        this.__addOwnerIndex(ownerIndex)

        const parentPaths = ownerItem.getPaths();
        this.__parentToPathIndex.push(this.__paths.length)
        for(let i=0; i<parentPaths.length; i++) {
            this.__addPath(ownerIndex, i);
        }
        ownerItem.pathAdded.connect((parentPathIndex)=>this.__addPath(ownerIndex, parentPathIndex))
        return ownerIndex;
    }

    removeOwner(parentItem) {
        return this.removeRef(parentItem);
    }

    //////////////////////////////////////////
    // Path
    __generatePath(childIndex) {

    }

    __addPathIndex(pathIndex) {

    }

    __addPath(parentIndex, parentPathIndex) {
        const newPath = this.__owners[parentIndex].getPath(parentPathIndex).slice();
        newPath.push(this.__name);
        const pathIndex = this.__paths.length;
        this.__pathToParentIndex[pathIndex] = parentIndex;
        this.__paths.push(newPath);
        this.__addPathIndex(pathIndex)
        this.pathAdded.emit(pathIndex)
    }

    // __updatePath(index = 0) {
    //     if (this.__ownerItem == undefined)
    //         this.__paths[index] = [this.__name];
    //     else {
    //         this.__paths[index] = this.__ownerItem.getPath().slice();
    //         this.__paths[index].push(this.__name);
    //     }
    // }

    getNumPaths() {
        return this.__paths.length;
    }

    getPaths() {
        return this.__paths;
    }

    getPath(index=0) {
        return this.__paths[index];
    }

    //////////////////////////////////////////
    // Metadata

    getMetadata(key) {
        return this.__metaData.get(key)
    }

    hasMetadata(key) {
        return this.__metaData.has(key)
    }

    setMetadata(key, metaData) {
        this.__metaData.set(key, metaData);
    }


    //////////////////////////////////////////
    // Persistence


    toJSON(context) {
        const j = super.toJSON(context);
        if (j) {
            j.name = this.__name;
            j.type = this.constructor.name;
        }
        return j;
    }

    fromJSON(j, context) {
        if (j.name)
            this.__name = j.name;
        super.fromJSON(j, context);
        // Note: JSON data is only used to store user edits, so 
        // parameters loaded from JSON are considered user edited.
        this.__flags |= ItemFlags.USER_EDITED;
    }

    readBinary(reader, context) {
        context.loadedItems[reader.pos()] = this;

        const type = reader.loadStr();

        this.setName(reader.loadStr());


        // Note: parameters follow name...
        super.readBinary(reader, context);
    }

    toString() {
        return JSON.stringify(this.toJSON(), null, 2)
    }
};

export {
    ItemFlags,
    BaseItem
};