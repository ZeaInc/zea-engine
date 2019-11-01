import { Vec2, Vec3 } from '../../Math';
import { Operator, XfoOperatorOutput } from './Operator.js';
import {
  ValueSetMode,
  Parameter,
  BooleanParameter,
  NumberParameter,
  Vec2Parameter,
  Vec3Parameter,
  ListParameter,
  StructParameter,
  TreeItemParameter,
  KinematicGroupParameter,
} from '../Parameters';

import { sgFactory } from '../SGFactory.js';

/** Class representing an explode part parameter.
 * @extends StructParameter
 */
class ExplodePartParameter extends StructParameter {
  /**
   * Create an explode part parameter.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name);

    this.__stageParam = this._addMember(new NumberParameter('Stage', 0));
    this.__axisParam = this._addMember(
      new Vec3Parameter('Axis', new Vec3(1, 0, 0))
    );

    // The Movement param enables fine level timing to be set per part.
    this.__movementParam = this._addMember(
      new Vec2Parameter('MovementTiming', new Vec2(0, 1), [
        new Vec2(0, 0),
        new Vec2(1, 1),
      ])
    );
    this.__multiplierParam = this._addMember(
      new NumberParameter('Multiplier', 1.0)
    );
    this.__output = new XfoOperatorOutput('Part');
  }

  /**
   * The setStage method.
   * @param {any} stage - The stage value.
   * @param {number} mode - The mode value.
   */
  setStage(stage, mode = ValueSetMode.USER_SETVALUE) {
    this.__stageParam.setValue(stage, mode);
  }

  /**
   * The getOutput method.
   * @return {any} - The return value.
   */
  getOutput() {
    return this.__output;
  }

  /**
   * The evaluate method.
   * @param {any} explode - The explode value.
   * @param {any} explodeDist - The distance that the parts explode to.
   * @param {any} offset - The offset value.
   * @param {any} stages - The stages value.
   * @param {any} cascade - In "cascade" mode, the parts move in a cascade.
   * @param {any} centered - The centered value.
   * @param {Xfo} parentXfo - The parentXfo value.
   * @param {any} parentDelta - The parentDelta value.
   */
  evaluate(
    explode,
    explodeDist,
    offset,
    stages,
    cascade,
    centered,
    parentXfo,
    parentDelta
  ) {
    // Note: during interactive setup of the operator we
    // can have evaluations before anything is connected.
    if (!this.__output.isConnected()) return;

    const stage = this.__stageParam.getValue();
    const movement = this.__movementParam.getValue();
    let dist;
    if (cascade) {
      // In 'cascade' mode, the parts move in a cascade,
      // starting with stage 0. then 1 ...
      let t = stage / stages;
      if (centered) t -= 0.5;
      dist =
        explodeDist *
        Math.linStep(movement.x, movement.y, Math.max(0, explode - t));
    } else {
      // Else all the parts are spread out across the explode distance.
      let t = 1.0 - stage / stages;
      if (centered) t -= 0.5;
      dist = explodeDist * Math.linStep(movement.x, movement.y, explode) * t;
    }
    dist += offset;

    let explodeDir = this.__axisParam.getValue();
    const multiplier = this.__multiplierParam.getValue();
    const initialxfo = this.__output.getInitialValue();
    let xfo;
    if (parentXfo) {
      xfo = parentDelta.multiply(initialxfo);
      explodeDir = parentXfo.ori.rotateVec3(explodeDir);
      xfo.tr.addInPlace(explodeDir.scale(dist * multiplier));
    } else {
      xfo = this.__output.getValue();
      xfo.tr = initialxfo.tr.add(explodeDir.scale(dist * multiplier));
    }

    this.__output.setValue(xfo);
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (j) {
      j.output = this.__output.toJSON(context, flags);
    }
    return j;
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    if (j.output) {
      this.__output.fromJSON(j.output, context);
    }
  }
}

/** Class representing an explode parts operator.
 * @extends ParameterOwner
 */
class ExplodePartsOperator extends Operator {
  /**
   * Create an explode parts operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name);

    this.__stagesParam = this.addParameter(new NumberParameter('Stages', 0));
    this._explodeParam = this.addParameter(
      new NumberParameter('Explode', 0.0, [0, 1])
    );
    this._distParam = this.addParameter(new NumberParameter('Dist', 1.0));
    this._offsetParam = this.addParameter(new NumberParameter('Offset', 0));
    this._cascadeParam = this.addParameter(
      new BooleanParameter('Cascade', false)
    );
    this._centeredParam = this.addParameter(
      new BooleanParameter('Centered', false)
    );
    this.__parentItemParam = this.addParameter(
      new TreeItemParameter('RelativeTo')
    );
    this.__parentItemParam.valueChanged.connect(() => {
      // compute the local xfos
      const parentItem = this.__parentItemParam.getValue();
      if (parentItem)
        this.__invParentSpace = parentItem.getGlobalXfo().inverse();
      else this.__invParentSpace = undefined;
    });
    this.__parentItemParam.treeItemGlobalXfoChanged.connect(
      this.__opInputChanged
    );

    this.__itemsParam = this.addParameter(
      new ListParameter('Parts', ExplodePartParameter)
    );
    this.__itemsParam.elementAdded.connect((value, index) => {
      this.addOutput(value.getOutput());
      value.setStage(index, ValueSetMode.SILENT);
      this.__stagesParam.setValue(
        this.__stagesParam.getValue() + 1,
        ValueSetMode.SILENT
      );
    });
    this.__itemsParam.elementRemoved.connect((value, index) => {
      this.removeOutput(value.getOutput());
    });

    this.__localXfos = [];
    this.__parts = [];
    this.__stages = 2;
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const stages = this.__stagesParam.getValue();
    const explode = this._explodeParam.getValue();
    // const explodeDir = this.getParameter('Axis').getValue();
    const explodeDist = this._distParam.getValue();
    const offset = this._offsetParam.getValue();
    const cascade = this._cascadeParam.getValue();
    const centered = this._centeredParam.getValue();
    const parentItem = this.__parentItemParam.getValue();
    let parentXfo;
    let parentDelta;
    if (parentItem) {
      parentXfo = parentItem.getGlobalXfo();
      parentDelta = this.__invParentSpace.multiply(parentXfo);
    }

    const items = this.__itemsParam.getValue();
    for (let i = 0; i < items.length; i++) {
      const part = items[i];
      part.evaluate(
        explode,
        explodeDist,
        offset,
        stages,
        cascade,
        centered,
        parentXfo,
        parentDelta
      );
    }
  }

  // ////////////////////////////////////////
  // Persistence

  /**
   * The toJSON method encodes this type as a json object for persistences.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   * @return {object} - Returns the json object.
   */
  toJSON(context, flags) {
    return super.toJSON(context, flags);
  }

  /**
   * The fromJSON method decodes a json object for this type.
   * @param {object} j - The json object this item must decode.
   * @param {object} context - The context value.
   * @param {number} flags - The flags value.
   */
  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
  }

  /**
   * The destroy method.
   */
  destroy() {
    clearTimeout(this.__timeoutId);
    super.destroy();
  }
}

sgFactory.registerClass('ExplodePartsOperator', ExplodePartsOperator);

export { ExplodePartsOperator };
