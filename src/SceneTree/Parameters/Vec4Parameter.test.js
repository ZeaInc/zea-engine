import { Vec4 } from '../../Math/Vec4'
import { Vec4Parameter } from './Vec4Parameter'
import { BinReader } from '../../SceneTree/BinReader'

describe('Vec4Parameter', () => {
  it('has an initial value.', () => {
    const vec4Parameter = new Vec4Parameter()
    const vec4 = new Vec4()

    expect(vec4Parameter.getValue().isEqual(vec4)).toBe(true)
  })

  it('checks value type.', () => {
    const vec4Parameter = new Vec4Parameter()

    expect(vec4Parameter.getDataType()).toEqual('Vec4')
  })

  it('sets value.', () => {
    const vec4Parameter = new Vec4Parameter()
    const value = new Vec4()
    vec4Parameter.setValue(value)

    expect(vec4Parameter.getValue()).toEqual(value)
  })

  it('saves to JSON (serialization).', () => {
    const vec4Parameter = new Vec4Parameter()
    vec4Parameter.setValue(new Vec4(1, 2, 3, 4))

    const expOutput = '{"value":{"x":1,"y":2,"z":3,"t":4}}'

    expect(JSON.stringify(vec4Parameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const vec4Parameter = new Vec4Parameter()
    const input = { value: { x: 1, y: 2, z: 3, t: 4 } }
    vec4Parameter.fromJSON(input)

    expect(vec4Parameter.getValue().toJSON()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const vec4Parameter = new Vec4Parameter()

    const data = new Float32Array(4)
    data[0] = 1
    data[1] = 2
    data[2] = 3
    data[3] = 4
    const reader = new BinReader(data.buffer)
    vec4Parameter.readBinary(reader)

    expect(vec4Parameter.getValue().toJSON()).toEqual({ x: 1, y: 2, z: 3, t: 4 })
  })

  it('clones parameter object', () => {
    const parameter = new Vec4Parameter('TestParameter')
    const value = new Vec4(1, 2, 3, 4)
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
