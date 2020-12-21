/* eslint-disable require-jsdoc */
import { Operator } from './Operator'
import { NumberParameter } from '../Parameters/NumberParameter'
import { BaseItem } from '../BaseItem'
import { OperatorInput } from './OperatorInput'
import { OperatorOutput } from './OperatorOutput'
import { OperatorOutputMode } from '../Parameters/Parameter'
import { Registry } from '../../Registry'

class AddFloatsOperator extends Operator {
  constructor(name: any) {
    super(name)
    this.addInput(new OperatorInput('A'))
    this.addInput(new OperatorInput('B'))
    this.addOutput(new OperatorOutput('C'))
  }

  evaluate() {
    const a = this.getInput('A').getValue()
    const b = this.getInput('B').getValue()
    this.getOutput('C').setClean(a + b)
  }
}

Registry.register('AddFloatsOperator', AddFloatsOperator)

// Note: this operator modifies a value in the output attribute
// By reading and then changing. This feature allows us to combine operators
// to compute complex results. (See BoundingBox operators).
class ScaleFloatOperator extends Operator {
  constructor(name: any) {
    super(name)
    this.addInput(new OperatorInput('ScaleValue'))
    this.addOutput(new OperatorOutput('Result', OperatorOutputMode.OP_READ_WRITE))
  }

  evaluate() {
    let scaleValue = 1.0
    const inParam = this.getInput('ScaleValue').getParam()
    if (inParam) {
      scaleValue = inParam.getValue()
    }
    // Read the value, modify and return.
    const value = this.getOutput('Result').getValue()
    this.getOutput('Result').setClean(value * scaleValue)
  }
}

Registry.register('ScaleFloatOperator', ScaleFloatOperator)

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Operator', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('AddFloatsOperator', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const addOperator = new AddFloatsOperator()

    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const myParam = new NumberParameter('MyParam')

    addOperator.getInput('A').setParam(aParam)
    addOperator.getInput('B').setParam(bParam)
    addOperator.getOutput('C').setParam(myParam)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    aParam.setValue(3)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    bParam.setValue(2.5)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.getValue()).toBe(5.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('ScaleFloatOperator', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const scaleOperator = new ScaleFloatOperator()

    const scaleParam = new NumberParameter('A', 2)
    const resultParam = new NumberParameter('MyParam', 3)

    scaleOperator.getInput('ScaleValue').setParam(scaleParam)
    scaleOperator.getOutput('Result').setParam(resultParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.getValue()).toBe(6)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.isDirty()).toBe(false)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    scaleParam.setValue(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.getValue()).toBe(24)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(resultParam.isDirty()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('combining AddFloatsOperator and ScaleFloatOperator', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const addOperator = new AddFloatsOperator()
    const aParam = new NumberParameter('A', 2)
    const bParam = new NumberParameter('B', 3.5)
    const myParam = new NumberParameter('AddScaleFloatOperator-MyParam')

    addOperator.getInput('A').setParam(aParam)
    addOperator.getInput('B').setParam(bParam)
    addOperator.getOutput('C').setParam(myParam)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const scaleOperator = new ScaleFloatOperator()
    const scaleParam = new NumberParameter('A', 2)

    scaleOperator.getInput('ScaleValue').setParam(scaleParam)
    scaleOperator.getOutput('Result').setParam(myParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.getValue()).toBe(11)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(false)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    scaleParam.setValue(1)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.getValue()).toBe(5.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(myParam.isDirty()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('dynamically changing inputs and outputs', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const operator = new Operator()
    const aParam = new NumberParameter('A', 2)
    const bParam = new NumberParameter('B', 3.5)
    const cParam = new NumberParameter('C')

    operator.addInput(new OperatorInput('A')).setParam(aParam)
    operator.addInput(new OperatorInput('B')).setParam(bParam)
    operator.addOutput(new OperatorOutput('C')).setParam(cParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(operator.getNumInputs()).toBe(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(operator.getNumOutputs()).toBe(1)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(true)

    operator.getInput('A').setParam(null)
    operator.getInput('B').setParam(null)
    operator.getOutput('C').setParam(null)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)

    operator.removeInput(operator.getInput('A'))
    operator.removeInput(operator.getInput('B'))
    operator.removeOutput(operator.getOutput('C'))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(operator.getNumInputs()).toBe(0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(operator.getNumOutputs()).toBe(0)

    operator.addInput(new OperatorInput('A')).setParam(aParam)
    operator.addInput(new OperatorInput('B')).setParam(bParam)
    operator.addOutput(new OperatorOutput('C')).setParam(cParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(true)

    operator.removeInput(operator.getInput('A'))
    operator.removeInput(operator.getInput('B'))
    operator.removeOutput(operator.getOutput('C'))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)
  })

  class SetFloatOperator extends Operator {
    value: any;
    constructor(name: any, value: any) {
      super(name)
      this.value = value
      this.addOutput(new OperatorOutput('Output', OperatorOutputMode.OP_WRITE))
    }

    evaluate() {
      this.getOutput('Output').setClean(this.value)
    }
  }

  class ScaleFloatsOperator extends Operator {
    constructor(name: any) {
      super(name)
      this.addInput(new OperatorInput('ScaleValue'))
      this.addOutput(new OperatorOutput('OutputA', OperatorOutputMode.OP_READ_WRITE))
      this.addOutput(new OperatorOutput('OutputB', OperatorOutputMode.OP_READ_WRITE))
    }

    evaluate() {
      let scaleValue = 2.0
      const inParam = this.getInput('ScaleValue').getParam()
      if (inParam) {
        scaleValue = inParam.getValue()
      }
      // Read the value, modify and return both values
      const valueA = this.getOutput('OutputA').getValue()
      this.getOutput('OutputA').setClean(valueA * scaleValue)
      const valueB = this.getOutput('OutputB').getValue()
      this.getOutput('OutputB').setClean(valueB * scaleValue)

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      this.emit('evaluated')
    }
  }

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('horizontal dirty propagation', () => {
    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const cParam = new NumberParameter('C')
    const scaleABParam = new NumberParameter('scaleABParam', 2)
    const scaleBCParam = new NumberParameter('scaleBCParam', 2)

    // In the following configuration, we have 3 parameters being driven by
    // 5 different operators. The 'setA/B/C' operators initialize the values to 2
    // Then the scale operators scale that value using the 'scaleAB' and 'scaleBC' values.
    //     Param A: > ['setA', 'scaleAB']
    //     Param B: > ['setB', 'scaleAB', 'scaleBC']
    //     Param C: > ['setC', 'scaleBC']
    // Parameter 'B' is modified by both scale operators.
    const setA = new SetFloatOperator('setA', 2)
    setA.getOutput('Output').setParam(aParam)
    const setB = new SetFloatOperator('setB', 2)
    setB.getOutput('Output').setParam(bParam)
    const setC = new SetFloatOperator('setC', 2)
    setC.getOutput('Output').setParam(cParam)

    const scaleAB = new ScaleFloatsOperator('scaleAB')
    scaleAB.getOutput('OutputA').setParam(aParam)
    scaleAB.getOutput('OutputB').setParam(bParam)
    scaleAB.getInput('ScaleValue').setParam(scaleABParam)

    const scaleBC = new ScaleFloatsOperator('scaleBC')
    scaleBC.getOutput('OutputA').setParam(bParam)
    scaleBC.getOutput('OutputB').setParam(cParam)
    scaleBC.getInput('ScaleValue').setParam(scaleBCParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(8)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)

    // Now we do something interesting.
    // We modify scaleAB, which will dirty A and B.
    // However, because ParamB becomes dirty, and it must dirty its
    // entire stack up to the last 'OP_WRITE' connected output,
    // then it also propagates dirty up to scaleBC operator, which then
    // propagates down to all its outputs, which includes C
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    scaleABParam.setValue(3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(true) // cParam becomes dirty because bParam becomes dirty
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(6) // 3 * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(12) // (3 * 2) * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(4) // 2 * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    scaleBCParam.setValue(3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(6) // 3 * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(18) // (3 * 2) * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(6) // 3 * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('creating an cyclic dependency caused by mixing OP_READ_WRITE layering', () => {
    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const scaleABParam1 = new NumberParameter('scaleABParam1', 2)
    const scaleABParam2 = new NumberParameter('scaleABParam2', 2)

    const setA = new SetFloatOperator('setA', 2)
    setA.getOutput('Output').setParam(aParam)
    const setB = new SetFloatOperator('setB', 2)
    setB.getOutput('Output').setParam(bParam)

    const scaleAB1 = new ScaleFloatsOperator('scaleAB1')
    scaleAB1.getInput('ScaleValue').setParam(scaleABParam1)
    const scaleAB2 = new ScaleFloatsOperator('scaleAB2')
    scaleAB2.getInput('ScaleValue').setParam(scaleABParam2)

    // Now we are going to mix up the bindings.
    // In theory, we should see an operator writing
    // to an output our of schedule. Meaning that
    // scaleAB1 should write the value of

    // Bind aParam: > ['scaleAB1', 'scaleAB2']
    scaleAB1.getOutput('OutputA').setParam(aParam)
    scaleAB2.getOutput('OutputA').setParam(aParam)

    // Bind bParam: > ['scaleAB2', 'scaleAB1']
    scaleAB2.getOutput('OutputB').setParam(bParam)
    scaleAB1.getOutput('OutputB').setParam(bParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(true)

    // This throws because we cannot evaluated scaleAB1 because its
    // input value depends on the value of scaleAB2, whose input also
    // depends on the output of scaleAB1
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('rebind to fix a cyclic dependency caused by mixing OP_READ_WRITE layering', () => {
    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const scaleABParam1 = new NumberParameter('scaleABParam1', 2)
    const scaleABParam2 = new NumberParameter('scaleABParam2', 2)

    const setA = new SetFloatOperator('setA', 2)
    setA.getOutput('Output').setParam(aParam)
    const setB = new SetFloatOperator('setB', 2)
    setB.getOutput('Output').setParam(bParam)

    const scaleAB1 = new ScaleFloatsOperator('scaleAB1')
    scaleAB1.getInput('ScaleValue').setParam(scaleABParam1)
    const scaleAB2 = new ScaleFloatsOperator('scaleAB2')
    scaleAB2.getInput('ScaleValue').setParam(scaleABParam2)

    // Now we are going to mix up the bindings.
    // In theory, we should see an operator writing
    // to an output our of schedule. Meaning that
    // scaleAB1 should write the value of

    // Bind aParam: > ['scaleAB1', 'scaleAB2']
    scaleAB1.getOutput('OutputA').setParam(aParam)
    scaleAB2.getOutput('OutputA').setParam(aParam)

    // Bind bParam: > ['scaleAB2', 'scaleAB1']
    scaleAB2.getOutput('OutputB').setParam(bParam)
    scaleAB1.getOutput('OutputB').setParam(bParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.isDirty()).toBe(true)

    // This throws because we cannot evaluated scaleAB1 because its
    // input value depends on the value of scaleAB2, whose input also
    // depends on the output of scaleAB1
    // expect(bParam.getValue).toThrow()

    // Rebind forces the operators to remove and re-add bindings, which flattens the bindings and fixes the problem.
    scaleAB1.rebind()
    scaleAB2.rebind()

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    scaleABParam1.setValue(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(12) // (3 * 2) * 2
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(12) // (3 * 2) * 2
  })

  class DoubleFloatsOperator extends Operator {
    constructor(name: any) {
      super(name)
      this.addInput(new OperatorInput('in'))
      this.addOutput(new OperatorOutput('out', OperatorOutputMode.OP_WRITE))
    }

    evaluate() {
      const a = this.getInput('in').getValue()
      this.getOutput('out').setClean(a * 2)
    }
  }
  class MultiOutputOperator extends Operator {
    constructor(name: any) {
      super(name)
      this.addInput(new OperatorInput('in'))
      this.addOutput(new OperatorOutput('out0', OperatorOutputMode.OP_WRITE))
      this.addOutput(new OperatorOutput('out1', OperatorOutputMode.OP_WRITE))
      this.addOutput(new OperatorOutput('out2', OperatorOutputMode.OP_WRITE))
    }

    evaluate() {
      const value = this.getInput('in').getParam().getValue()
      this.getOutput('out0').setClean(value)
      this.getOutput('out1').setClean(value)
      this.getOutput('out2').setClean(value)
    }
  }

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('layering multi-out on a chain', () => {
    const inAParam = new NumberParameter('inA')
    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const cParam = new NumberParameter('B')

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const doubleOperator0 = new DoubleFloatsOperator()
    doubleOperator0.getInput('in').setParam(inAParam)
    doubleOperator0.getOutput('out').setParam(aParam)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const doubleOperator1 = new DoubleFloatsOperator()
    doubleOperator1.getInput('in').setParam(aParam)
    doubleOperator1.getOutput('out').setParam(bParam)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const doubleOperator2 = new DoubleFloatsOperator()
    doubleOperator2.getInput('in').setParam(bParam)
    doubleOperator2.getOutput('out').setParam(cParam)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    inAParam.setValue(2)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    aParam.setValue(2.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(8)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(16)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const multiOutputOperator = new MultiOutputOperator()
    const inBParam = new NumberParameter('inB', 3)
    multiOutputOperator.getInput('in').setParam(inBParam)
    multiOutputOperator.getOutput('out0').setParam(aParam)
    multiOutputOperator.getOutput('out1').setParam(bParam)
    multiOutputOperator.getOutput('out2').setParam(cParam)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)

    // Now dirty the input to the chain.
    // Because the multi-out layers on top using OP_WRITE outputs,
    // it should prevent the chain from becoming dirty.
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    inAParam.setValue(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.isDirty()).toBe(false)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(aParam.getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(bParam.getValue()).toBe(3)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(cParam.getValue()).toBe(3)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('save to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const addOperator = new AddFloatsOperator()
    const parameterOwner = new BaseItem('Foo')
    const aParam = parameterOwner.addParameter(new NumberParameter('A'))
    const bParam = parameterOwner.addParameter(new NumberParameter('B'))
    const myParam = parameterOwner.addParameter(new NumberParameter('MyParam'))

    addOperator.getInput('A').setParam(aParam)
    addOperator.getInput('B').setParam(bParam)
    addOperator.getOutput('C').setParam(myParam)

    aParam.setValue(3)
    bParam.setValue(2.5)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(addOperator.toJSON())).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('load from JSON (serialization).', () => {
    const parameterOwner = new BaseItem('Foo')
    parameterOwner.addParameter(new NumberParameter('A'))
    parameterOwner.addParameter(new NumberParameter('B'))
    parameterOwner.addParameter(new NumberParameter('MyParam'))

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
    const addOperator = new AddFloatsOperator()
    const input = {
      name: '',
      type: 'AddFloatsOperator',
      inputs: [
        { name: 'A', paramPath: ['Foo', 'A'] },
        { name: 'B', paramPath: ['Foo', 'B'] },
      ],
      outputs: [{ name: 'C', paramPath: ['Foo', 'MyParam'], paramBindIndex: 0 }],
    }
    addOperator.fromJSON(input, {
      resolvePath: (path: any, cb: any) => {
        cb(parameterOwner.resolvePath(path))
      },
    })

    parameterOwner.getParameter('A').setValue(3)
    parameterOwner.getParameter('B').setValue(2.5)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterOwner.getParameter('MyParam').isDirty()).toBe(true)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterOwner.getParameter('MyParam').getValue()).toBe(5.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameterOwner.getParameter('MyParam').isDirty()).toBe(false)
  })
})
