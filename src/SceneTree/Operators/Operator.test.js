/* eslint-disable require-jsdoc */
import { Operator } from './Operator'
import { NumberParameter } from '../Parameters/NumberParameter'
import { BaseItem } from '../BaseItem'
import { OperatorInput } from './OperatorInput'
import { OperatorOutput, OperatorOutputMode } from './OperatorOutput'
import { sgFactory } from '../SGFactory.js'

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

sgFactory.registerClass('AddFloatsOperator', AddFloatsOperator)

// Note: this operatore modifies a value in the output attribute
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

sgFactory.registerClass('ScaleFloatOperator', ScaleFloatOperator)

describe('Operator', () => {
  it('AddFloatsOperator', () => {
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

  it('ScaleFloatOperator', () => {
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

  it('AddScaleFloatOperator', () => {
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

  it('save to JSON (serialization).', () => {
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

    const expOutput =
      '{"name":"","type":"AddFloatsOperator","inputs":[{"paramPath":["Foo","A"]},{"paramPath":["Foo","B"]}],"outputs":[{"paramPath":["Foo","MyParam"],"paramBindIndex":0}]}'
    expect(JSON.stringify(addOperator.toJSON())).toBe(expOutput)
  })

  it('load from JSON (serialization).', () => {
    const parameterOwner = new BaseItem('Foo')
    parameterOwner.addParameter(new NumberParameter('A'))
    parameterOwner.addParameter(new NumberParameter('B'))
    parameterOwner.addParameter(new NumberParameter('MyParam'))

    const addOperator = new AddFloatsOperator()
    const input = {
      name: '',
      type: 'AddFloatsOperator',
      inputs: [{ paramPath: ['Foo', 'A'] }, { paramPath: ['Foo', 'B'] }],
      outputs: [{ paramPath: ['Foo', 'MyParam'], paramBindIndex: 0 }],
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
