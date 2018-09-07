
import {
    Signal
} from '../Utilities';

class RefCounted {
    constructor() {
        if (this.constructor.name == 'RefCounted') {
            throw ("RefCounted should not be instantiated directly.");
        }
        this.__refs = [];
        this.destructing = new Signal();
    };

    numRefs(){
        return this.__refs.length;
    }

    addRef(referer) {
        if(!referer)
            throw("Error in RefCounted.addRef: Must provide a referer");

        this.__refs.push(referer);
        return this.__refs.length-1;
    }

    removeRefByIndex(index) {
        this.__refs.splice(index, 1);
        if(this.__refs.length == 0){
            this.destroy();
        }
    }

    removeRef(referer) {
        if(!referer)
            throw("Error in RefCounted.removeRef: Must provide a referer");
        // console.log(this.constructor.name + " removeRef:" + referer.constructor.name);
        let index = this.__refs.indexOf(referer);
        this.__refs.splice(index, 1);
        if(this.__refs.length == 0){
            this.destroy();
        }
    }

    getRefer(index) {
        return this.__refs[index];
    }

    getRefIndex(referer) {
        return this.__refs.indexOf(referer);
    }

    destroy(){
        // console.log(this.constructor.name + " destructing");
        this.destructing.emit(this);
    }
};
export {
    RefCounted
};
