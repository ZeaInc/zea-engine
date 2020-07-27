import {
  radToDeg,
  degToRad,
  isNumeric,
  randomInt,
  lerp,
  clamp,
  nearestPow2,
  nearestPow10,
  nextPow2,
  fract,
  remap,
  smoothStep,
  linStep,
  decode16BitFloatFrom2xUInt8,
  encode16BitFloatInto2xUInt8,
  encode16BitFloat,
  decode16BitFloat,
  convertFloat32ArrayToUInt16Array,
} from './MathFunctions'

describe('MathFunctions', () => {
  it('converts radians to degrees', () => {
    const degrees = radToDeg(1)

    expect(degrees).toBeCloseTo(57.29577951308232)
  })

  it('converts degrees to radians', () => {
    const degrees = degToRad(45)

    expect(degrees).toBeCloseTo(0.785398)
  })

  it('checks if number(true)', () => {
    const isNum = isNumeric(45)

    expect(isNum).toBe(true)
  })

  it('checks if number(false)', () => {
    const isNum = isNumeric('foo')

    expect(isNum).toBe(false)
  })

  it('generates random int inside a rage', () => {
    const MIN = 20
    const MAX = 27
    const randomNum = randomInt(MIN, MAX)

    expect(randomNum).toBeGreaterThanOrEqual(MIN)
    expect(randomNum).toBeLessThanOrEqual(MAX)
  })

  it('interpolates points', () => {
    const outLerp = lerp(1, 5, 0.08)

    expect(outLerp).toBe(1.32)
  })

  it('clamps number', () => {
    const MIN = 20
    const MAX = 27
    const clampUp = clamp(15, MIN, MAX)
    expect(clampUp).toBe(MIN)

    const clampDown = clamp(34, MIN, MAX)
    expect(clampDown).toBe(MAX)
  })

  it('returns the nearest pow of 2', () => {
    const nearest = nearestPow2(13)

    expect(nearest).toEqual(16)
  })

  it('returns the nearest pow of 10', () => {
    const nearest = nearestPow10(54)

    expect(nearest).toEqual(100)
  })

  it('returns the next pow of 2', () => {
    const nextPow = nextPow2(34)

    expect(nextPow).toEqual(64)
  })

  it('returns fractional part of a number', () => {
    const fract1 = fract(0)
    const fract2 = fract(-0.7)
    const fract3 = fract(-3.5)
    const fract4 = fract(0.7)
    const fract5 = fract(3.4)

    expect(fract1).toEqual(0)
    expect(fract2).toEqual(0.7)
    expect(fract3).toBeCloseTo(0.5)
    expect(fract4).toEqual(0.7)
    expect(fract5).toBeCloseTo(0.4)
  })

  it('returns the interpolation for two vectors', () => {
    const value = remap(5, 1, 4, 6, 7)

    expect(value).toBeCloseTo(7.333333333333333)
  })

  it('Performs smoothStep', () => {
    const value = smoothStep(5, 10, 7)

    expect(value).toBe(0.3520000000000001)
  })

  it('Performs smoothStep', () => {
    const value = smoothStep(5, 10, 7)

    expect(value).toBe(0.3520000000000001)
  })

  it('Performs linStep', () => {
    const value = linStep(5, 10, 7)

    expect(value).toBe(0.4)
  })

  it.skip('Decodes 16 bit float from two unsigned Int8', () => {
    const value = decode16BitFloatFrom2xUInt8([15, 8])

    expect(value).toBe(0.4)
  })

  it.skip('Encodes 16 bit float from two unsigned Int8', () => {
    const value = encode16BitFloatInto2xUInt8([15, 8])

    expect(value).toBe(0.4)
  })

  it.skip('Encodes 16 bit float', () => {
    const value = encode16BitFloat([15, 8])

    expect(value).toBe(0.4)
  })

  it.skip('Decodes 16 bit float', () => {
    const value = decode16BitFloat([15, 8])

    expect(value).toBe(0.4)
  })

  it.skip('DConverts Float32Array to an unsigned Int16Array', () => {
    const value = convertFloat32ArrayToUInt16Array([15, 8])

    expect(value).toBe(0.4)
  })
})
