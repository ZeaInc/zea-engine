import {
    Signal
} from '../../Utilities';
import {
    ValueGetMode,
    ValueSetMode,
    ParamFlags,
    Parameter
} from './Parameter.js';


class ListParameter extends Parameter {
    constructor(name, dataType) {
        super(name, []);
        this.__dataType = dataType;
        this.__elemCleanerFns = [];
        this.elementValueChanged = new Signal();
        this.elementAdded = new Signal();
        this.elementRemoved = new Signal();
    }

    __filter(item) {
        return true;
    }

    getCount() {
        return this.__value.length;
    }

    getElement(index) {
        return this.__value[index];
    }

    addElement(elem) {
        if (elem == undefined)
            elem = new this.__dataType()
        else {
            if (!this.__filter(elem))
                return;
        }

        this.__value.push(elem)
        this.__elemCleanerFns.push([]);
        // this.setValue(this.__value);
        this.__flags |= ParamFlags.USER_EDITED;
        this.elementAdded.emit(elem, this.__value.length - 1);
        // this.valueChanged.emit(ValueSetMode.USER_SETVALUE);
        return elem;
    }

    removeElement(index) {
        const elem = this.__value[index];
        this.__value.splice(index, 1)
        this.__elemCleanerFns.splice(index, 1);
        // this.setValue(this.__value)
        this.__flags |= ParamFlags.USER_EDITED;
        this.elementRemoved.emit(elem, index);
    }

    insertElement(index, elem) {
        if (!this.__filter(elem))
            return;
        this.__value.splice(index, 0, elem);
        this.__elemCleanerFns.splice(index, 0, []);
        // this.setValue(this.__value);
        this.__flags |= ParamFlags.USER_EDITED;
        this.elementAdded.emit(elem, index);
    }

    _cleanElementValue(index){
        // Clean the param before we start evaluating the connected op.
        // this is so that operators can read from the current value
        // to compute the next.
        let fns = this.__elemCleanerFns[index];
        this.__elemCleanerFns[index] = [];
        for (let fn of fns) {
            const res = fn(index, this.__value);
            if(res != undefined) 
                this.__value = res;
        }
    }


    getElementValue(index, mode = ValueSetMode.USER_SETVALUE) {
        if(index == undefined) {
            throw("index not provided")
        }
        if(mode == ValueGetMode.NORMAL && this.__elemCleanerFns[index].length > 0)
            this._cleanElementValue(index);
        return this.__value[index];
    }

    setElementValue(index, value, mode = ValueSetMode.USER_SETVALUE) {
        if(index == undefined) {
            throw("index not provided")
        }
        this.__value[index] = value;
        if (mode != ValueSetMode.OPERATOR_SETVALUE)
            this.elementValueChanged.emit(index, mode);
    }

    // TODO: one day support having only a single element dirty
    setElementDirty(index, cleaner) {
        if(index == undefined) {
            throw("index not provided")
        }
        
        if(this.__elemCleanerFns[index].indexOf(cleaner) != -1)
            return false;
        this.__elemCleanerFns[index].push(cleaner);
        if(this.__elemCleanerFns[index].length == 1)
            this.elementValueChanged.emit(index, ValueSetMode.OPERATOR_DIRTIED);
    }

    clone() {
        let clonedValue = this.__value.slice(0);
        const clonedParam = new ListParameter(this.__name, clonedValue, this.__dataType);
        this.cloneMembers(clonedParam);
        return clonedParam;
    }



    //////////////////////////////////////////
    // Persistence

    toJSON(context) {
        if ((this.__flags & ParamFlags.USER_EDITED) == 0)
            return;
        const items = [];
        for (let p of this.__value)
            items.push(p.toJSON(context));
        return {
            items
        };
    }

    fromJSON(j, context) {
        if (j.items == undefined) {
            console.warn("Invalid Parameter JSON");
            return;
        }
        // Note: JSON data is only used to store user edits, so 
        // parameters loaed from JSON are considered user edited.
        this.__flags |= ParamFlags.USER_EDITED;

        for (let i = 0; i < j.items.length; i++) {
            const elem = new this.__dataType()
            elem.fromJSON(j.items[i], context);
            this.__value.push(elem)
            this.elementAdded.emit(elem, this.__value.length - 1);
        }
        this.valueChanged.emit(ValueSetMode.DATA_LOAD);
    }


    destroy() {
        for (let i = 0; i < this.__value.length; i++) {
            if (this.__value[i] instanceof Parameter)
                this.__value[i].destroy();
            this.removeElement(i);
        }
    }
};


export {
    ListParameter
};