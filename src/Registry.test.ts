import { Registry } from './Registry'
import { Vec3 } from './Math/Vec3'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Registry', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => Registry.flush())

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('registers a new class/type', () => {
    Registry.register('FooClass', Float32Array)

    const classResult = Registry.getBlueprint('FooClass')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(classResult).toBe(Float32Array)

    const UInt32 = 4
    Registry.register('FooType', UInt32)

    const typeResult = Registry.getBlueprint('FooType')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(typeResult).toBe(UInt32)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'test'. Do you need to install ty... Remove this comment to see the full error message
  test('throws on duplicated class/type name registration', () => {
    Registry.register('FooClass', Float32Array)
    const UInt32 = 4
    Registry.register('FooType', UInt32)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => Registry.register('FooClass', Float32Array)).toThrow()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => Registry.register('FooType', Float32Array)).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('returns blueprint name for class/type', () => {
    Registry.register('FooClass', Float64Array)

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
    const classResult = Registry.getBlueprintName(new Float64Array(1, 2))
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(classResult).toEqual('FooClass')

    const UInt32 = 4
    Registry.register('FooType', UInt32)

    const typeResult = Registry.getBlueprintName(4)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(typeResult).toEqual('FooType')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('throws on getting non registered class/type', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => Registry.getBlueprintName(new Float64Array(1, 2))).toThrow()
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => Registry.getBlueprintName(4)).toThrow()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('instantiates the class if registered', () => {
    Registry.register('Vec3', Vec3)

    const result = Registry.constructClass('Vec3', 3, 4, 5)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(result).toEqual(new Vec3(3, 4, 5))
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('throws on class construction', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => Registry.constructClass('Vec3', 3, 4, 5)).toThrow()
  })
})
