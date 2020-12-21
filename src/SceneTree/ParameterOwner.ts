/* eslint-disable guard-for-in */
/* eslint-disable valid-jsdoc */
import { EventEmitter } from '../Utilities/EventEmitter';
import { Registry } from '../Registry';
/**
 * Class that allows other classes to be parameterized by `Parameter` type of objects.
 * Not only hosting parameters, but their events.
 *
 * @extends {EventEmitter}
 */
class ParameterOwner extends EventEmitter {
    __paramEventHandlers: any;
    __paramMapping: any;
    __params: any;
    deprecatedParamMapping: any;
    /**
     * Creates an instance of ParameterOwner by initializing parameter hosting mappings and events.
     * <br>
     * Every Object has a unique identifier which is based on a counter that is incremented.
     */
    constructor() {
        super();
        this.__params = [];
        this.__paramMapping = {};
        this.deprecatedParamMapping = {};
        this.__paramEventHandlers = {};
    }
    // --- Params ---
    /**
     * @deprecated
     * Returns the number of parameters current object has.
     *
     * @return {number} - Amount of parameters in current object.
     */
    numParameters() {
        console.warn('Deprecated. Use #getNumParameters instead.');
        return this.getNumParameters();
    }
    /**
     * Returns the number of parameters current object has.
     *
     * @return {number} - Amount of parameters in current object.
     */
    getNumParameters() {
        return this.__params.length;
    }
    /**
     * Returns all the parameters of the object.
     *
     * @return {array} - Parameter List
     */
    getParameters() {
        return this.__params;
    }
    /**
     * Returns the index of a parameter in parameter list.
     *
     * @param {string} paramName - Name of the parameter.
     * @return {number} - Position in the array
     */
    getParameterIndex(paramName: any) {
        return this.__paramMapping[paramName];
    }
    /**
     * Returns `Parameter` object in a given index
     *
     * @param {number} index - Position of the parameter in the array
     * @return {Parameter} - Parameter object value
     */
    getParameterByIndex(index: any) {
        return this.__params[index];
    }
    /**
     * Validates if the specified parameter exists in the object.
     *
     * @param {string} paramName - The parameter name.
     * @return {boolean} - The return value.
     */
    hasParameter(paramName: any) {
        return paramName in this.__paramMapping;
    }
    /**
     * Add a mapping from one name to a new parameter.
     * This is used to handle migrating parameters to new names.
     *
     * @param {string} key - The parameter name.
     * @param {string} paramName - The parameter name.
     * @return {boolean} - The return value.
     */
    addParameterDeprecationMapping(key: any, paramName: any) {
        this.deprecatedParamMapping[key] = paramName;
    }
    /**
     * Returns `Parameter` object using the given name
     *
     * @param {string} paramName - The parameter name.
     * @return {Parameter} - Parameter object value
     */
    getParameter(paramName: any) {
        let index = this.__paramMapping[paramName];
        if (index == undefined) {
            const newParamName = this.deprecatedParamMapping[paramName];
            if (!newParamName)
                return null;
            else {
                console.warn(`Parameter name ${paramName} is now deprecated. Please use ${newParamName} instead.`);
                index = this.__paramMapping[newParamName];
            }
        }
        return this.__params[index];
    }
    /**
     * This method can be overridden in derived classes
     * to perform general updates (see GLPass or BaseItem).
     * @param {object} event - The event object emitted by the parameter.
     * @private
     */
    __parameterValueChanged(event: any) {
        this.emit('parameterValueChanged', event);
    }
    /**
     * Adds `Parameter` object to the owner's parameter list.
     *
     * @emits `parameterAdded` with the name of the param.
     * @param {Parameter} param - The parameter to add.
     * @return {Parameter} - With `owner` and `valueChanged` event set.
     */
    addParameter(param: any) {
        return this.insertParameter(param, this.__params.length);
    }
    /**
     * Adds `Parameter` object to the owner's parameter list using the index.
     * It replaces the event in the specified index.
     *
     *
     * @emits `parameterAdded` with the name of the param.
     * @param {Parameter} param - The parameter to insert.
     * @param {number} index - The index value.
     * @return {Parameter} - With `owner` and `valueChanged` event set.
     */
    insertParameter(param: any, index: any) {
        const name = param.getName();
        if (this.__paramMapping[name] != undefined) {
            console.warn('Replacing Parameter:' + name);
            this.removeParameter(name);
        }
        param.setOwner(this);
        const paramChangedHandler = (event: any) => {
            // Note: spread operators cause errors on iOS 11.
            const newEvent = { param };
            for (let key in event)
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                newEvent[key] = event[key];
            this.__parameterValueChanged(newEvent);
        };
        param.on('valueChanged', paramChangedHandler);
        this.__paramEventHandlers[name] = paramChangedHandler;
        this.__params.splice(index, 0, param);
        for (let i = index; i < this.__params.length; i++) {
            this.__paramMapping[this.__params[i].getName()] = i;
        }
        this.emit('parameterAdded', { name });
        return param;
    }
    /**
     * Removes `Parameter` from owner, by using parameter's name.
     * @emits `parameterRemoved` with the name of the param.
     * @param {string} name - The parameter name.
     */
    removeParameter(name: any) {
        if (this.__paramMapping[name] == undefined) {
            throw new Error('Unable to remove Parameter:' + name);
        }
        const index = this.__paramMapping[name];
        const param = this.__params[this.__paramMapping[name]];
        param.off('valueChanged', this.__paramEventHandlers[name]);
        this.__params.splice(index, 1);
        delete this.__paramMapping[name];
        for (let i = index; i < this.__params.length; i++) {
            this.__paramMapping[this.__params[i].getName()] = i;
        }
        this.emit('parameterRemoved', { name });
    }
    /**
     * Replaces old `Parameter` by passing a new one with the same name.
     *
     * @param {Parameter} param - The parameter to replace.
     * @return {Parameter} - `Parameter` with `valueChanged` event set.
     */
    replaceParameter(param: any) {
        const name = param.getName();
        if (this.__paramMapping[name] == undefined) {
            // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'paramName'.
            throw new Error('Unable to replace Parameter:' + paramName);
        }
        const index = this.__paramMapping[name];
        this.removeParameter(name);
        this.insertParameter(param, index);
        return param;
    }
    // ////////////////////////////////////////
    // Persistence
    /**
     * The toJSON method encodes this type as a json object for persistence.
     *
     * @param {object} context - The context value.
     * @return {object} - Returns the json object.
     */
    toJSON(context: any) {
        const json = {};
        const paramsJSON = {};
        let savedParams = 0;
        for (const param of this.__params) {
            const paramJSON = param.toJSON(context);
            if (paramJSON) {
                // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                paramsJSON[param.getName()] = paramJSON;
                savedParams++;
            }
        }
        if (savedParams > 0)
            (json as any).params = paramsJSON;
        return json;
    }
    /**
     * The fromJSON method decodes a json object for this type.
     *
     * @param {object} j - The json object this item must decode.
     * @param {object} context - The context value.
     */
    fromJSON(j: any, context: any) {
        if (j.params) {
            for (const key in j.params) {
                const pj = j.params[key];
                const param = this.getParameter(key);
                if (!param)
                    console.warn('Param not found:' + key);
                else {
                    if (pj.paramPath) {
                        context.resolvePath(pj.paramPath, (param: any) => {
                            this.replaceParameter(param);
                        }, (reason: any) => {
                            console.warn('Unable to resolve shared parameter:' + pj.paramPath);
                        });
                    }
                    else {
                        param.fromJSON(pj, context);
                    }
                }
            }
        }
    }
    /**
     * Uses passed in BinReader object(containing an Int32 array with all the parameters) to reconstruct all parameters state.
     * <br>
     * In each iteration of the array, propType and propName are extracted and
     * used to build the right `Parameter` class. Then all of them are added to the object.
     *
     * @emits `parameterAdded` with the name of the param.
     * @param {BinReader} reader - The reader value.
     * @param {object} context - The context value.
     */
    readBinary(reader: any, context: any) {
        // TODO: make this work
        if (context.versions['zea-engine'].compare([0, 0, 3]) >= 0) {
            const numProps = reader.loadUInt32();
            for (let i = 0; i < numProps; i++) {
                const propType = reader.loadStr();
                const propName = reader.loadStr();
                let param = this.getParameter(propName);
                if (!param) {
                    param = Registry.constructClass(propType, propName);
                    if (!param) {
                        console.error('Unable to construct prop:' + propName + ' of type:' + propType);
                        continue;
                    }
                    this.addParameter(param);
                }
                param.readBinary(reader, context);
            }
        }
    }
    /**
     * Converts object's JSON value and converts it to a string.
     *
     * @return {string} - String of object's parameter list state.
     */
    toString() {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
        return JSON.stringify(this.toJSON(), null, 2);
    }
    // ////////////////////////////////////////
    // Clone and Destroy
    /**
     * Copies Parameters from another `ParameterOwner` to current object.
     *
     * @param {ParameterOwner} src - The ParameterOwner copy from.
     * @param {object} context - The context value.
     */
    copyFrom(src: any, context: any) {
        // Note: Loop over the parameters in reverse order,
        // this is because often, parameter dependencies
        // are bottom to top (bottom params dependent on higher params).
        // This means that as a parameter is set with a new value
        // it will dirty the params below it.
        let i = src.getNumParameters();
        while (i--) {
            const srcParam = src.getParameterByIndex(i);
            const param = this.getParameter(srcParam.getName());
            if (param) {
                // Note: we are not cloning the values.
                param.loadValue(srcParam.getValue());
            }
            else {
                this.addParameter(srcParam.clone(context));
            }
        }
    }
}
export { ParameterOwner };
