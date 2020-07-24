import { Vec3 } from '../../Math/Vec3'
import { Vec3Parameter } from './Vec3Parameter'
import { BinReader } from '../../SceneTree/BinReader'

describe('Vec3Parameter', () => {
  it('has an initial value.', () => {
    const vec3Parameter = new Vec3Parameter()

    const vec3 = new Vec3()

    expect(vec3Parameter.getValue().isEqual(vec3)).toBe(true)
  })

  it('checks value type.', () => {
    const vec3Parameter = new Vec3Parameter()

    expect(vec3Parameter.getDataType()).toEqual('Vec3')
  })

  it('sets value.', () => {
    const vec3Parameter = new Vec3Parameter()
    const value = new Vec3()
    vec3Parameter.setValue(value)
    expect(vec3Parameter.getValue()).toEqual(value)
  })

  it('saves to JSON (serialization).', () => {
    const vec3Parameter = new Vec3Parameter()
    const value = new Vec3(1, 2, 3)
    vec3Parameter.setValue(value)

    const expOutput = '{"value":{"x":1,"y":2,"z":3}}'

    expect(JSON.stringify(vec3Parameter.toJSON())).toEqual(expOutput)
  })

  it('loads from JSON (serialization).', () => {
    const vec3Parameter = new Vec3Parameter()
    const input = { value: { x: 1, y: 2, z: 3 } }
    vec3Parameter.fromJSON(input)

    expect(vec3Parameter.getValue().toJSON()).toEqual(input.value)
  })

  it('loads from binary (serialization).', () => {
    const vec3Parameter = new Vec3Parameter()

    const data = new Float32Array(3)
    data[0] = 1
    data[1] = 2
    data[2] = 3
    const reader = new BinReader(data.buffer)
    vec3Parameter.readBinary(reader)

    expect(vec3Parameter.getValue().toJSON()).toEqual({ x: 1, y: 2, z: 3 })
  })

  it('clones parameter object', () => {
    const parameter = new Vec3Parameter('TestParameter')
    const value = new Vec3(1, 2, 3)
    parameter.setValue(value)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
  })
})
