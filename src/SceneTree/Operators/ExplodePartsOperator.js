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

class ExplodePartParameter extends StructParameter {
  constructor(name) {
    super(name);

    this.__stageParam = this._addMember(new NumberParameter('Stage', 0));
    this.__axisParam = this._addMember(
      new Vec3Parameter('Axis', new Vec3(1, 0, 0))
    );

    // The Movement param enables fine level timing to be set per part.
    //
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

  setStage(stage, mode = ValueSetMode.USER_SETVALUE) {
    this.__stageParam.setValue(stage, mode);
  }

  getOutput() {
    return this.__output;
  }

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
    const stage = this.__stageParam.getValue();
    const movement = this.__movementParam.getValue();
    let dist;
    if (cascade) {
      // in 'cascade' mode, the parts move in a cascade,
      // starting with stage 0. then 1 ...
      const t = stage / stages;
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

  toJSON(context, flags) {
    const j = super.toJSON(context, flags);
    if (j) {
      j.output = this.__output.toJSON(context, flags);
    }
    return j;
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
    if (j.output) {
      this.__output.fromJSON(j.output, context);
    }
  }
}

class ExplodePartsOperator extends Operator {
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

  toJSON(context, flags) {
    return super.toJSON(context, flags);
  }

  fromJSON(j, context, flags) {
    super.fromJSON(j, context, flags);
  }

  destroy() {
    clearTimeout(this.__timeoutId);
    super.destroy();
  }
}

sgFactory.registerClass('ExplodePartsOperator', ExplodePartsOperator);

export { ExplodePartsOperator };
// export default AssetItem;
