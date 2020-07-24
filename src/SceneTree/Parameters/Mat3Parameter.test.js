import { Mat3Parameter } from './Mat3Parameter'
import { Mat3 } from '../../Math'
import { BinReader } from '../../SceneTree/BinReader'

describe('Mat3Parameter', () => {
  it('has an initial value.', () => {
    const mat3Parameter = new Mat3Parameter()

    expect(mat3Parameter.getValue()).toEqual(new Mat3())
  })

  it('checks value type.', () => {
    const mat3Parameter = new Mat3Parameter()

    expect(mat3Parameter.getDataType()).toEqual('Mat3')
  })

  it('sets value.', () => {
    const mat3Parameter = new Mat3Parameter()
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    mat3Parameter.setValue(mat3)

    expect(mat3Parameter.getValue()).toEqual(mat3)
  })

  it('saves to JSON (serialization).', () => {
    const mat3Parameter = new Mat3Parameter()
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    mat3Parameter.setValue(mat3)

    expect(mat3Parameter.toJSON()).toEqual({ value: Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9) })
  })

  it('loads from JSON (serialization).', () => {
    const mat3Parameter = new Mat3Parameter()
    const mat3 = { value: Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9) }
    mat3Parameter.fromJSON(mat3)

    expect(mat3Parameter.getValue()).toEqual(new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9))
  })

  it('loads from binary (serialization).', () => {
    const mat3Parameter = new Mat3Parameter()

    const data = Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
    const reader = new BinReader(data.buffer)
    mat3Parameter.readBinary(reader)

    expect(mat3Parameter.getValue().toJSON()).toEqual(Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9))
  })

  it('clones parameter object', () => {
    const parameter = new Mat3Parameter('TestParameter')
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    parameter.setValue(mat3)

    const parameter2 = parameter.clone()

    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
    expect(parameter.getValue()).toEqual(mat3)
  })
})
