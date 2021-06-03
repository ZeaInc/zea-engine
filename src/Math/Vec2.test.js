import { Vec2 } from './Vec2'

describe('Vec2', () => {
  it('has an initial value.', () => {
    const vec2 = new Vec2(1, 2)

    expect(vec2.x).toEqual(1)
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

  it('save to JSON (serialization).', () => {
    const vec2 = new Vec2(1, 2)

    const expOutput = '{"x":1,"y":2}'

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

  it('check the length of the vector.', () => {
    const vec2 = new Vec2(1, 2)

    expect(vec2.length()).toBeCloseTo(2.236)
  })

  it('creates Vec2 from buffer', () => {
    const float32Array = Float32Array.of(8, 5)
    const vec2 = Vec2.createFromBuffer(float32Array.buffer, 0)

    expect(vec2).toEqual(new Vec2(8, 5))
  })

  it('intersectionOfLines-1', () => {
    const p0 = new Vec2(-1, 0)
    const d0 = new Vec2(-1, 1)
    const p1 = new Vec2(1, 1)
    const d1 = new Vec2(0, 1)
    const res = Vec2.intersectionOfLines(p0, d0, p1, d1)

    expect(res.toJSON()).toEqual({ x: -1, y: 1 })
  })

  it('intersectionOfLines-2', () => {
    const p0 = new Vec2(-2, 0)
    const d0 = new Vec2(-2, -1)
    const p1 = new Vec2(1, 1)
    const d1 = new Vec2(0, 1)
    const res = Vec2.intersectionOfLines(p0, d0, p1, d1)

    expect(res.toJSON()).toEqual({ x: -2, y: 1 })
  })

  it('intersectionOfLines-parallel', () => {
    const p0 = new Vec2(-2, 0)
    const d0 = new Vec2(-2, 1)
    const p1 = new Vec2(1, 0)
    const d1 = new Vec2(1, 1)
    const res = Vec2.intersectionOfLines(p0, d0, p1, d1)

    expect(res).toEqual(null)
  })
})
