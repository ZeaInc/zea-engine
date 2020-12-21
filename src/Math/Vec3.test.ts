import { Vec3 } from './Vec3'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Vec3', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('has an initial value.', () => {
    const vec3 = new Vec3(1, 2, 3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3.x).toEqual(1)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3.y).toEqual(2)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3.z).toEqual(3)
  })

  // it('check value type.', () => {
  //   const numberParameter = new NumberParameter()

  //   expect(numberParameter.getDataType()).to.equal('Number')
  // })

  // it('set a value.', () => {
  //   const numberParameter = new NumberParameter()
  //   const value = 1356
  //   numberParameter.setValue(value)
  //   expect(numberParameter.getValue()).to.equal(value)
  // })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('save to JSON (serialization).', () => {
    const vec3 = new Vec3(1, 2, 3)

    const expOutput = '{"x":1,"y":2,"z":3}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(vec3.toJSON())).toEqual(expOutput)
  })

  // it('load from JSON (serialization).', () => {
  //   // test param without data type.
  //   const numberParameter = new NumberParameter()
  //   const input = { value: 1356 }
  //   numberParameter.fromJSON(input)

  //   expect(numberParameter.getValue()).to.equal(input.value)
  // })

  // it('check ranges -> set & get.', () => {})

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('check the lenght of the vector.', () => {
    const vec3 = new Vec3(1, 2, 3)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3.length()).toBeCloseTo(3.741)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('creates Vec3 from buffer', () => {
    const float32Array = Float32Array.of(8, 5, 6)
    const vec3 = Vec3.createFromBuffer(float32Array.buffer, 0)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(vec3).toEqual(new Vec3(8, 5, 6))
  })
})
