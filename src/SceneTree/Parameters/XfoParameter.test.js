import { Xfo } from '../../Math/Xfo'
import { XfoParameter } from './XfoParameter'
import { BinReader } from '../../SceneTree/BinReader'

describe('XfoParameter', () => {
  it('has an initial value.', () => {
    const xfoParameter = new XfoParameter()
    const xfo = new Xfo()

    expect(xfoParameter.getValue()).toEqual(xfo)
  })

  it('checks value type.', () => {
    const xfoParameter = new XfoParameter()

    expect(xfoParameter.getDataType()).toEqual('Xfo')
  })

  it('sets value.', () => {
    const xfoParameter = new XfoParameter()
    const value = new Xfo()
    xfoParameter.setValue(value)

    expect(xfoParameter.getValue()).toEqual(value)
  })

  it('saves to JSON (serialization).', () => {
    const xfoParameter = new XfoParameter()
    const xfo = new Xfo()
    xfo.tr.set(2, 5, 7)
    xfo.sc.set(2, 2, 2)

    xfoParameter.setValue(xfo)

    const expOutput = '{"value":{"tr":{"x":2,"y":5,"z":7},"ori":{"x":0,"y":0,"z":0,"w":1},"sc":{"x":2,"y":2,"z":2}}}'
    expect(JSON.stringify(xfoParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const xfoParameter = new XfoParameter()
    const input = { value: { tr: { x: 2, y: 5, z: 7 }, ori: { x: 0, y: 0, z: 0, w: 1 }, sc: { x: 2, y: 2, z: 2 } } }
    xfoParameter.fromJSON(input)

    expect(xfoParameter.getValue().toJSON()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const xfoParameter = new XfoParameter()

    const data = new Float32Array(10)
    data[0] = 2
    data[1] = 5
    data[2] = 7
    data[3] = 0
    data[4] = 0
    data[5] = 0
    data[6] = 1
    data[7] = 2
    data[8] = 2
    data[9] = 2
    const reader = new BinReader(data.buffer)
    xfoParameter.readBinary(reader)

    expect(xfoParameter.getValue().toJSON()).toEqual({
      tr: { x: 2, y: 5, z: 7 },
      ori: { x: 0, y: 0, z: 0, w: 1 },
      sc: { x: 2, y: 2, z: 2 },
    })
  })

  it('clones parameter object', () => {
    const parameter = new XfoParameter('TestParameter')
    const value = new Xfo(1, 2, 3, 4)
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
