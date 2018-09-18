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
        this.__freeOwnerIndices = [];
        this.__numPaths = 0;
        this.__parentToPathIndices = [];
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

        // this.__freeOwnerIndices.push(this.addOwnerIndex(0));
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
    // Owner Item

    getOwner(ownerIndex) {
        return this.__owners[ownerIndex].ownerItem;
    }

    addOwnerIndex() {
        let ownerIndex;
        if(this.__freeOwnerIndices.length > 0)
            ownerIndex = this.__freeOwnerIndices.pop();
        else {
            ownerIndex = this.__owners.length;
            this.__owners.push(null);
        }
        this.__parentToPathIndices[ownerIndex] = [];
        return ownerIndex;
    }

    setOwnerAtIndex(ownerIndex, ownerItem, childIndexWithinOwner) {
        this.addRef(ownerItem);
        this.__owners[ownerIndex] = { ownerItem, childIndexWithinOwner };
        this.__parentToPathIndices[ownerIndex] = [];

        const numParentPaths = ownerItem.getNumPaths();
        for(let i=0; i<numParentPaths; i++) {
            this.__addPath(ownerIndex, i);
        }
        ownerItem.pathAdded.connect((parentPathIndex)=>this.__addPath(ownerIndex, parentPathIndex))
    }

    addOwner(ownerItem) {
        const ownerIndex = this.addOwnerIndex();
        this.setOwnerAtIndex(ownerIndex, ownerItem);
        return ownerIndex;
    }

    removeOwner(ownerIndex) {
        this.removeRef(this.__owners[ownerIndex].ownerItem);
        this.__owners[ownerIndex] = null;
        this.__freeOwnerIndices.push(ownerIndex)
    }

    getOwnerIndicesAtPath(pathIndex){
        return this.__pathToParentIndex[pathIndex];
    }
    
    getOwnerPathIndices(ownerIndex){
        return this.__parentToPathIndices[ownerIndex];
    }

    //////////////////////////////////////////
    // Path

    __addPathIndex(pathIndex) {

    }

    __addPath(ownerIndex, parentPathIndex) {
        const pathIndex = this.__numPaths;
        this.__pathToParentIndex[pathIndex] = { ownerIndex, parentPathIndex };
        this.__parentToPathIndices[ownerIndex].push(pathIndex);
        this.__numPaths++;
        this.__addPathIndex(pathIndex)
        this.pathAdded.emit(pathIndex)
        return pathIndex;
    }

    getNumPaths() {
        return this.__numPaths;
    }

    getPath(pathIndex) {
        const {
            ownerIndex,
            parentPathIndex
        } = this.__pathToParentIndex[pathIndex];
        if(!this.__owners[ownerIndex])
            return [this.getName()]
        const path = this.__owners[ownerIndex].getPath(parentPathIndex);
        path.push(this.getName());
        return path;
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