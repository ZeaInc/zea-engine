import { Mat3Parameter } from './Mat3Parameter'
import { Mat3 } from '../../Math'
import { BinReader } from '../../SceneTree/BinReader'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Mat3Parameter', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.getValue()).toEqual(new Mat3())
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks value type.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.getDataType()).toEqual('Mat3')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets value.', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    mat3Parameter.setValue(mat3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.getValue()).toEqual(mat3)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('saves to JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    mat3Parameter.setValue(mat3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.toJSON()).toEqual({ value: Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9) })
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from JSON (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()
    const mat3 = { value: Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9) }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    mat3Parameter.fromJSON(mat3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.getValue()).toEqual(new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('loads from binary (serialization).', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 0.
    const mat3Parameter = new Mat3Parameter()

    const data = Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9)
    const reader = new BinReader(data.buffer)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    mat3Parameter.readBinary(reader)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(mat3Parameter.getValue().toJSON()).toEqual(Float32Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clones parameter object', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const parameter = new Mat3Parameter('TestParameter')
    const mat3 = new Mat3(1, 2, 3, 4, 5, 6, 7, 8, 9)
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    parameter.setValue(mat3)

    const parameter2 = parameter.clone()

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.toJSON()).toEqual(parameter2.toJSON())
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(parameter.getValue()).toEqual(mat3)
  })
})
