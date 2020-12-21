import { Vec2 } from './Vec2'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Vec2', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    const vec2 = new Vec2(1, 2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec2.x).toEqual(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec2.y).toEqual(2)
  })

  // it('check value type.', () => {
  //   const numberParameter = new NumberParameter()

  //   expect(numberParameter.getDataType()).toEqual('Number')
  // })

  // it('set a value.', () => {
  //   const numberParameter = new NumberParameter()
  //   const value = 1356
  //   numberParameter.setValue(value)
  //   expect(numberParameter.getValue()).toEqual(value)
  // })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('save to JSON (serialization).', () => {
    const vec2 = new Vec2(1, 2)

    const expOutput = '{"x":1,"y":2}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(vec2.toJSON())).toEqual(expOutput)
  })

  // it('load from JSON (serialization).', () => {
  //   // test param without data type.
  //   const numberParameter = new NumberParameter()
  //   const input = { value: 1356 }
  //   numberParameter.fromJSON(input)

  //   expect(numberParameter.getValue()).toEqual(input.value)
  // })

  // it('check ranges -> set & get.', () => {})

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('check the length of the vector.', () => {
    const vec2 = new Vec2(1, 2)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec2.length()).toBeCloseTo(2.236)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates Vec2 from buffer', () => {
    const float32Array = Float32Array.of(8, 5)
    const vec2 = Vec2.createFromBuffer(float32Array.buffer, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec2).toEqual(new Vec2(8, 5))
  })
})
