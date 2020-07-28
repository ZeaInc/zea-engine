import { MathFunctions } from './MathFunctions'

describe('MathFunctions', () => {
  it('converts radians to degrees', () => {
    const degrees = MathFunctions.radToDeg(1)

    expect(degrees).toBeCloseTo(57.29577951308232)
  })

  it('converts degrees to radians', () => {
    const degrees = MathFunctions.degToRad(45)

    expect(degrees).toBeCloseTo(0.785398)
  })

  it('checks if number(true)', () => {
    const isNum = MathFunctions.isNumeric(45)

    expect(isNum).toBe(true)
  })

  it('checks if number(false)', () => {
    const isNum = MathFunctions.isNumeric('foo')

    expect(isNum).toBe(false)
  })

  it('generates random int inside a rage', () => {
    const MIN = 20
    const MAX = 27
    const randomNum = MathFunctions.randomInt(MIN, MAX)

    expect(randomNum).toBeGreaterThanOrEqual(MIN)
    expect(randomNum).toBeLessThanOrEqual(MAX)
  })

  it('interpolates points', () => {
    const outLerp = MathFunctions.lerp(1, 5, 0.08)

    expect(outLerp).toBe(1.32)
  })

  it('clamps number', () => {
    const MIN = 20
    const MAX = 27
    const clampUp = MathFunctions.clamp(15, MIN, MAX)
    expect(clampUp).toBe(MIN)

    const clampDown = MathFunctions.clamp(34, MIN, MAX)
    expect(clampDown).toBe(MAX)
  })

  it('returns the nearest pow of 2', () => {
    const nearest = MathFunctions.nearestPow2(13)

    expect(nearest).toEqual(16)
  })

  it('returns the nearest pow of 10', () => {
    const nearest = MathFunctions.nearestPow10(54)

    expect(nearest).toEqual(100)
  })

  it('returns the next pow of 2', () => {
    const nextPow = MathFunctions.nextPow2(34)

    expect(nextPow).toEqual(64)
  })

  it('returns fractional part of a number', () => {
    const fract1 = MathFunctions.fract(0)
    const fract2 = MathFunctions.fract(-0.7)
    const fract3 = MathFunctions.fract(-3.5)
    const fract4 = MathFunctions.fract(0.7)
    const fract5 = MathFunctions.fract(3.4)

    expect(fract1).toEqual(0)
    expect(fract2).toEqual(0.7)
    expect(fract3).toBeCloseTo(0.5)
    expect(fract4).toEqual(0.7)
    expect(fract5).toBeCloseTo(0.4)
  })

  it('returns the interpolation for two vectors', () => {
    const value = MathFunctions.remap(5, 1, 4, 6, 7)

    expect(value).toBeCloseTo(7.333333333333333)
  })

  it('Performs smoothStep', () => {
    const value = MathFunctions.smoothStep(5, 10, 7)

    expect(value).toBe(0.3520000000000001)
  })

  it('Performs linStep', () => {
    const value = MathFunctions.linStep(5, 10, 7)

    expect(value).toBe(0.4)
  })

  it('Decodes 16 bit float from two unsigned Int8', () => {
    const value = MathFunctions.decode16BitFloatFrom2xUInt8([150, 250])

    expect(value).toBe(0.2340087890625)
  })

  it('Encodes 16 bit float from two unsigned Int8', () => {
    const value = MathFunctions.encode16BitFloatInto2xUInt8(3.38953139)

    expect(value).toEqual(Uint8Array.of(181, 0))
  })

  it('Encodes 16 bit float into a integer representative', () => {
    const value = MathFunctions.encode16BitFloat(15)

    expect(value).toBe(19328)
  })

  it('Decodes encoded integer number into a 16 bit float', () => {
    const value = MathFunctions.decode16BitFloat(19328)

    expect(value).toBe(15)
  })

  it('Converts Float32Array to an unsigned Int16Array', () => {
    const value = MathFunctions.convertFloat32ArrayToUInt16Array(Float32Array.of(15, 8))

    expect(value).toEqual(Uint16Array.of(19328, 18432))
  })
})
