import { MathFunctions } from './MathFunctions'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MathFunctions', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('converts radians to degrees', () => {
    const degrees = MathFunctions.radToDeg(1)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(degrees).toBeCloseTo(57.29577951308232)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('converts degrees to radians', () => {
    const degrees = MathFunctions.degToRad(45)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(degrees).toBeCloseTo(0.785398)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks if number(true)', () => {
    const isNum = MathFunctions.isNumeric(45)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isNum).toBe(true)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('checks if number(false)', () => {
    const isNum = MathFunctions.isNumeric('foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isNum).toBe(false)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('generates random int inside a rage', () => {
    const MIN = 20
    const MAX = 27
    const randomNum = MathFunctions.randomInt(MIN, MAX)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(randomNum).toBeGreaterThanOrEqual(MIN)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(randomNum).toBeLessThanOrEqual(MAX)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('interpolates points', () => {
    const outLerp = MathFunctions.lerp(1, 5, 0.08)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(outLerp).toBe(1.32)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('clamps number', () => {
    const MIN = 20
    const MAX = 27
    const clampUp = MathFunctions.clamp(15, MIN, MAX)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(clampUp).toBe(MIN)

    const clampDown = MathFunctions.clamp(34, MIN, MAX)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(clampDown).toBe(MAX)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns the nearest pow of 2', () => {
    const nearest = MathFunctions.nearestPow2(13)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(nearest).toEqual(16)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns the nearest pow of 10', () => {
    const nearest = MathFunctions.nearestPow10(54)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(nearest).toEqual(100)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns the next pow of 2', () => {
    const nextPow = MathFunctions.nextPow2(34)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(nextPow).toEqual(64)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns fractional part of a number', () => {
    const fract1 = MathFunctions.fract(0)
    const fract2 = MathFunctions.fract(-0.7)
    const fract3 = MathFunctions.fract(-3.5)
    const fract4 = MathFunctions.fract(0.7)
    const fract5 = MathFunctions.fract(3.4)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fract1).toEqual(0)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fract2).toEqual(0.7)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fract3).toBeCloseTo(0.5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fract4).toEqual(0.7)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(fract5).toBeCloseTo(0.4)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns the interpolation for two vectors', () => {
    const value = MathFunctions.remap(5, 1, 4, 6, 7)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBeCloseTo(7.333333333333333)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Performs smoothStep', () => {
    const value = MathFunctions.smoothStep(5, 10, 7)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBe(0.3520000000000001)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Performs linStep', () => {
    const value = MathFunctions.linStep(5, 10, 7)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBe(0.4)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Decodes 16 bit float from two unsigned Int8', () => {
    const value = MathFunctions.decode16BitFloatFrom2xUInt8([150, 250])

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBe(0.2340087890625)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Encodes 16 bit float from two unsigned Int8', () => {
    const value = MathFunctions.encode16BitFloatInto2xUInt8(3.38953139)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toEqual(Uint8Array.of(181, 0))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Encodes 16 bit float into a integer representative', () => {
    const value = MathFunctions.encode16BitFloat(15)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBe(19328)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Decodes encoded integer number into a 16 bit float', () => {
    const value = MathFunctions.decode16BitFloat(19328)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toBe(15)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Converts Float32Array to an unsigned Int16Array', () => {
    const value = MathFunctions.convertFloat32ArrayToUInt16Array(Float32Array.of(15, 8))

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(value).toEqual(Uint16Array.of(19328, 18432))
  })
})
