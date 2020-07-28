import StringFunctions from './StringFunctions'
import { Vec3 } from '../Math/Vec3'

describe('StringFunctions', () => {
  it('replaces all matches', () => {
    const str = 'F00 Foo'

    expect(StringFunctions.replaceAll(str, '0', 'o')).toEqual('Foo Foo')
    expect(StringFunctions.replaceAll(str, '1', 'i')).toEqual('F00 Foo')
  })

  it('Stringifies JSON and fixes precision on values', () => {
    const foo = new Vec3(1.45692, 3.82321, 6.144463)
    const expectedOutput = '{"x":1.46,"y":3.82,"z":6.14}'

    expect(StringFunctions.stringifyJSONWithFixedPrecision(foo.toJSON(), 0, 2)).toEqual(expectedOutput)
  })

  it('Hashes the string', () => {
    const hashedStr = StringFunctions.hashStr('Foo')

    expect(hashedStr).toEqual(70822)
  })
})
