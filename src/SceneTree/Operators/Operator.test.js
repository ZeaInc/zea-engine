/* eslint-disable require-jsdoc */
import { Operator } from './Operator'
import { NumberParameter } from '../Parameters/NumberParameter'
import { BaseItem } from '../BaseItem'
import { OperatorInput } from './OperatorInput'
import { OperatorOutput } from './OperatorOutput'
import { OperatorOutputMode } from '../Parameters/Parameter'
import { Registry } from '../../Registry'

class AddFloatsOperator extends Operator {
  constructor(name) {
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
  constructor(name) {
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

describe('Operator', () => {
  test('AddFloatsOperator', () => {
    const addOperator = new AddFloatsOperator()

    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const myParam = new NumberParameter('MyParam')

    addOperator.getInput('A').setParam(aParam)
    addOperator.getInput('B').setParam(bParam)
    addOperator.getOutput('C').setParam(myParam)

    aParam.setValue(3)
    bParam.setValue(2.5)

    expect(myParam.isDirty()).toBe(true)
    expect(myParam.getValue()).toBe(5.5)
    expect(myParam.isDirty()).toBe(false)
  })

  test('ScaleFloatOperator', () => {
    const scaleOperator = new ScaleFloatOperator()

    const scaleParam = new NumberParameter('A', 2)
    const resultParam = new NumberParameter('MyParam', 3)

    scaleOperator.getInput('ScaleValue').setParam(scaleParam)
    scaleOperator.getOutput('Result').setParam(resultParam)

    expect(resultParam.isDirty()).toBe(true)
    expect(resultParam.getValue()).toBe(6)
    expect(resultParam.isDirty()).toBe(false)

    scaleParam.setValue(4)
    expect(resultParam.isDirty()).toBe(true)
    expect(resultParam.getValue()).toBe(24)
    expect(resultParam.isDirty()).toBe(false)
  })

  test('combining AddFloatsOperator and ScaleFloatOperator', () => {
    const addOperator = new AddFloatsOperator()
    const aParam = new NumberParameter('A', 2)
    const bParam = new NumberParameter('B', 3.5)
    const myParam = new NumberParameter('AddScaleFloatOperator-MyParam')

    addOperator.getInput('A').setParam(aParam)
    addOperator.getInput('B').setParam(bParam)
    addOperator.getOutput('C').setParam(myParam)

    const scaleOperator = new ScaleFloatOperator()
    const scaleParam = new NumberParameter('A', 2)

    scaleOperator.getInput('ScaleValue').setParam(scaleParam)
    scaleOperator.getOutput('Result').setParam(myParam)

    expect(myParam.isDirty()).toBe(true)
    expect(myParam.getValue()).toBe(11)
    expect(myParam.isDirty()).toBe(false)

    scaleParam.setValue(1)

    expect(myParam.isDirty()).toBe(true)
    expect(myParam.getValue()).toBe(5.5)
    expect(myParam.isDirty()).toBe(false)
  })

  test('dynamically changing inputs and outputs', () => {
    const operator = new Operator()
    const aParam = new NumberParameter('A', 2)
    const bParam = new NumberParameter('B', 3.5)
    const cParam = new NumberParameter('C')

    operator.addInput(new OperatorInput('A')).setParam(aParam)
    operator.addInput(new OperatorInput('B')).setParam(bParam)
    operator.addOutput(new OperatorOutput('C')).setParam(cParam)

    expect(operator.getNumInputs()).toBe(2)
    expect(operator.getNumOutputs()).toBe(1)

    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(true)

    operator.getInput('A').setParam(null)
    operator.getInput('B').setParam(null)
    operator.getOutput('C').setParam(null)

    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(false)

    operator.removeInput(operator.getInput('A'))
    operator.removeInput(operator.getInput('B'))
    operator.removeOutput(operator.getOutput('C'))

    expect(operator.getNumInputs()).toBe(0)
    expect(operator.getNumOutputs()).toBe(0)

    operator.addInput(new OperatorInput('A')).setParam(aParam)
    operator.addInput(new OperatorInput('B')).setParam(bParam)
    operator.addOutput(new OperatorOutput('C')).setParam(cParam)

    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(true)

    operator.removeInput(operator.getInput('A'))
    operator.removeInput(operator.getInput('B'))
    operator.removeOutput(operator.getOutput('C'))

    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(false)
  })

  class SetFloatOperator extends Operator {
    constructor(name, value) {
      super(name)
      this.value = value
      this.addOutput(new OperatorOutput('Output', OperatorOutputMode.OP_WRITE))
    }

    evaluate() {
      this.getOutput('Output').setClean(this.value)
    }
  }

  class ScaleFloatsOperator extends Operator {
    constructor(name) {
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

      this.emit('evaluated')
    }
  }

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

    expect(aParam.isDirty()).toBe(true)
    expect(bParam.isDirty()).toBe(true)
    expect(cParam.isDirty()).toBe(true)
    expect(aParam.getValue()).toBe(4)
    expect(bParam.getValue()).toBe(8)
    expect(cParam.getValue()).toBe(4)
    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(false)

    // Now we do something interesting.
    // We modify scaleAB, which will dirty A and B.
    // However, because ParamB becomes dirty, and it must dirty its
    // entire stack up to the last 'OP_WRITE' connected output,
    // then it also propagates dirty up to scaleBC operator, which then
    // propagates down to all its outputs, which includes C
    scaleABParam.setValue(3)

    expect(aParam.isDirty()).toBe(true)
    expect(bParam.isDirty()).toBe(true)
    expect(cParam.isDirty()).toBe(true) // cParam becomes dirty because bParam becomes dirty
    expect(aParam.getValue()).toBe(6) // 3 * 2
    expect(bParam.getValue()).toBe(12) // (3 * 2) * 2
    expect(cParam.getValue()).toBe(4) // 2 * 2
    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(false)

    scaleBCParam.setValue(3)

    expect(aParam.isDirty()).toBe(true)
    expect(bParam.isDirty()).toBe(true)
    expect(cParam.isDirty()).toBe(true)
    expect(aParam.getValue()).toBe(6) // 3 * 2
    expect(bParam.getValue()).toBe(18) // (3 * 2) * 2
    expect(cParam.getValue()).toBe(6) // 3 * 2
    expect(aParam.isDirty()).toBe(false)
    expect(bParam.isDirty()).toBe(false)
    expect(cParam.isDirty()).toBe(false)
  })

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

    expect(aParam.isDirty()).toBe(true)
    expect(bParam.isDirty()).toBe(true)

    // This throws because we cannot evaluated scaleAB1 because its
    // input value depends on the value of scaleAB2, whose input also
    // depends on the output of scaleAB1
    expect(bParam.getValue).toThrow()
  })

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

    expect(aParam.isDirty()).toBe(true)
    expect(bParam.isDirty()).toBe(true)

    // This throws because we cannot evaluated scaleAB1 because its
    // input value depends on the value of scaleAB2, whose input also
    // depends on the output of scaleAB1
    // expect(bParam.getValue).toThrow()

    // Rebind forces the operators to remove and re-add bindings, which flattens the bindings and fixes the problem.
    scaleAB1.rebind()
    scaleAB2.rebind()

    scaleABParam1.setValue(3)
    expect(aParam.getValue()).toBe(12) // (3 * 2) * 2
    expect(bParam.getValue()).toBe(12) // (3 * 2) * 2
  })

  class DoubleFloatsOperator extends Operator {
    constructor(name) {
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
    constructor(name) {
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

  test('layering multi-out on a chain', () => {
    const inAParam = new NumberParameter('inA')
    const aParam = new NumberParameter('A')
    const bParam = new NumberParameter('B')
    const cParam = new NumberParameter('B')

    const doubleOperator0 = new DoubleFloatsOperator()
    doubleOperator0.getInput('in').setParam(inAParam)
    doubleOperator0.getOutput('out').setParam(aParam)

    const doubleOperator1 = new DoubleFloatsOperator()
    doubleOperator1.getInput('in').setParam(aParam)
    doubleOperator1.getOutput('out').setParam(bParam)

    const doubleOperator2 = new DoubleFloatsOperator()
    doubleOperator2.getInput('in').setParam(bParam)
    doubleOperator2.getOutput('out').setParam(cParam)

    inAParam.setValue(2)
    aParam.setValue(2.5)
    expect(aParam.getValue()).toBe(4)
    expect(bParam.getValue()).toBe(8)
    expect(cParam.getValue()).toBe(16)
    expect(cParam.isDirty()).toBe(false)

    const multiOutputOperator = new MultiOutputOperator()
    const inBParam = new NumberParameter('inB', 3)
    multiOutputOperator.getInput('in').setParam(inBParam)
    multiOutputOperator.getOutput('out0').setParam(aParam)
    multiOutputOperator.getOutput('out1').setParam(bParam)
    multiOutputOperator.getOutput('out2').setParam(cParam)

    expect(aParam.getValue()).toBe(3)
    expect(bParam.getValue()).toBe(3)
    expect(cParam.getValue()).toBe(3)
    expect(cParam.isDirty()).toBe(false)

    // Now dirty the input to the chain.
    // Because the multi-out layers on top using OP_WRITE outputs,
    // it should prevent the chain from becoming dirty.
    inAParam.setValue(4)
    expect(cParam.isDirty()).toBe(false)
    expect(aParam.getValue()).toBe(3)
    expect(bParam.getValue()).toBe(3)
    expect(cParam.getValue()).toBe(3)
  })

  test('save to JSON (serialization).', () => {
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

    expect(JSON.stringify(addOperator.toJSON())).toMatchSnapshot()
  })

  test('load from JSON (serialization).', () => {
    const parameterOwner = new BaseItem('Foo')
    parameterOwner.addParameter(new NumberParameter('A'))
    parameterOwner.addParameter(new NumberParameter('B'))
    parameterOwner.addParameter(new NumberParameter('MyParam'))

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
      resolvePath: (path, cb) => {
        cb(parameterOwner.resolvePath(path))
      },
    })

    parameterOwner.getParameter('A').setValue(3)
    parameterOwner.getParameter('B').setValue(2.5)

    expect(parameterOwner.getParameter('MyParam').isDirty()).toBe(true)
    expect(parameterOwner.getParameter('MyParam').getValue()).toBe(5.5)
    expect(parameterOwner.getParameter('MyParam').isDirty()).toBe(false)
  })
})
