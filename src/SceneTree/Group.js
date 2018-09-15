import {
    Vec2,
    Xfo
} from '../Math';
import {
    Signal
} from '../Utilities';
import {
    ValueSetMode,
    BooleanParameter,
    XfoParameter,
    MultiChoiceParameter
} from './Parameters';
import {
    ItemFlags
} from './BaseItem';
import {
    TreeItem
} from './TreeItem';
import {
    sgFactory
} from './SGFactory.js';


class Group extends TreeItem {
    constructor(name) {
        super(name);

        // this.__initialXfoParam = this.addParameter(new XfoParameter('InitialXfo'));
        // this.__initialXfoParam.valueChanged.connect(()=>{
        //     this.__invInitialXfo = this.__initialXfoParam.getValue().inverse();
        // })
        this.__initialXfoModeParam = this.addParameter(new MultiChoiceParameter('InitialXfoMode', ['first', 'average'], 0, 'Number'));
        this.__initialXfoModeParam.valueChanged.connect(()=>{
            this.recalcInitialXfo();
        })
        this.__invInitialXfo = undefined;
        this.__initialXfos = [];

        this.__items = [];

        this.__visibleParam.valueChanged.connect((changeType)=>{
            const value = this.__visibleParam.getValue();
            const len = this.__items.length;
            for (let i = 0; i < len; i++) {
                // this.__items[i].getParameter('Visible').setDirty(this.__visibleParam.getValue);
                this.__items[i].setInheritedVisiblity(value);
            }
        });
        this.__selectedParam.valueChanged.connect((changeType)=>{
            const selected = this.__selectedParam.getValue();
            const len = this.__items.length;
            for (let i = 0; i < len; i++) {
                this.__items[i].setSelected(selected);
            }
        });
        // Groups can be used to control Cutaway toggles for their members.
        this.__cutawayParam.valueChanged.connect((changeType)=>{
            const len = this.__items.length;
            for (let i = 0; i < len; i++) {
                const itemParam = this.__items[i].getParameter('CutawayEnabled');
                if(itemParam)
                    itemParam.setDirty(this.__cutawayParam.getValue);
            }
        });
        this.__globalXfoParam.valueChanged.connect((changeType)=>{
            if(this.__invInitialXfo && this.__items.length > 0) {
                let delta;
                const setDirty = (item, initialXfo)=>{
                    const clean = ()=>{
                        if(!delta) {
                            const xfo = this.__globalXfoParam.getValue();
                            // Compute the skinning transform that we can
                            // apply to all the items in the group.
                            delta = xfo.multiply(this.__invInitialXfo);
                        }
                        return delta.multiply(initialXfo);
                    }
                    item.getParameter('GlobalXfo').setDirty(clean);
                }
                const len = this.__items.length;
                for (let i = 0; i < len; i++) {
                    setDirty(this.__items[i], this.__initialXfos[i]);
                }
            }
        });

        this.mouseDownOnItem = new Signal();
        this.mouseUpOnItem = new Signal();
        this.mouseMoveOnItem = new Signal();


    }

    destroy() {
        super.destroy();
    }

    clone() {
        let cloned = new Group();
        this.copyTo(cloned);
        return cloned;
    }

    copyTo(cloned) {
        super.copyTo(cloned);
    }

    //////////////////////////////////////////
    // Items

    resolveItems(paths) {
        const asset = this.getOwner();
        for(let path of paths) {
            let treeItem = asset.resolvePath(path);
            if(treeItem) {
                this.addItem(treeItem);
            }
            else {
                console.warn("Group could not resolve item:" + path)
            }
        }
        this.recalcInitialXfo();
    }

    addItem(item) { 
        if(!item) {
            console.warn("Error adding item to group. Item is null");
            return;
        }
        const index = this.__items.length;
        item.mouseDown.connect((mousePos, event)=>{
            this.mouseDown.emit(mousePos, event);
            this.mouseDownOnItem.emit(mousePos, event, item);
        });
        item.mouseUp.connect((mousePos, event)=>{
            this.mouseUp.emit(mousePos, event);
            this.mouseUpOnItem.emit(mousePos, event, item);
        });
        item.mouseMove.connect((mousePos, event)=>{
            this.mouseMove.emit(mousePos, event);
            this.mouseMoveOnItem.emit(mousePos, event, item);
        });
        item.globalXfoChanged.connect((pathIndex, mode)=>{
            if(mode == ValueSetMode.USER_SETVALUE)
                this.__initialXfos[index] = item.getGlobalXfo();
        });
        this.__initialXfos[index] = item.getGlobalXfo();
        this.__items.push(item);
    }

    recalcInitialXfo() {
        if(this.__items.length == 0)
            return;
        const mode = this.__initialXfoModeParam.getValue();
        let xfo;
        if(mode == 'first') {
            xfo = this.__items[0].getGlobalXfo();
        }
        else if(mode == 'average') {
            xfo = new Xfo();
            for(let p of this.__items) {
                const itemXfo = p.getGlobalXfo();
                xfo.tr.addInPlace(itemXfo.tr)
                xfo.ori.addInPlace(itemXfo.ori)
                // xfo.sc.addInPlace(itemXfo.sc)
            }
            xfo.tr.scaleInPlace(1/this.__items.length);
            xfo.ori.normalizeInPlace(1/this.__items.length);
            // xfo.sc.scaleInPlace(1/this.__items.length);
        }
        else {
            throw("Invalid mode.")
        }

        this.__globalXfoParam.setValue(xfo);
        this.__invInitialXfo = xfo.inverse();
    }


    /////////////////////////
    // Events

    onMouseDown(event) {
        return false;
    }

    onMouseUp(event) {
        return false;
    }

    onMouseMove(event) {
        return false;
    }


    //////////////////////////////////////////
    // Persistence

    toJSON(context) {
        const j = super.toJSON(context);
        const treeItems = [];
        const makeRelative = (path) => {
            const assetPath = context.assetItem.getPath();
            return path.slice(assetPath.length);
        }
        for(let p of this.__items) 
            treeItems.push(makeRelative(p.getPath()));
        j.treeItems = treeItems
        return j;
    }

    fromJSON(j, context) {
        super.fromJSON(j, context);

        // Note: JSON data is only used to store user edits, so 
        // parameters loaed from JSON are considered user edited.
        this.setFlag(ItemFlags.USER_EDITED);

        if(!j.treeItems){
            console.warn("Invalid Parameter JSON");
            return;
        }

        const addItem = (index, path)=>{
            const treeItem = context.assetItem.resolvePath(path);
            if(!treeItem){
                console.warn("Group: '" + this.getName() + "'. Unable to load item:" + path)
                return;
            }
            this.addItem(treeItem);
        }
        const treeItems = j.treeItems;
        for(let i=0; i<j.treeItems.length; i++) {
            addItem(i, treeItems[i]);
        }

        this.recalcInitialXfo()
    }
};

sgFactory.registerClass('Group', Group);

export {
    Group
};