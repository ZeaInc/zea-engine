import { Quat } from '../../Math/Quat'
import { QuatParameter } from './QuatParameter'
import { BinReader } from '../../SceneTree/BinReader'

describe('QuatParameter', () => {
  it('has an initial value.', () => {
    const quatParameter = new QuatParameter()
    const quat = new Quat()

    expect(quatParameter.getValue().isEqual(quat)).toBe(true)
  })

  it('checks value type.', () => {
    const quatParameter = new QuatParameter()

    expect(quatParameter.getDataType()).toEqual('Quat')
  })

  it('sets value.', () => {
    const quatParameter = new QuatParameter()
    const value = new Quat()
    quatParameter.setValue(value)

    expect(quatParameter.getValue()).toEqual(value)
  })

  it('saves to JSON (serialization).', () => {
    const quatParameter = new QuatParameter()
    quatParameter.setValue(new Quat(1, 0, 0, 0))

    const expOutput = '{"value":{"x":1,"y":0,"z":0,"w":0}}'

    expect(JSON.stringify(quatParameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const quatParameter = new QuatParameter()
    const input = { value: { x: 1, y: 0, z: 0, w: 0 } }
    quatParameter.fromJSON(input)

    expect(quatParameter.getValue().toJSON()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const quatParameter = new QuatParameter()

    const data = new Float32Array(4)
    data[0] = 1
    data[1] = 0
    data[2] = 0
    data[3] = 0
    const reader = new BinReader(data.buffer)
    quatParameter.readBinary(reader)

    expect(quatParameter.getValue().toJSON()).toEqual({ x: 1, y: 0, z: 0, w: 0 })
  })

  it('clones parameter object', () => {
    const parameter = new QuatParameter('TestParameter')
    const value = new Quat(1, 0, 0, 0)
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
