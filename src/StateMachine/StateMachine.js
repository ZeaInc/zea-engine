
import {
    BaseItem
} from '../SceneTree/BaseItem.js';
import {
    sgFactory
} from '../SceneTree/SGFactory.js';

const getUrlVars = () => {
    const url = window.location.href,
        args = {};

    const parts = url.split('?');
    const hashes = parts.length > 1 ? parts[1].split('&') : [];
    for (let i = 0; i < hashes.length; i++) {
        const hash = hashes[i].split('=');
        args[hash[0]] = hash[1];
    }
    return args;
}

class StateMachine extends BaseItem {
    constructor(name) {
        super(name)
        this.__states = {};
        this.__currentState;
        this.__initialStateName;

        window.onpopstate = (event) => {
            if(event.state && event.state.stateName){
                this.activateState(event.state.stateName, false);
            }
            else {
                this.activateState(this.getInitialState(), false);
            }
        }
    }

    addState(state) {
        state.setStateMachine(this);
        this.__states[state.getName()] = state;

        if(Object.keys(this.__states).length == 1 && this.__initialStateName == undefined) {
            this.__initialStateName = state.getName();
        }
    }


    getState(name) {
        return this.__states[name];
    }

    activateState(name, addToHistory=true) {
        console.log("StateMachine.activateState:" + name)
        if(!this.__states[name])
            throw("Invalid state transtion:" + name)
        if(this.__currentState == this.__states[name])
            return;
        if(this.__currentState)
            this.__currentState.deactivate();
        this.__currentState = this.__states[name];
        this.__currentState.activate();

        // this turned out to be really anoying.
        // if(addToHistory) {
        //     const vars = getUrlVars();
        //     vars['stateId'] = name;
        //     let str = '?';
        //     for(let key in vars) {
        //         if(str != '?')
        //             str += '&'
        //         str += key+'='+vars[key];
        //     }
        //     window.history.pushState({stateName:name}, "State:"+name, str);
        // }
    }

    getActiveState() {
        return this.__currentState;
    }

    getActiveStateName() {
        return this.__currentState.constructor.name;
    }

    getInitialState() {
        return this.__initialStateName;
    }
    setInitialState(name) {
        this.__initialStateName = name;
    }


    //////////////////////////////////////////
    // Persistence

    toJSON(context) {
        let j = super.toJSON(context);
        if(!j) j = {};
        j.type = this.constructor.name;
        j.initialStateName = this.__initialStateName;

        const statesj = {};
        for(let key in this.__states){
            statesj[key] = this.__states[key].toJSON(context);
        }
        j.states = statesj;
        return j;
    }

    fromJSON(j, context) {
        super.fromJSON(j, context);
        this.__initialStateName = j.initialStateName;

        context.stateMachine = this;

        for(let key in j.states){
            const statejson = j.states[key];
            const state = sgFactory.constructClass(statejson.type);
            if (state) {
                state.fromJSON(statejson, context);
                this.addState(state);
            }
            else {
                throw("Invalid type:" + statejson.type)
            }
        }

        const onloaded = ()=>{
            this.activateState(this.__initialStateName);
            context.assetItem.loaded.disconnect(onloaded)
        }
        context.assetItem.loaded.connect(onloaded);
    }

};

sgFactory.registerClass('StateMachine', StateMachine);

export {
    StateMachine
};