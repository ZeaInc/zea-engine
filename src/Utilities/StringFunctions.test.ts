import { StringFunctions } from './StringFunctions'
import { Vec3 } from '../Math/Vec3'

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('StringFunctions', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('replaces all matches', () => {
    const str = 'F00 Foo'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(StringFunctions.replaceAll(str, '0', 'o')).toEqual('Foo Foo')
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(StringFunctions.replaceAll(str, '1', 'i')).toEqual('F00 Foo')
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Stringifies JSON and fixes precision on values', () => {
    const foo = new Vec3(1.45692, 3.82321, 6.144463)
    const expectedOutput = '{"x":1.46,"y":3.82,"z":6.14}'

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(StringFunctions.stringifyJSONWithFixedPrecision(foo.toJSON(), 0, 2)).toEqual(expectedOutput)
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Hashes the string', () => {
    const hashedStr = StringFunctions.hashStr('Foo')

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(hashedStr).toEqual(70822)
  })
})
