import { Registry } from '../../Registry';
import { BaseItem } from '../BaseItem.js';
import { OperatorInput } from './OperatorInput';
import { OperatorOutput } from './OperatorOutput';
/**
 * Class representing an operator.
 *
 * @extends BaseItem
 */
class Operator extends BaseItem {
    __inputs: any;
    __outputs: any;
    /**
     * Create an operator.
     * @param {string} name - The name value.
     */
    constructor(name: any) {
        super(name);
        this.__inputs = new Map();
        this.__outputs = new Map();
    }
    /**
     * This method sets the state of the operator to dirty which propagates
     * to the outputs of this operator, and which may then propagate to other
     * operators. When the scene is cleaned, which usually is caused by rendering
     * then the chain of operators are cleaned by triggering evaluation.
     * @private
     */
    setDirty() {
        this.__outputs.forEach((output: any) => output.setDirty());
    }
    /**
     * This method can be overridden in derived classes
     * to perform general updates (see GLPass or BaseItem).
     *
     * @param {object} event
     * @private
     */
    __parameterValueChanged(event: any) {
        super.__parameterValueChanged(event);
        this.setDirty();
    }
    /**
     * The addInput method.
     * @param {string|OperatorInput} input - The name of the input, or the input object
     * @return {array} - The return value.
     */
    addInput(input: any) {
        if (typeof input == 'string')
            input = new OperatorInput(input);
        else if (!(input instanceof OperatorInput)) {
            throw new Error(`addInput only accepts string or OperatorInput`);
        }
        input.setOperator(this);
        this.__inputs.set(input.getName(), input);
        this.setDirty();
        return input;
    }
    /**
     * The removeInput method.
     * @param {string|OperatorInput} input - The name of the input, or the input object
     */
    removeInput(input: any) {
        if (typeof input == 'string')
            input = this.getInput(input);
        if (!(input instanceof OperatorInput)) {
            throw new Error(`removeInput only accepts string or OperatorInput`);
        }
        if (input.getParam())
            input.setParam(null);
        this.__inputs.delete(input.getName());
    }
    /**
     * Getter for the number of inputs in this operator.
     * @return {number} - Returns the number of inputs.
     */
    getNumInputs() {
        return this.__inputs.size;
    }
    /**
     * The getInputByIndex method.
     * @param {number} index - The index value.
     * @return {object} - The return value.
     */
    getInputByIndex(index: any) {
        return Array.from(this.__inputs.values())[index];
    }
    /**
     * The getInput method.
     * @param {string} name - The name value.
     * @return {OperatorInput} - The return value.
     */
    getInput(name: any) {
        return this.__inputs.get(name);
    }
    /**
     * The addOutput method.
     * @param {string|OperatorOutput} output - The name of the output, or the output object
     * @return {array} - The return value.
     */
    addOutput(output: any) {
        if (typeof output == 'string')
            output = new OperatorOutput(output);
        else if (!(output instanceof OperatorOutput)) {
            throw new Error(`addOutput only accepts string or OperatorOutput`);
        }
        output.setOperator(this);
        if (this.getOutput(output.getName()))
            throw new Error(`Operator output already exists ${output.getName()}`);
        this.__outputs.set(output.getName(), output);
        this.setDirty();
        return output;
    }
    /**
     * The removeOutput method.
     * @param {string|OperatorOutput} output - The name of the output, or the output object
     */
    removeOutput(output: any) {
        if (typeof output == 'string')
            output = this.getOutput(output);
        if (!(output instanceof OperatorOutput)) {
            throw new Error(`removeOutput only accepts string or OperatorInput`);
        }
        if (output.getParam())
            output.setParam(null);
        this.__outputs.delete(output.getName());
    }
    /**
     * Getter for the number of outputs in this operator.
     * @return {number} - Returns the number of outputs.
     */
    getNumOutputs() {
        return this.__outputs.size;
    }
    /**
     * The getOutputByIndex method.
     * @param {number} index - The index value.
     * @return {object} - The return value.
     */
    getOutputByIndex(index: any) {
        return Array.from(this.__outputs.values())[index];
    }
    /**
     * The getOutput method.
     * @param {string} name - The name value.
     * @return {OperatorOutput} - The return value.
     */
    getOutput(name: any) {
        return this.__outputs.get(name);
    }
    /**
     * The evaluate method.
     * Computes the values of each of the outputs based on the values of the inputs
     * and the values of outputs with mode OP_READ_WRITE.
     * This method must be implemented by all Operators.
     */
    evaluate() {
        throw new Error('Not yet implemented');
    }
    /**
     * When the value on a Parameter is modified by a user by calling 'setValue,
     * then if any operators are bound, the value of the Parameter cannot be modified
     * directly as it is the result of a computation. Instead, the Parameter calls
     * 'backPropagateValue' on the Operator to cause the Operator to handle propagating
     * the value to one or more of its inputs.
     * to its inputs.
     * @param {any} value - The value param.
     * @return {any} - The modified value.
     */
    backPropagateValue(value: any) {
        // TODO: Implement me for custom manipulations.
        return value;
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
        const j = super.toJSON(context);
        (j as any).type = Registry.getBlueprintName(this);
        const inputs: any = [];
        this.__inputs.forEach((input: any) => {
            inputs.push(input.toJSON(context));
        });
        (j as any).inputs = inputs;
        const outputs: any = [];
        this.__outputs.forEach((output: any) => {
            outputs.push(output.toJSON(context));
        });
        (j as any).outputs = outputs;
        return j;
    }
    /**
     * The fromJSON method decodes a json object for this type.
     *
     * @param {object} j - The json object this item must decode.
     * @param {object} context - The context value.
     */
    fromJSON(j: any, context: any) {
        super.fromJSON(j, context);
        if (j.inputs) {
            j.inputs.forEach((inputJson: any, index: any) => {
                let input;
                if (inputJson.name) {
                    input = this.getInput(inputJson.name);
                    if (!input) {
                        input = this.addInput(inputJson.name);
                    }
                }
                else {
                    input = this.getInputByIndex(index);
                }
                input.fromJSON(inputJson, context);
            });
        }
        if (j.outputs) {
            j.outputs.forEach((outputJson: any, index: any) => {
                let output;
                if (outputJson.name) {
                    output = this.getOutput(outputJson.name);
                    if (!output) {
                        output = this.addOutput(outputJson.name);
                    }
                }
                else {
                    output = this.getOutputByIndex(index);
                }
                output.fromJSON(outputJson, context);
            });
        }
    }
    /**
     * The detach method.
     */
    detach() {
        this.__inputs.forEach((input: any) => input.detach());
        this.__outputs.forEach((output: any) => output.detach());
    }
    /**
     * The reattach method.
     */
    reattach() {
        this.__inputs.forEach((input: any) => input.reattach());
        this.__outputs.forEach((output: any) => output.reattach());
    }
    /**
     * The rebind method.
     */
    rebind() {
        this.__outputs.forEach((output: any) => output.rebind());
    }
}
export { Operator };
