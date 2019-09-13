import { sgFactory } from '../SceneTree/SGFactory.js';

import { ParameterOwner } from '../SceneTree/ParameterOwner.js';

class StateAction extends ParameterOwner {
  constructor(name) {
    super();
    this.__name = name;
    this.__childActions = [];

    this.__outputs = {};
  }

  addOutput(output) {
    this.__outputs[output.getName()] = output;
    return output;
  }

  getOutput(name) {
    return this.__outputs[name];
  }

  setState(state) {
    this.__state = state;
    this.__childActions.forEach(childAction => {
      childAction.setState(state);
    });
  }

  addChild(childAction) {
    this.__childActions.push(childAction);
    childAction.setState(this.__state);
  }

  getChild(index) {
    return this.__childActions[index];
  }

  activate() {
    console.warn(
      'activate must be implmented by each action. this:' +
        this.constructor.name
    );
  }

  addChild(childAction) {
    this.__childActions.push(childAction);
    childAction.setState(this.__state);
  }

  deactivate() {}

  __onDone() {
    this.__childActions.forEach(action => {
      action.activate();
    });
  }

  // ////////////////////////////////////////
  // Persistence

  toJSON(context, flags) {
    let j = super.toJSON(context, flags);
    if (!j)
      // If a state action has had no defaults changed, then it may not return json.
      j = {};
    j.type = sgFactory.getClassName(this);

    const childActionsj = [];
    for (const childAction of this.__childActions) {
      childActionsj.push(childAction.toJSON(context, flags));
    }
    j.childActions = childActionsj;

    const outputsj = {};
    for (const key in this.__outputs) {
      outputsj[key] = this.__outputs[key].toJSON(context, flags);
    }
    j.outputs = outputsj;

    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);

    for (const childActionjson of j.childActions) {
      const childAction = sgFactory.constructClass(childActionjson.type);
      if (childAction) {
        childAction.fromJSON(childActionjson, context);
        this.addChild(childAction);
      } else {
        throw 'Invalid type:' + childActionjson.type;
      }
    }

    for (const key in j.outputs) {
      this.__outputs[key].fromJSON(j.outputs[key], context);
      // const outputjson = j.outputs[key];
      // const output = sgFactory.constructClass(outputjson.type);
      // if (output) {
      //     output.fromJSON(outputjson, context);
      //     this.addOutput(key, output);
      // }
      // else {
      //     throw("Invalid type:" + outputjson.type)
      // }
    }
  }

  destroy() {
    super.destroy();
    this.__outputs = [];
  }
}

export { StateAction };
