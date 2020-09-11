import { Registry } from './Registry'
import { Vec3 } from './Math/Vec3'

describe('Registry', () => {
  beforeEach(() => Registry.flush())

  it('registers a new class/type', () => {
    Registry.register('FooClass', Float32Array)

    const classResult = Registry.getBlueprint('FooClass')
    expect(classResult).toBe(Float32Array)

    const UInt32 = 4
    Registry.register('FooType', UInt32)

    const typeResult = Registry.getBlueprint('FooType')
    expect(typeResult).toBe(UInt32)
  })

  test('throws on duplicated class/type name registration', () => {
    Registry.register('FooClass', Float32Array)
    const UInt32 = 4
    Registry.register('FooType', UInt32)

    expect(() => Registry.register('FooClass', Float32Array)).toThrow()
    expect(() => Registry.register('FooType', Float32Array)).toThrow()
  })

  it('returns blueprint name for class/type', () => {
    Registry.register('FooClass', Float64Array)

    const classResult = Registry.getBlueprintName(new Float64Array(1, 2))
    expect(classResult).toEqual('FooClass')

    const UInt32 = 4
    Registry.register('FooType', UInt32)

    const typeResult = Registry.getBlueprintName(4)
    expect(typeResult).toEqual('FooType')
  })

  it('throws on getting non registered class/type', () => {
    expect(() => Registry.getBlueprintName(new Float64Array(1, 2))).toThrow()
    expect(() => Registry.getBlueprintName(4)).toThrow()
  })

  it('instantiates the class if registered', () => {
    Registry.register('Vec3', Vec3)

    const result = Registry.constructClass('Vec3', 3, 4, 5)
    expect(result).toEqual(new Vec3(3, 4, 5))
  })

  it('throws on class construction', () => {
    expect(() => Registry.constructClass('Vec3', 3, 4, 5)).toThrow()
  })
})
