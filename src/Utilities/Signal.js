class Signal {
    constructor(toggledSignal=false) {
        this.__slots = [];
        // A toggled signal means that once it is fired, it is toggled to true
        // and never fired again. Any connections are immedietly emitted. 
        // Note: this is emulating the 'promise' system, and I really should
        // investigate using promisses. 
        this.__toggledSignal = toggledSignal;
        this.__toggled = false;
        this.__data = null;

        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.emit = this.emit.bind(this);
    }

    connect(fn) {
        if (fn == undefined)
            throw("a function callback must be passed to Signal.connect");
        if(this.__slots.indexOf(fn) != -1){
            console.warn("fn already connected to Signal.")
            return;
        }
        let id = this.__slots.length;
        this.__slots[id] = fn;

        if(this.__toggledSignal && this.__toggled){
            // This signal has already been toggled, so we should emit immedietly.
            if(this.__data)
                fn(...this.__data);
            else
                fn();
        }
        return id;
    }

    disconnect(fn) {
        let ids = [];
        this.__slots.forEach(function (item, index) {
            if (item === fn) {
                ids.push(index);
            }
        });
        if(ids.length == 0){
            console.warn("callback :" + fn.name + " was not connected to this signal:" + this.__name);
            return;
        }
        for(let id of ids) {
            this.__slots[id] = undefined;
        }
    }

    disconnectID(id) {
        if(!this.__slots[id])
            throw("Invalid ID");
        this.__slots[id] = undefined;
    }

    // emit the signal to all slots(observers)
    emit(...data) {
        if(this.__toggledSignal){
            if(!this.__toggled){
                this.__toggled = true;
                this.__data = data;
            }
            else{
                console.warn("Toggled signals should only be fired once, or untoggled before re-firing..");
            }
        }
        const len=this.__slots.length;
        for(let i=0; i< len; i++){
            const fn = this.__slots[i];
            // Skip disconnected slots.
            if(fn){
                fn(...data);
            }
        }
    }

    isToggled() {
        return this.__toggled;
    }
    setToggled(state) {
        this.__toggled = state;
        this.__data = undefined;
    }
    untoggle() {
        // When a toggled action needs to be re-applied, we should untoggle first.
        this.__toggled = false;
        this.__data = undefined;
    }
};

export {
    Signal
};


